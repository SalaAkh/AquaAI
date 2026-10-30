'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Info,
  Zap,
  SlidersHorizontal,
  FileText,
  TrendingDown,
  TrendingUp,
  Scale,
  CheckCircle2,
} from 'lucide-react';
import { FarmProfile, IrrigationRecommendation, EconomicTariffs, IrrigationEntry } from '@/lib/types';
import { useTranslation, formatLocalizedDate, getIrrigationMethodInfo } from '@/lib/i18n';
import { getTariffs, saveTariffs, getIrrigationEvents } from '@/lib/db-service';
import { AgronomicReportModal } from './AgronomicReportModal';

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
  const [tariffs, setTariffs] = useState<EconomicTariffs>(getTariffs);
  const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [events, setEvents] = useState<IrrigationEntry[]>([]);

  // Load saved tariffs and events
  useEffect(() => {
    setTariffs(getTariffs());
    let isMounted = true;
    getIrrigationEvents(farm.id).then((evs) => {
      if (isMounted) setEvents(evs);
    });
    return () => {
      isMounted = false;
    };
  }, [farm.id]);

  const schedule = recommendation.schedule;
  const maxVolume = Math.max(...schedule.map((s) => Math.max(s.baselineVolumeM3, s.waterVolumeM3)), 100);
  const maxDepth = Math.max(...schedule.map((s) => Math.max(s.etcMm, s.grossIrrigationMm, s.precipitationMm)), 5);

  // Economic calculations based on user tariffs
  const potentialWaterSavingsCost = Math.round(recommendation.potentialTotalSavingsM3 * tariffs.waterPricePerM3);
  const potentialElectricityKwh = Math.round(recommendation.potentialTotalSavingsM3 * 0.35);
  const potentialEnergySavingsCost = Math.round(potentialElectricityKwh * tariffs.electricityPricePerKwh);
  const totalPotentialScenarioSavings = potentialWaterSavingsCost + potentialEnergySavingsCost;

  // Plan vs Fact Variance
  const varianceList = schedule
    .map((day) => {
      const dayEvents = events.filter((e) => e.date === day.date && e.farmId === farm.id);
      const actualTotal = dayEvents.reduce((acc, e) => acc + e.actualM3, 0);
      if (dayEvents.length === 0) return null;
      const planned = day.waterVolumeM3;
      const diff = actualTotal - planned;
      const pct = planned > 0 ? Math.round((diff / planned) * 100) : 0;
      return {
        date: day.date,
        dayLabel: day.dayLabel,
        planned,
        actualTotal,
        diff,
        pct,
        method: dayEvents[0]?.method,
      };
    })
    .filter(Boolean);

  const handleSaveCustomTariffs = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const water = parseFloat((form.elements.namedItem('waterPrice') as HTMLInputElement).value);
    const elec = parseFloat((form.elements.namedItem('elecPrice') as HTMLInputElement).value);
    const diesel = parseFloat((form.elements.namedItem('dieselPrice') as HTMLInputElement).value);
    const currency = (form.elements.namedItem('currency') as HTMLSelectElement).value as 'KZT' | 'USD';

    const updated: EconomicTariffs = {
      waterPricePerM3: Number.isFinite(water) && water >= 0 ? water : tariffs.waterPricePerM3,
      electricityPricePerKwh: Number.isFinite(elec) && elec >= 0 ? elec : tariffs.electricityPricePerKwh,
      dieselPricePerLiter: Number.isFinite(diesel) && diesel >= 0 ? diesel : tariffs.dieselPricePerLiter,
      currency,
    };
    setTariffs(updated);
    saveTariffs(updated);
    setIsTariffModalOpen(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
      {/* Title & Metric Switcher & Actions */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{t.analyticsTitle}</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.analyticsSubtitle} • Динамика, план-факт и сценарный расчёт затрат
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Tariffs Config Button */}
          <button
            onClick={() => setIsTariffModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Настроить тарифы на воду и энергоносители"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Тарифы ({tariffs.currency})</span>
          </button>

          {/* PDF Report Button */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 transition-colors cursor-pointer"
            title="Сформировать печатный агрономический отчёт"
          >
            <FileText className="w-3.5 h-3.5 text-sky-600" />
            <span>Печатный отчёт (PDF)</span>
          </button>

          {/* Metric Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setActiveMetric('volume')}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                activeMetric === 'volume'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.metricVolume}
            </button>
            <button
              onClick={() => setActiveMetric('depth')}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                activeMetric === 'depth'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.metricDepth}
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {t.baselineConsumption}
          </span>
          <div className="mt-1 text-2xl font-black text-slate-700">
            {recommendation.baselineTotalVolumeM3.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">м³</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {t.baselineBenchmark}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-200/70">
          <span className="text-[11px] font-semibold text-sky-800 uppercase tracking-wider">
            {t.aquaAiPrescribed}
          </span>
          <div className="mt-1 text-2xl font-black text-sky-900">
            {recommendation.totalVolumeM3.toLocaleString()}{' '}
            <span className="text-xs font-normal text-sky-600">м³</span>
          </div>
          <div className="text-[11px] text-sky-700 mt-1">
            {getIrrigationMethodInfo(farm.irrigationMethod, t).title}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/70">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
            {t.projectedWaterSavings}
          </span>
          <div className="mt-1 text-2xl font-black text-emerald-700">
            {recommendation.potentialTotalSavingsM3.toLocaleString()}{' '}
            <span className="text-xs font-normal text-emerald-600">м³</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            ↓ {recommendation.potentialSavingsPercentage}% {t.conservedVsFlood}
          </div>
        </div>
      </div>

      {/* SVG Interactive Chart Visualizer */}
      <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
        <div className="flex items-center justify-between mb-4 text-xs text-slate-500 flex-wrap gap-2">
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
        <div className="grid grid-cols-7 gap-1 sm:gap-4 h-64 items-end pt-6 pb-2 px-2 border-b border-slate-200">
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
                      <div>{t.legendAquaAi}: {day.waterVolumeM3.toLocaleString()} м³</div>
                      <div>{t.legendBaseline}: {day.baselineVolumeM3.toLocaleString()} м³</div>
                      <div className="text-emerald-400 font-semibold">
                        {t.projectedWaterSavings}: {day.potentialSavingsM3.toLocaleString()} м³
                      </div>
                    </>
                  ) : (
                    <>
                      <div>{t.legendCropEtc}: {day.etcMm} мм</div>
                      <div>{t.legendRain}: {day.precipitationMm} мм</div>
                      <div>{t.legendGross}: {day.grossIrrigationMm} мм</div>
                    </>
                  )}
                </div>

                {/* Bars */}
                {activeMetric === 'volume' ? (
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    <div
                      style={{ height: `${Math.max(6, baselineHeight)}%` }}
                      className="w-1/2 max-w-[28px] bg-slate-200 rounded-t-md transition-all group-hover:bg-slate-300"
                    />
                    <div
                      style={{ height: `${Math.max(6, volumeHeight)}%` }}
                      className="w-1/2 max-w-[28px] bg-gradient-to-t from-sky-600 to-cyan-400 rounded-t-md transition-all group-hover:brightness-110 shadow-xs"
                    />
                  </div>
                ) : (
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    <div
                      style={{ height: `${Math.max(6, etcHeight)}%` }}
                      className="w-1/3 max-w-[18px] bg-amber-400/80 rounded-t-md transition-all"
                    />
                    <div
                      style={{ height: `${Math.max(6, rainHeight)}%` }}
                      className="w-1/3 max-w-[18px] bg-blue-400 rounded-t-md transition-all"
                    />
                    <div
                      style={{ height: `${Math.max(6, grossHeight)}%` }}
                      className="w-1/3 max-w-[18px] bg-teal-500 rounded-t-md transition-all"
                    />
                  </div>
                )}

                <div className="mt-2 text-[10px] font-semibold text-slate-600 truncate max-w-full">
                  {localizedDate.split(',')[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan vs Fact Variance Analysis (if logged events exist for scheduled period) */}
      {varianceList.length > 0 && (
        <div className="space-y-3 bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-sky-600" />
              Отклонения факта от расчётного плана (Plan vs. Fact Variance)
            </span>
            <span className="text-[11px] text-slate-500">Только сопоставимые календарные дни</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[650px] w-full text-xs text-left bg-white rounded-xl border border-slate-200 overflow-hidden">
              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Дата</th>
                  <th className="py-2.5 px-3">План FAO-56</th>
                  <th className="py-2.5 px-3">Факт внесения</th>
                  <th className="py-2.5 px-3">Отклонение (м³)</th>
                  <th className="py-2.5 px-3">Отклонение (%)</th>
                  <th className="py-2.5 px-3">Оценка соблюдения</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {varianceList.map((item) => {
                  if (!item) return null;
                  const isOver = item.diff > 0;
                  const isAccurate = Math.abs(item.pct) <= 10;
                  return (
                    <tr key={item.date} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-900">{item.date} ({item.dayLabel})</td>
                      <td className="py-2 px-3">{item.planned.toLocaleString('ru-RU')} м³</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{item.actualTotal.toLocaleString('ru-RU')} м³</td>
                      <td className={`py-2 px-3 font-bold ${isOver ? 'text-amber-700' : 'text-sky-700'}`}>
                        {isOver ? `+${item.diff.toLocaleString('ru-RU')}` : item.diff.toLocaleString('ru-RU')} м³
                      </td>
                      <td className={`py-2 px-3 font-semibold ${isOver ? 'text-amber-700' : 'text-sky-700'}`}>
                        {item.pct > 0 ? `+${item.pct}%` : `${item.pct}%`}
                      </td>
                      <td className="py-2 px-3">
                        {isAccurate ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> В норме (±10%)
                          </span>
                        ) : isOver ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <TrendingUp className="w-3 h-3" /> Превышение нормы
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                            <TrendingDown className="w-3 h-3" /> Недополив
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Energy & Fuel ROI Grid with User Tariffs */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/50 via-slate-50 to-emerald-50/40 border border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Сценарный экономический эффект (Тариф: {tariffs.waterPricePerM3} {tariffs.currency}/м³, {tariffs.electricityPricePerKwh} {tariffs.currency}/кВт⋅ч)
          </span>
          <button
            onClick={() => setIsTariffModalOpen(true)}
            className="text-[11px] font-semibold text-sky-700 hover:text-sky-900 underline cursor-pointer"
          >
            Изменить тарифы
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-medium">Экономия воды (сумма):</div>
            <div className="mt-1 text-lg font-black text-emerald-700">
              {potentialWaterSavingsCost.toLocaleString()} <span className="text-xs font-normal text-slate-500">{tariffs.currency}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">@ {tariffs.waterPricePerM3} {tariffs.currency} / м³</div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-medium">Электроэнергия насоса:</div>
            <div className="mt-1 text-lg font-black text-amber-700">
              {potentialElectricityKwh.toLocaleString()} <span className="text-xs font-normal text-slate-500">кВт⋅ч</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">0.35 кВт⋅ч на 1 м³</div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-medium">Экономия на электроэнергии:</div>
            <div className="mt-1 text-lg font-black text-sky-800">
              {potentialEnergySavingsCost.toLocaleString()} <span className="text-xs font-normal text-slate-500">{tariffs.currency}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">@ {tariffs.electricityPricePerKwh} {tariffs.currency} / кВт⋅ч</div>
          </div>

          <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 shadow-2xs">
            <div className="text-[11px] text-emerald-800 font-bold">Суммарный сценарный ROI:</div>
            <div className="mt-1 text-lg font-black text-emerald-950">
              {totalPotentialScenarioSavings.toLocaleString()} <span className="text-xs font-normal text-emerald-700">{tariffs.currency}</span>
            </div>
            <div className="text-[10px] text-emerald-700 mt-0.5">Вода + Энергия</div>
          </div>
        </div>
      </div>

      {/* Assumptions & Integrity Note */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
        <div className="font-semibold text-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-sky-600" />
            <span>Прозрачность расчётов и методологический эталон</span>
          </div>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            Сценарная оценка • Не финансовый аудит
          </span>
        </div>
        <p className="leading-relaxed">
          Расчёт потенциальной экономии смоделирован против регионального базового уровня традиционного арычного полива с КПД 50%.
          Все денежные суммы являются оценочными сценарными расчётами на основе заданных пользователем тарифов и не представляют собой
          государственные акты или официально верифицированные сертификаты экономии.
        </p>
      </div>

      {/* Modal: Tariff Settings */}
      {isTariffModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Пользовательские тарифы</h3>
            <p className="text-xs text-slate-500">
              Укажите актуальные тарифы вашего региона для расчёта операционных затрат и окупаемости.
            </p>
            <form onSubmit={handleSaveCustomTariffs} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700">Валюта расчётов</label>
                <select
                  name="currency"
                  defaultValue={tariffs.currency}
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                >
                  <option value="KZT">Казахстанский тенге (₸, KZT)</option>
                  <option value="USD">Доллар США ($, USD)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Тариф на воду ({tariffs.currency} за 1 м³)
                </label>
                <input
                  name="waterPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={tariffs.waterPricePerM3}
                  required
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Тариф на электроэнергию ({tariffs.currency} за 1 кВт⋅ч)
                </label>
                <input
                  name="elecPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={tariffs.electricityPricePerKwh}
                  required
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Цена дизельного топлива ({tariffs.currency} за 1 литр)
                </label>
                <input
                  name="dieselPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={tariffs.dieselPricePerLiter}
                  required
                  className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTariffModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white"
                >
                  Применить тарифы
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Agronomic Report (Print / PDF) */}
      <AgronomicReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        farm={farm}
        recommendation={recommendation}
        events={events}
        tariffs={tariffs}
      />
    </div>
  );
};
