'use client';

import React, { useState, useMemo } from 'react';
import { FarmProfile, SatelliteImageryData, SatellitePixel } from '@/lib/types';
import { generateSatelliteObservation, getNdviColor, getNdwiColor } from '@/lib/satellite';
import { useTranslation } from '@/lib/i18n';
import {
  Satellite,
  Eye,
  CheckCircle2,
  Compass,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface SatelliteNdviCardProps {
  farm: FarmProfile;
  baselineKc: number;
  onApplySatelliteKc?: (adjustedKc: number) => void;
}

export const SatelliteNdviCard: React.FC<SatelliteNdviCardProps> = ({
  farm,
  baselineKc,
  onApplySatelliteKc,
}) => {
  const { t, language } = useTranslation();
  const [viewMode, setViewMode] = useState<'ndvi' | 'ndwi'>('ndvi');
  const [selectedPixel, setSelectedPixel] = useState<SatellitePixel | null>(null);
  const [isApplied, setIsApplied] = useState(false);

  // Generate satellite observation for this farm
  const data: SatelliteImageryData = useMemo(() => {
    return generateSatelliteObservation(farm, baselineKc);
  }, [farm, baselineKc]);

  const handleApply = () => {
    // Simulated satellite grid must never modify operational irrigation guidance.
    if (onApplySatelliteKc) {
      onApplySatelliteKc(data.satelliteAdjustedKc);
      setIsApplied(true);
      setTimeout(() => setIsApplied(false), 3000);
    }
  };

  const getSectorStressText = (stress: SatellitePixel['waterStress']) => {
    if (language === 'kk') {
      if (stress === 'optimal') return 'Оңтайлы ылғал';
      if (stress === 'mild_deficit') return 'Шамалы тапшылық';
      return 'Қатты тапшылық';
    }
    if (language === 'ru') {
      if (stress === 'optimal') return 'Оптимальный';
      if (stress === 'mild_deficit') return 'Умеренный дефицит';
      return 'Острый дефицит';
    }
    if (stress === 'optimal') return 'Optimal';
    if (stress === 'mild_deficit') return 'Mild Deficit';
    return 'Severe Stress';
  };

  const getSectorAdviceText = (stress: SatellitePixel['waterStress']) => {
    if (language === 'kk') {
      if (stress === 'optimal') return 'Жапырақ біркелкі дамыған. Суару нормасын өзгерту қажет емес.';
      if (stress === 'mild_deficit') return 'Жергілікті құрғау байқалды. Тамшылату желісін тексеру ұсынылады.';
      return 'Назар аударыңыз: солу қаупі жоғары. Секторды шұғыл суару қажет!';
    }
    if (language === 'ru') {
      if (stress === 'optimal') return 'Равномерное развитие листовой пластины. Снижение нормы полива не требуется.';
      if (stress === 'mild_deficit') return 'Зафиксировано локальное иссушение. Рекомендуется проверить капельные линии сектора.';
      return 'Внимание: высокий риск увядания. Требуется приоритетный полив сектора!';
    }
    if (stress === 'optimal') return 'Uniform canopy development. No reduction in irrigation needed.';
    if (stress === 'mild_deficit') return 'Localized drying detected. Inspect emitter drip lines in this sector.';
    return 'Warning: high wilting risk. Prioritize immediate irrigation delivery to this sector!';
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200/70 mb-2">
            <Satellite className="w-3.5 h-3.5" />
            <span>Sentinel-2 MSI • ESA Copernicus L2A</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t.satelliteTitle}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            {t.satelliteSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('ndvi')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'ndvi'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.layerNdvi}
          </button>
          <button
            onClick={() => setViewMode('ndwi')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'ndwi'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.layerNdwi}
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Mean NDVI */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
          <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
            {t.meanNdvi}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
              {data.meanNdvi}
            </span>
            <span className="text-xs font-semibold text-emerald-700">
              {data.meanNdvi >= 0.7 ? t.denseCover : t.moderateCover}
            </span>
          </div>
          <p className="text-[11px] text-emerald-700/80 mt-1">
            {t.rangeLabel} {data.minNdvi} – {data.maxNdvi}
          </p>
        </div>

        {/* Metric 2: NDWI Water Stress */}
        <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100">
          <div className="text-[11px] font-semibold text-sky-800 uppercase tracking-wider">
            {t.ndwiWaterStress}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-sky-950">
              {data.meanNdwi > 0 ? `+${data.meanNdwi}` : data.meanNdwi}
            </span>
            <span className="text-xs font-semibold text-sky-700">
              {data.waterStressStatus === 'optimal_hydration' ? t.normalHydration : t.moistureDeficit}
            </span>
          </div>
          <p className="text-[11px] text-sky-700/80 mt-1">
            {t.turgorLabel}
          </p>
        </div>

        {/* Metric 3: Dynamic Kc Adjustment */}
        <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100">
          <div className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider">
            {t.kcCorrectionFao}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-teal-950">
              {data.satelliteAdjustedKc}
            </span>
            <span className="text-xs font-semibold text-teal-700">
              {data.kcAdjustmentPercent >= 0 ? `+${data.kcAdjustmentPercent}%` : `${data.kcAdjustmentPercent}%`}
            </span>
          </div>
          <p className="text-[11px] text-teal-700/80 mt-1">
            FAO: {data.faoBaselineKc} → {data.satelliteAdjustedKc}
          </p>
        </div>

        {/* Metric 4: Uniformity */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            CU Uniformity
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {data.spatialUniformityPercent}%
            </span>
            <span className="text-xs font-medium text-slate-500">
              {data.cloudCoverPercent}% cloud
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{data.acquisitionDate}</span>
          </p>
        </div>
      </div>

      {/* Main Map & Interactive Sector Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Visual 6x6 Field Sector Grid */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-5 text-white shadow-inner flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-slate-200">
                {t.interactiveNdviGrid}
              </span>
            </div>
            <span className="text-slate-400 text-[11px]">
              <strong className="text-cyan-300 uppercase">{viewMode}</strong>
            </span>
          </div>

          {/* 6x6 Heatmap Matrix */}
          <div className="py-4 flex justify-center">
            <div className="grid grid-cols-6 gap-2 p-3 bg-slate-950 rounded-2xl border border-slate-800/80 shadow-2xl max-w-md w-full">
              {data.grid.map((row, rIdx) =>
                row.map((pixel, cIdx) => {
                  const val = viewMode === 'ndvi' ? pixel.ndvi : pixel.ndwi;
                  const bgColor = viewMode === 'ndvi' ? getNdviColor(pixel.ndvi) : getNdwiColor(pixel.ndwi);
                  const isSelected = selectedPixel?.row === rIdx && selectedPixel?.col === cIdx;

                  return (
                    <button
                      key={`${rIdx}-${cIdx}`}
                      onClick={() => setSelectedPixel(pixel)}
                      style={{ backgroundColor: bgColor }}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] font-bold text-white shadow-xs transition-all hover:scale-110 active:scale-95 ${
                        isSelected ? 'ring-2 ring-white scale-110 z-10' : 'opacity-90 hover:opacity-100'
                      }`}
                      title={`[${rIdx + 1}, ${cIdx + 1}] | NDVI: ${pixel.ndvi}`}
                    >
                      <span className="drop-shadow-xs">{val}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Gradient Legend */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
            {viewMode === 'ndvi' ? (
              <div className="flex items-center gap-2">
                <span>{t.ndviLegendLow}</span>
                <div className="h-2 w-32 rounded-full bg-gradient-to-r from-red-400 via-amber-400 via-lime-400 to-emerald-600" />
                <span>{t.ndviLegendHigh}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>&lt; -0.15</span>
                <div className="h-2 w-32 rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-sky-500" />
                <span>&gt; +0.05</span>
              </div>
            )}
            <span className="text-[10px] text-slate-500">{t.clickPixelPrompt}</span>
          </div>
        </div>

        {/* Selected Sector Details & Action Box */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-teal-600" />
              {t.selectedPixelTitle}
            </h4>

            {selectedPixel ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Grid:</span>
                  <span className="font-bold text-slate-900">
                    [{selectedPixel.row + 1}, {selectedPixel.col + 1}]
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">NDVI:</span>
                  <span className="font-bold text-emerald-700">{selectedPixel.ndvi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">NDWI:</span>
                  <span className="font-bold text-sky-700">{selectedPixel.ndwi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t.turgorLabel}:</span>
                  <span className="font-semibold text-emerald-700">
                    {getSectorStressText(selectedPixel.waterStress)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-600">
                  {getSectorAdviceText(selectedPixel.waterStress)}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-6 text-center">
                {t.clickPixelPrompt}
              </p>
            )}
          </div>

          {/* Demo-only Kc estimate; this must not affect live irrigation figures. */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200/80">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-bold text-teal-950">
                {t.kcCorrectionFao}
              </span>
            </div>
            <p className="text-[11px] text-teal-800/90 leading-relaxed mb-3">
              NDVI ({data.meanNdvi}): Kc {data.faoBaselineKc} → {data.satelliteAdjustedKc}
            </p>
            <button
              onClick={handleApply}
              disabled={!onApplySatelliteKc}
              className={`w-full py-2.5 px-3 rounded-xl font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                isApplied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {!onApplySatelliteKc ? (
                <span>Demo only — real satellite data required</span>
              ) : isApplied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.kcApplied}</span>
                </>
              ) : (
                <span>{t.applyKcBtn} ({data.satelliteAdjustedKc})</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
