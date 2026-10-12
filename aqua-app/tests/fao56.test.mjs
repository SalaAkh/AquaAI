import assert from 'node:assert/strict';

// Import constants and functions from fao56 logic
const FAO_CROP_COEFFICIENTS = {
  wheat: { initial: 0.35, development: 0.75, mid_season: 1.15, late_season: 0.45 },
  cotton: { initial: 0.35, development: 0.75, mid_season: 1.20, late_season: 0.65 },
  rice: { initial: 1.05, development: 1.15, mid_season: 1.20, late_season: 0.90 },
  corn: { initial: 0.40, development: 0.80, mid_season: 1.20, late_season: 0.60 },
  vegetables: { initial: 0.50, development: 0.75, mid_season: 1.10, late_season: 0.80 },
};

const IRRIGATION_EFFICIENCIES = {
  drip: { efficiency: 0.90 },
  sprinkler: { efficiency: 0.75 },
  furrow_flood: { efficiency: 0.55 },
};

function calculateEffectiveRainfall(precipitationMm) {
  if (precipitationMm <= 1.5) return 0;
  return Number((Math.max(0, (precipitationMm - 1.5) * 0.8)).toFixed(2));
}

function depthToVolumeM3(depthMm, areaHectares) {
  return Number((depthMm * areaHectares * 10).toFixed(1));
}

function calculateDailySchedule(day, farm, nextDayPrecip = 0) {
  const cropTable = FAO_CROP_COEFFICIENTS[farm.cropType];
  const kc = cropTable ? cropTable[farm.growthStage] : 1.0;
  const efficiency = farm.customEfficiency ?? IRRIGATION_EFFICIENCIES[farm.irrigationMethod]?.efficiency ?? 0.75;
  const baselineEfficiency = 0.50;

  const etcMm = Number((day.et0Mm * kc).toFixed(2));
  const effRainMm = calculateEffectiveRainfall(day.precipitationMm);
  const netIrrigationMm = Math.max(0, Number((etcMm - effRainMm).toFixed(2)));
  const grossIrrigationMm = Number((netIrrigationMm / efficiency).toFixed(2));
  const volumeM3 = depthToVolumeM3(grossIrrigationMm, farm.fieldSizeHectares);

  const baselineGrossMm = Number((netIrrigationMm / baselineEfficiency).toFixed(2));
  const baselineM3 = depthToVolumeM3(baselineGrossMm, farm.fieldSizeHectares);
  const potentialSavingsM3 = Math.max(0, Number((baselineM3 - volumeM3).toFixed(1)));

  let action = 'irrigate';
  let recommendedWindow = '05:30 - 08:30 (Morning low VPD window)';

  if (day.precipitationMm >= 5 || effRainMm >= etcMm) {
    action = 'skip';
    recommendedWindow = 'No irrigation required';
  } else if (nextDayPrecip >= 8) {
    action = 'delay';
    recommendedWindow = 'Delay until post-storm assessment';
  } else if (netIrrigationMm < 1.0) {
    action = 'skip';
    recommendedWindow = 'No irrigation required';
  } else if (day.tempMaxC > 32) {
    recommendedWindow = '20:30 - 23:30 (Night application to curb evaporative loss)';
  }

  return {
    kc,
    etcMm,
    effectiveRainfallMm: effRainMm,
    netIrrigationMm,
    grossIrrigationMm,
    volumeM3,
    baselineM3,
    potentialSavingsM3,
    action,
    recommendedWindow,
  };
}

// ==========================================
// Test Cases
// ==========================================

function testDepthToVolumeM3() {
  console.log('Testing Depth to Volume conversion (1 mm over 1 ha = 10 m³)...');

  // Case 1: 1 mm over 1 ha
  assert.equal(depthToVolumeM3(1, 1), 10.0, '1 mm over 1 ha must equal 10.0 m³');

  // Case 2: 18 mm over 45 ha (Turkistan demo farm)
  assert.equal(depthToVolumeM3(18, 45), 8100.0, '18 mm over 45 ha must equal 8,100.0 m³');

  // Case 3: 25.5 mm over 120 ha (Almaty wheat farm)
  assert.equal(depthToVolumeM3(25.5, 120), 30600.0, '25.5 mm over 120 ha must equal 30,600.0 m³');

  // Case 4: Zero depth
  assert.equal(depthToVolumeM3(0, 50), 0.0, '0 mm depth must yield 0.0 m³ volume');

  console.log('✔ depthToVolumeM3 passed all cases');
}

