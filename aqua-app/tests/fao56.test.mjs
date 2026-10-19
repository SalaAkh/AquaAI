import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

// Exercise the ACTUAL application code, transpiled from its real TypeScript sources.
// No duplicate test-only crop coefficients, irrigation algorithms, or copied functions.
const require = createRequire(import.meta.url);
const temp = mkdtempSync(join(tmpdir(), 'aqua-hydrology-test-'));

try {
  for (const name of ['constants', 'fao56']) {
    const source = readFileSync(resolve('src/lib', name + '.ts'), 'utf8');
    const output = ts.transpileModule(source, {
      fileName: name + '.ts',
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    writeFileSync(join(temp, name + '.js'), output);
  }

  const {
    calculateEffectiveRainfall,
    depthToVolumeM3,
    getCropCoefficient,
    calculateIrrigationRecommendation,
  } = require(join(temp, 'fao56.js'));

  const farm = {
    id: 'unit-test-field', name: 'Cotton unit field', fieldSizeHectares: 45,
    cropType: 'cotton', growthStage: 'mid_season', irrigationMethod: 'drip',
    soilType: 'loam', latitude: 43.3, longitude: 68.2,
  };

  const day = (date, overrides = {}) => ({
    date, tempMaxC: 27, tempMinC: 12, tempMeanC: 20, weatherCode: 0,
    conditionLabel: 'Clear', precipitationMm: 0, et0Mm: 5,
    relativeHumidityPercent: 50, windSpeedKmh: 9, solarRadiationMj: 18,
    ...overrides,
  });

  assert.equal(depthToVolumeM3(1, 1), 10);
  assert.equal(depthToVolumeM3(18, 45), 8100);
  assert.equal(getCropCoefficient('cotton', 'mid_season'), 1.2);
  assert.equal(calculateEffectiveRainfall(11.5), 8);
  assert.throws(() => depthToVolumeM3(-1, 45), RangeError);
  assert.throws(() => calculateEffectiveRainfall(-1), RangeError);

  // 5 mm of rain does NOT mean that irrigation is unnecessary.
  const mixed = calculateIrrigationRecommendation(farm, [day('2026-10-20', {
    et0Mm: 5, precipitationMm: 5,
  })], 'live');
  assert.equal(mixed.schedule[0].etcMm, 6);
  assert.equal(mixed.schedule[0].effectiveRainfallMm, 2.8);
  assert.equal(mixed.schedule[0].netIrrigationMm, 3.2);
  assert.equal(mixed.schedule[0].waterVolumeM3, 1602);
  assert.equal(mixed.schedule[0].action, 'irrigate');
  assert.equal(mixed.primaryAction, 'irrigate');
  assert.equal(mixed.totalVolumeM3, mixed.schedule[0].waterVolumeM3);

  const wet = calculateIrrigationRecommendation(farm, [day('2026-10-20', {
    et0Mm: 5, precipitationMm: 10,
  })], 'live');
  assert.equal(wet.schedule[0].action, 'skip');
  assert.equal(wet.schedule[0].waterVolumeM3, 0);
  assert.equal(wet.totalVolumeM3, 0);
  assert.equal(wet.primaryAction, 'skip');

  // Tomorrow's rain should prompt a CHECK, not automatically skip today's positive need.
  const nextRain = calculateIrrigationRecommendation(farm, [
    day('2026-10-20'), day('2026-10-21', { precipitationMm: 15 }),
  ], 'live');
  assert.equal(nextRain.schedule[0].action, 'irrigate');
  assert.match(nextRain.schedule[0].actionReason, /tomorrow/i);
  assert.equal(nextRain.schedule[1].action, 'skip');

  const small = calculateIrrigationRecommendation(farm, [
    day('2026-10-20', { et0Mm: 0.5 }),
  ], 'live');
  assert.equal(small.schedule[0].action, 'irrigate');
  assert.ok(small.schedule[0].waterVolumeM3 > 0);
  assert.equal(small.primaryAction, 'monitor');

  const dry = calculateIrrigationRecommendation(farm, [
    day('2026-10-20'), day('2026-10-21'),
  ], 'fallback');
  assert.equal(dry.forecastDays, 2);
  assert.equal(dry.totalGrossIrrigationMm, 13.34);
  assert.equal(dry.totalVolumeM3, dry.schedule.reduce((s, x) => s + x.waterVolumeM3, 0));
  assert.match(dry.assumptions.weatherSource, /Synthetic/);
  assert.equal(dry.schedule.length, 2);
  assert.equal(dry.primaryAction, 'irrigate');

  // Bad inputs fail rather than being silently transformed into apparently reliable results.
  assert.throws(() => calculateIrrigationRecommendation(farm, []), RangeError);
  assert.throws(() => calculateIrrigationRecommendation({ ...farm, fieldSizeHectares: 0 }, [day('2026-10-20')]), RangeError);
  assert.throws(() => calculateIrrigationRecommendation(farm, [day('2026-10-20', { et0Mm: NaN })]), RangeError);
  assert.throws(() => calculateIrrigationRecommendation(farm, [day('2026-10-20', { precipitationMm: -1 })]), RangeError);
  assert.throws(() => calculateIrrigationRecommendation({ ...farm, customEfficiency: 1.2 }, [day('2026-10-20')]), RangeError);

  console.log('✔ AquaAI production FAO-56 irrigation module tests passed');
} finally {
  rmSync(temp, { recursive: true, force: true });
}
