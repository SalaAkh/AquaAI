import {
  BASELINE_IRRIGATION_EFFICIENCY,
  FAO_CROP_COEFFICIENTS,
  IRRIGATION_EFFICIENCIES,
} from './constants';
import {
  CropType,
  DailyIrrigationSchedule,
  DailyWeatherForecast,
  FarmProfile,
  GrowthStage,
  IrrigationRecommendation,
} from './types';

/**
 * Calculates effective precipitation (P_eff) from raw precipitation (P)
 * Based on FAO-56 / USDA SCS empirical model adjusted for arid/semi-arid Central Asian soils.
 * - Under 2mm: evaporated directly from dry soil surface / canopy interception without soil moisture recharge.
 * - Above 2mm: ~75-80% infiltrates into root zone before surface runoff.
 */
export function calculateEffectiveRainfall(precipitationMm: number): number {
  if (!Number.isFinite(precipitationMm) || precipitationMm < 0) {
    throw new RangeError('Precipitation must be a non-negative finite number');
  }
  if (precipitationMm <= 1.5) {
    return 0;
  }
  // Formula: Effective rainfall bounded by max infiltration capacity
  const effective = Math.max(0, (precipitationMm - 1.5) * 0.8);
  return Number(effective.toFixed(2));
}

/**
 * Retrieves the FAO-56 crop coefficient (Kc) for given crop and stage.
 */
export function getCropCoefficient(crop: CropType, stage: GrowthStage): number {
  const cropTable = FAO_CROP_COEFFICIENTS[crop];
  if (!cropTable) return 1.0;
  return cropTable[stage] ?? 1.0;
}

/**
 * Converts water depth in millimeters over an area in hectares to cubic meters (m³).
 * Standard agricultural hydrology conversion:
 * 1 mm = 1 liter / m² = 10 m³ / hectare.
 */
export function depthToVolumeM3(depthMm: number, areaHectares: number): number {
  if (!Number.isFinite(depthMm) || depthMm < 0 ||
    !Number.isFinite(areaHectares) || areaHectares < 0) {
    throw new RangeError('Water depth and area must be non-negative finite numbers');
  }
  return Number((depthMm * areaHectares * 10).toFixed(1));
}

/**
 * Core FAO-56 Irrigation Engine
 * Calculates net & gross irrigation demand, volumes, and timings.
 */
