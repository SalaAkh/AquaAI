'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  Droplets,
  Layers,
  ArrowUpRight,
  Info,
  Calendar,
} from 'lucide-react';
import { FarmProfile, IrrigationRecommendation } from '@/lib/types';

interface WaterAnalyticsChartProps {
  recommendation: IrrigationRecommendation;
  farm: FarmProfile;
}

export const WaterAnalyticsChart: React.FC<WaterAnalyticsChartProps> = ({
  recommendation,
  farm,
}) => {
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
            <h3 className="text-base font-bold text-slate-900">Comparative Water Analytics</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            AquaAI Precision Irrigation vs Regional Traditional Flood Inundation Baseline (50% Eff.)
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
            Volume (m³)
          </button>
          <button
            onClick={() => setActiveMetric('depth')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeMetric === 'depth'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Depth (mm)
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">
            Baseline Consumption
          </span>
          <div className="mt-1 text-2xl font-bold text-slate-700">
            {recommendation.baselineTotalVolumeM3.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">m³</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Historical 50% flood benchmark
          </div>
        </div>

        <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-200/70">
          <span className="text-[11px] font-semibold text-sky-800 uppercase">
            AquaAI Prescribed Volume
          </span>
          <div className="mt-1 text-2xl font-bold text-sky-900">
            {recommendation.totalVolumeM3.toLocaleString()}{' '}
            <span className="text-xs font-normal text-sky-600">m³</span>
          </div>
          <div className="text-[11px] text-sky-700 mt-1">
            {farm.irrigationMethod.toUpperCase()} (1 mm/ha = 10 m³)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/70">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase">
            Projected Water Savings
          </span>
          <div className="mt-1 text-2xl font-bold text-emerald-700">
            {recommendation.potentialTotalSavingsM3.toLocaleString()}{' '}
            <span className="text-xs font-normal text-emerald-600">m³</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            ↓ {recommendation.potentialSavingsPercentage}% conserved vs flood
          </div>
        </div>
      </div>

      {/* SVG Interactive Chart Visualizer */}
      <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
        <div className="flex items-center justify-between mb-4 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">
            {activeMetric === 'volume'
              ? 'Daily Water Volume: AquaAI Delivery vs Baseline (m³)'
              : 'Daily Hydrological Depth: ETc vs Precipitation vs Delivery (mm)'}
          </span>
          <div className="flex items-center gap-4">
            {activeMetric === 'volume' ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-slate-300" />
                  <span>Baseline Flood</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-sky-500" />
                  <span>AquaAI Plan</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-500" />
                  <span>Crop ETc</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-blue-400" />
                  <span>Rainfall</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-teal-500" />
                  <span>Gross Needed</span>
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

            return (
              <div key={day.date} className="h-full flex flex-col justify-end items-center group relative">
                {/* Tooltip on Hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] rounded-lg p-2 pointer-events-none z-20 whitespace-nowrap shadow-lg">
                  <div className="font-bold text-sky-300">{day.dayLabel}</div>
                  {activeMetric === 'volume' ? (
                    <>
                      <div>AquaAI Plan: {day.waterVolumeM3.toLocaleString()} m³</div>
                      <div>Baseline: {day.baselineVolumeM3.toLocaleString()} m³</div>
                      <div className="text-emerald-400 font-semibold">
                        Savings: {day.potentialSavingsM3.toLocaleString()} m³
                      </div>
                    </>
                  ) : (
                    <>
                      <div>Crop ETc: {day.etcMm} mm</div>
                      <div>Precipitation: {day.precipitationMm} mm</div>
                      <div>Gross Delivery: {day.grossIrrigationMm} mm</div>
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
                  {day.dayLabel.split(',')[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Assumptions & Integrity Note */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-sky-600" />
          Transparency &amp; Model Benchmark
        </div>
        <p className="leading-relaxed">
          Savings calculations are modeled against an explicit benchmark: traditional unlined furrow flooding in Central Asia with 50% application efficiency. Potential savings reflect avoiding excessive runoff and over-irrigation. They do not constitute certified past carbon or water credits.
        </p>
      </div>
    </div>
  );
};
