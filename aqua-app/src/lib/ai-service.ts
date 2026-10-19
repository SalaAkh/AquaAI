import { FarmProfile, IrrigationRecommendation } from './types';

export type AdvisorExplanation = NonNullable<IrrigationRecommendation['aiExplanation']>;

/**
 * Client-compatible AI Advisor engine:
 * Uses a secure server API route for optional Google Gemini responses,
 * otherwise provides deterministic FAO-56 scientific agronomic guidance.
 */
export async function getAgronomicAdvisorExplanation(
  recommendation: IrrigationRecommendation,
  language: string = 'ru'
): Promise<AdvisorExplanation> {
  // 1. Try Next.js server route first (handles GEMINI_API_KEY from server env securely)
  try {
    const apiRes = await fetch('/api/ai/advisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recommendation, language }),
    });
    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data && data.summary) {
        return {
          summary: data.summary,
          farmerAdvice: data.farmerAdvice,
          conservationImpact: data.conservationImpact,
          modelConfidence: data.modelConfidence || 'high',
          source: data.source || 'gemini',
        };
      }
    }
  } catch {
    // Continue to direct client or fallback
  }

  // Never call Gemini directly from the browser: all credentials stay server-only.

  // High-quality deterministic agronomic explanation fallback
  const rainCoversDemand = recommendation.totalEffectiveRainfallMm >= recommendation.totalEtcMm;
  const isWaterDeficit = recommendation.totalGrossIrrigationMm > 0;
  const fName = recommendation.farmName || 'Field';
  const windowText = recommendation.recommendedWindowSummary || '05:30 – 08:30';

  if (language === 'kk') {
    let summary = '';
    if (rainCoversDemand) {
      summary = `«${fName}» үшін күтілетін табиғи тиімді жауын-шашын (${recommendation.totalEffectiveRainfallMm} мм) дақылдың су қажеттілігін толық жабады. Суаруды тоқтата тұруға болады.`;
    } else if (isWaterDeficit) {
      summary = `«${fName}» шаруашылығына алдағы ${recommendation.forecastDays} күнде шамамен ${recommendation.totalGrossIrrigationMm} мм (${recommendation.totalVolumeM3.toLocaleString()} м³) суару қажет.`;
    } else {
      summary = `«${fName}» алқабындағы ылғал тепе-теңдігі қалыпты. Топырақ ылғалын бақылауды жалғастырыңыз.`;
    }

    return {
      summary,
      farmerAdvice: `Булануды азайту үшін суаруды ұсынылған уақыт аралығында (${windowText}) жүргізіңіз.`,
      conservationImpact: `Бұл кестені сақтау дәстүрлі бастырумен салыстырғанда шамамен ${recommendation.potentialTotalSavingsM3.toLocaleString()} м³ (${recommendation.potentialSavingsPercentage}%) суды үнемдейді.`,
      modelConfidence: 'high',
      source: 'algorithmic_fallback',
    };
  }

  if (language === 'ru') {
    let summary = '';
    if (rainCoversDemand) {
      summary = `Для хозяйства «${fName}» ожидаемые эффективные осадки (${recommendation.totalEffectiveRainfallMm} мм) полностью покрывают потребность культуры в воде. Полив можно временно приостановить.`;
    } else if (isWaterDeficit) {
      summary = `Хозяйству «${fName}» требуется ориентировочно ${recommendation.totalGrossIrrigationMm} мм (${recommendation.totalVolumeM3.toLocaleString()} м³) полива на ближайшие ${recommendation.forecastDays} дней. Прогноз осадков (${recommendation.totalPrecipitationMm} мм) недостаточен для покрытия водного дефицита.`;
    } else {
      summary = `Водный баланс поля «${fName}» стабилен. Поддерживайте плановый мониторинг влажности почвы.`;
    }

    return {
      summary,
      farmerAdvice: `Распределите полив на утренние часы (${windowText}), чтобы исключить ветровой снос и пиковое испарение.`,
      conservationImpact: `Соблюдение данного графика экономит ориентировочно ${recommendation.potentialTotalSavingsM3.toLocaleString()} м³ (${recommendation.potentialSavingsPercentage}%) по сравнению с традиционным затоплением.`,
      modelConfidence: 'high',
      source: 'algorithmic_fallback',
    };
  }

  // English fallback
  let summary = '';
  if (rainCoversDemand) {
    summary = `Effective forecast rainfall (${recommendation.totalEffectiveRainfallMm} mm) satisfies crop evapotranspiration for "${fName}". Irrigation can be suspended.`;
  } else if (isWaterDeficit) {
    summary = `Field "${fName}" requires approximately ${recommendation.totalGrossIrrigationMm} mm (${recommendation.totalVolumeM3.toLocaleString()} m³) of irrigation across ${recommendation.forecastDays} days.`;
  } else {
    summary = `Moisture balance is in equilibrium for "${fName}". Continue monitoring.`;
  }

  return {
    summary,
    farmerAdvice: `Apply water during the recommended window (${windowText}) to minimize evaporative flash.`,
    conservationImpact: `Saves approximately ${recommendation.potentialTotalSavingsM3.toLocaleString()} m³ (${recommendation.potentialSavingsPercentage}%) vs. 50% flood irrigation baseline.`,
    modelConfidence: 'high',
    source: 'algorithmic_fallback',
  };
}

