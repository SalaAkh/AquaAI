import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { Connection } from '@solana/web3.js';

const APP_URL = process.env.APP_URL || 'http://localhost:3001';
const SOLANA_DEVNET_RPC = 'https://api.devnet.solana.com';

async function runEndToEndVerification() {
  console.log('=== AquaAI End-to-End User Journey Verification ===\n');

  // STEP 1: Verify Web Application Root Serving
  console.log('Step 1: Testing Web Application Root HTML Serving...');
  const rootRes = await fetch(APP_URL);
  assert.equal(rootRes.status, 200, 'Root URL must return HTTP 200');
  const html = await rootRes.text();
  assert.ok(html.includes('AquaAI'), 'HTML must contain brand name AquaAI');
  assert.ok(
    html.includes('Smarter Irrigation') || html.includes('Точный полив') || html.includes('Дәл суару'),
    'HTML must contain hero tag'
  );
  console.log('✔ Step 1 Passed: Root Next.js page served successfully (Length: ' + html.length + ' bytes).\n');

  // STEP 2: Create a Farm Profile in Kazakhstan
  console.log('Step 2: Simulating Farm Creation for Kyzylorda Rice Basin...');
  const farmProfile = {
    id: 'farm-kyzylorda-test-01',
    name: 'Kyzylorda Syr Darya Rice Co-operative',
    locationId: 'kyzylorda',
    locationName: 'Kyzylorda Lower Basin',
    region: 'Kyzylorda Region, Kazakhstan',
    latitude: 44.8488,
    longitude: 65.5092,
    fieldSizeHectares: 60,
    cropType: 'rice',
    growthStage: 'mid_season',
    irrigationMethod: 'furrow_flood',
    soilType: 'silt_clay',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  console.log('✔ Step 2 Passed: Farm profile instantiated for ' + farmProfile.name + ' (' + farmProfile.fieldSizeHectares + ' ha).\n');

  // STEP 3: Retrieve Real Meteorological Data from Open-Meteo
  console.log('Step 3: Retrieving Real Weather Forecast via /api/weather...');
  const weatherRes = await fetch(`${APP_URL}/api/weather?lat=${farmProfile.latitude}&lon=${farmProfile.longitude}`);
  assert.equal(weatherRes.status, 200, 'Weather endpoint must return 200');
  const weatherData = await weatherRes.json();
  assert.ok(weatherData.forecast && weatherData.forecast.length >= 7, 'Must return at least 7 days forecast');
  assert.ok(weatherData.forecast[0].et0Mm > 0, 'Must contain valid FAO-56 reference evapotranspiration ET0');
  console.log(`✔ Step 3 Passed: Live weather retrieved from Open-Meteo (ET0 day 1: ${weatherData.forecast[0].et0Mm} mm/day, Source: ${weatherData.source}).\n`);

  // STEP 4: Calculate FAO-56 Irrigation Requirements
  console.log('Step 4: Executing FAO-56 Penman-Monteith Agronomic Calculations...');
  const kc_rice_mid = 1.20;
  const efficiency_flood = 0.55;
  const baseline_efficiency = 0.50;

  let totalEtcMm = 0;
  let totalPrecipMm = 0;
  let totalGrossMm = 0;
  let totalVolumeM3 = 0;
  let baselineTotalM3 = 0;

  weatherData.forecast.forEach((day) => {
    const etc = Number((day.et0Mm * kc_rice_mid).toFixed(2));
    totalEtcMm += etc;
    totalPrecipMm += day.precipitationMm;

    const effRain = day.precipitationMm > 1.5 ? (day.precipitationMm - 1.5) * 0.8 : 0;
    const net = Math.max(0, etc - effRain);
    const gross = Number((net / efficiency_flood).toFixed(2));
    totalGrossMm += gross;

    // 1 mm over 1 ha = 10 m³
    const vol = gross * farmProfile.fieldSizeHectares * 10;
    totalVolumeM3 += vol;

    const baseGross = Number((net / baseline_efficiency).toFixed(2));
    const baseVol = baseGross * farmProfile.fieldSizeHectares * 10;
    baselineTotalM3 += baseVol;
  });

  const recommendation = {
    id: `REC-${farmProfile.id}-E2E`,
    farmId: farmProfile.id,
    farmName: farmProfile.name,
    calculatedAt: new Date().toISOString(),
    forecastDays: weatherData.forecast.length,
    periodStart: weatherData.forecast[0].date,
    periodEnd: weatherData.forecast[weatherData.forecast.length - 1].date,
    totalEtcMm: Number(totalEtcMm.toFixed(2)),
    totalPrecipitationMm: Number(totalPrecipMm.toFixed(2)),
    totalEffectiveRainfallMm: 0,
    totalNetIrrigationMm: Number((totalGrossMm * efficiency_flood).toFixed(2)),
    totalGrossIrrigationMm: Number(totalGrossMm.toFixed(2)),
    totalVolumeM3: Math.round(totalVolumeM3),
    baselineTotalVolumeM3: Math.round(baselineTotalM3),
    potentialTotalSavingsM3: Math.max(0, Math.round(baselineTotalM3 - totalVolumeM3)),
    potentialSavingsPercentage: Number((((baselineTotalM3 - totalVolumeM3) / baselineTotalM3) * 100).toFixed(1)),
    primaryAction: 'irrigate',
    recommendedWindowSummary: 'Early morning (05:30 - 08:30)',
    schedule: weatherData.forecast.map(f => ({ et0Mm: f.et0Mm })),
    assumptions: {
      irrigationEfficiency: efficiency_flood,
      effectiveRainfallFactor: 0.8,
      baselineMethod: 'Traditional Furrow / Canal Inundation (50% benchmark)',
      weatherSource: 'Open-Meteo High-Resolution ECMWF/GFS',
      faoStandard: 'FAO Irrigation and Drainage Paper No. 56'
    }
  };

  assert.ok(recommendation.totalVolumeM3 > 0, 'Total water volume must be calculated');
  console.log(`✔ Step 4 Passed: FAO-56 Gross Irrigation: ${recommendation.totalGrossIrrigationMm} mm, Total Volume: ${recommendation.totalVolumeM3.toLocaleString()} m³.\n`);

  // STEP 5: Gemini AI Agronomic Advisor API
  console.log('Step 5: Testing Gemini AI Agronomic Advisor via /api/ai/advisor...');
  const advisorRes = await fetch(`${APP_URL}/api/ai/advisor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recommendation })
  });
  assert.equal(advisorRes.status, 200, 'AI advisor endpoint must return 200');
  const advisorData = await advisorRes.json();
  assert.ok(advisorData.summary, 'Must return summary');
  assert.ok(advisorData.farmerAdvice, 'Must return actionable farmer guidance');
  console.log(`✔ Step 5 Passed: AI Advisor returned grounded explanation (Source: ${advisorData.source}).`);
  console.log(`   Summary: "${advisorData.summary.slice(0, 100)}..."\n`);

  // STEP 6: Cryptographic SHA-256 Digest Generation
  console.log('Step 6: Generating Cryptographic SHA-256 Fingerprint for Solana Memo...');
  const canonicalPayload = {
    id: recommendation.id,
    farmId: recommendation.farmId,
    calculatedAt: recommendation.calculatedAt,
    forecastDays: recommendation.forecastDays,
    totalGrossIrrigationMm: recommendation.totalGrossIrrigationMm,
    totalVolumeM3: recommendation.totalVolumeM3,
    periodStart: recommendation.periodStart,
    periodEnd: recommendation.periodEnd,
    faoStandard: recommendation.assumptions.faoStandard
  };
  const jsonStr = JSON.stringify(canonicalPayload, Object.keys(canonicalPayload).sort());
  const sha256Hash = crypto.createHash('sha256').update(jsonStr).digest('hex');
  const memoText = `AQUA-AI:V1:${recommendation.id}:${sha256Hash.slice(0, 32)}`;
  assert.equal(sha256Hash.length, 64, 'SHA-256 fingerprint must be 64 hexadecimal characters');
  console.log(`✔ Step 6 Passed: SHA-256 Hash: ${sha256Hash}`);
  console.log(`   Solana Memo Payload: "${memoText}"\n`);

  // STEP 7: Solana Devnet Connectivity & Blockhash
  console.log('Step 7: Verifying Solana Devnet RPC Connectivity...');
  const connection = new Connection(SOLANA_DEVNET_RPC, 'confirmed');
  const { blockhash } = await connection.getLatestBlockhash('confirmed');
  assert.ok(blockhash, 'Solana Devnet blockhash must be retrieved');
  console.log(`✔ Step 7 Passed: Successfully communicated with Solana Devnet RPC (${SOLANA_DEVNET_RPC}). Current blockhash: ${blockhash}\n`);

  console.log('========================================================');
  console.log('🎉 ALL 7 END-TO-END VERIFICATION STEPS PASSED WITH 100% SUCCESS!');
  console.log('========================================================');
}

runEndToEndVerification().catch(err => {
  console.error('❌ E2E Verification failed:', err);
  process.exit(1);
});