function testCropEvapotranspirationAcrossCropsAndStages() {
  console.log('Testing ETc = ET0 * Kc across all crops & stages...');

  const et0 = 5.0; // mm/day

  // Cotton: initial (0.35), development (0.75), mid_season (1.20), late_season (0.65)
  assert.equal(Number((et0 * FAO_CROP_COEFFICIENTS.cotton.initial).toFixed(2)), 1.75);
  assert.equal(Number((et0 * FAO_CROP_COEFFICIENTS.cotton.development).toFixed(2)), 3.75);
  assert.equal(Number((et0 * FAO_CROP_COEFFICIENTS.cotton.mid_season).toFixed(2)), 6.00);
  assert.equal(Number((et0 * FAO_CROP_COEFFICIENTS.cotton.late_season).toFixed(2)), 3.25);

  // Wheat: initial (0.35), mid_season (1.15)
  assert.equal(Number((et0 * FAO_CROP_COEFFICIENTS.wheat.mid_season).toFixed(2)), 5.75);

  // Rice: highest demand mid_season (1.20)
  assert.equal(Number((et0 * FAO_CROP_COEFFICIENTS.rice.mid_season).toFixed(2)), 6.00);

  console.log('✔ ETc = ET0 * Kc passed for all tested crops and stages');
}

function testEffectiveRainfallCalculation() {
  console.log('Testing FAO-56 / USDA SCS Effective Rainfall logic...');

  // Sub-threshold precipitation (intercepted by foliage or evaporated before infiltration)
  assert.equal(calculateEffectiveRainfall(0.0), 0.0, '0 mm precipitation gives 0 mm effective recharge');
  assert.equal(calculateEffectiveRainfall(1.0), 0.0, '1.0 mm precipitation (< 1.5mm) gives 0 mm effective recharge');
  assert.equal(calculateEffectiveRainfall(1.5), 0.0, '1.5 mm precipitation threshold gives 0 mm effective recharge');

  // Above threshold
  // 11.5 mm precipitation: (11.5 - 1.5) * 0.8 = 8.0 mm
  assert.equal(calculateEffectiveRainfall(11.5), 8.0, '(11.5 - 1.5) * 0.8 must equal 8.0 mm');

  // 21.5 mm precipitation: (21.5 - 1.5) * 0.8 = 16.0 mm
  assert.equal(calculateEffectiveRainfall(21.5), 16.0, '(21.5 - 1.5) * 0.8 must equal 16.0 mm');

  console.log('✔ Effective Rainfall passed all boundary tests');
}

function testIrrigationEfficiencyAndGrossDepth() {
  console.log('Testing Gross Depth and Savings against 50% flood baseline...');

  const netDeficit = 18.0; // mm

  // Drip (90% eff): 18 / 0.90 = 20.0 mm
  const grossDrip = Number((netDeficit / 0.90).toFixed(2));
  assert.equal(grossDrip, 20.0, 'Drip gross depth should be 20.0 mm');

  // Sprinkler (75% eff): 18 / 0.75 = 24.0 mm
  const grossSprinkler = Number((netDeficit / 0.75).toFixed(2));
  assert.equal(grossSprinkler, 24.0, 'Sprinkler gross depth should be 24.0 mm');

  // Flood baseline (50% eff): 18 / 0.50 = 36.0 mm
  const grossFlood = Number((netDeficit / 0.50).toFixed(2));
  assert.equal(grossFlood, 36.0, 'Flood gross depth should be 36.0 mm');

  // Savings
  const savedDripMm = grossFlood - grossDrip;
  assert.equal(savedDripMm, 16.0, 'Drip saves 16.0 mm compared to flood baseline');

  // Volume savings on 50 ha field: 16.0 mm * 50 ha * 10 = 8,000 m³
  const savedVolumeM3 = depthToVolumeM3(savedDripMm, 50);
  assert.equal(savedVolumeM3, 8000.0, 'Drip on 50 ha saves 8,000 m³ water');

  console.log('✔ Gross Depth and Savings benchmarks verified');
}

