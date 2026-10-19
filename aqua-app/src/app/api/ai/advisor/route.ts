import { NextRequest, NextResponse } from 'next/server';
import { IrrigationRecommendation } from '@/lib/types';

// In-memory rate limiting map (IP -> timestamps array)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(ip, validTimestamps);
    return true;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Превышен лимит запросов к AI Advisor. Повторите попытку через минуту.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const recommendation: IrrigationRecommendation = body.recommendation;
    const language: 'ru' | 'kk' | 'en' = body.language || 'ru';

    // 2. Input Validation
    if (
      !recommendation ||
      typeof recommendation !== 'object' ||
      !recommendation.farmName ||
      !Number.isFinite(recommendation.totalVolumeM3) ||
      recommendation.totalVolumeM3 < 0
    ) {
      return NextResponse.json({ error: 'Некорректная структура расчётных данных' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    const langInstruction =
      language === 'kk'
        ? 'IMPORTANT: Output strictly in the Kazakh language (қазақ тілінде).'
        : language === 'en'
        ? 'IMPORTANT: Output strictly in the English language.'
        : 'IMPORTANT: Output strictly in the Russian language (на русском языке).';

    // 3. Gemini API Execution with fallback models
    if (apiKey) {
      const prompt = `
You are an expert FAO agronomic irrigation specialist assisting a farmer in Central Asia.
Explain the following calculated irrigation model results in simple, practical, actionable language.
${langInstruction}
RULES:
1. DO NOT invent soil moisture sensor readings, weather observations, or fictitious lab measurements.
2. Rely strictly on the provided FAO-56 calculated parameters.
3. Be clear about assumptions: this daily replacement model calculates atmospheric water deficit (ETc - Peff), but does NOT measure root zone soil water storage. Clearly mention this limitation.
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
  "summary": "1-2 sentence core recommendation stating total mm, volume in m3, and whether rainfall covers demand.",
  "farmerAdvice": "Clear, direct guidance on when and how to apply water to prevent evaporative loss and check root moisture.",
  "conservationImpact": "Concise statement on cubic meters saved compared to regional flood irrigation.",
  "modelConfidence": "high"
}
`;

      const candidateModels = ['gemini-2.0-flash', 'gemini-1.5-flash'];
      for (const modelName of candidateModels) {
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
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
        } catch (mErr) {
          console.warn(`Gemini model ${modelName} failed, trying next candidate:`, mErr);
        }
      }
    }

    // 4. Deterministic Agronomic Fallback (no API key or network failure)
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
      farmerAdvice = `Күндізгі булануды азайту үшін суаруды ұсынылған уақытта (${recommendation.recommendedWindowSummary}) жүргізіңіз. Топырақ ылғалдылығы датчикпен өлшенбегендіктен, су беру алдында тамыр қабатын қолмен тексеріңіз.`;
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
      farmerAdvice = `Подавайте поливную норму в рекомендованное окно (${recommendation.recommendedWindowSummary}) для снижения потерь на испарение. Так как датчики влажности не установлены, проверьте корнеобитаемый слой перед включением насоса.`;
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
      farmerAdvice = `Apply scheduled water during the recommended window (${recommendation.recommendedWindowSummary}) to minimize midday atmospheric evaporative loss. Since physical soil sensors are not installed, manually confirm root-zone moisture before pumping.`;
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
