'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Brain,
  Droplets,
  Calculator,
  Layers,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Send,
  MessageSquare,
  ShieldCheck,
  User,
  Lightbulb,
  FileSpreadsheet,
} from 'lucide-react';
import { FarmProfile, IrrigationRecommendation } from '@/lib/types';
import { useTranslation, getCropLabel, getGrowthStageInfo, getIrrigationMethodInfo, getLocalizedWindow } from '@/lib/i18n';
import { getAgronomicAdvisorExplanation, getAgronomicChatReply } from '@/lib/ai-service';

interface AiAdvisorViewProps {
  currentFarm: FarmProfile;
  recommendation: IrrigationRecommendation | null;
  isLoading: boolean;
  onRecalculate: () => void;
  onUpdateExplanation?: (explanation: NonNullable<IrrigationRecommendation['aiExplanation']>) => void;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  time: string;
}

export const AiAdvisorView: React.FC<AiAdvisorViewProps> = ({
  currentFarm,
  recommendation,
  isLoading,
  onRecalculate,
  onUpdateExplanation,
}) => {
  const { t, language } = useTranslation();
  const [isExplaining, setIsExplaining] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isSending, setIsSending] = useState(false);

  const getLocalizedWelcome = () => {
    const fName = currentFarm.name;
    if (language === 'kk') {
      return `Сәлеметсіз бе! Мен AquaAI гидролог-кеңесшісімін. «${fName}» алқабының FAO-56 есептеулері, булануды азайту және суару кестесі бойынша сұрақтарыңызға жауап беруге дайынмын.`;
    }
    if (language === 'ru') {
      return `Здравствуйте! Я агроном-гидролог AquaAI. Готов объяснить расчёт потребности по модели FAO-56 для поля «${fName}», оптимальное окно полива и предотвращение испарения.`;
    }
    return `Hello! I am your AquaAI agronomic advisor. Ready to explain the FAO-56 calculation results for "${fName}", optimal timing windows, and evaporative loss prevention.`;
  };

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: getLocalizedWelcome(),
      time: 'Just now',
    },
  ]);

  const handleAskGemini = async () => {
    if (!recommendation) return;
    setIsExplaining(true);
    try {
      const expl = await getAgronomicAdvisorExplanation(recommendation, language);
      if (onUpdateExplanation) {
        onUpdateExplanation(expl);
      }
    } catch (err) {
      console.error('Failed to trigger AI explanation:', err);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const q = (textToSend || inputQuery).trim();
    if (!q || isSending) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsSending(true);

    try {
      const { reply } = await getAgronomicChatReply(
        q,
        currentFarm,
        recommendation ?? undefined,
        language,
        chatMessages.slice(-4)
      );
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: 'Calculation engine response ready. Maintain root-zone moisture between 65-80% of field capacity.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const quickPrompts = [
    t.quickPrompt1,
    t.quickPrompt2,
    t.quickPrompt3,
    t.quickPrompt4,
  ];

  if (!recommendation) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto">
          <Brain className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Loading Agronomic Advisor...</h3>
        <p className="text-xs text-slate-500">
          Gathering live meteorological forecast and computing FAO-56 crop water demand for {currentFarm.name}...
        </p>
        <button
          onClick={onRecalculate}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          Calculate Now
        </button>
      </div>
    );
  }

  const stageInfo = getGrowthStageInfo(currentFarm.growthStage, t);
  const methodInfo = getIrrigationMethodInfo(currentFarm.irrigationMethod, t);
  const activeKc = recommendation.schedule[0]?.kc ?? 1.15;
  const eff = recommendation.assumptions.irrigationEfficiency;
  const aiExplanation = recommendation.aiExplanation;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Irrigation Advisor &amp; Hydrology Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              FAO-56 Mathematical Model &amp; Gemini Guidance
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Every irrigation recommendation is mathematically derived from Penman-Monteith reference evapotranspiration (ET₀), single crop coefficients (Kc), and effective precipitation. No fictitious sensor measurements are invented.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2.5">
            <button
              onClick={handleAskGemini}
              disabled={isExplaining || isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isExplaining ? 'animate-spin' : ''}`} />
              <span>{isExplaining ? 'Consulting Gemini...' : 'Explain with Gemini AI'}</span>
            </button>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Period: {recommendation.periodStart} — {recommendation.periodEnd} ({recommendation.forecastDays} days)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary AI Explanation Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Agronomic Directive &amp; AI Analysis</h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    aiExplanation?.source === 'gemini'
                      ? 'bg-purple-50 text-purple-800 border-purple-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {aiExplanation?.source === 'gemini' ? 'Gemini 2.0 Flash' : 'FAO-56 Grounded Calculation'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Field: <strong>{currentFarm.name}</strong> • {currentFarm.fieldSizeHectares} ha • {getCropLabel(currentFarm.cropType, t)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRecalculate}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Recalculate Model</span>
            </button>
          </div>
        </div>

        {/* Core Summary Callout */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-50/80 via-white to-emerald-50/80 border border-sky-200/80 shadow-2xs">
          <div className="text-xs font-bold text-sky-900 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-600" />
            <span>Executive Recommendation Summary</span>
          </div>
          <p className="text-base font-semibold text-slate-800 leading-relaxed">
            {aiExplanation?.summary || (
              <>
                Field &ldquo;{currentFarm.name}&rdquo; requires approximately{' '}
                <strong className="text-slate-950 font-bold">{recommendation.totalGrossIrrigationMm} mm</strong>{' '}
                (<strong className="text-sky-700 font-bold">{recommendation.totalVolumeM3.toLocaleString()} m³</strong>) of gross irrigation across the next {recommendation.forecastDays} days. Forecast precipitation ({recommendation.totalPrecipitationMm} mm) is insufficient to satisfy crop evapotranspiration demand.
              </>
            )}
          </p>
        </div>

        {/* Operational Guidance & Conservation Impact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs space-y-2">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Operational Timing &amp; Anti-Evaporation Window</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {aiExplanation?.farmerAdvice || (
                <>
                  Apply scheduled water during the recommended window (
                  <strong>{getLocalizedWindow(recommendation.recommendedWindowSummary, language)}</strong>) to avoid midday thermal vapor pressure deficit and wind drift losses.
                </>
              )}
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 shadow-2xs space-y-2">
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Water Conservation Impact (Estimated Projection)</span>
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed font-semibold">
              {aiExplanation?.conservationImpact || (
                <>
                  Adhering to this precision schedule conserves approximately{' '}
                  <strong>{recommendation.potentialTotalSavingsM3.toLocaleString()} m³</strong> ({recommendation.potentialSavingsPercentage}%) compared to regional 50% flood irrigation baselines.
                </>
              )}
            </p>
            <div className="text-[10px] text-emerald-700/80 pt-1">
              *Model projection benchmark comparing precision delivery vs. traditional Central Asian canal inundation.
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Mathematical Hydrology Pipeline (FAO-56) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-2">
            <Calculator className="w-3.5 h-3.5 text-sky-600" />
            <span>FAO Irrigation and Drainage Paper No. 56</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Step-by-Step Agronomic Calculation Pipeline
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Complete transparency into how crop demand, natural rainfall, application efficiency, and final cubic meter volumes are calculated.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1: ETc = ET0 * Kc */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>STEP 1: CROP DEMAND</span>
              <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">ETc = ET₀ × Kc</span>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {recommendation.totalEtcMm} <span className="text-xs font-normal text-slate-500">mm</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-tight">
              ET₀ sum: {(recommendation.schedule.reduce((a, s) => a + s.et0Mm, 0)).toFixed(1)} mm × Kc {activeKc} ({getCropLabel(currentFarm.cropType, t)}).
            </p>
          </div>

          {/* Step 2: Peff */}
          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-sky-800">
              <span>STEP 2: EFFECTIVE RAIN</span>
              <span className="font-mono text-[10px] bg-sky-200/80 px-1.5 py-0.5 rounded">P_eff</span>
            </div>
            <div className="text-2xl font-black text-sky-900">
              {recommendation.totalEffectiveRainfallMm} <span className="text-xs font-normal text-sky-600">mm</span>
            </div>
            <p className="text-[11px] text-sky-800 leading-tight">
              Precipitation: {recommendation.totalPrecipitationMm} mm. First 1.5mm intercepts canopy; remaining at 80% infiltration.
            </p>
          </div>

          {/* Step 3: Net Deficit & Gross Depth */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-800">
              <span>STEP 3: GROSS DEPTH</span>
              <span className="font-mono text-[10px] bg-amber-200/80 px-1.5 py-0.5 rounded">I_gross = Net / Eff</span>
            </div>
            <div className="text-2xl font-black text-amber-900">
              {recommendation.totalGrossIrrigationMm} <span className="text-xs font-normal text-amber-700">mm</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-tight">
              Net deficit: {recommendation.totalNetIrrigationMm} mm divided by {Math.round(eff * 100)}% delivery efficiency.
            </p>
          </div>

          {/* Step 4: Volumetric Conversion */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
              <span>STEP 4: VOLUME (m³)</span>
              <span className="font-mono text-[10px] bg-emerald-200/80 px-1.5 py-0.5 rounded">1 mm × ha × 10</span>
            </div>
            <div className="text-2xl font-black text-emerald-900">
              {recommendation.totalVolumeM3.toLocaleString()} <span className="text-xs font-normal text-emerald-700">m³</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-tight">
              Conversion: 1 mm depth across 1 ha equals exactly 10 m³ water. Field area: {currentFarm.fieldSizeHectares} ha.
            </p>
          </div>
        </div>

        {/* Inputs & Assumptions Table */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Input Parameters Fed to Model</span>
            </h4>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Field Name:</span>
                <span className="font-semibold text-slate-900">{currentFarm.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Geographic Coordinates:</span>
                <span className="font-mono font-semibold text-slate-900">{currentFarm.latitude.toFixed(4)}°, {currentFarm.longitude.toFixed(4)}°</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Field Area:</span>
                <span className="font-semibold text-slate-900">{currentFarm.fieldSizeHectares} hectares</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Crop &amp; Growth Stage:</span>
                <span className="font-semibold text-slate-900">{getCropLabel(currentFarm.cropType, t)} ({stageInfo.title})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">FAO-56 Kc Factor:</span>
                <span className="font-mono font-semibold text-slate-900">{activeKc}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Application Efficiency:</span>
                <span className="font-semibold text-slate-900">{Math.round(eff * 100)}% ({methodInfo.title})</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Assumptions &amp; Scientific Limitations</span>
            </h4>
            <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200/70 text-xs space-y-2 text-amber-950">
              <div className="font-bold text-amber-900 mb-1">Standard: {recommendation.assumptions.faoStandard}</div>
              <ul className="list-disc list-inside space-y-1.5 text-amber-900/90 leading-relaxed text-[11px]">
                <li><strong>Baseline Benchmark:</strong> {recommendation.assumptions.baselineMethod}.</li>
                <li><strong>Weather Source:</strong> {recommendation.assumptions.weatherSource}.</li>
                {recommendation.limitations.map((lim, idx) => (
                  <li key={idx}>{lim}</li>
                ))}
                <li><strong>Integrity:</strong> Model values represent hydrological calculations and must not be cited as direct physical water-meter or sensor measurements.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Agronomic Consultation Chat */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-600" />
              <span>Interactive Agronomic Advisor Consultation</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ask questions regarding soil salinity, high heat windows, fertigation timing, or storm delays.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Grounded in FAO-56</span>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.replace(/^[^\s]+\s/, ''))}
              className="text-xs font-medium px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-sky-50 hover:text-sky-800 text-slate-600 border border-slate-200/80 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat message display */}
        <div className="space-y-3 max-h-72 overflow-y-auto p-4 rounded-2xl bg-slate-50/70 border border-slate-200">
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 text-xs ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="w-7 h-7 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed shadow-2xs ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-800 border border-slate-200/90'
                }`}
              >
                <p>{msg.text}</p>
                <span
                  className={`block text-[10px] mt-1 ${
                    msg.role === 'user' ? 'text-slate-400 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.time}
                </span>
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isSending && (
            <div className="flex gap-2.5 text-xs items-center text-slate-500 italic py-1">
              <Bot className="w-4 h-4 text-sky-600 animate-spin" />
              <span>Formulating hydrological agronomist guidance...</span>
            </div>
          )}
        </div>

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isSending}
            placeholder="Ask about night irrigation, salinity leaching, fertigation, or rain delay..."
            className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium"
          />
          <button
            type="submit"
            disabled={isSending || !inputQuery.trim()}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