function testDailySchedulingAndWeatherDecisions() {
  console.log('Testing Agronomic Scheduling Rules (Irrigate, Delay, Skip, Night window)...');

  const farm = {
    fieldSizeHectares: 45,
    cropType: 'cotton',
    growthStage: 'mid_season',
    irrigationMethod: 'drip',
  };

  // Scenario 1: Normal sunny day, no rain -> Action: irrigate
  const daySunny = { et0Mm: 5.0, precipitationMm: 0.0, tempMaxC: 28 };
  const resSunny = calculateDailySchedule(daySunny, farm);
  assert.equal(resSunny.action, 'irrigate', 'Sunny day with water deficit must recommend irrigate');
  assert.equal(resSunny.etcMm, 6.0, 'Cotton mid-season ETc = 5 * 1.2 = 6.0 mm');
  assert.equal(resSunny.recommendedWindow, '05:30 - 08:30 (Morning low VPD window)');

  // Scenario 2: Heavy rainfall (8 mm) -> Action: skip
  const dayRain = { et0Mm: 3.5, precipitationMm: 8.0, tempMaxC: 22 };
  const resRain = calculateDailySchedule(dayRain, farm);
  assert.equal(resRain.action, 'skip', 'Day with >= 5mm rain must skip irrigation');
  assert.equal(resRain.recommendedWindow, 'No irrigation required');

  // Scenario 3: Heavy rain predicted tomorrow (10 mm) -> Action: delay
  const dayPreStorm = { et0Mm: 4.5, precipitationMm: 0.0, tempMaxC: 29 };
  const resPreStorm = calculateDailySchedule(dayPreStorm, farm, 10.0);
  assert.equal(resPreStorm.action, 'delay', 'Heavy rain tomorrow must delay scheduled irrigation');

  // Scenario 4: Scorching heat (> 32°C) in Central Asia summer -> Recommended window shifts to night
  const dayHeat = { et0Mm: 6.5, precipitationMm: 0.0, tempMaxC: 38 };
  const resHeat = calculateDailySchedule(dayHeat, farm);
  assert.equal(resHeat.action, 'irrigate');
  assert.ok(resHeat.recommendedWindow.includes('Night application'), 'High heat must prescribe evening/night window to curb thermal flash');

  console.log('✔ Agronomic scheduling rules passed all scenarios');
}

function testCustomEfficiencyOverrides() {
  console.log('Testing custom efficiency calibration...');

  const farmCustom = {
    fieldSizeHectares: 30,
    cropType: 'wheat',
    growthStage: 'development',
    irrigationMethod: 'sprinkler',
    customEfficiency: 0.85, // Calibrated precision pivot with low pressure drops
  };

  const day = { et0Mm: 4.0, precipitationMm: 0.0, tempMaxC: 25 };
  const res = calculateDailySchedule(day, farmCustom);

  // ETc = 4.0 * 0.75 = 3.0 mm
  assert.equal(res.etcMm, 3.0);
  // Gross = 3.0 / 0.85 = 3.53 mm
  assert.equal(res.grossIrrigationMm, 3.53);
  // Volume = 3.53 * 30 * 10 = 1059 m³
  assert.equal(res.volumeM3, 1059.0);

  console.log('✔ Custom efficiency calibration correctly applied');
}

try {
  console.log('======================================================');
  console.log('AquaAI Agricultural Hydrology & FAO-56 Test Suite');
  console.log('======================================================');
  testDepthToVolumeM3();
  testCropEvapotranspirationAcrossCropsAndStages();
  testEffectiveRainfallCalculation();
  testIrrigationEfficiencyAndGrossDepth();
  testDailySchedulingAndWeatherDecisions();
  testCustomEfficiencyOverrides();
  console.log('======================================================');
  console.log('ALL AGRICULTURAL CALCULATION TESTS PASSED SUCCESSFULLY');
  console.log('======================================================');
} catch (err) {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
}
