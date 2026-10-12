import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, recommendation, farm, history, language } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const currentLang: 'ru' | 'kk' | 'en' = language || 'ru';
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const langDirective =
          currentLang === 'kk'
            ? 'ЖАУАПТЫ ТЕК ҚАЗАҚ ТІЛІНДЕ БЕРІҢІЗ.'
            : currentLang === 'en'
            ? 'RESPOND STRICTLY IN ENGLISH.'
            : 'ОТВЕЧАЙТЕ СТРОГО НА РУССКОМ ЯЗЫКЕ.';

        const systemInstruction = `
Вы — ведущий гидролог и агроном AquaAI по орошаемому земледелию в Центральной Азии (Казахстан, бассейн Аральского моря).
${langDirective}
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
            resData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (replyText) {
            return NextResponse.json({ reply: replyText, source: 'gemini' });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini chat API error, falling back:', geminiErr);
      }
    }

    // Smart Agronomic Rule-based Fallback in user language
    const lower = message.toLowerCase();
    let reply = '';

    if (currentLang === 'kk') {
      if (lower.includes('ветер') || lower.includes('жел') || lower.includes('wind')) {
        reply = `Жел жылдамдығы 15–18 км/сағ-тан асқан кезде жаңбырлатып суару тиімділігі жел ығысуынан 30–40%-ға төмендейді. «${farm?.name || 'Алқап'}» үшін суаруды таңертеңгі (05:00–08:30) немесе түнгі тымық сағаттарда жүргізуді қатаң ұсынамыз.`;
      } else if (lower.includes('соль') || lower.includes('засол') || lower.includes('тұз') || lower.includes('salin')) {
        reply = `Сырдария мен Арал өңірінің сортаң топырағында беткі аз суаруға жол берілмейді, өйткені тұздар тамырға тартылады. 10-15% шаю фракциясы бар тамшылатып суаруды және органикалық қышқылдандыруды қолдану қажет.`;
      } else if (lower.includes('время') || lower.includes('уақыт') || lower.includes('когда') || lower.includes('when')) {
        reply = `«${farm?.name || 'Алқап'}» үшін суарудың ең тиімді уақыты — таңғы 05:30-дан 09:00-ге дейін немесе кешкі 19:30-дан кейін. Бұл кезде ауа ылғалдылығы тапшылығы (VPD) төмен болып, судың тікелей ауаға ұшып кетуін болдырмайды.`;
      } else if (lower.includes('удобр') || lower.includes('тыңайтқыш') || lower.includes('фертигац') || lower.includes('fert')) {
        reply = `Фертигацияны суару жүйесі арқылы топырақты таза сумен 20-30 минут ылғалдандырғаннан кейін қосып, тамыр күйіп қалмауы үшін соңында жүйені таза сумен 30 минут шаю керек.`;
      } else if (lower.includes('дождь') || lower.includes('жаңбыр') || lower.includes('rain')) {
        reply = `Болжам бойынша ${recommendation?.totalPrecipitationMm || 0} мм жауын-шашын күтілуде. Егер тәуліктік жаңбыр 8-10 мм-ден асса, жоспарланған суаруды 24-48 сағатқа кейінге қалдырып, табиғи ылғалды пайдаланған жөн.`;
      } else {
        reply = `FAO-56 есебі бойынша «${farm?.name || 'Алқап'}» (${farm?.fieldSizeHectares || 45} га): ағымдағы брутто қажеттілік ${recommendation?.totalGrossIrrigationMm || 22} мм (${recommendation?.totalVolumeM3?.toLocaleString() || '10,000'} м³). Тамыр қабатындағы ылғалдылықты далалық сыйымдылықтың 65–80% деңгейінде ұстаңыз.`;
      }
    } else if (currentLang === 'ru') {
      if (lower.includes('ветер') || lower.includes('жел') || lower.includes('wind')) {
        reply = `При скорости ветра выше 15–18 км/ч эффективность дождевания снижается на 30–40% из-за ветрового сноса и неравномерного распределения капель. Настоятельно рекомендуем поливать в утренние часы (05:00–08:30) или ночью, когда воздух спокоен.`;
      } else if (lower.includes('соль') || lower.includes('засол') || lower.includes('тұз') || lower.includes('salin')) {
        reply = `В условиях засоления почв (особенно бассейна Сырдарьи и Арала) недопустим недостаточный поверхностный полив. Рекомендуется промывной режим с фракцией выщелачивания (10-15%) и применение капельного полива.`;
      } else if (lower.includes('время') || lower.includes('уақыт') || lower.includes('когда') || lower.includes('when')) {
        reply = `Оптимальное окно полива для поля «${farm?.name || ''}» — с 05:30 до 09:00 или после 19:30. В это время дефицит давления пара (VPD) минимален, предотвращая потерю до 25% воды на испарение.`;
      } else if (lower.includes('удобр') || lower.includes('тыңайтқыш') || lower.includes('фертигац') || lower.includes('fert')) {
        reply = `Фертигацию следует начинать после предварительного увлажнения почвы чистой водой (первые 20-30% цикла) и завершать промывкой системы чистой водой в течение 30 минут.`;
      } else if (lower.includes('дождь') || lower.includes('жаңбыр') || lower.includes('rain')) {
        reply = `По прогнозу ожидается ${recommendation?.totalPrecipitationMm || 0} мм осадков. Если дождь превышает 8-10 мм, запланированный полив следует отложить на 24-48 часов для полной экономии ресурса.`;
      } else {
        reply = `На основе расчёта FAO-56 для поля «${farm?.name || 'Поле'}» (${farm?.fieldSizeHectares || 45} га): брутто-потребность составляет ${recommendation?.totalGrossIrrigationMm || 22} мм (${recommendation?.totalVolumeM3?.toLocaleString() || '10,000'} м³). Держите влажность в корневом горизонте на уровне 65–80% от ППВ.`;
      }
    } else {
      // en
      if (lower.includes('wind') || lower.includes('ветер') || lower.includes('жел')) {
        reply = `At wind speeds exceeding 15–18 km/h, overhead spray efficiency drops by 30–40% due to canopy drift and pattern distortion. We strongly advise scheduling applications during calm morning hours (05:00–08:30) or nighttime.`;
      } else if (lower.includes('salt') || lower.includes('salin') || lower.includes('засол') || lower.includes('тұз')) {
        reply = `Under salinity conditions in the Aral Basin, under-irrigation causes toxic capillary salt accumulation in the root zone. Maintain a calculated leaching fraction of 10–15% alongside localized drip fertigation.`;
      } else if (lower.includes('time') || lower.includes('when') || lower.includes('время') || lower.includes('уақыт')) {
        reply = `Optimal irrigation timing for "${farm?.name || 'your field'}" is 05:30–09:00 or after 19:30. Vapor pressure deficit (VPD) is minimized during these periods, preventing up to 25% direct evaporative loss.`;
      } else if (lower.includes('fert') || lower.includes('удобр') || lower.includes('тыңайтқыш')) {
        reply = `Initiate fertigation after wetting the root zone with fresh water (first 25% of the cycle), and always finish with a 30-minute clean water flush to prevent salt burns and emitter clogging.`;
      } else if (lower.includes('rain') || lower.includes('дождь') || lower.includes('жаңбыр')) {
        reply = `Forecast rainfall is ${recommendation?.totalPrecipitationMm || 0} mm. If rainfall exceeds 8-10 mm, suspend pumping for 24-48 hours to conserve energy and utilize soil profile infiltration.`;
      } else {
        reply = `Based on FAO-56 modeling for "${farm?.name || 'Field'}" (${farm?.fieldSizeHectares || 45} ha): current gross irrigation requirement is ${recommendation?.totalGrossIrrigationMm || 22} mm (${recommendation?.totalVolumeM3?.toLocaleString() || '10,000'} m³). Maintain root-zone moisture between 65–80% of Field Capacity.`;
      }
    }

    return NextResponse.json({ reply, source: 'agronomic_engine' });
  } catch (err: unknown) {
    console.error('Chat API handler error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
