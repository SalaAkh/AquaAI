import { NextRequest, NextResponse } from 'next/server';
import { FarmProfile, IrrigationRecommendation } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, recommendation, farm, history } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const systemInstruction = `
Вы — ведущий гидролог и агроном AquaAI по орошаемому земледелию в Центральной Азии (Казахстан, бассейн Аральского моря).
КОНТЕКСТ ХОЗЯЙСТВА:
- Хозяйство: ${farm?.name || 'Поле'} (${farm?.region || 'Казахстан'}, ${farm?.fieldSizeHectares || 50} га)
- Культура: ${farm?.cropType || 'хлопок'}, фаза: ${farm?.growthStage || 'вегетация'}
- Метод полива: ${farm?.irrigationMethod || 'капельный'}
- Почва: ${farm?.soilType || 'суглинок'}
- Рекомендация полива: ${recommendation?.totalGrossIrrigationMm || 24} мм брутто (${recommendation?.totalVolumeM3?.toLocaleString() || '12,000'} м³) на ближайшие 7 дней.
- Прогноз осадков: ${recommendation?.totalPrecipitationMm || 0} мм.

ПРАВИЛА:
1. Отвечайте лаконично, профессионально и понятно для фермера (2-4 предложения).
2. Опирайтесь на принципы гидрологии FAO-56, защиту от засоления и испарения на ветру.
3. Отвечайте на том языке, на котором задан вопрос (русский, казахский или английский).
`;

        const contents = [
          ...(history || []).map((h: { role: string; text: string }) => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }],
          })),
          {
            role: 'user',
            parts: [{ text: message }],
          },
        ];

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              systemInstruction: { parts: [{ text: systemInstruction }] },
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 500,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const resData = await geminiRes.json();
          const replyText =
            resData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
            'Рекомендация подготовлена на основе гидромодели.';
          return NextResponse.json({ reply: replyText, source: 'gemini' });
        }
      } catch (geminiErr) {
        console.warn('Gemini chat API error, falling back:', geminiErr);
      }
    }

    // Smart Agronomic Rule-based Fallback
    const lower = message.toLowerCase();
    let reply = '';

    if (lower.includes('ветер') || lower.includes('жел') || lower.includes('wind')) {
      reply = `При скорости ветра выше 15–18 км/ч эффективность дождевания снижается на 30–40% из-за ветрового сноса и неравномерного распределения капель. Для вашей культуры (${farm?.cropType || 'хлопок'}) настоятельно рекомендуем поливать в утренние часы (05:00–08:30) или ночью, когда приземный слой воздуха спокоен.`;
    } else if (lower.includes('соль') || lower.includes('засол') || lower.includes('тұз') || lower.includes('salin')) {
      reply = `В условиях засоления почв (особенно бассейна Сырдарьи и Арала) недопустим недостаточный поверхностный полив, так как соли подтягиваются к корням. Рекомендуется промывной режим с фракцией выщелачивания (Leaching Fraction ~10-15%) и применение капельного полива с добавлением гипса/кислования при необходимости.`;
    } else if (lower.includes('время') || lower.includes('уақыт') || lower.includes('когда') || lower.includes('when')) {
      reply = `Оптимальное окно полива для поля ${farm?.name || ''} — с 05:30 до 09:00 или после 19:30. В это время дефицит давления водяного пара (VPD) минимален, что предотвращает потерю до 25% поливной воды на прямое испарение в атмосферу.`;
    } else if (lower.includes('удобр') || lower.includes('тыңайтқыш') || lower.includes('фертигац') || lower.includes('fert')) {
      reply = `Фертигацию (подачу удобрений через поливную систему) следует начинать после предварительного увлажнения почвы чистой водой (первые 20-30% поливного цикла) и завершать промывкой системы чистой водой в течение 30 минут во избежание ожогов корневой системы.`;
    } else if (lower.includes('дождь') || lower.includes('жаңбыр') || lower.includes('rain')) {
      reply = `По прогнозу ожидается ${recommendation?.totalPrecipitationMm || 0} мм осадков. Если суточный дождь превышает 8-10 мм, запланированный полив следует отложить на 24-48 часов для полного использования естественной влаги и экономии ресурса насосов.`;
    } else {
      reply = `На основе расчёта FAO-56 для поля «${farm?.name || 'Поле'}» (${farm?.fieldSizeHectares || 50} га, ${farm?.cropType || 'хлопок'}): текущая брутто-потребность составляет ${recommendation?.totalGrossIrrigationMm || 22} мм (${recommendation?.totalVolumeM3?.toLocaleString() || '11,000'} м³). Держите влажность в корневом горизонте 40 см в диапазоне 65–80% от полевой влагоёмкости (ППВ).`;
    }

    return NextResponse.json({ reply, source: 'agronomic_engine' });
  } catch (err: unknown) {
    console.error('Chat API handler error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
