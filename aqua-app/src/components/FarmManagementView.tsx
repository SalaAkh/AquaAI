'use client';

import React, { useState } from 'react';
import {
  Sprout,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  MapPin,
  Sliders,
  Droplets,
  Layers,
  ArrowRight,
  Sparkles,
  Save,
  Check,
  AlertCircle,
} from 'lucide-react';
import { CropType, FarmProfile, GrowthStage, IrrigationMethod, SoilType } from '@/lib/types';
import {
  LOCATION_PRESETS,
  SOIL_CHARACTERISTICS,
  IRRIGATION_EFFICIENCIES,
  FAO_CROP_COEFFICIENTS,
} from '@/lib/constants';
import {
  useTranslation,
  getCropLabel,
  getGrowthStageInfo,
  getIrrigationMethodInfo,
  getSoilTypeInfo,
} from '@/lib/i18n';
import { InteractiveFarmMap } from './InteractiveFarmMap';

interface FarmManagementViewProps {
  farms: FarmProfile[];
  currentFarm: FarmProfile;
  onSelectFarm: (farm: FarmProfile) => void;
  onSaveFarm: (farm: FarmProfile) => void;
  onDeleteFarm: (farmId: string) => void;
  onNavigateToDashboard: () => void;
}

export const FarmManagementView: React.FC<FarmManagementViewProps> = ({
  farms,
  currentFarm,
  onSelectFarm,
  onSaveFarm,
  onDeleteFarm,
  onNavigateToDashboard,
}) => {
  const { t } = useTranslation();

  const [isEditing, setIsEditing] = useState(false);
  const [editingFarmId, setEditingFarmId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState(43.3015);
  const [longitude, setLongitude] = useState(68.2723);
  const [regionName, setRegionName] = useState('Turkistan Region, Kazakhstan');
  const [fieldSize, setFieldSize] = useState<number>(45);
  const [cropType, setCropType] = useState<CropType>('cotton');
  const [growthStage, setGrowthStage] = useState<GrowthStage>('mid_season');
  const [irrigationMethod, setIrrigationMethod] = useState<IrrigationMethod>('drip');
  const [customEfficiencyPercent, setCustomEfficiencyPercent] = useState<number>(90);
  const [soilType, setSoilType] = useState<SoilType>('clay_loam');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Initialize editor for creating new field
  const handleStartNewField = () => {
    setIsEditing(true);
    setEditingFarmId(null);
    setName('');
    setLatitude(43.3015);
    setLongitude(68.2723);
    setRegionName('Turkistan Region, Kazakhstan');
    setFieldSize(50);
    setCropType('cotton');
    setGrowthStage('mid_season');
    setIrrigationMethod('drip');
    setCustomEfficiencyPercent(90);
    setSoilType('clay_loam');
    setSaveSuccessMessage(null);
  };

  // Initialize editor for editing existing field
  const handleStartEditField = (farm: FarmProfile) => {
    setIsEditing(true);
    setEditingFarmId(farm.id);
    setName(farm.name);
    setLatitude(farm.latitude);
    setLongitude(farm.longitude);
    setRegionName(farm.region);
    setFieldSize(farm.fieldSizeHectares);
    setCropType(farm.cropType);
    setGrowthStage(farm.growthStage);
    setIrrigationMethod(farm.irrigationMethod);
    setCustomEfficiencyPercent(
      Math.round((farm.customEfficiency ?? IRRIGATION_EFFICIENCIES[farm.irrigationMethod]?.efficiency ?? 0.8) * 100)
    );
    setSoilType(farm.soilType);
    setSaveSuccessMessage(null);
  };

  // Handle map coordinates update
  const handleLocationChange = (lat: number, lon: number, newRegionName?: string) => {
    setLatitude(lat);
    setLongitude(lon);
    if (newRegionName) {
      setRegionName(newRegionName);
    }
  };

  // Save handler
  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const farm: FarmProfile = {
      id: editingFarmId || `farm-${Date.now().toString(36)}`,
      name: name.trim(),
      locationId: 'custom-loc',
      locationName: regionName || 'Central Asia Agricultural Field',
      region: regionName || 'Kazakhstan',
      latitude: Number(latitude.toFixed(4)),
      longitude: Number(longitude.toFixed(4)),
      fieldSizeHectares: Math.max(0.1, Number(fieldSize)),
      cropType,
      growthStage,
      irrigationMethod,
      customEfficiency: Number((customEfficiencyPercent / 100).toFixed(2)),
      soilType,
      isDemo: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveFarm(farm);
    setIsEditing(false);
    setEditingFarmId(null);
    setSaveSuccessMessage(`Field "${farm.name}" successfully saved and updated on Dashboard!`);
    setTimeout(() => setSaveSuccessMessage(null), 4000);
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

  // Current Kc preview
  const currentKc = FAO_CROP_COEFFICIENTS[cropType]?.[growthStage] ?? 1.0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-sky-950 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold mb-3">
              <Sprout className="w-3.5 h-3.5" />
              <span>Farm Management &amp; Field Editor</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Agricultural Field Profiles
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Configure field boundaries, crop parameters, growth stages, and irrigation methods. Changes persist locally and immediately update the live Dashboard weather and FAO-56 irrigation calculations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleStartNewField}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Field</span>
            </button>
          </div>
        </div>
      </div>

      {saveSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3 text-xs font-semibold animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
          <button
            onClick={onNavigateToDashboard}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs transition-colors"
          >
            <span>View on Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Grid: Saved Fields List & Field Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Saved Fields List (5 cols or full width if not editing) */}
        <div className={isEditing ? 'lg:col-span-5 space-y-4' : 'lg:col-span-12 space-y-4'}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Saved Fields ({farms.length})</span>
            </h2>
            {!isEditing && (
              <button
                onClick={handleStartNewField}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Field</span>
              </button>
            )}
          </div>

          <div className={`grid ${isEditing ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
            {farms.map((farm) => {
              const isSelected = farm.id === currentFarm.id;
              const cropIcon = farm.cropType === 'cotton' ? '🌱' : farm.cropType === 'wheat' ? '🌾' : farm.cropType === 'rice' ? '🌾' : '🌽';
              const stageInfo = getGrowthStageInfo(farm.growthStage, t);
              const methodInfo = getIrrigationMethodInfo(farm.irrigationMethod, t);
              const defaultEffRate = IRRIGATION_EFFICIENCIES[farm.irrigationMethod]?.efficiency ?? 0.75;
              const effPercent = Math.round((farm.customEfficiency ?? defaultEffRate) * 100);

              return (
                <div
                  key={farm.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-emerald-50/60 border-emerald-400 shadow-sm ring-1 ring-emerald-400'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-lg shadow-2xs">
                        {cropIcon}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">
                          {farm.id === 'demo-turkistan-cotton' ? t.demoTurkistanName : farm.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{farm.region}</span>
                        </p>
                      </div>
                    </div>

                    {isSelected ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-2xs">
                        Active
                      </span>
                    ) : (
                      <button
                        onClick={() => onSelectFarm(farm)}
                        className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 transition-colors"
                      >
                        Select
                      </button>
                    )}
                  </div>

                  {/* Attributes list */}
                  <div className="mt-4 pt-3 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Area</span>
                      <div className="font-bold text-slate-800">{farm.fieldSizeHectares} ha</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Crop &amp; Stage</span>
                      <div className="font-bold text-slate-800 truncate">
                        {getCropLabel(farm.cropType, t)} ({stageInfo.title.split(' ')[0]})
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Efficiency</span>
                      <div className="font-bold text-slate-800">{effPercent}% ({methodInfo.title.split(' ')[0]})</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Coordinates</span>
                      <div className="font-mono text-[11px] text-slate-600">{farm.latitude.toFixed(2)}°, {farm.longitude.toFixed(2)}°</div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleStartEditField(farm)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-sky-700 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Field</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {farms.length > 1 && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete field "${farm.name}"?`)) {
                              onDeleteFarm(farm.id);
                            }
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Field"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {isSelected && (
                        <button
                          onClick={onNavigateToDashboard}
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                        >
                          <span>Go to Dashboard</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Field Editor Form */}
        {isEditing && (
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingFarmId ? 'Edit Field Profile' : 'Create New Agricultural Field'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pick coordinates on interactive map, set crop type, and adjust efficiency
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-6">
              {/* Field Name */}
              <div>
                <label htmlFor="editor-farm-name" className="block text-xs font-bold text-slate-700 mb-1">
                  Field Name / Agricultural Entity
                </label>
                <input
                  id="editor-farm-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Syr Darya Cotton Parcel #3"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                />
              </div>

              {/* Interactive Map with Coordinate Fallback */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Geographic Location &amp; Coordinates</span>
                  <span className="text-[11px] font-normal text-slate-500">Interactive Map with Fallback</span>
                </label>
                <InteractiveFarmMap
                  latitude={latitude}
                  longitude={longitude}
                  fieldSizeHectares={fieldSize}
                  onLocationChange={handleLocationChange}
                />
              </div>

              {/* Area & Crop Type Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="editor-field-size" className="block text-xs font-bold text-slate-700 mb-1">
                    Field Area (Hectares)
                  </label>
                  <div className="relative">
                    <input
                      id="editor-field-size"
                      type="number"
                      min="0.1"
                      step="0.1"
                      max="10000"
                      required
                      value={fieldSize}
                      onChange={(e) => setFieldSize(parseFloat(e.target.value) || 1)}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 pr-12 font-medium"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-bold">ha</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Hydrology rule: 1 mm depth across {fieldSize} ha = <strong>{(fieldSize * 10).toLocaleString()} m³</strong> water.
                  </p>
                </div>

                <div>
                  <label htmlFor="editor-crop-type" className="block text-xs font-bold text-slate-700 mb-1">
                    Crop Type
                  </label>
                  <select
                    id="editor-crop-type"
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value as CropType)}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer font-medium"
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
                  <label className="block text-xs font-bold text-slate-700">Growth Stage &amp; Crop Coefficient</label>
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
                    Irrigation Delivery Method &amp; Application Efficiency
                  </label>
                  <span className="text-xs font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md">
                    {customEfficiencyPercent}% Application Efficiency
                  </span>
                </div>

                {/* Method selector buttons */}
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
                        className={`p-2.5 rounded-xl border text-xs text-center transition-all ${
                          isSelected
                            ? 'bg-sky-50 border-sky-500 text-sky-950 font-bold ring-1 ring-sky-500'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold">{mInfo.title.split(' ')[0]}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{defaultEff}% standard</div>
                      </button>
                    );
                  })}
                </div>

                {/* Fine-tuning slider */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 font-semibold">Custom Efficiency Calibration:</span>
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
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>40% (Unlined furrow)</span>
                    <span>75% (Pivot)</span>
                    <span>90%+ (Precision drip)</span>
                  </div>
                </div>
              </div>

              {/* Soil Type */}
              <div>
                <label htmlFor="editor-soil-type" className="block text-xs font-bold text-slate-700 mb-1">
                  Soil Texture Type
                </label>
                <select
                  id="editor-soil-type"
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value as SoilType)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer font-medium"
                >
                  {soilTypes.map((s) => {
                    const sInfo = getSoilTypeInfo(s, t);
                    return (
                      <option key={s} value={s}>
                        {sInfo.title} ({SOIL_CHARACTERISTICS[s].availableWaterCapacityMmPerM} mm/m AWC)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl active:scale-95 transition-all shadow-md"
                >
                  <Save className="w-4 h-4 text-emerald-400" />
                  <span>Save &amp; Update Dashboard</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
