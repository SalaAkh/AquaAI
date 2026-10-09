'use client';

import React from 'react';
import {
  Droplets,
  Sprout,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  HelpCircle,
  ArrowDownRight,
  TrendingDown,
  Layers,
} from 'lucide-react';
import { FarmProfile, IrrigationRecommendation } from '@/lib/types';
import { GROWTH_STAGE_LABELS, IRRIGATION_EFFICIENCIES } from '@/lib/constants';

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
  const efficiencyInfo = IRRIGATION_EFFICIENCIES[farm.irrigationMethod];
  const stageInfo = GROWTH_STAGE_LABELS[farm.growthStage];

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'irrigate':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle className="w-3 h-3" /> Apply Irrigation
          </span>
        );
      case 'delay':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3" /> Rain Forecast — Delay
          </span>
        );
      case 'skip':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-300">
            <Droplets className="w-3 h-3" /> Skip / Moisture Met
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Top Banner with primary recommendation */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
                FAO-56 Irrigation Directive
              </span>
              <span className="text-xs text-slate-400">
                Period: {recommendation.periodStart} to {recommendation.periodEnd}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Recommended: {recommendation.totalGrossIrrigationMm} mm over {recommendation.forecastDays} Days
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Total volume: <strong className="text-white font-semibold">{recommendation.totalVolumeM3.toLocaleString()} m³</strong> for {farm.fieldSizeHectares} hectares
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300">Field Status:</span>
              {getActionBadge(recommendation.primaryAction === 'irrigate' ? 'irrigate' : 'skip')}
            </div>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-all backdrop-blur-xs disabled:opacity-50"
            >
              {isLoading ? 'Recalculating...' : 'Recalculate with Live Forecast'}
            </button>
          </div>
        </div>

        {/* Suggested Timing Callout */}
        <div className="mt-5 p-3 rounded-xl bg-sky-900/40 border border-sky-700/50 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-sky-200">
            <Clock className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>
              <strong>Suggested Irrigation Window:</strong> {recommendation.recommendedWindowSummary}
            </span>
          </div>
          <span className="text-[11px] text-cyan-300">Minimizes daytime vapor deficit & wind drift</span>
        </div>
      </div>

      {/* Hydrological Equations Grid */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-600" />
            FAO-56 Water Balance Breakdown
          </h4>
          <span className="text-[11px] text-slate-500 font-mono">ETc = ET₀ × Kc</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* ETc */}
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <div className="text-[11px] font-medium text-slate-500 uppercase">Crop Water Demand (ETc)</div>
            <div className="mt-1 text-xl font-bold text-slate-900">
              {recommendation.totalEtcMm} <span className="text-xs font-normal text-slate-500">mm</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Crop Kc: {recommendation.schedule[0]?.kc ?? 1.0} ({farm.cropType})
            </div>
          </div>

          {/* Rain & Effective Rain */}
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <div className="text-[11px] font-medium text-slate-500 uppercase">Effective Rainfall (Peff)</div>
            <div className="mt-1 text-xl font-bold text-sky-700">
              {recommendation.totalEffectiveRainfallMm} <span className="text-xs font-normal text-slate-500">mm</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Total Raw Rain: {recommendation.totalPrecipitationMm} mm
            </div>
          </div>

          {/* Net Requirement */}
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <div className="text-[11px] font-medium text-slate-500 uppercase">Net Deficit (Inet)</div>
            <div className="mt-1 text-xl font-bold text-amber-700">
              {recommendation.totalNetIrrigationMm} <span className="text-xs font-normal text-slate-500">mm</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">max(0, ETc - Peff)</div>
          </div>

          {/* Application Efficiency & Gross */}
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <div className="text-[11px] font-medium text-slate-500 uppercase">Gross Delivery Needed</div>
            <div className="mt-1 text-xl font-bold text-teal-700">
              {recommendation.totalGrossIrrigationMm} <span className="text-xs font-normal text-slate-500">mm</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {farm.irrigationMethod} ({Math.round(efficiencyInfo.efficiency * 100)}% eff.)
            </div>
          </div>
        </div>
      </div>

      {/* Daily Schedule Table */}
      <div className="p-6">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
          Daily Prescriptive Irrigation Schedule
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2.5 font-semibold">Date & Condition</th>
                <th className="pb-2.5 font-semibold text-right">ET₀ / ETc</th>
                <th className="pb-2.5 font-semibold text-right">Precipitation</th>
                <th className="pb-2.5 font-semibold text-right">Gross Needed</th>
                <th className="pb-2.5 font-semibold text-right">Volume (m³)</th>
                <th className="pb-2.5 font-semibold text-center">Action</th>
                <th className="pb-2.5 font-semibold hidden md:table-cell pl-4">Window & Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recommendation.schedule.map((day) => (
                <tr key={day.date} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 font-medium text-slate-900">
                    <div>{day.dayLabel}</div>
                    <div className="text-[11px] text-slate-400">{day.conditionLabel}</div>
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
                    <div className="text-slate-800 font-medium">{day.recommendedWindow}</div>
                    <div className="text-[11px] text-slate-500">{day.actionReason}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assumptions & Limitations Box (Required by specifications) */}
      <div className="p-5 bg-amber-50/40 border-t border-amber-200/60 text-xs">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-900">
              Agronomic Assumptions & Limitation Boundaries
            </div>
            <p className="text-amber-800 leading-relaxed">
              Standard: <strong>{recommendation.assumptions.faoStandard}</strong>. Water volume conversion: <strong>1 mm over 1 ha = 10 m³</strong>.
              Application efficiency assumes <strong>{Math.round(recommendation.assumptions.irrigationEfficiency * 100)}%</strong> for your {farm.irrigationMethod} system.
            </p>
            <ul className="list-disc list-inside text-[11px] text-amber-800/90 space-y-0.5 pt-1">
              {recommendation.limitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
