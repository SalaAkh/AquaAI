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

interface AiAdvisorCardProps {
  recommendation: IrrigationRecommendation;
  onUpdateExplanation?: (explanation: NonNullable<IrrigationRecommendation['aiExplanation']>) => void;
}

export const AiAdvisorCard: React.FC<AiAdvisorCardProps> = ({
  recommendation,
  onUpdateExplanation,
}) => {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState(
    recommendation.aiExplanation || {
      summary: `Your ${recommendation.farmName} requires approximately ${recommendation.totalGrossIrrigationMm} mm (${recommendation.totalVolumeM3.toLocaleString()} m³) of irrigation over the next ${recommendation.forecastDays} days. Forecast precipitation of ${recommendation.totalPrecipitationMm} mm is insufficient to cover estimated crop water demand.`,
      farmerAdvice: `Distribute applications in early morning or evening windows (${recommendation.recommendedWindowSummary}) to suppress atmospheric evaporative losses.`,
      conservationImpact: `Following this precision schedule saves approximately ${recommendation.potentialTotalSavingsM3.toLocaleString()} m³ (${recommendation.potentialSavingsPercentage}%) compared to regional 50% efficiency furrow flooding.`,
      modelConfidence: 'high' as const,
      source: 'algorithmic_fallback' as const,
    }
  );

  React.useEffect(() => {
    if (recommendation.aiExplanation) {
      setExplanation(recommendation.aiExplanation);
    } else {
      setExplanation({
        summary: `Your ${recommendation.farmName} requires approximately ${recommendation.totalGrossIrrigationMm} mm (${recommendation.totalVolumeM3.toLocaleString()} m³) of irrigation over the next ${recommendation.forecastDays} days. Forecast precipitation of ${recommendation.totalPrecipitationMm} mm is insufficient to cover estimated crop water demand.`,
        farmerAdvice: `Distribute applications in early morning or evening windows (${recommendation.recommendedWindowSummary}) to suppress atmospheric evaporative losses.`,
        conservationImpact: `Following this precision schedule saves approximately ${recommendation.potentialTotalSavingsM3.toLocaleString()} m³ (${recommendation.potentialSavingsPercentage}%) compared to regional 50% efficiency furrow flooding.`,
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
              <h3 className="text-sm font-bold text-slate-900">Gemini Agronomic Advisor</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Grounded on FAO-56
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Plain-language synthesis for farmers &amp; water masters
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
            <span>{loading ? 'Consulting Gemini...' : 'Regenerate Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Core summary highlight */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-sky-600" />
            Core Recommendation
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
              Operational Farmer Advice
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {explanation.farmerAdvice}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/30">
            <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Conservation &amp; Efficiency Impact
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
            <span>AI responses are strictly constrained to FAO-56 inputs without synthetic observations.</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">
            Confidence: {explanation.modelConfidence.toUpperCase()} • Mode: {explanation.source}
          </span>
        </div>
      </div>
    </div>
  );
};
