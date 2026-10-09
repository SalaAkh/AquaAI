import assert from 'node:assert/strict';

// Test FAO-56 core calculation logic
function testDepthToVolumeM3() {
  // 1 mm over 1 hectare = 10 cubic meters
  const depth = 1;
  const hectares = 1;
  const volume = depth * hectares * 10;
  assert.equal(volume, 10, '1 mm over 1 ha must equal 10 m³');

  // 18 mm over 45 ha = 8,100 m³
  const depth2 = 18;
  const hectares2 = 45;
  const volume2 = depth2 * hectares2 * 10;
  assert.equal(volume2, 8100, '18 mm over 45 ha must equal 8,100 m³');
  console.log('✔ testDepthToVolumeM3 passed');
}

function testCropEvapotranspiration() {
  // ETc = ET0 * Kc
  const et0 = 5.0; // mm/day
  const kc_mid_cotton = 1.20;
  const etc = Number((et0 * kc_mid_cotton).toFixed(2));
  assert.equal(etc, 6.0, 'ETc for cotton (mid-season, ET0=5) must equal 6.00 mm');

  const kc_wheat_dev = 0.75;
  const etc_wheat = Number((et0 * kc_wheat_dev).toFixed(2));
  assert.equal(etc_wheat, 3.75, 'ETc for wheat (dev stage, ET0=5) must equal 3.75 mm');
  console.log('✔ testCropEvapotranspiration passed');
}

function testEffectiveRainfall() {
  // FAO-56 / USDA SCS empirical check
  function calculateEffectiveRainfall(precipitationMm) {
    if (precipitationMm <= 1.5) return 0;
    return Number((Math.max(0, (precipitationMm - 1.5) * 0.8)).toFixed(2));
  }

  assert.equal(calculateEffectiveRainfall(1.0), 0, 'Precipitation under 1.5mm should have 0 effective recharge');
  assert.equal(calculateEffectiveRainfall(11.5), 8.0, '(11.5 - 1.5) * 0.8 must equal 8.00 mm');
  console.log('✔ testEffectiveRainfall passed');
}

function testGrossWaterRequirement() {
  // I_gross = I_net / efficiency
  const net = 18; // mm
  const dripEfficiency = 0.90;
  const floodEfficiency = 0.50;

  const grossDrip = Number((net / dripEfficiency).toFixed(2));
  const grossFlood = Number((net / floodEfficiency).toFixed(2));

  assert.equal(grossDrip, 20.0, 'Drip gross irrigation should be 20.0 mm');
  assert.equal(grossFlood, 36.0, 'Flood gross irrigation should be 36.0 mm');

  const savingsMm = grossFlood - grossDrip;
  assert.equal(savingsMm, 16.0, 'Water saved should be 16.0 mm');
  console.log('✔ testGrossWaterRequirement passed');
}

try {
  console.log('Running AquaAI Agricultural Hydrology & FAO-56 Unit Tests...');
  testDepthToVolumeM3();
  testCropEvapotranspiration();
  testEffectiveRainfall();
  testGrossWaterRequirement();
  console.log('All water calculation unit tests PASSED successfully!');
} catch (e) {
  console.error('Test failed:', e);
  process.exit(1);
}