/**
 * Client-compatible AI Agronomic Chat:
 */
export async function getAgronomicChatReply(
  message: string,
  farm: FarmProfile | undefined,
  recommendation: IrrigationRecommendation | undefined,
  language: string = 'ru',
  history?: Array<{ role: string; text: string }>
): Promise<{ reply: string; source: 'gemini' | 'algorithmic_fallback' }> {
  // 1. Try server route first
  try {
    const apiRes = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, farm, recommendation, language, history }),
    });
    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data && data.reply) {
        return { reply: data.reply, source: data.source || 'gemini' };
      }
    }
  } catch {
    // Continue to direct client or fallback
  }

  // Server route unavailable: use clearly labelled algorithmic fallback.

  // Rule-based fallback
  const lower = message.toLowerCase();
  let reply = '';

  if (language === 'kk') {
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
  } else if (language === 'ru') {
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
    // English
    if (lower.includes('wind') || lower.includes('ветер') || lower.includes('жел')) {
      reply = `At wind speeds exceeding 15–18 km/h, overhead spray efficiency drops by 30–40% due to canopy drift. We strongly advise scheduling applications during calm morning hours (05:00–08:30) or nighttime.`;
    } else if (lower.includes('salt') || lower.includes('salin') || lower.includes('засол') || lower.includes('тұз')) {
      reply = `Under salinity conditions in the Aral Basin, under-irrigation causes toxic capillary salt accumulation. Maintain a calculated leaching fraction of 10–15% alongside localized drip fertigation.`;
    } else if (lower.includes('time') || lower.includes('when') || lower.includes('время') || lower.includes('уақыт')) {
      reply = `Optimal irrigation timing for "${farm?.name || 'your field'}" is 05:30–09:00 or after 19:30. Vapor pressure deficit (VPD) is minimized during these periods, preventing direct evaporative loss.`;
    } else if (lower.includes('fert') || lower.includes('удобр') || lower.includes('тыңайтқыш')) {
      reply = `Start fertigation after wetting the root zone with clean water (first 20-30% of the cycle), and flush system with clean water for 30 minutes at the end.`;
    } else if (lower.includes('rain') || lower.includes('дождь') || lower.includes('жаңбыр')) {
      reply = `Forecast shows ${recommendation?.totalPrecipitationMm || 0} mm of rain. If daily rainfall exceeds 8-10 mm, postpone scheduled irrigation by 24-48 hours.`;
    } else {
      reply = `Based on FAO-56 modeling for "${farm?.name || 'Field'}" (${farm?.fieldSizeHectares || 45} ha): gross irrigation requirement is ${recommendation?.totalGrossIrrigationMm || 22} mm (${recommendation?.totalVolumeM3?.toLocaleString() || '10,000'} m³). Maintain root-zone moisture between 65-80% of field capacity.`;
    }
  }

  return { reply, source: 'algorithmic_fallback' };
}
