import { CropType, GrowthStage, IrrigationMethod, LocationPreset, SoilType } from './types';

export const LOCATION_PRESETS: LocationPreset[] = [
  {
    id: 'turkistan',
    name: 'Turkistan Irrigation District',
    region: 'Turkistan Region',
    country: 'Kazakhstan',
    latitude: 43.3015,
    longitude: 68.2723,
    description: 'Syr Darya river basin. Arid climate with critical irrigation dependency.',
    primaryCrops: ['cotton', 'corn', 'vegetables'],
  },
  {
    id: 'kyzylorda',
    name: 'Kyzylorda Lower Basin',
    region: 'Kyzylorda Region',
    country: 'Kazakhstan',
    latitude: 44.8488,
    longitude: 65.5092,
    description: 'Aral Sea delta zone. Intense evaporation and high salinity considerations.',
    primaryCrops: ['rice', 'wheat'],
  },
  {
    id: 'almaty_zhetysu',
    name: 'Zhetysu Agricultural Plain',
    region: 'Almaty Region',
    country: 'Kazakhstan',
    latitude: 43.3218,
    longitude: 76.9744,
    description: 'Tian Shan foothill basin fed by snowmelt rivers. High-value grains and orchards.',
    primaryCrops: ['wheat', 'corn', 'vegetables'],
  },
  {
    id: 'shymkent',
    name: 'Shymkent Horticultural Belt',
    region: 'South Kazakhstan',
    country: 'Kazakhstan',
    latitude: 42.3417,
    longitude: 69.5901,
    description: 'Temperate-warm oasis with extended growing season and intensive crop cycles.',
    primaryCrops: ['vegetables', 'cotton', 'corn'],
  },
  {
    id: 'kostanay',
    name: 'Kostanay Steppe Grain Belt',
    region: 'Kostanay Region',
    country: 'Kazakhstan',
    latitude: 53.2144,
    longitude: 63.6246,
    description: 'Northern dry-steppe wheat plateau. Dependent on precision rainfed/supplemental irrigation.',
    primaryCrops: ['wheat'],
  },
  {
    id: 'zhambyl_taraz',
    name: 'Talass River Oasis',
    region: 'Zhambyl Region',
    country: 'Kazakhstan',
    latitude: 42.9000,
    longitude: 71.3667,
    description: 'Inter-republic transboundary river basin with seasonal water supply quotas.',
    primaryCrops: ['vegetables', 'corn', 'wheat'],
  },
];

// FAO-56 Crop Coefficients (Kc values)
export const FAO_CROP_COEFFICIENTS: Record<CropType, Record<GrowthStage, number>> = {
  wheat: {
    initial: 0.35,
    development: 0.75,
    mid_season: 1.15,
    late_season: 0.45,
  },
  cotton: {
    initial: 0.35,
    development: 0.75,
    mid_season: 1.20,
    late_season: 0.65,
  },
  rice: {
    initial: 1.05,
    development: 1.15,
    mid_season: 1.20,
    late_season: 0.90,
  },
  corn: {
    initial: 0.40,
    development: 0.80,
    mid_season: 1.20,
    late_season: 0.60,
  },
  vegetables: {
    initial: 0.50,
    development: 0.75,
    mid_season: 1.10,
    late_season: 0.80,
  },
};

// Growth Stage Details
export const GROWTH_STAGE_LABELS: Record<GrowthStage, { title: string; description: string }> = {
  initial: {
    title: 'Initial (Germination & Emergence)',
    description: 'Ground cover < 10%. Evaporation dominates water consumption.',
  },
  development: {
    title: 'Crop Development (Vegetative Growth)',
    description: 'Ground cover expands from 10% to 75%. Rapid rise in transpiration.',
  },
  mid_season: {
    title: 'Mid-Season (Flowering & Fruit Formation)',
    description: 'Full canopy cover. Peak water demand and highest sensitivity to moisture stress.',
  },
  late_season: {
    title: 'Late Season (Ripening & Maturation)',
    description: 'Leaves senesce and yellow. Water requirement diminishes until harvest.',
  },
};

// Irrigation Efficiency (Fraction of delivered water reaching the root zone)
export const IRRIGATION_EFFICIENCIES: Record<IrrigationMethod, { efficiency: number; label: string; description: string }> = {
  drip: {
    efficiency: 0.90,
    label: 'Drip / Micro-Irrigation (90% Eff.)',
    description: 'Direct localized root delivery. Minimal evaporation and zero surface runoff.',
  },
  sprinkler: {
    efficiency: 0.75,
    label: 'Center Pivot / Sprinkler (75% Eff.)',
    description: 'Overhead spray. Moderate losses from wind drift and droplet evaporation.',
  },
  furrow_flood: {
    efficiency: 0.55,
    label: 'Traditional Furrow / Flood (55% Eff.)',
    description: 'Gravity canal inundation. High deep percolation and tailwater runoff losses.',
  },
};

// Soil Moisture Characteristics (Field Capacity & Wilting Point in mm/meter)
export const SOIL_CHARACTERISTICS: Record<SoilType, { label: string; availableWaterCapacityMmPerM: number }> = {
  sandy_loam: {
    label: 'Sandy Loam (Light)',
    availableWaterCapacityMmPerM: 110,
  },
  loam: {
    label: 'Loam (Medium / Balanced)',
    availableWaterCapacityMmPerM: 160,
  },
  clay_loam: {
    label: 'Clay Loam (Heavy)',
    availableWaterCapacityMmPerM: 180,
  },
  silt_clay: {
    label: 'Silty Clay (Dense Aral Basin)',
    availableWaterCapacityMmPerM: 190,
  },
};

// Baseline Central Asian traditional irrigation practice: 55% efficient furrow inundation
export const BASELINE_IRRIGATION_EFFICIENCY = 0.50; // Historical regional benchmark

// Demo Farm Defaults
export const DEMO_FARM_TURKISTAN = {
  id: 'demo-turkistan-cotton',
  name: 'Turkistan Basin Agro-Cooperative (Demo)',
  locationId: 'turkistan',
  locationName: 'Turkistan Irrigation District',
  region: 'Turkistan Region, Kazakhstan',
  latitude: 43.3015,
  longitude: 68.2723,
  fieldSizeHectares: 45,
  cropType: 'cotton' as CropType,
  growthStage: 'mid_season' as GrowthStage,
  irrigationMethod: 'drip' as IrrigationMethod,
  soilType: 'clay_loam' as SoilType,
  isDemo: true,
  createdAt: '2026-03-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
};

export const DEMO_FARM_ALMATY = {
  id: 'demo-almaty-wheat',
  name: 'Zhetysu Spring Wheat Farm #7 (Demo)',
  locationId: 'almaty_zhetysu',
  locationName: 'Zhetysu Agricultural Plain',
  region: 'Almaty Region, Kazakhstan',
  latitude: 43.3218,
  longitude: 76.9744,
  fieldSizeHectares: 120,
  cropType: 'wheat' as CropType,
  growthStage: 'development' as GrowthStage,
  irrigationMethod: 'sprinkler' as IrrigationMethod,
  soilType: 'loam' as SoilType,
  isDemo: true,
  createdAt: '2026-03-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
};
