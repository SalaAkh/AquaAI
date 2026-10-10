'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  ShieldCheck,
  RefreshCw,
  Lightbulb,
  Droplets,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { IrrigationRecommendation } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';

interface AiAdvisorCardProps {
  recommendation: IrrigationRecommendation;
  onUpdateExplanation?: (explanation: NonNullable<IrrigationRecommendation['aiExplanation']>) => void;
}

export const AiAdvisorCard: React.FC<AiAdvisorCardProps> = ({
  recommendation,
  onUpdateExplanation,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState(
    recommendation.aiExplanation || {
      summary: `Хозяйству ${recommendation.farmName} требуется ориентировочно ${recommendation.totalGrossIrrigationMm} мм (${recommendation.totalVolumeM3.toLocaleString()} м³) полива на ближайшие ${recommendation.forecastDays} дней. Прогноз осадков (${recommendation.totalPrecipitationMm} мм) недостаточен для покрытия водного дефицита культуры.`,
      farmerAdvice: `Распределите полив на ранние утренние часы (${recommendation.recommendedWindowSummary}), чтобы минимизировать ветровой снос и пиковое испарение.`,
      conservationImpact: `Соблюдение данного графика экономит ориентировочно ${recommendation.potentialTotalSavingsM3.toLocaleString()} м³ (${recommendation.potentialSavingsPercentage}%) по сравнению с традиционным затоплением.`,
      modelConfidence: 'high' as const,
      source: 'algorithmic_fallback' as const,
    }
  );

  React.useEffect(() => {
    if (recommendation.aiExplanation) {
      setExplanation(recommendation.aiExplanation);
    } else {
      setExplanation({
        summary: `Хозяйству ${recommendation.farmName} требуется ориентировочно ${recommendation.totalGrossIrrigationMm} мм (${recommendation.totalVolumeM3.toLocaleString()} м³) полива на ближайшие ${recommendation.forecastDays} дней. Прогноз осадков (${recommendation.totalPrecipitationMm} мм) недостаточен для покрытия водного дефицита культуры.`,
        farmerAdvice: `Распределите полив на ранние утренние часы (${recommendation.recommendedWindowSummary}), чтобы минимизировать ветровой снос и пиковое испарение.`,
        conservationImpact: `Соблюдение данного графика экономит ориентировочно ${recommendation.potentialTotalSavingsM3.toLocaleString()} м³ (${recommendation.potentialSavingsPercentage}%) по сравнению с традиционным затоплением.`,
        modelConfidence: 'high' as const,
        source: 'algorithmic_fallback' as const,
      });
    }
  }, [recommendation]);

  const handleAskGemini = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendation }),
      });

      if (res.ok) {
        const data = await res.json();
        const updated = {
          summary: data.summary,
          farmerAdvice: data.farmerAdvice,
          conservationImpact: data.conservationImpact,
          modelConfidence: data.modelConfidence || 'high',
          source: data.source || 'gemini',
        };
        setExplanation(updated);
        if (onUpdateExplanation) {
          onUpdateExplanation(updated);
        }
      }
    } catch (err) {
      console.error('Failed to query AI advisor:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-sky-50/60 via-white to-emerald-50/40">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-tr from-sky-600 to-emerald-500 text-white rounded-xl shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">{t.advisorTitle}</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Grounded on FAO-56
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {t.advisorSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAskGemini}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Консультация с Gemini...' : t.refreshAiBtn}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Core summary highlight */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-sky-600" />
            Ключевой вывод гидромодели
          </div>
          <p className="text-sm font-medium text-slate-800 leading-relaxed">
            &ldquo;{explanation.summary}&rdquo;
          </p>
        </div>

        {/* Practical Farmer Guidance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200/80 bg-white">
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              {t.operationalAdviceTitle}
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {explanation.farmerAdvice}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/30">
            <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {t.impactTitle}
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed font-medium">
              {explanation.conservationImpact}
            </p>
          </div>
        </div>

        {/* Scientific Integrity Disclaimer */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Рекомендации строго ограничены физическими расчётами FAO-56.</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">
            Достоверность: {explanation.modelConfidence.toUpperCase()} • Режим: {explanation.source}
          </span>
        </div>
      </div>
    </div>
  );
};
