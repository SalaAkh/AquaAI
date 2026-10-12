'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Info,
  Zap,
} from 'lucide-react';
import { FarmProfile, IrrigationRecommendation } from '@/lib/types';
import { useTranslation, formatLocalizedDate, getIrrigationMethodInfo } from '@/lib/i18n';

interface WaterAnalyticsChartProps {
  recommendation: IrrigationRecommendation;
  farm: FarmProfile;
}

export const WaterAnalyticsChart: React.FC<WaterAnalyticsChartProps> = ({
  recommendation,
  farm,
}) => {
  const { t, language } = useTranslation();
  const [activeMetric, setActiveMetric] = useState<'volume' | 'depth'>('volume');

  const schedule = recommendation.schedule;
  const maxVolume = Math.max(...schedule.map((s) => Math.max(s.baselineVolumeM3, s.waterVolumeM3)), 100);
  const maxDepth = Math.max(...schedule.map((s) => Math.max(s.etcMm, s.grossIrrigationMm, s.precipitationMm)), 5);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
      {/* Title & Metric Switcher */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{t.analyticsTitle}</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.analyticsSubtitle}
          </p>
        </div>

        {/* Metric Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveMetric('volume')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeMetric === 'volume'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.metricVolume}
          </button>
          <button
            onClick={() => setActiveMetric('depth')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeMetric === 'depth'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.metricDepth}
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">
            {t.baselineConsumption}
          </span>
          <div className="mt-1 text-2xl font-bold text-slate-700">
            {recommendation.baselineTotalVolumeM3.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">m³</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {t.baselineBenchmark}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-200/70">
          <span className="text-[11px] font-semibold text-sky-800 uppercase">
            {t.aquaAiPrescribed}
          </span>
          <div className="mt-1 text-2xl font-bold text-sky-900">
            {recommendation.totalVolumeM3.toLocaleString()}{' '}
            <span className="text-xs font-normal text-sky-600">m³</span>
          </div>
          <div className="text-[11px] text-sky-700 mt-1">
            {getIrrigationMethodInfo(farm.irrigationMethod, t).title}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/70">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase">
            {t.projectedWaterSavings}
          </span>
          <div className="mt-1 text-2xl font-bold text-emerald-700">
            {recommendation.potentialTotalSavingsM3.toLocaleString()}{' '}
            <span className="text-xs font-normal text-emerald-600">m³</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            ↓ {recommendation.potentialSavingsPercentage}% {t.conservedVsFlood}
          </div>
        </div>
      </div>

      {/* SVG Interactive Chart Visualizer */}
      <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
        <div className="flex items-center justify-between mb-4 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">
            {activeMetric === 'volume' ? t.chartTitleVolume : t.chartTitleDepth}
          </span>
          <div className="flex items-center gap-4">
            {activeMetric === 'volume' ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-slate-300" />
                  <span>{t.legendBaseline}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-sky-500" />
                  <span>{t.legendAquaAi}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-500" />
                  <span>{t.legendCropEtc}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-blue-400" />
                  <span>{t.legendRain}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-teal-500" />
                  <span>{t.legendGross}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bars Container */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 h-64 items-end pt-6 pb-2 px-2 border-b border-slate-200">
          {schedule.map((day) => {
            const baselineHeight = maxVolume > 0 ? (day.baselineVolumeM3 / maxVolume) * 100 : 0;
            const volumeHeight = maxVolume > 0 ? (day.waterVolumeM3 / maxVolume) * 100 : 0;

            const etcHeight = maxDepth > 0 ? (day.etcMm / maxDepth) * 100 : 0;
            const rainHeight = maxDepth > 0 ? (day.precipitationMm / maxDepth) * 100 : 0;
            const grossHeight = maxDepth > 0 ? (day.grossIrrigationMm / maxDepth) * 100 : 0;

            const localizedDate = formatLocalizedDate(day.date, language);

            return (
              <div key={day.date} className="h-full flex flex-col justify-end items-center group relative">
                {/* Tooltip on Hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] rounded-lg p-2 pointer-events-none z-20 whitespace-nowrap shadow-lg">
                  <div className="font-bold text-sky-300">{localizedDate}</div>
                  {activeMetric === 'volume' ? (
                    <>
                      <div>{t.legendAquaAi}: {day.waterVolumeM3.toLocaleString()} m³</div>
                      <div>{t.legendBaseline}: {day.baselineVolumeM3.toLocaleString()} m³</div>
                      <div className="text-emerald-400 font-semibold">
                        {t.projectedWaterSavings}: {day.potentialSavingsM3.toLocaleString()} m³
                      </div>
                    </>
                  ) : (
                    <>
                      <div>{t.legendCropEtc}: {day.etcMm} mm</div>
                      <div>{t.legendRain}: {day.precipitationMm} mm</div>
                      <div>{t.legendGross}: {day.grossIrrigationMm} mm</div>
                    </>
                  )}
                </div>

                {/* Bars */}
                {activeMetric === 'volume' ? (
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    {/* Baseline Bar */}
                    <div
                      style={{ height: `${Math.max(6, baselineHeight)}%` }}
                      className="w-1/2 max-w-[28px] bg-slate-200 rounded-t-md transition-all group-hover:bg-slate-300"
                    />
                    {/* AquaAI Bar */}
                    <div
                      style={{ height: `${Math.max(6, volumeHeight)}%` }}
                      className="w-1/2 max-w-[28px] bg-gradient-to-t from-sky-600 to-cyan-400 rounded-t-md transition-all group-hover:brightness-110 shadow-xs"
                    />
                  </div>
                ) : (
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    {/* ETc bar */}
                    <div
                      style={{ height: `${Math.max(6, etcHeight)}%` }}
                      className="w-1/3 max-w-[18px] bg-amber-400/80 rounded-t-md transition-all"
                    />
                    {/* Rain bar */}
                    <div
                      style={{ height: `${Math.max(6, rainHeight)}%` }}
                      className="w-1/3 max-w-[18px] bg-blue-400 rounded-t-md transition-all"
                    />
                    {/* Gross Irrigation bar */}
                    <div
                      style={{ height: `${Math.max(6, grossHeight)}%` }}
                      className="w-1/3 max-w-[18px] bg-teal-500 rounded-t-md transition-all"
                    />
                  </div>
                )}

                {/* Day label */}
                <div className="mt-2 text-[10px] font-semibold text-slate-600 truncate max-w-full">
                  {localizedDate.split(',')[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Energy & Fuel ROI Grid */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/50 via-slate-50 to-emerald-50/40 border border-slate-250 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            {language === 'kk' ? 'Энергетикалық және экологиялық тиімділік (Сорғы ROI)' : language === 'ru' ? 'Энергетическая и экологическая эффективность (ROI насосов)' : 'Energy & Fuel Savings (Pump ROI)'}
          </span>
          <span className="text-[11px] text-slate-500">
            {language === 'kk' ? 'Су айдау көлемін азайту есебінен' : language === 'ru' ? 'За счёт снижения перекачки влаги' : 'From pumping volume reduction'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-medium">
              {language === 'kk' ? 'Электр энергиясы:' : language === 'ru' ? 'Электроэнергия:' : 'Electricity:'}
            </div>
            <div className="mt-1 text-lg font-extrabold text-amber-700">
              {Math.round(recommendation.potentialTotalSavingsM3 * 0.35).toLocaleString()} <span className="text-xs font-normal text-slate-500">кВт⋅ч</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">0.35 kWh / 1 m³</div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-medium">
              {language === 'kk' ? 'Дизель отыны:' : language === 'ru' ? 'Дизельное топливо:' : 'Diesel fuel:'}
            </div>
            <div className="mt-1 text-lg font-extrabold text-sky-800">
              {Math.round(recommendation.potentialTotalSavingsM3 * 0.08).toLocaleString()} <span className="text-xs font-normal text-slate-500">L</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">0.08 L / 1 m³</div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-medium">
              {language === 'kk' ? 'ЖЖМ үнемдеу:' : language === 'ru' ? 'Экономия на ГСМ:' : 'Fuel costs saved:'}
            </div>
            <div className="mt-1 text-lg font-extrabold text-emerald-700">
              ₸ {Math.round(recommendation.potentialTotalSavingsM3 * 0.08 * 350).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">@ 350 ₸ / L</div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-medium">
              {language === 'kk' ? 'CO₂ азайту:' : language === 'ru' ? 'Сокращение CO₂:' : 'Carbon offset:'}
            </div>
            <div className="mt-1 text-lg font-extrabold text-teal-800">
              {(Math.round(recommendation.potentialTotalSavingsM3 * 0.35 * 0.62) / 1000).toFixed(2)} <span className="text-xs font-normal text-slate-500">t CO₂</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">ESG / Carbon</div>
          </div>
        </div>
      </div>

      {/* Assumptions & Integrity Note */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
        <div className="font-semibold text-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-sky-600" />
            <span>{language === 'kk' ? 'Гидрологиялық ашықтық және эталон' : language === 'ru' ? 'Прозрачность расчётов и базовый эталон' : 'Hydrological Transparency & Baseline'}</span>
          </div>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            Model Projection • Not a physical meter result
          </span>
        </div>
        <p className="leading-relaxed">
          {language === 'kk'
            ? 'Су үнемдеу есебі Орталық Азиядағы 50% ПӘК бар дәстүрлі топырақ арықпен суаруға қарсы есептелген. Бұл мән физикалық есептегіш көрсеткіші емес, математикалық модельдің болжамы.'
            : language === 'ru'
            ? 'Расчёт экономии смоделирован против регионального базового уровня традиционного арычного полива с КПД 50%. Значение является расчётным показателем математической модели, а не замером физического расходомера.'
            : 'Savings are modeled against regional unlined furrow flood baselines at 50% application efficiency. This figure represents an agronomic simulation projection, not a physical meter measurement.'}
        </p>
      </div>
    </div>
  );
};
