'use client';

import React, { useState } from 'react';
import { X, Sprout, MapPin, Check } from 'lucide-react';
import { CropType, FarmProfile, GrowthStage, IrrigationMethod, SoilType } from '@/lib/types';
import {
  LOCATION_PRESETS,
  SOIL_CHARACTERISTICS,
} from '@/lib/constants';
import {
  useTranslation,
  getGrowthStageInfo,
  getIrrigationMethodInfo,
  getSoilTypeInfo,
} from '@/lib/i18n';

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
  const [selectedLocationId, setSelectedLocationId] = useState(
    initialFarm?.locationId || LOCATION_PRESETS[0].id
  );
  const [fieldSize, setFieldSize] = useState<number>(initialFarm?.fieldSizeHectares || 45);
  const [cropType, setCropType] = useState<CropType>(initialFarm?.cropType || 'cotton');
  const [growthStage, setGrowthStage] = useState<GrowthStage>(
    initialFarm?.growthStage || 'mid_season'
  );
  const [irrigationMethod, setIrrigationMethod] = useState<IrrigationMethod>(
    initialFarm?.irrigationMethod || 'drip'
  );
  const [soilType, setSoilType] = useState<SoilType>(initialFarm?.soilType || 'clay_loam');

  React.useEffect(() => {
    if (isOpen) {
      setName(initialFarm?.name || '');
      setSelectedLocationId(initialFarm?.locationId || LOCATION_PRESETS[0].id);
      setFieldSize(initialFarm?.fieldSizeHectares || 45);
      setCropType(initialFarm?.cropType || 'cotton');
      setGrowthStage(initialFarm?.growthStage || 'mid_season');
      setIrrigationMethod(initialFarm?.irrigationMethod || 'drip');
      setSoilType(initialFarm?.soilType || 'clay_loam');
    }
  }, [isOpen, initialFarm]);

  if (!isOpen) return null;

  const activePreset =
    LOCATION_PRESETS.find((l) => l.id === selectedLocationId) || LOCATION_PRESETS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const farm: FarmProfile = {
      id: initialFarm?.id || `farm-${Date.now().toString(36)}`,
      name: name.trim(),
      locationId: activePreset.id,
      locationName: activePreset.name,
      region: `${activePreset.region}, ${activePreset.country}`,
      latitude: activePreset.latitude,
      longitude: activePreset.longitude,
      fieldSizeHectares: Math.max(0.5, fieldSize),
      cropType,
      growthStage,
      irrigationMethod,
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-100 text-sky-700 rounded-lg">
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
            <label htmlFor="farm-name" className="block text-xs font-semibold text-slate-700 mb-1">
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
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>

          {/* Location Presets in Kazakhstan / Central Asia */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="farm-location" className="block text-xs font-semibold text-slate-700">
                {t.locationPresetLabel}
              </label>
              <span className="text-[11px] text-slate-500">
                {t.coordinates} {activePreset.latitude.toFixed(2)}°, {activePreset.longitude.toFixed(2)}°
              </span>
            </div>
            <select
              id="farm-location"
              name="farmLocation"
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
            >
              {LOCATION_PRESETS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.region}, {loc.country})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {activePreset.description}
            </p>
          </div>

          {/* Field Size & Crop Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="farm-field-size" className="block text-xs font-semibold text-slate-700 mb-1">
                {t.fieldSizeLabel}
              </label>
              <div className="relative">
                <input
                  id="farm-field-size"
                  name="fieldSizeHectares"
                  type="number"
                  autoComplete="off"
                  min="0.5"
                  step="0.5"
                  max="10000"
                  required
                  value={fieldSize}
                  onChange={(e) => setFieldSize(parseFloat(e.target.value) || 1)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 pr-12"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">ha</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">{t.depthM3Ratio}</p>
            </div>

            <div>
              <label htmlFor="farm-crop-type" className="block text-xs font-semibold text-slate-700 mb-1">
                {t.cropTypeLabel}
              </label>
              <select
                id="farm-crop-type"
                name="cropType"
                value={cropType}
                onChange={(e) => setCropType(e.target.value as CropType)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
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
            <label className="block text-xs font-semibold text-slate-700 mb-2">{t.growthStageLabel}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {growthStagesList.map((stage) => {
                const isSelected = growthStage === stage;
                const info = getGrowthStageInfo(stage, t);
                return (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => setGrowthStage(stage)}
                    className={`p-3 text-left rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/70 text-sky-950 font-medium ring-1 ring-sky-500'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold">{info.title}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-sky-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">{info.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Irrigation Method & Efficiency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="farm-irrigation-method" className="block text-xs font-semibold text-slate-700 mb-1">
                {t.irrigationMethodLabel}
              </label>
              <select
                id="farm-irrigation-method"
                name="irrigationMethod"
                value={irrigationMethod}
                onChange={(e) => setIrrigationMethod(e.target.value as IrrigationMethod)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
              >
                {irrigationMethods.map((m) => {
                  const mInfo = getIrrigationMethodInfo(m, t);
                  return (
                    <option key={m} value={m}>
                      {mInfo.title}
                    </option>
                  );
                })}
              </select>
              <p className="mt-1 text-[11px] text-slate-500">
                {getIrrigationMethodInfo(irrigationMethod, t).description}
              </p>
            </div>

            <div>
              <label htmlFor="farm-soil-type" className="block text-xs font-semibold text-slate-700 mb-1">
                {t.soilTypeLabel}
              </label>
              <select
                id="farm-soil-type"
                name="soilType"
                value={soilType}
                onChange={(e) => setSoilType(e.target.value as SoilType)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
              >
                {soilTypes.map((s) => {
                  const sInfo = getSoilTypeInfo(s, t);
                  return (
                    <option key={s} value={s}>
                      {sInfo.title}
                    </option>
                  );
                })}
              </select>
              <p className="mt-1 text-[11px] text-slate-500">
                {t.waterCapacityLabel} {SOIL_CHARACTERISTICS[soilType].availableWaterCapacityMmPerM} mm/m
              </p>
            </div>
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
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl active:scale-98 transition-all shadow-xs"
            >
              {t.saveFarmBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
