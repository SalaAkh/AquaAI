'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { LandingHero } from '@/components/LandingHero';
import { WeatherWidget } from '@/components/WeatherWidget';
import { IrrigationCalculatorCard } from '@/components/IrrigationCalculatorCard';
import { SatelliteNdviCard } from '@/components/SatelliteNdviCard';
import { SoilMoistureSensorCard } from '@/components/SoilMoistureSensorCard';
import { AiAdvisorCard } from '@/components/AiAdvisorCard';
import { WaterAnalyticsChart } from '@/components/WaterAnalyticsChart';
import { SolanaVerifierCard } from '@/components/SolanaVerifierCard';
import { WaterSubsidiesCard } from '@/components/WaterSubsidiesCard';
import { CentralAsiaChallenge } from '@/components/CentralAsiaChallenge';
import { FarmManagerModal } from '@/components/FarmManagerModal';
import { DailyWeatherForecast, FarmProfile, IrrigationRecommendation, OnChainProof } from '@/lib/types';
import { DEMO_FARM_TURKISTAN } from '@/lib/constants';
import { calculateIrrigationRecommendation } from '@/lib/fao56';
import { fetchOpenMeteoForecast, generateCentralAsiaFallbackForecast } from '@/lib/weather';
import { LanguageProvider, useTranslation, getCropLabel, getGrowthStageInfo } from '@/lib/i18n';
import { WalletProvider } from '@/lib/wallet';
import {
  getActiveFarmId,
  getSavedFarms,
  saveFarmProfile,
  setActiveFarmId,
  saveRecommendationToHistory,
} from '@/lib/storage';
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
} from 'lucide-react';

