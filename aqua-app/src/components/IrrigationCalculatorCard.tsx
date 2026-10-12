'use client';

import React from 'react';
import {
  Droplets,
  Clock,
  AlertTriangle,
  CheckCircle,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { FarmProfile, IrrigationRecommendation } from '@/lib/types';
import { IRRIGATION_EFFICIENCIES } from '@/lib/constants';
import {
  useTranslation,
  getCropLabel,
  getIrrigationMethodInfo,
  formatLocalizedDate,
  getLocalizedActionReason,
  getLocalizedWindow,
} from '@/lib/i18n';

interface IrrigationCalculatorCardProps {
  recommendation: IrrigationRecommendation;
  farm: FarmProfile;
  onRefresh: () => void;
  isLoading: boolean;
}

export const IrrigationCalculatorCard: React.FC<IrrigationCalculatorCardProps> = ({
  recommendation,
  farm,
  onRefresh,
  isLoading,
}) => {
  const { t, language } = useTranslation();
  const efficiencyInfo = IRRIGATION_EFFICIENCIES[farm.irrigationMethod];

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'irrigate':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle className="w-3 h-3" /> {t.primaryActionIrrigate}
          </span>
        );
      case 'delay':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3" /> {t.primaryActionDelay}
          </span>
        );
      case 'skip':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-300">
            <Droplets className="w-3 h-3" /> {t.primaryActionNoNeed}
          </span>
        );
      default:
        return null;
    }
  };

  const handleExportCsv = () => {
    const headers = language === 'kk' ? [
      'Күн',
      'Дақыл',
      'Өсу кезеңі',
      'ET0 булану (мм)',
      'ETc сұраныс (мм)',
      'Жауын-шашын (мм)',
      'Брутто норма (мм)',
      'Су көлемі (м3)',
      'Рекомендация',
      'Суару уақыты',
      'Негіздеме',
    ] : language === 'ru' ? [
      'Дата',
      'Культура',
      'Фаза роста',
      'ET0 испарение (мм)',
      'ETc потребность (мм)',
      'Осадки (мм)',
      'Брутто норма (мм)',
      'Объем воды (м3)',
      'Рекомендация',
      'Окно полива',
      'Обоснование',
    ] : [
      'Date',
      'Crop',
      'Growth Stage',
      'ET0 Evapotranspiration (mm)',
      'ETc Demand (mm)',
      'Precipitation (mm)',
      'Gross Depth (mm)',
      'Volume (m3)',
      'Recommendation',
      'Timing Window',
      'Reasoning',
    ];

    const rows = recommendation.schedule.map((day) => [
      formatLocalizedDate(day.date, language),
      getCropLabel(farm.cropType, t),
      farm.growthStage,
      day.et0Mm,
      day.etcMm,
      day.precipitationMm,
      day.grossIrrigationMm,
      day.waterVolumeM3,
      day.action === 'irrigate' ? t.primaryActionIrrigate : day.action === 'delay' ? t.primaryActionDelay : t.primaryActionNoNeed,
      getLocalizedWindow(day.recommendedWindow, language),
      `"${getLocalizedActionReason(day.action, language, day.precipitationMm).replace(/"/g, '""')}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AquaAI_Schedule_${farm.name.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')}_${recommendation.periodStart}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Top Banner with primary recommendation */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
                {t.faoDirective}
              </span>
              <span className="text-xs text-slate-400">
                {recommendation.periodStart} — {recommendation.periodEnd}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {t.grossIrrigationDepth}: {recommendation.totalGrossIrrigationMm} mm
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              {t.totalVolume}: <strong className="text-white font-semibold">{recommendation.totalVolumeM3.toLocaleString()} м³</strong> ({farm.fieldSizeHectares} {t.hectares})
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300">{t.statusLabel}</span>
              {getActionBadge(recommendation.primaryAction === 'irrigate' ? 'irrigate' : 'skip')}
            </div>
            <button
              id="calculate-irrigation-btn"
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 text-xs font-black shadow-lg shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Droplets className={`w-4 h-4 text-slate-950 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? (language === 'kk' ? 'Есептелуде...' : language === 'ru' ? 'Расчёт...' : 'Calculating...') : (language === 'kk' ? 'Суаруды есептеу' : language === 'ru' ? 'Рассчитать полив' : 'Calculate irrigation')}</span>
            </button>
          </div>
        </div>

        {/* Suggested Timing Callout */}
        <div className="mt-5 p-3 rounded-xl bg-sky-900/40 border border-sky-700/50 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-sky-200">
            <Clock className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>
              <strong>{t.recommendedWindowLabel}</strong> {getLocalizedWindow(recommendation.recommendedWindowSummary, language)}
            </span>
          </div>
          <span className="text-[11px] text-cyan-300">{t.windowMinimizesEvap}</span>
        </div>
      </div>

      {/* Hydrological Equations Grid */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-600" />
            {t.calculatorTitle}
          </h4>
          <span className="text-[11px] text-slate-500 font-mono">ETc = ET₀ × Kc</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* ETc */}
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <div className="text-[11px] font-medium text-slate-500 uppercase">{t.netEtc}</div>
            <div className="mt-1 text-xl font-bold text-slate-900">
              {recommendation.totalEtcMm} <span className="text-xs font-normal text-slate-500">mm</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Kc: {recommendation.schedule[0]?.kc ?? 1.0} ({getCropLabel(farm.cropType, t)})
            </div>
          </div>

          {/* Rain & Effective Rain */}
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <div className="text-[11px] font-medium text-slate-500 uppercase">{t.effectiveRain}</div>
            <div className="mt-1 text-xl font-bold text-sky-700">
              {recommendation.totalEffectiveRainfallMm} <span className="text-xs font-normal text-slate-500">mm</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {t.totalRainLabel} {recommendation.totalPrecipitationMm} mm
            </div>
          </div>

          {/* Net Requirement */}
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <div className="text-[11px] font-medium text-slate-500 uppercase">{t.netDeficit}</div>
            <div className="mt-1 text-xl font-bold text-amber-700">
              {recommendation.totalNetIrrigationMm} <span className="text-xs font-normal text-slate-500">mm</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">max(0, ETc - Peff)</div>
          </div>

          {/* Application Efficiency & Gross */}
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <div className="text-[11px] font-medium text-slate-500 uppercase">{t.grossIrrigationDepth}</div>
            <div className="mt-1 text-xl font-bold text-teal-700">
              {recommendation.totalGrossIrrigationMm} <span className="text-xs font-normal text-slate-500">mm</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {getIrrigationMethodInfo(farm.irrigationMethod, t).title} ({Math.round(efficiencyInfo.efficiency * 100)}% {t.efficiency})
            </div>
          </div>
        </div>
      </div>

      {/* Daily Schedule Table */}
      <div className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {t.scheduleTitle}
          </h4>
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shadow-2xs"
            title={t.exportCsvBtn}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.exportCsvBtn}</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2.5 font-semibold">{t.dayHeader}</th>
                <th className="pb-2.5 font-semibold text-right">{t.cropDemandHeader}</th>
                <th className="pb-2.5 font-semibold text-right">{t.rainHeader}</th>
                <th className="pb-2.5 font-semibold text-right">{t.grossIrrigationDepth}</th>
                <th className="pb-2.5 font-semibold text-right">{t.volumeM3Header}</th>
                <th className="pb-2.5 font-semibold text-center">{t.actionHeader}</th>
                <th className="pb-2.5 font-semibold hidden md:table-cell pl-4">{t.timingHeader}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recommendation.schedule.map((day) => (
                <tr key={day.date} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 font-medium text-slate-900">
                    <div>{formatLocalizedDate(day.date, language)}</div>
                  </td>
                  <td className="py-3 text-right">
                    <span className="font-semibold text-slate-800">{day.etcMm} mm</span>
                    <div className="text-[10px] text-slate-400">ET₀ {day.et0Mm}</div>
                  </td>
                  <td className="py-3 text-right">
                    <span className={day.precipitationMm > 0 ? 'font-semibold text-sky-700' : 'text-slate-400'}>
                      {day.precipitationMm} mm
                    </span>
                    <div className="text-[10px] text-slate-400">eff: {day.effectiveRainfallMm} mm</div>
                  </td>
                  <td className="py-3 text-right font-bold text-slate-900">
                    {day.grossIrrigationMm} mm
                  </td>
                  <td className="py-3 text-right font-mono font-medium text-sky-800">
                    {day.waterVolumeM3.toLocaleString()}
                  </td>
                  <td className="py-3 text-center">
                    {getActionBadge(day.action)}
                  </td>
                  <td className="py-3 hidden md:table-cell pl-4">
                    <div className="text-slate-800 font-medium">{getLocalizedWindow(day.recommendedWindow, language)}</div>
                    <div className="text-[11px] text-slate-500">{getLocalizedActionReason(day.action, language, day.precipitationMm)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assumptions & Limitations Box */}
      <div className="p-5 bg-amber-50/40 border-t border-amber-200/60 text-xs">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-900">
              {t.assumptionsTitle}
            </div>
            <p className="text-amber-800 leading-relaxed">
              {t.standard} <strong>{recommendation.assumptions.faoStandard}</strong>. {t.volumeConversionNote}{' '}
              {t.networkEfficiency} <strong>{Math.round(recommendation.assumptions.irrigationEfficiency * 100)}%</strong> ({getIrrigationMethodInfo(farm.irrigationMethod, t).title}).
            </p>
            <ul className="list-disc list-inside text-[11px] text-amber-800/90 space-y-0.5 pt-1">
              <li>{t.limitation1}</li>
              <li>{t.limitation2}</li>
              <li>{t.limitation3}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
