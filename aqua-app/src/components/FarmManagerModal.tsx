'use client';

import React, { useState } from 'react';
import { X, Sprout, MapPin, Gauge, Layers, Info, Check } from 'lucide-react';
import { CropType, FarmProfile, GrowthStage, IrrigationMethod, SoilType } from '@/lib/types';
import {
  GROWTH_STAGE_LABELS,
  IRRIGATION_EFFICIENCIES,
  LOCATION_PRESETS,
  SOIL_CHARACTERISTICS,
} from '@/lib/constants';

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
  const [name, setName] = useState(initialFarm?.name || 'Turkistan Field Alpha');
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
      setName(initialFarm?.name || (initialFarm ? '' : 'Turkistan Field Alpha'));
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
                {initialFarm ? 'Edit Farm Configuration' : 'Create New Farm Profile'}
              </h3>
              <p className="text-xs text-slate-500">Configure regional agro-climatic parameters</p>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Farm / Field Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Syr Darya Co-op Sector 4"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>

          {/* Location Presets in Kazakhstan / Central Asia */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Location in Kazakhstan & Central Asia
              </label>
              <span className="text-[11px] text-slate-500">
                Lat: {activePreset.latitude.toFixed(2)}°, Lon: {activePreset.longitude.toFixed(2)}°
              </span>
            </div>
            <select
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Field Size (Hectares)
              </label>
              <div className="relative">
                <input
                  type="number"
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
              <p className="mt-1 text-[11px] text-slate-500">1 mm depth = 10 m³ water per ha</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Crop Type</label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value as CropType)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer capitalize"
              >
                <option value="wheat">🌾 Wheat (Grain / Steppe)</option>
                <option value="cotton">🌱 Cotton (Aral Basin Cash Crop)</option>
                <option value="rice">🌾 Rice (Kyzylorda Basin)</option>
                <option value="corn">🌽 Corn / Maize (Fodder & Grain)</option>
                <option value="vegetables">🍅 Vegetables (Horticulture)</option>
              </select>
            </div>
          </div>

          {/* Growth Stage Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Crop Growth Stage</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(['initial', 'development', 'mid_season', 'late_season'] as GrowthStage[]).map((stage) => {
                const isSelected = growthStage === stage;
                const info = GROWTH_STAGE_LABELS[stage];
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Irrigation Delivery Method
              </label>
              <select
                value={irrigationMethod}
                onChange={(e) => setIrrigationMethod(e.target.value as IrrigationMethod)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
              >
                <option value="drip">💧 Drip / Micro-Irrigation (90% Eff.)</option>
                <option value="sprinkler">🌧️ Center Pivot / Sprinkler (75% Eff.)</option>
                <option value="furrow_flood">🌊 Furrow / Flood (55% Eff.)</option>
              </select>
              <p className="mt-1 text-[11px] text-slate-500">
                {IRRIGATION_EFFICIENCIES[irrigationMethod].description}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Soil Texture Type</label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value as SoilType)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
              >
                <option value="sandy_loam">Sandy Loam (Light, rapid infiltration)</option>
                <option value="loam">Loam (Medium balanced water capacity)</option>
                <option value="clay_loam">Clay Loam (Heavy, high water retention)</option>
                <option value="silt_clay">Silty Clay (Dense Aral Basin alluvium)</option>
              </select>
              <p className="mt-1 text-[11px] text-slate-500">
                Available water capacity: {SOIL_CHARACTERISTICS[soilType].availableWaterCapacityMmPerM} mm/meter
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
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl active:scale-98 transition-all shadow-xs"
            >
              Save Farm Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