function DashboardApp() {
  const { t } = useTranslation();
  const [farms, setFarms] = useState<FarmProfile[]>([DEMO_FARM_TURKISTAN]);
  const [currentFarm, setCurrentFarm] = useState<FarmProfile>(DEMO_FARM_TURKISTAN);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'satellite' | 'blockchain' | 'subsidies' | 'about'>('dashboard');
  const [showLandingHero, setShowLandingHero] = useState<boolean>(true);
  const [isFarmModalOpen, setIsFarmModalOpen] = useState<boolean>(false);
  const [editingFarm, setEditingFarm] = useState<FarmProfile | undefined>(undefined);

  // Weather & Calculations state
  const [forecast, setForecast] = useState<DailyWeatherForecast[]>([]);
  const [weatherSource, setWeatherSource] = useState<'live' | 'fallback'>('live');
  const [recommendation, setRecommendation] = useState<IrrigationRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load farms from storage on initial mount
  useEffect(() => {
    const loadedFarms = getSavedFarms();
    setFarms(loadedFarms);
    const activeId = getActiveFarmId();
    const active = loadedFarms.find((f) => f.id === activeId) || loadedFarms[0] || DEMO_FARM_TURKISTAN;
    setCurrentFarm(active);
  }, []);

  // Compute recommendation when farm or weather changes
  const loadAgronomicData = useCallback(async (farm: FarmProfile) => {
    setIsLoading(true);
    try {
      let weatherRes: { forecast: DailyWeatherForecast[]; source: 'live' | 'fallback' };
      try {
        const res = await fetch(`/api/weather?lat=${farm.latitude}&lon=${farm.longitude}`);
        if (res.ok) {
          weatherRes = await res.json();
        } else {
          weatherRes = await fetchOpenMeteoForecast(farm.latitude, farm.longitude);
        }
      } catch {
        weatherRes = await fetchOpenMeteoForecast(farm.latitude, farm.longitude);
      }

      setForecast(weatherRes.forecast);
      setWeatherSource(weatherRes.source);

      // 2. Run FAO-56 calculations
      const rec = calculateIrrigationRecommendation(farm, weatherRes.forecast);
      setRecommendation(rec);
      saveRecommendationToHistory(rec);
    } catch (err) {
      console.error('Failed loading agronomic data:', err);
      // Fallback
      const fallbackWeather = generateCentralAsiaFallbackForecast(farm.latitude, farm.longitude);
      setForecast(fallbackWeather);
      setWeatherSource('fallback');
      const rec = calculateIrrigationRecommendation(farm, fallbackWeather);
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
    setActiveFarmId(farm.id);
  };

  const handleSaveFarm = (savedFarm: FarmProfile) => {
    const updated = saveFarmProfile(savedFarm);
    setFarms(updated);
    setCurrentFarm(savedFarm);
    setIsFarmModalOpen(false);
    setEditingFarm(undefined);
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
        grossIrrigationMm: gross,
        waterVolumeM3: vol,
      };
    });

    const totalEtc = Number(updatedSchedule.reduce((a, s) => a + s.etcMm, 0).toFixed(1));
    const totalGross = Number(updatedSchedule.reduce((a, s) => a + s.grossIrrigationMm, 0).toFixed(1));
    const totalVol = Math.round(updatedSchedule.reduce((a, s) => a + s.waterVolumeM3, 0));
    const baselineVol = recommendation.baselineTotalVolumeM3;
    const savingsVol = Math.max(0, baselineVol - totalVol);
    const savingsPct = Math.round((savingsVol / baselineVol) * 100);

    const updatedRec: IrrigationRecommendation = {
      ...recommendation,
      totalEtcMm: totalEtc,
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
    <div className="min-h-screen flex flex-col bg-slate-50">
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

      {/* Hero Section */}
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
      <main id="dashboard-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Active Farm Header Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-lg border border-sky-100">
              {currentFarm.cropType === 'cotton' ? '🌱' : currentFarm.cropType === 'wheat' ? '🌾' : currentFarm.cropType === 'rice' ? '🌾' : '🌽'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">
                  {currentFarm.id === DEMO_FARM_TURKISTAN.id ? t.demoTurkistanName : currentFarm.name}
                </h1>
                {currentFarm.isDemo ? (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    {t.demoFarmBadge}
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {t.activeProdBadge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentFarm.region}</span>
                <span>•</span>
                <span>{currentFarm.fieldSizeHectares} {t.hectares}</span>
                <span>•</span>
                <span>{getCropLabel(currentFarm.cropType, t)} ({getGrowthStageInfo(currentFarm.growthStage, t).title})</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingFarm(currentFarm);
                setIsFarmModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{t.editParamsBtn}</span>
            </button>
            <button
              onClick={() => loadAgronomicData(currentFarm)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{t.refreshWeatherBtn}</span>
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Open-Meteo Weather Component */}
            <WeatherWidget
              forecast={forecast}
              source={weatherSource}
              locationName={currentFarm.locationName}
            />

            {/* Irrigation Directives Card */}
            {recommendation && (
              <IrrigationCalculatorCard
                recommendation={recommendation}
                farm={currentFarm}
                onRefresh={() => loadAgronomicData(currentFarm)}
                isLoading={isLoading}
              />
            )}

            {/* Satellite Sentinel-2 NDVI Card */}
            {recommendation && (
              <SatelliteNdviCard
                farm={currentFarm}
                baselineKc={recommendation.schedule[0]?.kc ?? 1.15}
                onApplySatelliteKc={handleApplySatelliteKc}
              />
            )}

            {/* IoT Soil Moisture Telemetry Probe (Ground truth validation) */}
            <SoilMoistureSensorCard farm={currentFarm} />

            {/* Gemini AI Advisor Card with Interactive Chat */}
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

            {/* Quick Analytics & Blockchain Row */}
            {recommendation && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <WaterAnalyticsChart recommendation={recommendation} farm={currentFarm} />
                <SolanaVerifierCard
                  recommendation={recommendation}
                  onProofCreated={handleProofCreated}
                />
              </div>
            )}

            {/* Subsidies & Certificate preview */}
            {recommendation && (
              <WaterSubsidiesCard recommendation={recommendation} farm={currentFarm} />
            )}
          </div>
        )}

        {/* Satellite Dedicated Tab */}
        {activeTab === 'satellite' && recommendation && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <SatelliteNdviCard
              farm={currentFarm}
              baselineKc={recommendation.schedule[0]?.kc ?? 1.15}
              onApplySatelliteKc={handleApplySatelliteKc}
            />
            <SoilMoistureSensorCard farm={currentFarm} />
            <IrrigationCalculatorCard
              recommendation={recommendation}
              farm={currentFarm}
              onRefresh={() => loadAgronomicData(currentFarm)}
              isLoading={isLoading}
            />
          </div>
        )}

        {activeTab === 'analytics' && recommendation && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <WaterAnalyticsChart recommendation={recommendation} farm={currentFarm} />
            <IrrigationCalculatorCard
              recommendation={recommendation}
              farm={currentFarm}
              onRefresh={() => loadAgronomicData(currentFarm)}
              isLoading={isLoading}
            />
          </div>
        )}

        {activeTab === 'subsidies' && recommendation && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <WaterSubsidiesCard recommendation={recommendation} farm={currentFarm} />
            <WaterAnalyticsChart recommendation={recommendation} farm={currentFarm} />
          </div>
        )}

        {activeTab === 'blockchain' && recommendation && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <SolanaVerifierCard
              recommendation={recommendation}
              onProofCreated={handleProofCreated}
            />
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <CentralAsiaChallenge />
          </div>
        )}

        {/* Bottom Aral Sea & Climate Context Banner if on Dashboard */}
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

      {/* Farm Create/Edit Modal */}
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
    <LanguageProvider>
      <WalletProvider>
        <DashboardApp />
      </WalletProvider>
    </LanguageProvider>
  );
}
