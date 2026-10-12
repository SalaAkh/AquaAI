'use client';

import React from 'react';
import {
  Waves,
  Mountain,
  TrendingDown,
  Droplets,
  ShieldAlert,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export const CentralAsiaChallenge: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-8">
      {/* Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 mb-3">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{t.crisisBadge}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.crisisTitle}
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
          {t.crisisSubtitle}
        </p>
      </div>

      {/* 3 Core Crisis Realities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Waves className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">{t.aralDepletionTitle}</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t.aralDepletionDesc}
          </p>
          <div className="pt-2 border-t border-slate-200 text-[11px] font-semibold text-slate-700">
            {t.aralImpact}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
            <Mountain className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">{t.glacierRetreatTitle}</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t.glacierRetreatDesc}
          </p>
          <div className="pt-2 border-t border-slate-200 text-[11px] font-semibold text-slate-700">
            {t.glacierImpact}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">{t.floodLossTitle}</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t.floodLossDesc}
          </p>
          <div className="pt-2 border-t border-slate-200 text-[11px] font-semibold text-slate-700">
            {t.floodSolution}
          </div>
        </div>
      </div>

      {/* How AquaAI Solves It */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-900 to-slate-900 text-white space-y-4">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <Droplets className="w-4 h-4" />
          {t.interventionBadge}
        </div>
        <h3 className="text-xl font-bold text-white">
          {t.interventionTitle}
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
          {t.interventionDesc}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs">
            <div className="text-xl font-bold text-cyan-300">30-45%</div>
            <div className="text-[11px] text-slate-300 mt-0.5">{t.statWaterSavings}</div>
          </div>
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs">
            <div className="text-xl font-bold text-emerald-300">100%</div>
            <div className="text-[11px] text-slate-300 mt-0.5">{t.statFaoAdherence}</div>
          </div>
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs">
            <div className="text-xl font-bold text-sky-300">0 kg</div>
            <div className="text-[11px] text-slate-300 mt-0.5">{t.statSensorBarrier}</div>
          </div>
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs">
            <div className="text-xl font-bold text-purple-300">Solana</div>
            <div className="text-[11px] text-slate-300 mt-0.5">{t.statSolanaAudit}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
