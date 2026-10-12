'use client';

import React, { useState } from 'react';
import { X, Sprout, MapPin, Check, Sliders } from 'lucide-react';
import { CropType, FarmProfile, GrowthStage, IrrigationMethod, SoilType } from '@/lib/types';
import {
  LOCATION_PRESETS,
  SOIL_CHARACTERISTICS,
  IRRIGATION_EFFICIENCIES,
  FAO_CROP_COEFFICIENTS,
} from '@/lib/constants';
import {
  useTranslation,
  getGrowthStageInfo,
  getIrrigationMethodInfo,
  getSoilTypeInfo,
} from '@/lib/i18n';
import { InteractiveFarmMap } from './InteractiveFarmMap';

interface FarmManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveFarm: (farm: FarmProfile) => void;
  initialFarm?: FarmProfile;
}

export const FarmManagerModal: React.FC<FarmManagerModalProps> = ({
  isOpen,
  onClose,
  onSaveFarm,
  initialFarm,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState(initialFarm?.name || '');
  const [latitude, setLatitude] = useState(initialFarm?.latitude || 43.3015);
  const [longitude, setLongitude] = useState(initialFarm?.longitude || 68.2723);
  const [regionName, setRegionName] = useState(initialFarm?.region || 'Turkistan Region, Kazakhstan');
  const [fieldSize, setFieldSize] = useState<number>(initialFarm?.fieldSizeHectares || 45);
  const [cropType, setCropType] = useState<CropType>(initialFarm?.cropType || 'cotton');
  const [growthStage, setGrowthStage] = useState<GrowthStage>(
    initialFarm?.growthStage || 'mid_season'
  );
  const [irrigationMethod, setIrrigationMethod] = useState<IrrigationMethod>(
    initialFarm?.irrigationMethod || 'drip'
  );
  const [customEfficiencyPercent, setCustomEfficiencyPercent] = useState<number>(
    initialFarm?.customEfficiency
      ? Math.round(initialFarm.customEfficiency * 100)
      : 90
  );
  const [soilType, setSoilType] = useState<SoilType>(initialFarm?.soilType || 'clay_loam');

  React.useEffect(() => {
    if (isOpen) {
      setName(initialFarm?.name || '');
      setLatitude(initialFarm?.latitude || 43.3015);
      setLongitude(initialFarm?.longitude || 68.2723);
      setRegionName(initialFarm?.region || 'Turkistan Region, Kazakhstan');
      setFieldSize(initialFarm?.fieldSizeHectares || 45);
      setCropType(initialFarm?.cropType || 'cotton');
      setGrowthStage(initialFarm?.growthStage || 'mid_season');
      setIrrigationMethod(initialFarm?.irrigationMethod || 'drip');
      setCustomEfficiencyPercent(
        initialFarm?.customEfficiency
          ? Math.round(initialFarm.customEfficiency * 100)
          : Math.round((IRRIGATION_EFFICIENCIES[initialFarm?.irrigationMethod || 'drip']?.efficiency ?? 0.9) * 100)
      );
      setSoilType(initialFarm?.soilType || 'clay_loam');
    }
  }, [isOpen, initialFarm]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const farm: FarmProfile = {
      id: initialFarm?.id || `farm-${Date.now().toString(36)}`,
      name: name.trim(),
      locationId: initialFarm?.locationId || 'custom-loc',
      locationName: regionName || 'Central Asia Agricultural Basin',
      region: regionName || 'Kazakhstan',
      latitude: Number(latitude.toFixed(4)),
      longitude: Number(longitude.toFixed(4)),
      fieldSizeHectares: Math.max(0.1, fieldSize),
      cropType,
      growthStage,
      irrigationMethod,
      customEfficiency: Number((customEfficiencyPercent / 100).toFixed(2)),
      soilType,
      isDemo: false,
      createdAt: initialFarm?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveFarm(farm);
    onClose();
  };

  const crops: { type: CropType; icon: string; label: string }[] = [
    { type: 'cotton', icon: '🌱', label: t.cropCotton },
    { type: 'wheat', icon: '🌾', label: t.cropWheat },
    { type: 'rice', icon: '🌾', label: t.cropRice },
    { type: 'corn', icon: '🌽', label: t.cropCorn },
    { type: 'vegetables', icon: '🍅', label: t.cropVegetables },
  ];

  const irrigationMethods: IrrigationMethod[] = ['drip', 'sprinkler', 'furrow_flood'];
  const soilTypes: SoilType[] = ['sandy_loam', 'loam', 'clay_loam', 'silt_clay'];
  const growthStagesList: GrowthStage[] = ['initial', 'development', 'mid_season', 'late_season'];
  const currentKc = FAO_CROP_COEFFICIENTS[cropType]?.[growthStage] ?? 1.0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {initialFarm ? t.modalTitleEdit : t.modalTitleNew}
              </h3>
              <p className="text-xs text-slate-500">{t.modalSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Farm Name */}
          <div>
            <label htmlFor="farm-name" className="block text-xs font-bold text-slate-700 mb-1">
              {t.farmNameLabel}
            </label>
            <input
              id="farm-name"
              name="farmName"
              type="text"
              autoComplete="off"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.farmNamePlaceholder}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Interactive Map with Coordinate Fallback */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Geographic Location &amp; Coordinates
            </label>
            <InteractiveFarmMap
              latitude={latitude}
              longitude={longitude}
              fieldSizeHectares={fieldSize}
              onLocationChange={(newLat, newLon, newRegion) => {
                setLatitude(newLat);
                setLongitude(newLon);
                if (newRegion) setRegionName(newRegion);
              }}
            />
          </div>

          {/* Field Size & Crop Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="farm-field-size" className="block text-xs font-bold text-slate-700 mb-1">
                {t.fieldSizeLabel}
              </label>
              <div className="relative">
                <input
                  id="farm-field-size"
                  name="fieldSizeHectares"
                  type="number"
                  autoComplete="off"
                  min="0.1"
                  step="0.5"
                  max="10000"
                  required
                  value={fieldSize}
                  onChange={(e) => setFieldSize(parseFloat(e.target.value) || 1)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 pr-12 font-medium"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">ha</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">{t.depthM3Ratio}</p>
            </div>

            <div>
              <label htmlFor="farm-crop-type" className="block text-xs font-bold text-slate-700 mb-1">
                {t.cropTypeLabel}
              </label>
              <select
                id="farm-crop-type"
                name="cropType"
                value={cropType}
                onChange={(e) => setCropType(e.target.value as CropType)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer font-medium"
              >
                {crops.map((c) => (
                  <option key={c.type} value={c.type}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Growth Stage Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700">{t.growthStageLabel}</label>
              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Kc: {currentKc}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {growthStagesList.map((stage) => {
                const isSelected = growthStage === stage;
                const info = getGrowthStageInfo(stage, t);
                const stageKc = FAO_CROP_COEFFICIENTS[cropType]?.[stage] ?? 1.0;

                return (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => setGrowthStage(stage)}
                    className={`p-3 text-left rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-medium ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold">{info.title}</span>
                      <span className="font-mono text-[10px] text-slate-500">Kc {stageKc}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">{info.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Irrigation Method & Efficiency Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                {t.irrigationMethodLabel} &amp; Application Efficiency
              </label>
              <span className="text-xs font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md">
                {customEfficiencyPercent}% Efficiency
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {irrigationMethods.map((m) => {
                const isSelected = irrigationMethod === m;
                const mInfo = getIrrigationMethodInfo(m, t);
                const defaultEff = Math.round((IRRIGATION_EFFICIENCIES[m]?.efficiency ?? 0.75) * 100);

                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setIrrigationMethod(m);
                      setCustomEfficiencyPercent(defaultEff);
                    }}
                    className={`p-2 rounded-xl border text-xs text-center transition-all ${
                      isSelected
                        ? 'bg-sky-50 border-sky-500 text-sky-950 font-bold ring-1 ring-sky-500'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold">{mInfo.title.split(' ')[0]}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{defaultEff}%</div>
                  </button>
                );
              })}
            </div>

            {/* Slider */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600 font-semibold">Custom Calibration:</span>
                <span className="font-mono font-bold text-slate-900">{customEfficiencyPercent}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="98"
                step="1"
                value={customEfficiencyPercent}
                onChange={(e) => setCustomEfficiencyPercent(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Soil Type */}
          <div>
            <label htmlFor="farm-soil-type" className="block text-xs font-bold text-slate-700 mb-1">
              {t.soilTypeLabel}
            </label>
            <select
              id="farm-soil-type"
              name="soilType"
              value={soilType}
              onChange={(e) => setSoilType(e.target.value as SoilType)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer font-medium"
            >
              {soilTypes.map((s) => {
                const sInfo = getSoilTypeInfo(s, t);
                return (
                  <option key={s} value={s}>
                    {sInfo.title} ({SOIL_CHARACTERISTICS[s].availableWaterCapacityMmPerM} mm/m)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl active:scale-98 transition-all shadow-md"
            >
              {t.saveFarmBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
