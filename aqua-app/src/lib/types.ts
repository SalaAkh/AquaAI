export type CropType = 'wheat' | 'cotton' | 'rice' | 'corn' | 'vegetables';

export type GrowthStage = 'initial' | 'development' | 'mid_season' | 'late_season';

export type IrrigationMethod = 'drip' | 'sprinkler' | 'furrow_flood';

export type SoilType = 'sandy_loam' | 'loam' | 'clay_loam' | 'silt_clay';

export interface LocationPreset {
  id: string;
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  description: string;
  primaryCrops: CropType[];
}

export interface FarmProfile {
  id: string;
  name: string;
  locationId: string;
  locationName: string;
  region: string;
  latitude: number;
  longitude: number;
  fieldSizeHectares: number;
  cropType: CropType;
  growthStage: GrowthStage;
  irrigationMethod: IrrigationMethod;
  soilType: SoilType;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailyWeatherForecast {
  date: string;
  tempMaxC: number;
  tempMinC: number;
  tempMeanC: number;
  precipitationMm: number;
  et0Mm: number; // FAO-56 Reference Evapotranspiration
  relativeHumidityPercent: number;
  windSpeedKmh: number;
  solarRadiationMj: number;
  weatherCode: number;
  conditionLabel: string;
}

export interface DailyIrrigationSchedule {
  date: string;
  dayLabel: string;
  weatherCode: number;
  conditionLabel: string;
  tempMaxC: number;
  tempMinC: number;
  precipitationMm: number;
  et0Mm: number;
  kc: number;
  etcMm: number;
  effectiveRainfallMm: number;
  netIrrigationMm: number;
  grossIrrigationMm: number;
  waterVolumeM3: number; // 1 mm * ha * 10
  baselineVolumeM3: number; // Central Asia traditional flood practice
  potentialSavingsM3: number;
  action: 'irrigate' | 'skip' | 'delay';
  actionReason: string;
  recommendedWindow: string;
}

export interface IrrigationRecommendation {
  id: string;
  farmId: string;
  farmName: string;
  calculatedAt: string;
  forecastDays: number;
  periodStart: string;
  periodEnd: string;
  totalEtcMm: number;
  totalPrecipitationMm: number;
  totalEffectiveRainfallMm: number;
  totalNetIrrigationMm: number;
  totalGrossIrrigationMm: number;
  totalVolumeM3: number;
  baselineTotalVolumeM3: number;
  potentialTotalSavingsM3: number;
  potentialSavingsPercentage: number;
  primaryAction: 'irrigate' | 'skip' | 'monitor';
  recommendedWindowSummary: string;
  schedule: DailyIrrigationSchedule[];
  assumptions: {
    irrigationEfficiency: number;
    effectiveRainfallFactor: number;
    baselineMethod: string;
    weatherSource: string;
    faoStandard: string;
  };
  limitations: string[];
  aiExplanation?: {
    summary: string;
    farmerAdvice: string;
    conservationImpact: string;
    modelConfidence: 'high' | 'medium' | 'moderate';
    source: 'gemini' | 'algorithmic_fallback';
  };
  onChainProof?: OnChainProof;
}

export interface OnChainProof {
  dataHash: string; // SHA-256 hexadecimal hash
  signature?: string;
  slot?: number;
  timestamp: string;
  cluster: 'devnet';
  explorerUrl?: string;
  status: 'pending' | 'verified' | 'failed' | 'simulated';
  memoPayload: string;
  error?: string;
}

export interface SatellitePixel {
  row: number;
  col: number;
  ndvi: number;
  ndwi: number;
  waterStress: 'optimal' | 'mild_deficit' | 'severe_stress';
}

export interface SatelliteImageryData {
  farmId: string;
  acquisitionDate: string;
  satelliteMission: 'Sentinel-2A/B MSI L2A' | 'Landsat-9 OLI-2';
  resolutionMeters: number;
  cloudCoverPercent: number;
  meanNdvi: number;
  meanNdwi: number;
  minNdvi: number;
  maxNdvi: number;
  vegetationVigor: 'dense_canopy' | 'moderate_growth' | 'sparse_canopy' | 'stressed_canopy';
  waterStressStatus: 'optimal_hydration' | 'moderate_deficit' | 'severe_stress';
  faoBaselineKc: number;
  satelliteAdjustedKc: number;
  kcAdjustmentPercent: number;
  spatialUniformityPercent: number;
  grid: SatellitePixel[][];
}