export function calculateIrrigationRecommendation(
  farm: FarmProfile,
  forecast: DailyWeatherForecast[],
  weatherSource: 'live' | 'fallback' | 'unknown' = 'unknown'
): IrrigationRecommendation {
  if (!Number.isFinite(farm.fieldSizeHectares) || farm.fieldSizeHectares <= 0) {
    throw new RangeError('Field area must be a positive finite number');
  }
  if (!Array.isArray(forecast) || forecast.length === 0) {
    throw new RangeError('A non-empty forecast is required');
  }
  if (farm.customEfficiency !== undefined &&
      (!Number.isFinite(farm.customEfficiency) ||
        farm.customEfficiency <= 0 || farm.customEfficiency > 1)) {
    throw new RangeError('Irrigation efficiency must be between 0 and 1');
  }
  const kc = getCropCoefficient(farm.cropType, farm.growthStage);
  const efficiency =
    farm.customEfficiency && farm.customEfficiency > 0 && farm.customEfficiency <= 1
      ? farm.customEfficiency
      : IRRIGATION_EFFICIENCIES[farm.irrigationMethod]?.efficiency ?? 0.75;
  const baselineEfficiency = BASELINE_IRRIGATION_EFFICIENCY;

  const schedule: DailyIrrigationSchedule[] = [];

  let totalEtcMm = 0;
  let totalPrecipitationMm = 0;
  let totalEffectiveRainfallMm = 0;
  let totalNetIrrigationMm = 0;
  let totalGrossIrrigationMm = 0;
  let totalVolumeM3 = 0;
  let baselineTotalVolumeM3 = 0;

  forecast.forEach((day, index) => {
    if (!Number.isFinite(day.et0Mm) || day.et0Mm < 0 ||
        !Number.isFinite(day.precipitationMm) || day.precipitationMm < 0 ||
        !Number.isFinite(day.tempMaxC) || typeof day.date !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(day.date)) {
      throw new RangeError('Forecast contains invalid hydrological inputs');
    }
    // 1. Crop Evapotranspiration: ETc = ET0 * Kc
    const etcMm = Number((day.et0Mm * kc).toFixed(2));
    totalEtcMm += etcMm;

    // 2. Effective Rainfall
    const effRainMm = calculateEffectiveRainfall(day.precipitationMm);
    totalPrecipitationMm += day.precipitationMm;
    totalEffectiveRainfallMm += effRainMm;

    // 3. Net Irrigation Requirement: max(0, ETc - P_eff)
    const netIrrigationMm = Math.max(0, Number((etcMm - effRainMm).toFixed(2)));
    totalNetIrrigationMm += netIrrigationMm;

    // 4. Gross Irrigation Requirement accounting for farm application efficiency
    const grossIrrigationMm = Number((netIrrigationMm / efficiency).toFixed(2));
    totalGrossIrrigationMm += grossIrrigationMm;

    // 5. Volume conversion: 1 mm * ha * 10 = m³
    const volumeM3 = depthToVolumeM3(grossIrrigationMm, farm.fieldSizeHectares);
    totalVolumeM3 += volumeM3;

    // 6. Regional baseline flood scenario (50% efficiency traditional canal)
    const baselineGrossMm = Number((netIrrigationMm / baselineEfficiency).toFixed(2));
    const baselineM3 = depthToVolumeM3(baselineGrossMm, farm.fieldSizeHectares);
    baselineTotalVolumeM3 += baselineM3;

    const potentialSavingsM3 = Math.max(0, Number((baselineM3 - volumeM3).toFixed(1)));

    // 7. Conservative daily advisory: ETc - effective rainfall describes
    // modelled replacement demand, not the moisture content of the root zone.
    // Never automatically postpone a positive deficit on the strength of
    // tomorrow's rain alone: current stored soil water is unknown.
    let action: 'irrigate' | 'skip' | 'delay' = 'irrigate';
    let actionReason = 'Modelled crop water demand exceeds effective forecast rainfall. Check root-zone moisture before applying water.';
    let recommendedWindow = '05:30 - 08:30 (illustrative: confirm local conditions)';
    const nextDayPrecip = forecast[index + 1]?.precipitationMm ?? 0;

    if (netIrrigationMm === 0) {
      action = 'skip';
      actionReason = 'Effective rainfall meets modelled crop demand for this day; verify soil conditions.';
      recommendedWindow = 'No replacement irrigation estimated';
    } else if (netIrrigationMm < 1) {
      actionReason = 'Small positive modelled demand: verify root-zone moisture before choosing to irrigate.';
      recommendedWindow = 'Only after checking soil moisture';
    } else if (nextDayPrecip >= 8) {
      actionReason = `Rain (${nextDayPrecip} mm) is forecast tomorrow, but soil storage is unknown; do not postpone irrigation automatically. Check moisture and update the forecast.`;
      recommendedWindow = 'Confirm soil moisture and rain forecast';
    } else if (day.tempMaxC > 32) {
      recommendedWindow = '20:30 - 23:30 (illustrative cool-hour window)';
    }

    const dateObj = new Date(`${day.date}T12:00:00`);
    const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    schedule.push({
      date: day.date,
      dayLabel,
      weatherCode: day.weatherCode,
      conditionLabel: day.conditionLabel,
      tempMaxC: day.tempMaxC,
      tempMinC: day.tempMinC,
      precipitationMm: day.precipitationMm,
      et0Mm: day.et0Mm,
      kc,
      etcMm,
      effectiveRainfallMm: effRainMm,
      netIrrigationMm,
      grossIrrigationMm,
      waterVolumeM3: volumeM3,
      baselineVolumeM3: baselineM3,
      potentialSavingsM3,
      action,
      actionReason,
      recommendedWindow,
    });
  });

  const potentialTotalSavingsM3 = Math.max(0, Number((baselineTotalVolumeM3 - totalVolumeM3).toFixed(1)));
  const potentialSavingsPercentage =
    baselineTotalVolumeM3 > 0
      ? Number(((potentialTotalSavingsM3 / baselineTotalVolumeM3) * 100).toFixed(1))
      : 0;

  // Determine aggregate recommendation
  const hasReplacementDemand = schedule.some((s) => s.netIrrigationMm >= 1);
  const hasSmallDemand = schedule.some((s) => s.netIrrigationMm > 0);
  const primaryAction: 'irrigate' | 'skip' | 'monitor' =
    hasReplacementDemand ? 'irrigate' : hasSmallDemand ? 'monitor' : 'skip';

  const periodStart = forecast[0]?.date ?? new Date().toISOString().split('T')[0];
  const periodEnd = forecast[forecast.length - 1]?.date ?? periodStart;

  const recommendationId = `REC-${farm.id}-${Date.now().toString(36).toUpperCase()}`;

  return {
    id: recommendationId,
    farmId: farm.id,
    farmName: farm.name,
    calculatedAt: new Date().toISOString(),
    forecastDays: forecast.length,
    periodStart,
    periodEnd,
    totalEtcMm: Number(totalEtcMm.toFixed(2)),
    totalPrecipitationMm: Number(totalPrecipitationMm.toFixed(2)),
    totalEffectiveRainfallMm: Number(totalEffectiveRainfallMm.toFixed(2)),
    totalNetIrrigationMm: Number(totalNetIrrigationMm.toFixed(2)),
    totalGrossIrrigationMm: Number(totalGrossIrrigationMm.toFixed(2)),
    totalVolumeM3: Number(totalVolumeM3.toFixed(1)),
    baselineTotalVolumeM3: Number(baselineTotalVolumeM3.toFixed(1)),
    potentialTotalSavingsM3,
    potentialSavingsPercentage,
    primaryAction,
    recommendedWindowSummary:
      farm.irrigationMethod === 'drip'
        ? 'Early morning micro-pulses (05:30 - 08:30) or dusk to match crop transpiration rate.'
        : 'Night/early morning application to prevent overhead wind drift and thermal evaporative flash.',
    schedule,
    assumptions: {
      irrigationEfficiency: efficiency,
      effectiveRainfallFactor: 0.8,
      baselineMethod: 'Unlined canal / traditional furrow inundation (50% regional Central Asian efficiency benchmark)',
      weatherSource: weatherSource === 'live'
        ? 'Open-Meteo forecast (model, not a field measurement)'
        : weatherSource === 'fallback'
        ? 'Synthetic illustrative weather scenario — not suitable for live irrigation decisions'
        : 'Unverified input forecast — source not specified',
      faoStandard: 'FAO Irrigation and Drainage Paper No. 56 (Penman-Monteith Single Crop Coefficient)',
    },
    limitations: [
      'Assumes uniform soil infiltration and properly maintained irrigation emitters/nozzles.',
      'Does not account for unmeasured groundwater table capillary rise or localized soil salinity leaching requirements.',
      'This daily replacement model does not measure soil water storage; do not treat it as an automatic irrigation order.',
      'Effective rainfall is an illustrative heuristic, not a measured infiltration or a complete USDA SCS implementation.',
      'Subject to NWP forecast skill limitations beyond 72 hours.',
    ],
  };
}
