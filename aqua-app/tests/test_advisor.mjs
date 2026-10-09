async function testAdvisor() {
  const payload = {
    recommendation: {
      farmName: "Turkistan Basin Agro-Cooperative (Demo)",
      forecastDays: 7,
      totalGrossIrrigationMm: 20.5,
      totalVolumeM3: 9225,
      totalPrecipitationMm: 0,
      totalEffectiveRainfallMm: 0,
      totalEtcMm: 18.4,
      periodStart: "2026-10-09",
      periodEnd: "2026-10-15",
      potentialTotalSavingsM3: 7380,
      potentialSavingsPercentage: 44.4,
      primaryAction: "irrigate",
      recommendedWindowSummary: "05:30 - 08:30",
      schedule: [{ et0Mm: 3.26 }]
    }
  };

  const res = await fetch("http://localhost:3000/api/ai/advisor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Response:", data);
}

testAdvisor().catch(console.error);
