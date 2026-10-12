import { NextRequest, NextResponse } from 'next/server';
import { IrrigationRecommendation } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const recommendation: IrrigationRecommendation = body.recommendation;
    const language: 'ru' | 'kk' | 'en' = body.language || 'ru';

    if (!recommendation) {
      return NextResponse.json({ error: 'Missing recommendation payload' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    const langInstruction =
      language === 'kk'
        ? 'IMPORTANT: Output strictly in the Kazakh language (қазақ тілінде).'
        : language === 'en'
        ? 'IMPORTANT: Output strictly in the English language.'
        : 'IMPORTANT: Output strictly in the Russian language (на русском языке).';

    // If Gemini API key is configured in env, make real API call
    if (apiKey) {
      try {
        const prompt = `
You are an expert FAO agronomic irrigation specialist assisting a farmer in Central Asia.
Explain the following calculated irrigation model results in simple, practical, actionable language.
${langInstruction}
RULES:
1. DO NOT invent soil moisture sensor readings, weather observations, or fictitious lab measurements.
2. Rely strictly on the provided FAO-56 calculated parameters.
3. Be clear about assumptions (application efficiency, Penman-Monteith ET0, regional flood baseline).
4. Keep the tone helpful, professional, and clear for farm operators.

INPUT DATA:
- Farm: ${recommendation.farmName}
- Period: ${recommendation.periodStart} to ${recommendation.periodEnd} (${recommendation.forecastDays} days)
- Total Reference Evapotranspiration (ET0): ${(recommendation.schedule || []).reduce((acc, s) => acc + s.et0Mm, 0).toFixed(1)} mm
- Total Crop Evapotranspiration (ETc): ${recommendation.totalEtcMm} mm
- Forecast Rainfall: ${recommendation.totalPrecipitationMm} mm (Effective Recharge: ${recommendation.totalEffectiveRainfallMm} mm)
- Recommended Gross Irrigation Depth: ${recommendation.totalGrossIrrigationMm} mm
- Total Water Volume: ${recommendation.totalVolumeM3.toLocaleString()} m³
- Baseline Flood Volume: ${recommendation.baselineTotalVolumeM3.toLocaleString()} m³
- Potential Water Savings: ${recommendation.potentialTotalSavingsM3.toLocaleString()} m³ (${recommendation.potentialSavingsPercentage}%)
- Primary Action: ${recommendation.primaryAction.toUpperCase()}
- Application Timing Recommendation: ${recommendation.recommendedWindowSummary}

Format your response strictly as valid JSON with keys:
{
  "summary": "1-2 sentence core recommendation stating total mm and whether rainfall covers demand.",
  "farmerAdvice": "Clear, direct guidance on when and how to apply water to prevent evaporative loss.",
  "conservationImpact": "Concise statement on cubic meters saved compared to regional flood irrigation.",
  "modelConfidence": "high"
}
`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.2,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return NextResponse.json({
              summary: parsed.summary,
              farmerAdvice: parsed.farmerAdvice,
              conservationImpact: parsed.conservationImpact,
              modelConfidence: parsed.modelConfidence || 'high',
              source: 'gemini',
            });
          }
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to deterministic agronomist engine:', geminiError);
      }
    }

    // High-quality deterministic agronomic explanation fallback (when API key is not present or rate limited)
    const rainCoversDemand = recommendation.totalEffectiveRainfallMm >= recommendation.totalEtcMm;
    const isWaterDeficit = recommendation.totalGrossIrrigationMm > 0;

    let summary = '';
    let farmerAdvice = '';
    let conservationImpact = '';

    if (language === 'kk') {
      if (rainCoversDemand) {
        summary = `Табиғи тиімді жауын-шашын (${recommendation.totalEffectiveRainfallMm} мм) алдағы ${recommendation.forecastDays} күнде дақыл сұранысын (${recommendation.totalEtcMm} мм) толық жабады. Суаруды тоқтата тұруға болады.`;
      } else if (isWaterDeficit) {
        summary = `«${recommendation.farmName}» алқабына алдағы 7 күнде шамамен ${recommendation.totalGrossIrrigationMm} мм (${recommendation.totalVolumeM3.toLocaleString()} м³) суару қажет. ${recommendation.totalPrecipitationMm} мм жауын-шашын болжамы дақыл қажеттілігін өтеуге жеткіліксіз.`;
      } else {
        summary = `Дақылдың су теңгерімі қалыпты. Топырақ ылғалдылығын бақылауды жалғастырыңыз.`;
      }
      farmerAdvice = `Күндізгі булануды азайту үшін суаруды ұсынылған уақытта (${recommendation.recommendedWindowSummary}) жүргізіңіз. Арық жиектерін тексеріп, ысырапқа жол бермеңіз.`;
      conservationImpact =
        recommendation.potentialTotalSavingsM3 > 0
          ? `FAO-56 кестесін сақтау дәстүрлі арықпен суаруға қарағанда шамамен ${recommendation.potentialTotalSavingsM3.toLocaleString()} м³ (${recommendation.potentialSavingsPercentage}%) суды үнемдейді.`
          : `Суару тиімділігі тамыр қабатының нормасына сәйкес келеді.`;
    } else if (language === 'ru') {
      if (rainCoversDemand) {
        summary = `Естественные осадки (${recommendation.totalEffectiveRainfallMm} мм) полностью покроют потребность культуры (${recommendation.totalEtcMm} мм) в ближайшие ${recommendation.forecastDays} дней. Полив можно отложить.`;
      } else if (isWaterDeficit) {
        summary = `Хозяйству «${recommendation.farmName}» требуется ориентировочно ${recommendation.totalGrossIrrigationMm} мм (${recommendation.totalVolumeM3.toLocaleString()} м³) полива на ближайшие 7 дней. Прогноз осадков (${recommendation.totalPrecipitationMm} мм) недостаточен.`;
      } else {
        summary = `Водный баланс культуры находится в равновесии. Продолжайте мониторинг влажности почвы.`;
      }
      farmerAdvice = `Подавайте поливную норму в рекомендованное окно (${recommendation.recommendedWindowSummary}) для снижения потерь на испарение.`;
      conservationImpact =
        recommendation.potentialTotalSavingsM3 > 0
          ? `Соблюдение данного графика экономит ориентировочно ${recommendation.potentialTotalSavingsM3.toLocaleString()} м³ (${recommendation.potentialSavingsPercentage}%) по сравнению с базовым арычным поливом.`
          : `Эффективность полива соответствует биологической норме.`;
    } else {
      if (rainCoversDemand) {
        summary = `Natural effective precipitation (${recommendation.totalEffectiveRainfallMm} mm) is expected to satisfy crop evapotranspiration demand (${recommendation.totalEtcMm} mm) over the next ${recommendation.forecastDays} days. Irrigation can be suspended.`;
      } else if (isWaterDeficit) {
        summary = `Your field requires approximately ${recommendation.totalGrossIrrigationMm} mm (${recommendation.totalVolumeM3.toLocaleString()} m³) of irrigation over the selected 7-day period. Forecast rainfall of ${recommendation.totalPrecipitationMm} mm is insufficient to cover the estimated crop water demand.`;
      } else {
        summary = `Crop water demand is currently in equilibrium with minimal evaporative stress. Maintain soil moisture monitoring.`;
      }
      farmerAdvice = `Apply scheduled water during the recommended window (${recommendation.recommendedWindowSummary}) to minimize midday atmospheric evaporative loss. Check field borders to eliminate tailwater runoff.`;
      conservationImpact =
        recommendation.potentialTotalSavingsM3 > 0
          ? `Adhering to this FAO-56 schedule saves approximately ${recommendation.potentialTotalSavingsM3.toLocaleString()} m³ (${recommendation.potentialSavingsPercentage}%) compared to regional 50% efficiency flood/furrow baselines.`
          : `Irrigation efficiency matches root zone uptake thresholds.`;
    }

    return NextResponse.json({
      summary,
      farmerAdvice,
      conservationImpact,
      modelConfidence: 'high',
      source: 'algorithmic_fallback',
    });
  } catch (error) {
    console.error('AI Advisor endpoint error:', error);
    return NextResponse.json({ error: 'Failed to process advice' }, { status: 500 });
  }
}
