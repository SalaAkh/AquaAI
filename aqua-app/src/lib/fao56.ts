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
  return Number((depthMm * areaHectares * 10).toFixed(1));
}

/**
 * Core FAO-56 Irrigation Engine
 * Calculates net & gross irrigation demand, volumes, and timings.
 */
export function calculateIrrigationRecommendation(
  farm: FarmProfile,
  forecast: DailyWeatherForecast[]
): IrrigationRecommendation {
  const kc = getCropCoefficient(farm.cropType, farm.growthStage);
  const efficiency = IRRIGATION_EFFICIENCIES[farm.irrigationMethod]?.efficiency ?? 0.75;
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

    // 7. Scheduling Logic & Best Window
    let action: 'irrigate' | 'skip' | 'delay' = 'irrigate';
    let actionReason = 'Crop evapotranspiration exceeds expected effective rainfall.';
    let recommendedWindow = '05:30 - 08:30 (Morning low VPD window)';

    // Check upcoming rain in the next 24-48 hours
    const nextDayPrecip = forecast[index + 1]?.precipitationMm ?? 0;

    if (day.precipitationMm >= 5 || effRainMm >= etcMm) {
      action = 'skip';
      actionReason = `Natural precipitation (${day.precipitationMm} mm) satisfies or exceeds crop water demand.`;
      recommendedWindow = 'No irrigation required';
    } else if (nextDayPrecip >= 8) {
      action = 'delay';
      actionReason = `Significant rain (${nextDayPrecip} mm) forecasted tomorrow. Delay to avoid deep percolation waste.`;
      recommendedWindow = 'Delay until post-storm assessment';
    } else if (netIrrigationMm < 1.0) {
      action = 'skip';
      actionReason = 'Minimal moisture deficit (< 1.0 mm). Soil root reserve is adequate.';
      recommendedWindow = 'No irrigation required';
    } else if (day.tempMaxC > 32) {
      // High daytime heat in Central Asia: recommend night/evening irrigation to avoid massive evaporative loss
      recommendedWindow = '20:30 - 23:30 (Night application to curb evaporative loss)';
    }

    const dateObj = new Date(day.date);
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
  const irrigateDaysCount = schedule.filter((s) => s.action === 'irrigate').length;
  const primaryAction: 'irrigate' | 'skip' | 'monitor' =
    irrigateDaysCount >= 3 ? 'irrigate' : irrigateDaysCount > 0 ? 'monitor' : 'skip';

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
      weatherSource: 'Open-Meteo High-Resolution Numerical Weather Prediction (ECMWF/GFS)',
      faoStandard: 'FAO Irrigation and Drainage Paper No. 56 (Penman-Monteith Single Crop Coefficient)',
    },
    limitations: [
      'Assumes uniform soil infiltration and properly maintained irrigation emitters/nozzles.',
      'Does not account for unmeasured groundwater table capillary rise or localized soil salinity leaching requirements.',
      'Subject to NWP forecast skill limitations beyond 72 hours.',
    ],
  };
}
