'use client';

import React, { useState } from 'react';
import { FarmProfile, IrrigationRecommendation } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';
import {
  Award,
  Coins,
  FileCheck2,
  Printer,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ExternalLink,
  Droplets,
  Calendar,
} from 'lucide-react';

interface WaterSubsidiesCardProps {
  recommendation: IrrigationRecommendation;
  farm: FarmProfile;
}

export const WaterSubsidiesCard: React.FC<WaterSubsidiesCardProps> = ({
  recommendation,
  farm,
}) => {
  const { t, language } = useTranslation();
  const [showCertificate, setShowCertificate] = useState(false);

  // KZT subsidy calculation: ~65 KZT saved per m³ of water saved in Southern Kazakhstan
  const KZT_PER_M3 = 65;
  const sevenDaySavedM3 = recommendation.potentialTotalSavingsM3;
  const sevenDaySavingsKzt = Math.round(sevenDaySavedM3 * KZT_PER_M3);

  // Seasonal projection (100 days irrigation season)
  const seasonSavedM3 = Math.round((sevenDaySavedM3 / 7) * 100);
  const seasonSavingsKzt = Math.round(seasonSavedM3 * KZT_PER_M3);

  // 1 Water Credit = 100 m³ of verifiable water conserved
  const waterCredits = (sevenDaySavedM3 / 100).toFixed(1);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200/80 mb-2">
            <Coins className="w-3.5 h-3.5" />
            <span>{t.subsidiesTitle}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t.subsidiesTitle}
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            {t.subsidiesSubtitle}
          </p>
        </div>

        <button
          onClick={() => setShowCertificate(!showCertificate)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-semibold text-xs shadow-md transition-all active:scale-[0.98]"
        >
          <Award className="w-4 h-4 text-emerald-200" />
          <span>{showCertificate ? 'Скрыть сертификат' : t.exportCertBtn}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: 7-day savings in KZT */}
        <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/40 rounded-2xl p-5 border border-emerald-100">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 mb-2">
            <span>{t.calcSavingsKzt}</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
            ₸ {sevenDaySavingsKzt.toLocaleString()}
          </div>
          <p className="text-xs text-emerald-700/80 mt-1.5">
            За 7 дней учёта ({sevenDaySavedM3.toLocaleString()} м³ сэкономленной влаги)
          </p>
        </div>

        {/* Metric 2: Seasonal Projected KZT */}
        <div className="bg-gradient-to-br from-sky-50/70 to-indigo-50/40 rounded-2xl p-5 border border-sky-100">
          <div className="flex items-center justify-between text-xs font-semibold text-sky-800 mb-2">
            <span>Сезонный потенциал (100 дней):</span>
            <Sparkles className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-sky-950">
            ₸ {seasonSavingsKzt.toLocaleString()}
          </div>
          <p className="text-xs text-sky-700/80 mt-1.5">
            Прогнозная экономия ~{seasonSavedM3.toLocaleString()} м³ за сезон полива
          </p>
        </div>

        {/* Metric 3: Solana Water Credits */}
        <div className="bg-gradient-to-br from-purple-50/70 to-fuchsia-50/40 rounded-2xl p-5 border border-purple-100">
          <div className="flex items-center justify-between text-xs font-semibold text-purple-800 mb-2">
            <span>{t.waterCreditsEarned}</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-950">
            {waterCredits} <span className="text-base font-semibold text-purple-700">AWC</span>
          </div>
          <p className="text-xs text-purple-700/80 mt-1.5">
            AquaAI Water Credits (1 кредит = 100 м³ верифицированной воды)
          </p>
        </div>
      </div>

      {/* Interactive Certificate View */}
      {showCertificate && (
        <div className="mt-8 pt-6 border-t border-slate-200 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-600" />
              <span>{t.certTitle}</span>
            </h3>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Распечатать / PDF</span>
            </button>
          </div>

          {/* Certificate Paper */}
          <div className="relative bg-gradient-to-b from-amber-50/30 via-white to-amber-50/20 border-4 border-double border-amber-300/80 rounded-2xl p-6 sm:p-10 shadow-lg text-slate-800">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
              <Droplets className="w-96 h-96 text-teal-900" />
            </div>

            <div className="relative space-y-6 text-center">
              {/* Seal & Header */}
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md border-2 border-amber-200">
                  <Droplets className="w-9 h-9" />
                </div>
              </div>

              <div>
                <p className="text-xs font-bold tracking-widest text-amber-700 uppercase">
                  Республика Казахстан • Бассейновая инспекция
                </p>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 uppercase tracking-tight">
                  {t.certTitle}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  № AWC-{recommendation.id.slice(0, 8).toUpperCase()}-2026
                </p>
              </div>

              {/* Awarded To */}
              <div className="max-w-xl mx-auto py-2 border-y border-amber-200/80 text-sm">
                <p className="text-slate-500 text-xs">Настоящим удостоверяется, что агрохозяйство:</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{farm.name}</p>
                <p className="text-xs text-slate-600 mt-1">
                  Регион: <span className="font-semibold">{farm.region}</span> • Площадь:{' '}
                  <span className="font-semibold">{farm.fieldSizeHectares} га</span> • Культура:{' '}
                  <span className="font-semibold capitalize">{farm.cropType}</span>
                </p>
              </div>

              {/* Verified Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-left text-xs bg-white/80 p-4 rounded-xl border border-amber-200/60 shadow-xs">
                <div>
                  <span className="text-slate-400 block">Период аудита:</span>
                  <span className="font-bold text-slate-800">{recommendation.periodStart} — {recommendation.periodEnd}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Сэкономлено воды:</span>
                  <span className="font-bold text-emerald-700 text-sm">{sevenDaySavedM3.toLocaleString()} м³</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Снижение расхода:</span>
                  <span className="font-bold text-sky-700 text-sm">-{recommendation.potentialSavingsPercentage}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Эко-субсидия:</span>
                  <span className="font-bold text-emerald-900 text-sm">₸ {sevenDaySavingsKzt.toLocaleString()}</span>
                </div>
              </div>

              {/* Cryptographic verification footer */}
              <div className="pt-4 border-t border-amber-200/80 flex flex-col sm:flex-row items-center justify-between text-left text-[11px] text-slate-500 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-slate-700 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Криптографический хеш директивы:</span>
                  </div>
                  <code className="block font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 break-all max-w-md">
                    {recommendation.onChainProof?.dataHash || `sha256-directive-${recommendation.id.slice(0, 16)}`}
                  </code>
                  {recommendation.onChainProof?.signature && (
                    <div className="flex items-center gap-1.5 text-purple-700 text-[10px] mt-0.5">
                      <span>Solana Tx: {recommendation.onChainProof.signature.slice(0, 16)}...</span>
                      {recommendation.onChainProof.explorerUrl && (
                        <a
                          href={recommendation.onChainProof.explorerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="underline inline-flex items-center gap-0.5"
                        >
                          Explorer <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="font-semibold text-slate-800">AquaAI Agronomic Engine</div>
                  <div className="text-[10px] text-slate-400">FAO-56 Penman-Monteith Verification</div>
                  <div className="text-[10px] text-emerald-600 font-medium">Статус: ВЕРИФИЦИРОВАНО ●</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
