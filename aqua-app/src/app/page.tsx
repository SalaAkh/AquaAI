'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, NavTabType } from '@/components/Navbar';
import { LandingHero } from '@/components/LandingHero';
import { WeatherWidget } from '@/components/WeatherWidget';
import { IrrigationCalculatorCard } from '@/components/IrrigationCalculatorCard';
import { SatelliteNdviCard } from '@/components/SatelliteNdviCard';
import { SoilMoistureSensorCard } from '@/components/SoilMoistureSensorCard';
import { AiAdvisorCard } from '@/components/AiAdvisorCard';
import { AiAdvisorView } from '@/components/AiAdvisorView';
import { FarmManagementView } from '@/components/FarmManagementView';
import { WaterAnalyticsChart } from '@/components/WaterAnalyticsChart';
import { IrrigationJournal } from '@/components/IrrigationJournal';
import { TodayIrrigationCard } from '@/components/TodayIrrigationCard';
import { SolanaVerifierCard } from '@/components/SolanaVerifierCard';
import { WaterSubsidiesCard } from '@/components/WaterSubsidiesCard';
import { CentralAsiaChallenge } from '@/components/CentralAsiaChallenge';
import { FarmManagerModal } from '@/components/FarmManagerModal';
import { DailyWeatherForecast, FarmProfile, IrrigationRecommendation, OnChainProof } from '@/lib/types';
import { DEMO_FARM_TURKISTAN } from '@/lib/constants';
import { calculateIrrigationRecommendation } from '@/lib/fao56';
import { generateCentralAsiaFallbackForecast } from '@/lib/weather';
import { LanguageProvider, useTranslation, getCropLabel, getGrowthStageInfo } from '@/lib/i18n';
import { WalletProvider } from '@/lib/wallet';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import {
  getFarms,
  saveFarm,
  deleteFarm,
  getActiveFarmIdLocal,
  setActiveFarmIdLocal,
} from '@/lib/db-service';
import { saveRecommendationToHistory } from '@/lib/storage';
import {
  Sprout,
  Droplets,
  Layers,
  ShieldCheck,
  MapPin,
  RefreshCw,
  Plus,
  Sliders,
  Sparkles,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

function DashboardApp() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [farms, setFarms] = useState<FarmProfile[]>([DEMO_FARM_TURKISTAN]);
  const [currentFarm, setCurrentFarm] = useState<FarmProfile>(DEMO_FARM_TURKISTAN);
  const [activeTab, setActiveTab] = useState<NavTabType>('dashboard');
  const [showLandingHero, setShowLandingHero] = useState<boolean>(true);
  const [isFarmModalOpen, setIsFarmModalOpen] = useState<boolean>(false);
  const [editingFarm, setEditingFarm] = useState<FarmProfile | undefined>(undefined);

  // Weather & Calculations state
  const [forecast, setForecast] = useState<DailyWeatherForecast[]>([]);
  const [weatherSource, setWeatherSource] = useState<'live' | 'fallback'>('live');
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<IrrigationRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load farms from db-service on initial mount or user change
  useEffect(() => {
    let isMounted = true;
    getFarms(user?.id).then((loadedFarms) => {
      if (isMounted) {
        setFarms(loadedFarms);
        const activeId = getActiveFarmIdLocal();
        const active = loadedFarms.find((f) => f.id === activeId) || loadedFarms[0] || DEMO_FARM_TURKISTAN;
        setCurrentFarm(active);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Compute recommendation when farm or weather changes
  const loadAgronomicData = useCallback(async (farm: FarmProfile) => {
    setIsLoading(true);
    setWeatherError(null);
    try {
      const response = await fetch(
        `/api/weather?lat=${encodeURIComponent(farm.latitude)}&lon=${encodeURIComponent(farm.longitude)}`,
        { cache: 'no-store' }
      );
      if (!response.ok) throw new Error(`Weather API returned ${response.status}`);
      const weatherRes = (await response.json()) as {
        forecast: DailyWeatherForecast[];
        source: 'live' | 'fallback';
      };
      if (!Array.isArray(weatherRes.forecast) || weatherRes.forecast.length === 0) {
        throw new Error('No usable weather forecast available');
      }

      setForecast(weatherRes.forecast);
      setWeatherSource(weatherRes.source);

      // 2. Run FAO-56 calculations
      const rec = calculateIrrigationRecommendation(farm, weatherRes.forecast, weatherRes.source);
      setRecommendation(rec);
      saveRecommendationToHistory(rec);
    } catch (err) {
      console.warn('Live meteorological request failed, applying regional climatology:', err);
      // Fallback
      const fallbackWeather = generateCentralAsiaFallbackForecast(farm.latitude, farm.longitude);
      setForecast(fallbackWeather);
      setWeatherSource('fallback');
      const rec = calculateIrrigationRecommendation(farm, fallbackWeather, 'fallback');
      setRecommendation(rec);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentFarm) {
      loadAgronomicData(currentFarm);
    }
  }, [currentFarm, loadAgronomicData]);

  const handleSelectFarm = (farm: FarmProfile) => {
    setCurrentFarm(farm);
    setActiveFarmIdLocal(farm.id);
  };

  const handleSaveFarm = async (savedFarm: FarmProfile) => {
    const updated = await saveFarm(savedFarm, user?.id);
    setFarms(updated);
    setCurrentFarm(savedFarm);
    setIsFarmModalOpen(false);
    setEditingFarm(undefined);
    loadAgronomicData(savedFarm);
  };

  const handleDeleteFarm = async (farmId: string) => {
    const updated = await deleteFarm(farmId, user?.id);
    setFarms(updated);
    if (currentFarm.id === farmId) {
      const nextActive = updated[0] || DEMO_FARM_TURKISTAN;
      setCurrentFarm(nextActive);
      setActiveFarmIdLocal(nextActive.id);
    }
  };

  const handleProofCreated = (proof: OnChainProof) => {
    if (recommendation) {
      const updatedRec = { ...recommendation, onChainProof: proof };
      setRecommendation(updatedRec);
      saveRecommendationToHistory(updatedRec);
    }
  };

  // Callback when user applies satellite-derived Kc adjustment
  const handleApplySatelliteKc = (adjustedKc: number) => {
    if (!recommendation) return;
    const efficiency = recommendation.assumptions.irrigationEfficiency || 0.9;
    const updatedSchedule = recommendation.schedule.map((day) => {
      const etc = Number((day.et0Mm * adjustedKc).toFixed(1));
      const net = Math.max(0, Number((etc - day.effectiveRainfallMm).toFixed(1)));
      const gross = Number((net / efficiency).toFixed(1));
      const vol = Math.round(gross * currentFarm.fieldSizeHectares * 10);
      return {
        ...day,
        kc: adjustedKc,
        etcMm: etc,
        netIrrigationMm: net,
        grossIrrigationMm: gross,
        waterVolumeM3: vol,
      };
    });

    const totalEtc = Number(updatedSchedule.reduce((a, s) => a + s.etcMm, 0).toFixed(1));
    const totalNet = Number(updatedSchedule.reduce((a, s) => a + s.netIrrigationMm, 0).toFixed(1));
    const totalGross = Number(updatedSchedule.reduce((a, s) => a + s.grossIrrigationMm, 0).toFixed(1));
    const totalVol = Math.round(updatedSchedule.reduce((a, s) => a + s.waterVolumeM3, 0));
    const baselineVol = recommendation.baselineTotalVolumeM3;
    const savingsVol = Math.max(0, baselineVol - totalVol);
    const savingsPct = baselineVol > 0 ? Math.round((savingsVol / baselineVol) * 100) : 0;

    const updatedRec: IrrigationRecommendation = {
      ...recommendation,
      totalEtcMm: totalEtc,
      totalNetIrrigationMm: totalNet,
      totalGrossIrrigationMm: totalGross,
      totalVolumeM3: totalVol,
      potentialTotalSavingsM3: savingsVol,
      potentialSavingsPercentage: savingsPct,
      schedule: updatedSchedule,
    };

    setRecommendation(updatedRec);
    saveRecommendationToHistory(updatedRec);
  };

  return (
    <div className="min-h-screen min-w-0 overflow-x-clip flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-cyan-100 selection:text-cyan-900">
      {/* Top Navbar */}
      <Navbar
        currentFarm={currentFarm}
        farms={farms}
        onSelectFarm={handleSelectFarm}
        onOpenNewFarmModal={() => {
          setEditingFarm(undefined);
          setIsFarmModalOpen(true);
        }}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Hero Section (only on main dashboard) */}
      {showLandingHero && activeTab === 'dashboard' && (
        <LandingHero
          onLaunchDashboard={() => {
            const el = document.getElementById('dashboard-content');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onExploreDemo={() => {
            handleSelectFarm(DEMO_FARM_TURKISTAN);
            const el = document.getElementById('dashboard-content');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          farm={currentFarm}
        />
      )}

      {/* Main Container */}
      <main id="dashboard-content" className="flex-1 min-w-0 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-28 sm:pb-8 space-y-5 sm:space-y-8">
        {/* Active Farm Header Bar (Always visible for clarity and quick navigation) */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-3 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-50 to-emerald-50 text-sky-800 flex items-center justify-center font-bold text-xl border border-sky-100 shadow-2xs">
              {currentFarm.cropType === 'cotton' ? '🌱' : currentFarm.cropType === 'wheat' ? '🌾' : currentFarm.cropType === 'rice' ? '🌾' : '🌽'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-lg font-black text-slate-900 break-words">
                  {currentFarm.id === DEMO_FARM_TURKISTAN.id ? t.demoTurkistanName : currentFarm.name}
                </h1>
                {currentFarm.isDemo ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    {t.demoFarmBadge}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {t.activeProdBadge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentFarm.region}</span>
                <span>•</span>
                <span className="font-semibold text-slate-700">{currentFarm.fieldSizeHectares} {t.hectares}</span>
                <span>•</span>
                <span>{getCropLabel(currentFarm.cropType, t)} ({getGrowthStageInfo(currentFarm.growthStage, t).title})</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('farms');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Open Farm Editor"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{t.editParamsBtn}</span>
            </button>
            <button
              onClick={() => loadAgronomicData(currentFarm)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{t.refreshWeatherBtn}</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            SCREEN 1: DASHBOARD
        ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* 1. Today's Irrigation Plan & Primary CTA */}
            {recommendation && (
              <TodayIrrigationCard
                recommendation={recommendation}
                weatherSource={weatherSource}
                onLogIrrigationClick={() => {
                  const el = document.getElementById('irrigation-entry-form') || document.getElementById('irrigation-tracking-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            )}

            {/* 2. Water Usage Tracking (Journal with 3 input modes & history) */}
            {recommendation && <IrrigationJournal farm={currentFarm} recommendation={recommendation} />}

            {/* 3. 7-Day FAO-56 Irrigation Recommendation Card */}
            {recommendation && (
              <IrrigationCalculatorCard
                recommendation={recommendation}
                farm={currentFarm}
                onRefresh={() => loadAgronomicData(currentFarm)}
                isLoading={isLoading}
              />
            )}

            {/* 4. Open-Meteo Weather Forecast */}
            <WeatherWidget
              forecast={forecast}
              source={weatherSource}
              locationName={currentFarm.locationName}
              isLoading={isLoading}
              error={weatherError}
              onRetry={() => loadAgronomicData(currentFarm)}
            />

            {/* 5. Water & Cost Analytics Chart (with custom tariffs & PDF report) */}
            {recommendation && (
              <WaterAnalyticsChart recommendation={recommendation} farm={currentFarm} />
            )}

            {/* 6. Gemini AI Agronomic Advisor Highlight Card */}
            {recommendation && (
              <AiAdvisorCard
                recommendation={recommendation}
                farm={currentFarm}
                onUpdateExplanation={(newExpl) => {
                  if (recommendation) {
                    setRecommendation({ ...recommendation, aiExplanation: newExpl });
                  }
                }}
              />
            )}
          </div>
        )}

        {/* =========================================================================
            SCREEN 2: FARM MANAGEMENT (Full Editor & Saved Fields View)
        ========================================================================= */}
        {activeTab === 'farms' && (
          <FarmManagementView
            farms={farms}
            currentFarm={currentFarm}
            onSelectFarm={handleSelectFarm}
            onSaveFarm={handleSaveFarm}
            onDeleteFarm={handleDeleteFarm}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {/* =========================================================================
            SCREEN 3: AI IRRIGATION ADVISOR (Dedicated Scientific Transparency View)
        ========================================================================= */}
        {activeTab === 'advisor' && (
          <AiAdvisorView
            currentFarm={currentFarm}
            recommendation={recommendation}
            isLoading={isLoading}
            onRecalculate={() => loadAgronomicData(currentFarm)}
            onUpdateExplanation={(newExpl) => {
              if (recommendation) {
                setRecommendation({ ...recommendation, aiExplanation: newExpl });
              }
            }}
          />
        )}

        {/* Dedicated Satellite Tab */}
        {activeTab === 'satellite' && recommendation && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <SatelliteNdviCard
              farm={currentFarm}
              baselineKc={recommendation.schedule[0]?.kc ?? 1.15}
              
            />
            <SoilMoistureSensorCard farm={currentFarm} />
          </div>
        )}

        {/* Dedicated Analytics Tab */}
        {activeTab === 'analytics' && recommendation && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <WaterAnalyticsChart recommendation={recommendation} farm={currentFarm} />
          </div>
        )}

        {/* Dedicated Subsidies Tab */}
        {activeTab === 'subsidies' && recommendation && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <WaterSubsidiesCard recommendation={recommendation} farm={currentFarm} />
          </div>
        )}

        {/* Dedicated Blockchain Tab */}
        {activeTab === 'blockchain' && recommendation && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <SolanaVerifierCard
              recommendation={recommendation}
              onProofCreated={handleProofCreated}
            />
          </div>
        )}

        {/* Dedicated Ecological Challenge Tab */}
        {activeTab === 'about' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <CentralAsiaChallenge />
          </div>
        )}

        {/* Aral Sea & Climate Context Banner at bottom of Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="pt-6">
            <CentralAsiaChallenge />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-sky-600" />
            <span className="font-semibold text-slate-800">{t.footerSystems}</span>
            <span>•</span>
            <span>{t.footerResilience}</span>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <span>{t.badgeFao}</span>
            <span>•</span>
            <span>{t.tabSatellite}</span>
            <span>•</span>
            <span>{t.tabBlockchain}</span>
          </div>

          <div className="text-[11px] text-slate-400">
            {t.footerCopyright}
          </div>
        </div>
      </footer>

      {/* Farm Create/Edit Modal (quick launch anywhere) */}
      <FarmManagerModal
        isOpen={isFarmModalOpen}
        onClose={() => {
          setIsFarmModalOpen(false);
          setEditingFarm(undefined);
        }}
        onSaveFarm={handleSaveFarm}
        initialFarm={editingFarm}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <WalletProvider>
          <DashboardApp />
        </WalletProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
