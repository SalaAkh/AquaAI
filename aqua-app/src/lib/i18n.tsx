'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CropType, GrowthStage, IrrigationMethod, SoilType } from './types';

export type Language = 'ru' | 'kk' | 'en';

export interface Translations {
  // Brand & Header
  brandName: string;
  brandTagline: string;
  tabDashboard: string;
  tabAnalytics: string;
  tabSatellite: string;
  tabBlockchain: string;
  tabSubsidies: string;
  tabAbout: string;
  newFieldBtn: string;
  solanaConnected: string;
  connectWalletBtn: string;
  disconnectBtn: string;
  connecting: string;
  devnetBadge: string;

  // Farm Header
  demoFarmBadge: string;
  activeProdBadge: string;
  editParamsBtn: string;
  refreshWeatherBtn: string;
  recalculating: string;
  hectares: string;
  demoTurkistanName: string;
  demoAlmatyName: string;

  // Hero Section
  heroColosseumBadge: string;
  heroColosseumSub: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  exploreTurkistanBtn: string;
  launchDashboardBtn: string;
  badgeFao: string;
  badgeWeather: string;
  badgeGemini: string;
  badgeSolana: string;
  heroAdviceCallout: string;
  heroAdviceText: string;
  faoPillarDesc: string;
  weatherPillarDesc: string;
  geminiPillarDesc: string;
  solanaPillarDesc: string;
  vsFloodBaseline: string;

  // Weather Widget
  weatherTitle: string;
  weatherSubtitle: string;
  liveApiBadge: string;
  fallbackBadge: string;
  todayMaxTemp: string;
  minTemp: string;
  precipitation: string;
  referenceEt0: string;
  et0GrassBaseline: string;
  peakWindHum: string;
  humidity: string;
  today: string;

  // Irrigation Calculator
  faoDirective: string;
  calculatorTitle: string;
  primaryActionIrrigate: string;
  primaryActionDelay: string;
  primaryActionNoNeed: string;
  statusLabel: string;
  recommendedWindowLabel: string;
  windowMinimizesEvap: string;
  netEtc: string;
  effectiveRain: string;
  netDeficit: string;
  grossIrrigationDepth: string;
  totalVolume: string;
  pumpDuration: string;
  totalRainLabel: string;
  efficiency: string;
  scheduleTitle: string;
  exportCsvBtn: string;
  dayHeader: string;
  cropDemandHeader: string;
  rainHeader: string;
  volumeM3Header: string;
  recommendationHeader: string;
  actionHeader: string;
  timingHeader: string;
  assumptionsTitle: string;
  standard: string;
  volumeConversionNote: string;
  networkEfficiency: string;
  limitation1: string;
  limitation2: string;
  limitation3: string;

  // Satellite NDVI
  satelliteTitle: string;
  satelliteSubtitle: string;
  layerNdvi: string;
  layerNdwi: string;
  meanNdvi: string;
  denseCover: string;
  moderateCover: string;
  rangeLabel: string;
  ndwiWaterStress: string;
  normalHydration: string;
  moistureDeficit: string;
  turgorLabel: string;
  kcCorrectionFao: string;
  applyKcBtn: string;
  kcApplied: string;
  interactiveNdviGrid: string;
  ndviLegendLow: string;
  ndviLegendMid: string;
  ndviLegendHigh: string;
  selectedPixelTitle: string;
  clickPixelPrompt: string;
  pixelVigour: string;
  pixelHydration: string;
  pixelKcContrib: string;

  // Soil Moisture Telemetry (IoT)
  soilTelemetryTitle: string;
  soilTelemetrySubtitle: string;
  loraTelemetryBadge: string;
  minsAgo: string;
  depth20Label: string;
  depth40Label: string;
  depth60Label: string;
  statusOptimal: string;
  statusModerateDeficit: string;
  statusCriticalDry: string;
  statusSaturated: string;
  currentMoisture: string;
  fieldCapacityShort: string;
  madThresholdShort: string;
  wiltingPointShort: string;
  madSafetyZone: string;

  // AI Advisor
  advisorTitle: string;
  advisorSubtitle: string;
  refreshAiBtn: string;
  operationalAdviceTitle: string;
  impactTitle: string;
  confidenceHigh: string;
  chatTabLabel: string;
  welcomeMsg: string;
  defaultSummary: string;
  defaultAdvice: string;
  defaultImpact: string;
  chatInputPlaceholder: string;
  sendBtn: string;
  quickPrompt1: string;
  quickPrompt2: string;
  quickPrompt3: string;
  quickPrompt4: string;
  chatFallbackReply: string;
  nowTime: string;

  // Water Analytics
  analyticsTitle: string;
  analyticsSubtitle: string;
  metricVolume: string;
  metricDepth: string;
  baselineConsumption: string;
  baselineBenchmark: string;
  aquaAiPrescribed: string;
  projectedWaterSavings: string;
  conservedVsFlood: string;
  chartTitleVolume: string;
  chartTitleDepth: string;
  legendBaseline: string;
  legendAquaAi: string;
  legendCropEtc: string;
  legendRain: string;
  legendGross: string;
  dailyTableTitle: string;

  // Solana Cryptographic Audit
  solanaTitle: string;
  solanaSubtitle: string;
  memoProgramBadge: string;
  offchainTitle: string;
  offchainDesc: string;
  fingerprintLabel: string;
  copyHashBtn: string;
  copied: string;
  canonicalPayloadLabel: string;
  commitStepTitle: string;
  commitStepDesc: string;
  recordOnChainBtn: string;
  recordingInProgress: string;
  verifiedStatus: string;
  viewExplorerBtn: string;
  verifyRpcStepTitle: string;
  verifyRpcStepDesc: string;
  txSignaturePlaceholder: string;
  verifyNowBtn: string;
  verifying: string;
  hashVerifiedValid: string;
  hashVerificationFailed: string;

  // Subsidies & Certificate
  subsidiesTitle: string;
  subsidiesSubtitle: string;
  exportCertBtn: string;
  hideCertBtn: string;
  calcSavingsKzt: string;
  kztSubsidyAmount: string;
  sevenDaysAudit: string;
  seasonalPotential: string;
  seasonProjectedM3: string;
  waterCreditsEarned: string;
  creditsUnitDesc: string;
  certTitle: string;
  certPrintBtn: string;
  certMinistry: string;
  certCertifies: string;
  certAuditPeriod: string;
  certWaterSaved: string;
  certConsumptionDrop: string;
  certEcoSubsidy: string;
  certDirectiveHash: string;
  certStatus: string;
  certEngine: string;

  // Central Asia Ecological Crisis
  crisisBadge: string;
  crisisTitle: string;
  crisisSubtitle: string;
  aralDepletionTitle: string;
  aralDepletionDesc: string;
  aralImpact: string;
  glacierRetreatTitle: string;
  glacierRetreatDesc: string;
  glacierImpact: string;
  floodLossTitle: string;
  floodLossDesc: string;
  floodSolution: string;
  interventionBadge: string;
  interventionTitle: string;
  interventionDesc: string;
  statWaterSavings: string;
  statFaoAdherence: string;
  statSensorBarrier: string;
  statSolanaAudit: string;

  // Farm Modal
  modalTitleNew: string;
  modalTitleEdit: string;
  modalSubtitle: string;
  farmNameLabel: string;
  farmNamePlaceholder: string;
  locationPresetLabel: string;
  coordinates: string;
  fieldSizeLabel: string;
  depthM3Ratio: string;
  cropTypeLabel: string;
  growthStageLabel: string;
  irrigationMethodLabel: string;
  soilTypeLabel: string;
  waterCapacityLabel: string;
  cancelBtn: string;
  saveFarmBtn: string;

  // Crops
  cropCotton: string;
  cropWheat: string;
  cropRice: string;
  cropCorn: string;
  cropVegetables: string;

  // Growth Stages
  stageInitialTitle: string;
  stageInitialDesc: string;
  stageDevelopmentTitle: string;
  stageDevelopmentDesc: string;
  stageMidSeasonTitle: string;
  stageMidSeasonDesc: string;
  stageLateSeasonTitle: string;
  stageLateSeasonDesc: string;

  // Irrigation Methods
  methodDripTitle: string;
  methodDripDesc: string;
  methodSprinklerTitle: string;
  methodSprinklerDesc: string;
  methodFloodTitle: string;
  methodFloodDesc: string;
  methodDrip: string;
  savedWaterMetric: string;

  // Soils
  soilSandyLoamTitle: string;
  soilSandyLoamDesc: string;
  soilLoamTitle: string;
  soilLoamDesc: string;
  soilClayLoamTitle: string;
  soilClayLoamDesc: string;
  soilSiltClayTitle: string;
  soilSiltClayDesc: string;

  // Footer
  footerSystems: string;
  footerResilience: string;
  footerCopyright: string;
}

const translations: Record<Language, Translations> = {
  ru: {
    // Brand & Header
    brandName: 'AquaAI',
    brandTagline: 'Интеллектуальный полив для Центральной Азии',
    tabDashboard: 'Рабочая панель',
    tabAnalytics: 'Аналитика расхода',
    tabSatellite: 'Спутник NDVI',
    tabBlockchain: 'Solana-аудит',
    tabSubsidies: 'Субсидии и сертификат',
    tabAbout: 'Кризис Арала',
    newFieldBtn: '+ Новое поле',
    solanaConnected: 'Solana Devnet ● Активен',
    connectWalletBtn: 'Подключить кошелёк',
    disconnectBtn: 'Отключить',
    connecting: 'Подключение...',
    devnetBadge: 'DEVNET',

    // Farm Header
    demoFarmBadge: 'Демо-хозяйство',
    activeProdBadge: 'Действующее поле',
    editParamsBtn: 'Параметры поля',
    refreshWeatherBtn: 'Обновить метеоданные',
    recalculating: 'Пересчёт...',
    hectares: 'гектаров',
    demoTurkistanName: 'Туркестанский агрокооператив (Демо)',
    demoAlmatyName: 'Жетысу, Яровая пшеница №7 (Демо)',

    // Hero Section
    heroColosseumBadge: "Colosseum Crypto World's Fair 2026",
    heroColosseumSub: 'Климатический MVP для Центральной Азии',
    heroTitle: 'Точный полив. Каждая капля на счету.',
    heroHighlight: 'Агрономический ИИ и гидрология FAO-56',
    heroSubtitle: 'Защита водных ресурсов Казахстана и бассейна Аральского моря. Научно обоснованные нормы орошения Penman-Monteith, метеомодели Open-Meteo и ончейн-аудит Solana, предотвращающие до 45% потерь воды.',
    exploreTurkistanBtn: 'Демо: Туркестан (Хлопок)',
    launchDashboardBtn: 'Открыть расчёт полива',
    badgeFao: 'FAO-56 Пенман-Монтейт',
    badgeWeather: 'Open-Meteo онлайн',
    badgeGemini: 'ИИ-агроном Gemini',
    badgeSolana: 'Ончейн-аудит Solana',
    heroAdviceCallout: 'Указание поливальщику',
    heroAdviceText: 'Оптимальное окно полива — утренние часы (05:30 – 08:30) до наступления дневного суховея.',
    faoPillarDesc: 'Пенман-Монтейт и коэффициенты Kc культур для хлопка, пшеницы, риса и овощей.',
    weatherPillarDesc: '7-дневный численный метеопрогноз Open-Meteo: осадки, радиация, испарение ET0.',
    geminiPillarDesc: 'ИИ переводит сложные гидрологические формулы в ясные практические указания поливальщикам.',
    solanaPillarDesc: 'Криптографическая фиксация директив в блокчейне Solana Devnet через транзакции Memo.',
    vsFloodBaseline: 'к базовому затоплению',

    // Weather Widget
    weatherTitle: 'Численный прогноз погоды и ET₀',
    weatherSubtitle: '7-дневный прогноз высокого атмосферного разрешения',
    liveApiBadge: '● Open-Meteo онлайн API',
    fallbackBadge: '● Климатическая норма',
    todayMaxTemp: 'Макс. температура сегодня',
    minTemp: 'Мин:',
    precipitation: 'Осадки',
    referenceEt0: 'Эталонное ET₀',
    et0GrassBaseline: 'Базовый газон FAO-56',
    peakWindHum: 'Ветер и влажность',
    humidity: 'Влажность:',
    today: 'Сегодня',

    // Irrigation Calculator
    faoDirective: 'Гидрологическая директива FAO-56',
    calculatorTitle: 'Научный расчёт норм полива (FAO-56)',
    primaryActionIrrigate: 'НЕОБХОДИМ ПОЛИВ',
    primaryActionDelay: 'ОТЛОЖИТЬ ПОЛИВ (ОЖИДАЮТСЯ ОСАДКИ)',
    primaryActionNoNeed: 'ПОЛИВ НЕ ТРЕБУЕТСЯ',
    statusLabel: 'Статус:',
    recommendedWindowLabel: 'Рекомендуемое окно полива:',
    windowMinimizesEvap: 'Минимизирует дневное испарение и ветровой снос',
    netEtc: 'Потребность культуры (ETc)',
    effectiveRain: 'Эффективные осадки',
    netDeficit: 'Чистый дефицит (Inet)',
    grossIrrigationDepth: 'Брутто-норма полива',
    totalVolume: 'Общий объём воды',
    pumpDuration: 'Время работы насоса',
    totalRainLabel: 'Всего осадков:',
    efficiency: 'КПД',
    scheduleTitle: '7-дневный подекадный график полива',
    exportCsvBtn: 'Экспорт наряда (.CSV)',
    dayHeader: 'День',
    cropDemandHeader: 'Потребность (ETc)',
    rainHeader: 'Осадки',
    volumeM3Header: 'Объём (м³)',
    recommendationHeader: 'Рекомендация по поливу',
    actionHeader: 'Действие',
    timingHeader: 'Время и обоснование',
    assumptionsTitle: 'Гидрологические допущения и границы применимости модели',
    standard: 'Стандарт:',
    volumeConversionNote: 'Объёмный пересчёт: 1 мм на 1 га = 10 м³.',
    networkEfficiency: 'КПД поливной сети:',
    limitation1: 'Предполагается равномерная инфильтрация почвы и исправность водовыпусков/капельниц.',
    limitation2: 'Не учитывается капиллярный подпор грунтовых вод и промывка от засоления.',
    limitation3: 'Точность метеопрогноза снижается за горизонтом 72 часов.',

    // Satellite NDVI
    satelliteTitle: 'Спутниковый мониторинг NDVI и водного стресса',
    satelliteSubtitle: 'Спектральный анализ вегетационных индексов по 10-метровым каналам B04 (Red) и B08 (NIR) Sentinel-2 для динамической калибровки коэффициента Kc.',
    layerNdvi: 'Слой NDVI (Биомасса)',
    layerNdwi: 'Слой NDWI (Влага)',
    meanNdvi: 'Средний индекс NDVI',
    denseCover: 'Густой покров',
    moderateCover: 'Умеренный рост',
    rangeLabel: 'Диапазон:',
    ndwiWaterStress: 'Водный стресс (NDWI)',
    normalHydration: 'В норме',
    moistureDeficit: 'Дефицит влаги',
    turgorLabel: 'Тургор листового аппарата',
    kcCorrectionFao: 'Коррекция Kc (FAO-56)',
    applyKcBtn: 'Применить спутниковый Kc',
    kcApplied: 'Kc успешно обновлён!',
    interactiveNdviGrid: 'Интерактивная карта поля Sentinel-2 (разрешение 10м):',
    ndviLegendLow: 'Разреженный (<0.4)',
    ndviLegendMid: 'Средний (0.5–0.7)',
    ndviLegendHigh: 'Плотный (>0.75)',
    selectedPixelTitle: 'Данные выбранного сектора поля:',
    clickPixelPrompt: 'Нажмите на любой сектор сетки для детального анализа спектра.',
    pixelVigour: 'Развитие биомассы',
    pixelHydration: 'Уровень влагообеспеченности',
    pixelKcContrib: 'Локальный вклад в Kc',

    // Soil Moisture Telemetry
    soilTelemetryTitle: 'Влажность почвы в корнеобитаемом профиле',
    soilTelemetrySubtitle: 'Данные ёмкостных датчиков VWC (%) на глубинах 20, 40 и 60 см для контроля порога допустимого истощения (MAD).',
    loraTelemetryBadge: 'LoRaWAN IoT-телеметрия зондов',
    minsAgo: '3 мин назад',
    depth20Label: 'Поверхностный слой (испарение)',
    depth40Label: 'Основной корневой горизонт (активное водопотребление)',
    depth60Label: 'Глубинный буферный горизонт (капиллярный подпор)',
    statusOptimal: 'Оптимально',
    statusModerateDeficit: 'Умеренный дефицит',
    statusCriticalDry: 'Критический дефицит',
    statusSaturated: 'Переувлажнение',
    currentMoisture: 'Текущая влажность',
    fieldCapacityShort: 'ППВ (Влагоёмкость)',
    madThresholdShort: 'Порог истощения MAD',
    wiltingPointShort: 'Точка увядания',
    madSafetyZone: 'Безопасная зона MAD',

    // AI Advisor
    advisorTitle: 'ИИ-агроном AquaAI (Google Gemini)',
    advisorSubtitle: 'Оперативные полевые рекомендации на основе физической гидрологии',
    refreshAiBtn: 'Обновить консультацию ИИ',
    operationalAdviceTitle: 'Практические указания поливальщику',
    impactTitle: 'Экологический эффект и экономия',
    confidenceHigh: 'Высокая достоверность модели',
    chatTabLabel: 'Диалог с ИИ-агрономом',
    welcomeMsg: 'Здравствуйте! Я агроном-гидролог AquaAI. Готов ответить на любые вопросы по поливу, защите от испарения или минерализации воды.',
    defaultSummary: 'Хозяйству требуется плановый полив на ближайшие 7 дней. Прогноз осадков недостаточен для покрытия водного дефицита культуры.',
    defaultAdvice: 'Распределите полив на ранние утренние часы (05:30 – 08:30), чтобы минимизировать ветровой снос и пиковое испарение.',
    defaultImpact: 'Соблюдение данного графика экономит воду по сравнению с традиционным затоплением.',
    chatInputPlaceholder: 'Задайте вопрос агроному (напр., влияние ветра, засоление, фертигация)...',
    sendBtn: 'Отправить',
    quickPrompt1: '💨 Полив при сильном ветре',
    quickPrompt2: '🧂 Что делать при засолении почвы?',
    quickPrompt3: '⏰ В какие часы лучше включать насос?',
    quickPrompt4: '🧪 Как проводить фертигацию?',
    chatFallbackReply: 'Рекомендуется придерживаться текущей нормы полива FAO-56. Для минимизации потерь включайте полив в утреннее время до 09:00.',
    nowTime: 'Сейчас',

    // Water Analytics
    analyticsTitle: 'Сравнительная аналитика водопотребления',
    analyticsSubtitle: 'Нормативный полив AquaAI против традиционного арычного затопления (потери до 50%)',
    metricVolume: 'Объём (м³)',
    metricDepth: 'Слой (мм)',
    baselineConsumption: 'Базовое потребление',
    baselineBenchmark: 'Арычный полив с потерями 50%',
    aquaAiPrescribed: 'Норма полива AquaAI',
    projectedWaterSavings: 'Сэкономлено воды',
    conservedVsFlood: 'сбережено vs затопление',
    chartTitleVolume: 'Суточный объём воды: Расход AquaAI vs Базовый уровень (м³)',
    chartTitleDepth: 'Суточный водный баланс: ETc vs Осадки vs Полив (мм)',
    legendBaseline: 'Базовое затопление',
    legendAquaAi: 'План AquaAI',
    legendCropEtc: 'Потребность ETc',
    legendRain: 'Осадки',
    legendGross: 'Брутто-норма',
    dailyTableTitle: 'Подекадное сравнение экономии',

    // Solana Cryptographic Audit
    solanaTitle: 'Криптографический аудит Solana',
    solanaSubtitle: 'Неизменяемая фиксация директив водосбережения в блокчейне Solana Devnet',
    memoProgramBadge: 'Программа Solana Memo',
    offchainTitle: 'Конфиденциальность данных вне блокчейна',
    offchainDesc: 'Персональные данные хозяйства и точные GPS-координаты остаются строго конфиденциальными. В публичный блокчейн Solana записывается только криптографический отпечаток (SHA-256) расчёта.',
    fingerprintLabel: 'Криптографический отпечаток (SHA-256):',
    copyHashBtn: 'Копировать хеш',
    copied: 'Скопировано',
    canonicalPayloadLabel: 'Параметры директивы:',
    commitStepTitle: '1. Запись доказательства в Solana Devnet',
    commitStepDesc: 'Подписывает и отправляет транзакцию в программу Memo блокчейна Solana.',
    recordOnChainBtn: 'Записать доказательство в Solana',
    recordingInProgress: 'Запись транзакции в Solana...',
    verifiedStatus: 'Подтверждено в блокчейне',
    viewExplorerBtn: 'Смотреть в Solana Explorer',
    verifyRpcStepTitle: '2. Независимая проверка хеша в RPC',
    verifyRpcStepDesc: 'Введите сигнатуру транзакции для проверки целостности на узле Devnet.',
    txSignaturePlaceholder: 'Вставьте сигнатуру транзакции Solana...',
    verifyNowBtn: 'Проверить хеш в RPC',
    verifying: 'Проверка в блокчейне...',
    hashVerifiedValid: 'Хеш совпадает! Директива подлинна и неизменна.',
    hashVerificationFailed: 'Проверка не пройдена или транзакция не найдена.',

    // Subsidies & Certificate
    subsidiesTitle: 'Государственные субсидии и Водные кредиты',
    subsidiesSubtitle: 'Монетизация подтверждённой экономии воды по тарифным программам РК',
    exportCertBtn: 'Официальный сертификат аудита',
    hideCertBtn: 'Скрыть сертификат',
    calcSavingsKzt: 'Оценка государственной эко-субсидии:',
    kztSubsidyAmount: 'тенге экономии',
    sevenDaysAudit: 'За 7 дней аудита',
    seasonalPotential: 'Сезонный потенциал (100 дней):',
    seasonProjectedM3: 'Прогнозная сезонная экономия',
    waterCreditsEarned: 'Начислено водных эко-кредитов (Water Credits)',
    creditsUnitDesc: 'AquaAI Water Credits (1 кредит = 100 м³ подтверждённой экономии)',
    certTitle: 'СЕРТИФИКАТ ПОДТВЕРЖДЁННОГО ВОДОСБЕРЕЖЕНИЯ',
    certPrintBtn: 'Печать / Экспорт в PDF',
    certMinistry: 'Республика Казахстан • Бассейновая инспекция по регулированию использования и охране водных ресурсов',
    certCertifies: 'Настоящим удостоверяется, что агрохозяйство:',
    certAuditPeriod: 'Период аудита:',
    certWaterSaved: 'Сэкономлено воды:',
    certConsumptionDrop: 'Снижение расхода:',
    certEcoSubsidy: 'Эко-субсидия:',
    certDirectiveHash: 'Криптографический хеш директивы:',
    certStatus: 'Статус: ВЕРИФИЦИРОВАНО ●',
    certEngine: 'Валидатор гидрологического аудита AquaAI (FAO-56)',

    // Central Asia Ecological Crisis
    crisisBadge: 'Региональный климатический и водный кризис',
    crisisTitle: 'Проблема дефицита воды в Центральной Азии',
    crisisSubtitle: 'Центральная Азия находится в эпицентре одного из самых острых экологических вызовов планеты. Орошаемое земледелие забирает свыше 80% пресной воды бассейна Аральского моря, при этом более половины теряется из-за арычного затопления и грунтовых каналов.',
    aralDepletionTitle: 'Высыхание Аральского моря',
    aralDepletionDesc: 'Забор вод рек Сырдарья и Амударья под монокультуры сократил площадь Арала более чем на 90%, образовав пустыню Аралкум с миллионами тонн токсичной соляной пыли.',
    aralImpact: 'Последствия: соляные бури и резкое засоление почв юга Казахстана.',
    glacierRetreatTitle: 'Таяние ледников Тянь-Шаня',
    glacierRetreatDesc: 'Ледники, питающие реки региона, сокращаются беспрецедентными темпами из-за потепления. Пик стока сдвигается на раннюю весну, вызывая летнюю засуху.',
    glacierImpact: 'Прогноз: падение летнего стока рек до 25% к 2040 году.',
    floodLossTitle: 'Потери до 50% при затоплении',
    floodLossDesc: 'Традиционный полив по бороздам подаёт воду по жесткому календарю без учета реальной транспирации. Это вымывает питательные вещества и заболачивает почву.',
    floodSolution: 'Решение: точный расчет по FAO-56 сокращает потери на 30–45%.',
    interventionBadge: 'Вклад платформы AquaAI',
    interventionTitle: 'Замена догадок строгой гидрологией и открытым ончейн-аудитом',
    interventionDesc: 'Синхронизируя численные метеопрогнозы с формулами Пенмана-Монтейта, AquaAI вычисляет точную суточную потребность растений. Фермеры не поливают перед дождями и минимизируют испарение.',
    statWaterSavings: 'Потенциал сбережения воды',
    statFaoAdherence: 'Соответствие стандарту FAO-56',
    statSensorBarrier: 'Порог входа без покупки датчиков',
    statSolanaAudit: 'Верифицируемый ончейн-аудит',

    // Farm Modal
    modalTitleNew: 'Добавление нового поля',
    modalTitleEdit: 'Редактирование параметров поля',
    modalSubtitle: 'Настройка региональных агроклиматических параметров',
    farmNameLabel: 'Название хозяйства / поля',
    farmNamePlaceholder: 'Например, Кооператив Сырдарья, сектор 4',
    locationPresetLabel: 'Агроэкологическая зона',
    coordinates: 'Координаты:',
    fieldSizeLabel: 'Площадь поля (га)',
    depthM3Ratio: '1 мм поливной нормы = 10 м³ воды на гектар',
    cropTypeLabel: 'Сельскохозяйственная культура',
    growthStageLabel: 'Текущая фаза вегетации',
    irrigationMethodLabel: 'Способ орошения',
    soilTypeLabel: 'Тип почвы',
    waterCapacityLabel: 'Доступная влагоёмкость почвы:',
    cancelBtn: 'Отмена',
    saveFarmBtn: 'Сохранить поле',

    // Crops
    cropCotton: 'Хлопчатник (Бассейн Арала)',
    cropWheat: 'Пшеница (Зерновой клин)',
    cropRice: 'Рис (Бассейн Кызылорды)',
    cropCorn: 'Кукуруза (Кормовая и зерновая)',
    cropVegetables: 'Овощные культуры',

    // Growth Stages
    stageInitialTitle: 'Начальная фаза (Всходы)',
    stageInitialDesc: 'Проективное покрытие < 10%. Преобладает прямое испарение с почвы.',
    stageDevelopmentTitle: 'Вегетативный рост',
    stageDevelopmentDesc: 'Покрытие увеличивается с 10% до 75%. Быстрый рост транспирации.',
    stageMidSeasonTitle: 'Цветение и формирование урожая',
    stageMidSeasonDesc: 'Полный сомкнутый покров. Пиковая потребность культуры в воде.',
    stageLateSeasonTitle: 'Созревание',
    stageLateSeasonDesc: 'Пожелтение листьев. Водопотребность снижается до уборки.',

    // Irrigation Methods
    methodDripTitle: 'Капельное орошение (КПД 90%)',
    methodDripDesc: 'Локальная подача под корень. Нулевой сток и минимальное испарение.',
    methodSprinklerTitle: 'Дождевание / Спринклеры (КПД 75%)',
    methodSprinklerDesc: 'Круговые и фронтальные машины. Потери от ветра и испарения капель.',
    methodFloodTitle: 'Арычный / Бороздовой полив (КПД 55%)',
    methodFloodDesc: 'Гравитационный напуск по бороздам. Высокие потери на глубинную фильтрацию.',
    methodDrip: 'Капельное орошение (КПД 90%)',
    savedWaterMetric: 'Сэкономлено воды за 7 дней',

    // Soils
    soilSandyLoamTitle: 'Супесчаная (Лёгкая)',
    soilSandyLoamDesc: 'Быстрая фильтрация, низкая влагоудерживающая способность.',
    soilLoamTitle: 'Суглинистая (Сбалансированная)',
    soilLoamDesc: 'Оптимальное соотношение влаги и воздуха для корней.',
    soilClayLoamTitle: 'Тяжелосуглинистая',
    soilClayLoamDesc: 'Высокая влагоёмкость, медленное впитывание.',
    soilSiltClayTitle: 'Илисто-глинистая (Аральский аллювий)',
    soilSiltClayDesc: 'Плотная почва дельт Сырдарьи с риском коркообразования.',

    // Footer
    footerSystems: 'AquaAI Systems',
    footerResilience: 'Климатическая устойчивость Центральной Азии',
    footerCopyright: '© 2026 AquaAI. Защита водных ресурсов Казахстана и бассейна Аральского моря.',
  },

  kk: {
    // Brand & Header
    brandName: 'AquaAI',
    brandTagline: 'Орталық Азияға арналған ақылды суару жүйесі',
    tabDashboard: 'Басқару тақтасы',
    tabAnalytics: 'Су шығыны талдауы',
    tabSatellite: 'Жерсерік NDVI',
    tabBlockchain: 'Solana аудиті',
    tabSubsidies: 'Субсидиялар мен сертификат',
    tabAbout: 'Арал дағдарысы',
    newFieldBtn: '+ Жаңа алқап',
    solanaConnected: 'Solana Devnet ● Белсенді',
    connectWalletBtn: 'Әмиянды қосу',
    disconnectBtn: 'Ажырату',
    connecting: 'Қосылуда...',
    devnetBadge: 'DEVNET',

    // Farm Header
    demoFarmBadge: 'Демо-шаруашылық',
    activeProdBadge: 'Өндірістік алқап',
    editParamsBtn: 'Алқап параметрлері',
    refreshWeatherBtn: 'Ауа райын жаңарту',
    recalculating: 'Қайта есептеу...',
    hectares: 'гектар',
    demoTurkistanName: 'Түркістан агрокооперативі (Демо)',
    demoAlmatyName: 'Жетісу, Жаздық бидай №7 (Демо)',

    // Hero Section
    heroColosseumBadge: "Colosseum Crypto World's Fair 2026",
    heroColosseumSub: 'Орталық Азияға арналған климаттық MVP',
    heroTitle: 'Дәл суару. Әр тамшы есепте.',
    heroHighlight: 'Агрономиялық ЖИ және FAO-56 гидрологиясы',
    heroSubtitle: 'Қазақстан мен Арал теңізі алабының су ресурстарын сақтау. Penman-Monteith нормалары, Open-Meteo ауа райы деректері және Solana ончейн-аудиті су ысырабын 45%-ға дейін қысқартады.',
    exploreTurkistanBtn: 'Демо: Түркістан (Мақта)',
    launchDashboardBtn: 'Суару есебін ашу',
    badgeFao: 'FAO-56 Пенман-Монтейт',
    badgeWeather: 'Open-Meteo онлайн',
    badgeGemini: 'Gemini ЖИ-агрономы',
    badgeSolana: 'Solana ончейн-аудиті',
    heroAdviceCallout: 'Суарушыға нұсқау',
    heroAdviceText: 'Суарудың ең тиімді уақыты — күндізгі ыстық басталғанға дейінгі таңғы сағаттар (05:30 – 08:30).',
    faoPillarDesc: 'Мақта, бидай, күріш және көкөністерге арналған Пенман-Монтейт және Kc коэффициенттері.',
    weatherPillarDesc: 'Open-Meteo 7 күндік сандық болжамы: жауын-шашын, радиация және ET0 булануы.',
    geminiPillarDesc: 'Жасанды интеллект күрделі формулаларды шаруаға түсінікті практикалық нұсқауларға айналдырады.',
    solanaPillarDesc: 'Су үнемдеу деректерін Solana Devnet блокчейнінде Memo арқылы өзгеріссіз бекіту.',
    vsFloodBaseline: 'дәстүрлі бастырумен салыстырғанда',

    // Weather Widget
    weatherTitle: 'Сандық ауа райы және ET₀ болжамы',
    weatherSubtitle: '7 күндік жоғары дәлдіктегі атмосфералық болжам',
    liveApiBadge: '● Open-Meteo тікелей API',
    fallbackBadge: '● Климаттық норма',
    todayMaxTemp: 'Бүгінгі ең жоғары температура',
    minTemp: 'Мин:',
    precipitation: 'Жауын-шашын',
    referenceEt0: 'Эталондық ET₀',
    et0GrassBaseline: 'FAO-56 базалық көгал',
    peakWindHum: 'Жел және ылғалдылық',
    humidity: 'Ылғалдылық:',
    today: 'Бүгін',

    // Irrigation Calculator
    faoDirective: 'FAO-56 гидрологиялық директивасы',
    calculatorTitle: 'Суару нормаларын ғылыми есептеу (FAO-56)',
    primaryActionIrrigate: 'СУАРУ ҚАЖЕТ',
    primaryActionDelay: 'СУАРУДЫ КЕЙІНГЕ ҚАЛДЫРУ (ЖАУЫН КҮТІЛУДЕ)',
    primaryActionNoNeed: 'СУАРУ ҚАЖЕТ ЕМЕС',
    statusLabel: 'Мәртебесі:',
    recommendedWindowLabel: 'Ұсынылатын суару уақыты:',
    windowMinimizesEvap: 'Күндізгі булану мен жел ығысуын азайтады',
    netEtc: 'Өсімдік сұранысы (ETc)',
    effectiveRain: 'Тиімді жауын-шашын',
    netDeficit: 'Таза тапшылық (Inet)',
    grossIrrigationDepth: 'Брутто суару мөлшері',
    totalVolume: 'Жалпы су көлемі',
    pumpDuration: 'Сорғының жұмыс уақыты',
    totalRainLabel: 'Барлық жауын-шашын:',
    efficiency: 'ПӘК',
    scheduleTitle: '7 күндік суару кестесі',
    exportCsvBtn: 'Кестені экспорттау (.CSV)',
    dayHeader: 'Күн',
    cropDemandHeader: 'Сұраныс (ETc)',
    rainHeader: 'Жауын-шашын',
    volumeM3Header: 'Көлемі (м³)',
    recommendationHeader: 'Суару бойынша кеңес',
    actionHeader: 'Әрекет',
    timingHeader: 'Уақыты және негіздемесі',
    assumptionsTitle: 'Гидрологиялық болжамдар және үлгі шектеулері',
    standard: 'Стандарт:',
    volumeConversionNote: 'Көлемдік есеп: 1 га жерге 1 мм су мөлшері = 10 м³.',
    networkEfficiency: 'Суару жүйесінің ПӘК:',
    limitation1: 'Топырақтың біркелкі сіңіргіштігі мен тамшылатқыштардың дұрыстығы ескеріледі.',
    limitation2: 'Жер асты суларының капиллярлық көтерілуі мен тұз шаю нормасы қамтылмаған.',
    limitation3: 'Ауа райы болжамының дәлдігі 72 сағаттан кейін төмендеуі мүмкін.',

    // Satellite NDVI
    satelliteTitle: 'Жерсеріктік NDVI және су стрессі мониторингі',
    satelliteSubtitle: 'Kc коэффициентін дәл калибрлеу үшін Sentinel-2 спутнигінің 10 метрлік B04 (Red) және B08 (NIR) арналары арқылы спектрлік талдау.',
    layerNdvi: 'NDVI қабаты (Биомасса)',
    layerNdwi: 'NDWI қабаты (Ылғал)',
    meanNdvi: 'Орташа NDVI индексі',
    denseCover: 'Қалың өсімдік',
    moderateCover: 'Орташа өсу',
    rangeLabel: 'Ауқымы:',
    ndwiWaterStress: 'Су стрессі (NDWI)',
    normalHydration: 'Қалыпты',
    moistureDeficit: 'Ылғал тапшылығы',
    turgorLabel: 'Жапырақ тургоры',
    kcCorrectionFao: 'Kc түзетуі (FAO-56)',
    applyKcBtn: 'Спутниктік Kc қолдану',
    kcApplied: 'Kc сәтті жаңартылды!',
    interactiveNdviGrid: 'Sentinel-2 алқап картасы (10м ажыратымдылық):',
    ndviLegendLow: 'Сирек (<0.4)',
    ndviLegendMid: 'Орташа (0.5–0.7)',
    ndviLegendHigh: 'Тығыз (>0.75)',
    selectedPixelTitle: 'Таңдалған сектор деректері:',
    clickPixelPrompt: 'Спектрді толық көру үшін картадағы кез келген секторды басыңыз.',
    pixelVigour: 'Биомасса дамуы',
    pixelHydration: 'Ылғалмен қамтамасыз ету',
    pixelKcContrib: 'Kc үлесі',

    // Soil Moisture Telemetry
    soilTelemetryTitle: 'Тамыр қабатындағы топырақ ылғалдылығы',
    soilTelemetrySubtitle: 'Рұқсат етілген ылғал таусылу шегін (MAD) бақылау үшін 20, 40 және 60 см тереңдіктегі VWC (%) сыйымдылық датчиктерінің деректері.',
    loraTelemetryBadge: 'LoRaWAN IoT телеметриясы',
    minsAgo: '3 мин бұрын',
    depth20Label: 'Беткі қабат (булану)',
    depth40Label: 'Негізгі тамыр горизонты (белсенді су тұтыну)',
    depth60Label: 'Терең буферлік қабат (капиллярлық тірек)',
    statusOptimal: 'Оңтайлы',
    statusModerateDeficit: 'Орташа тапшылық',
    statusCriticalDry: 'Қауіпті құрғақшылық',
    statusSaturated: 'Шамадан тыс ылғалды',
    currentMoisture: 'Ағымдағы ылғалдылық',
    fieldCapacityShort: 'ДВП (Далалық сыйымдылық)',
    madThresholdShort: 'MAD шегі',
    wiltingPointShort: 'Солу нүктесі',
    madSafetyZone: 'Қауіпсіз MAD аймағы',

    // AI Advisor
    advisorTitle: 'AquaAI ЖИ-агрономы (Google Gemini)',
    advisorSubtitle: 'Физикалық гидрологияға негізделген жедел далалық нұсқаулар',
    refreshAiBtn: 'ЖИ кеңесін жаңарту',
    operationalAdviceTitle: 'Суарушыға практикалық нұсқаулар',
    impactTitle: 'Экологиялық нәтиже және үнемдеу',
    confidenceHigh: 'Үлгінің жоғары сенімділігі',
    chatTabLabel: 'ЖИ-агрономмен сұхбат',
    welcomeMsg: 'Сәлеметсіз бе! Мен AquaAI гидролог-агрономымын. Суару, булануды азайту және су минерализациясы бойынша кез келген сұраққа жауап беруге дайынмын.',
    defaultSummary: 'Алқапқа алдағы 7 күнде жоспарлы суару қажет. Жауын-шашын болжамы өсімдік сұранысын жабуға жеткіліксіз.',
    defaultAdvice: 'Жел ығысуы мен булануды болдырмау үшін суаруды таңғы уақытқа (05:30 – 08:30) жоспарлаңыз.',
    defaultImpact: 'Бұл кестені сақтау дәстүрлі арықпен суарумен салыстырғанда суды үнемдейді.',
    chatInputPlaceholder: 'Агрономға сұрақ қойыңыз (мыс., желдің әсері, топырақ тұздануы, тыңайтқыш беру)...',
    sendBtn: 'Жіберу',
    quickPrompt1: '💨 Қатты жел кезінде суару',
    quickPrompt2: '🧂 Топырақ тұзданғанда не істеу керек?',
    quickPrompt3: '⏰ Сорғыны қай уақытта қосқан дұрыс?',
    quickPrompt4: '🧪 Фертигацияны қалай жүргізеді?',
    chatFallbackReply: 'Ағымдағы FAO-56 суару нормасын сақтау ұсынылады. Ысырапты азайту үшін суаруды таңертеңгі 09:00-ге дейін қосыңыз.',
    nowTime: 'Қазір',

    // Water Analytics
    analyticsTitle: 'Су тұтынуды салыстырмалы талдау',
    analyticsSubtitle: 'AquaAI дәл суаруы дәстүрлі арықпен бастыруға қарсы (50%-ға дейін шығын)',
    metricVolume: 'Көлемі (м³)',
    metricDepth: 'Қабаты (мм)',
    baselineConsumption: 'Базалық тұтыну',
    baselineBenchmark: '50% шығыны бар дәстүрлі арық',
    aquaAiPrescribed: 'AquaAI суару нормасы',
    projectedWaterSavings: 'Үнемделген су',
    conservedVsFlood: 'арыққа қарағанда үнемделді',
    chartTitleVolume: 'Тәуліктік су көлемі: AquaAI шығыны vs Базалық деңгей (м³)',
    chartTitleDepth: 'Тәуліктік су балансы: ETc vs Жауын vs Суару (мм)',
    legendBaseline: 'Дәстүрлі суару',
    legendAquaAi: 'AquaAI жоспары',
    legendCropEtc: 'Өсімдік ETc',
    legendRain: 'Жауын-шашын',
    legendGross: 'Брутто норма',
    dailyTableTitle: 'Үнемдеуді күн бойынша салыстыру',

    // Solana Cryptographic Audit
    solanaTitle: 'Solana криптографиялық аудиті',
    solanaSubtitle: 'Solana Devnet блокчейнінде су үнемдеу директиваларын өзгеріссіз бекіту',
    memoProgramBadge: 'Solana Memo бағдарламасы',
    offchainTitle: 'Блокчейннен тыс деректер құпиялылығы',
    offchainDesc: 'Шаруашылықтың дербес деректері мен GPS нүктелері толық құпия сақталады. Solana блокчейніне тек есептеудің криптографиялық таңбасы (SHA-256) жазылады.',
    fingerprintLabel: 'Криптографиялық таңба (SHA-256):',
    copyHashBtn: 'Хэшті көшіру',
    copied: 'Көшірілді',
    canonicalPayloadLabel: 'Директива параметрлері:',
    commitStepTitle: '1. Дәлелді Solana Devnet-ке жазу',
    commitStepDesc: 'Транзакцияға қол қойып, Solana Memo бағдарламасына тікелей жібереді.',
    recordOnChainBtn: 'Дәлелді Solana-ға жазу',
    recordingInProgress: 'Solana-ға транзакция жазылуда...',
    verifiedStatus: 'Блокчейнде расталған',
    viewExplorerBtn: 'Solana Explorer-ден көру',
    verifyRpcStepTitle: '2. Хэшті RPC арқылы тәуелсіз тексеру',
    verifyRpcStepDesc: 'Devnet түйінінде дұрыстығын тексеру үшін транзакция қолтаңбасын енгізіңіз.',
    txSignaturePlaceholder: 'Solana транзакция қолтаңбасын қойыңыз...',
    verifyNowBtn: 'RPC арқылы тексеру',
    verifying: 'Блокчейнде тексерілуде...',
    hashVerifiedValid: 'Хэш сәйкес келді! Директива шынайы және өзгертілмеген.',
    hashVerificationFailed: 'Тексеру сәтсіз аяқталды немесе транзакция табылмады.',

    // Subsidies & Certificate
    subsidiesTitle: 'Мемлекеттік субсидиялар және Су несиелері',
    subsidiesSubtitle: 'ҚР тарифтік бағдарламалары бойынша расталған су үнемдеуді монетизациялау',
    exportCertBtn: 'Ресми аудит сертификаты',
    hideCertBtn: 'Сертификатты жасыру',
    calcSavingsKzt: 'Мемлекеттік эко-субсидия бағалауы:',
    kztSubsidyAmount: 'теңге үнемдеу',
    sevenDaysAudit: '7 күндік есеп бойынша',
    seasonalPotential: 'Маусымдық әлеует (100 күн):',
    seasonProjectedM3: 'Маусымдық болжамды үнемдеу',
    waterCreditsEarned: 'Есептелген су несиелері (Water Credits)',
    creditsUnitDesc: 'AquaAI Water Credits (1 несие = 100 м³ расталған су үнемдеу)',
    certTitle: 'РАСТАЛҒАН СУ ҮНЕМДЕУ СЕРТИФИКАТЫ',
    certPrintBtn: 'Басып шығару / PDF',
    certMinistry: 'Қазақстан Республикасы • Су ресурстарын пайдалануды реттеу және қорғау жөніндегі бассейндік инспекция',
    certCertifies: 'Осы құжат келесі агрошаруашылыққа берілді:',
    certAuditPeriod: 'Аудит кезеңі:',
    certWaterSaved: 'Үнемделген су:',
    certConsumptionDrop: 'Шығынды азайту:',
    certEcoSubsidy: 'Эко-субсидия:',
    certDirectiveHash: 'Директиваның криптографиялық хэші:',
    certStatus: 'Мәртебесі: РАСТАЛҒАН ●',
    certEngine: 'AquaAI гидрологиялық аудит валидаторы (FAO-56)',

    // Central Asia Ecological Crisis
    crisisBadge: 'Аймақтық климаттық және су дағдарысы',
    crisisTitle: 'Орталық Азиядағы су тапшылығы мәселесі',
    crisisSubtitle: 'Орталық Азия жаһандық ең өткір экологиялық дағдарыстың бірін бастан кешуде. Арал теңізі алабындағы тұщы судың 80%-дан астамы суармалы егіншілікке жұмсалады, оның жартысынан көбі тиімсіз арықтар мен топырақ каналдарда жоғалады.',
    aralDepletionTitle: 'Арал теңізінің тартылуы',
    aralDepletionDesc: 'Сырдария мен Әмудария суларын монокультураларға бұру Арал көлемін 90%-дан астам қысқартып, миллиондаған тонна улы тұз тарататын Аралқұм шөлін қалыптастырды.',
    aralImpact: 'Салдары: улы тұзды дауылдар және оңтүстік өңір топырағының сортаңдануы.',
    glacierRetreatTitle: 'Тянь-Шань мұздықтарының еруі',
    glacierRetreatDesc: 'Аймақ өзендерін қоректендіретін мұздықтар жылыну салдарынан бұрын-соңды болмаған жылдамдықпен еруде. Еру шыңы ерте көктемге ауысып, жаз соңында қуаңшылық туғызады.',
    glacierImpact: 'Болжам: 2040 жылға қарай өзендердің жазғы ағыны 25%-ға дейін кемиді.',
    floodLossTitle: 'Бастырып суарудағы 50% шығын',
    floodLossDesc: 'Дәстүрлі арықпен суару өсімдіктің нақты сұранысын ескермей, тұрақты күнтізбе бойынша су береді. Бұл топырақты батпақтандырып, құнарлы заттарды шайып кетеді.',
    floodSolution: 'Шешімі: FAO-56 дәл суару нормалары ысырапты 30–45%-ға азайтады.',
    interventionBadge: 'AquaAI платформасының үлесі',
    interventionTitle: 'Болжамдарды нақты гидрология мен ончейн-аудитпен алмастыру',
    interventionDesc: 'Сандық ауа райын Пенман-Монтейт формулаларымен ұштастыра отырып, AquaAI өсімдіктің тәуліктік нақты су сұранысын есептейді. Фермерлер жаңбыр алдында суармайды және булануды азайтады.',
    statWaterSavings: 'Су үнемдеу әлеуеті',
    statFaoAdherence: 'FAO-56 стандартына сәйкестік',
    statSensorBarrier: 'Датчиксіз қолжетімділік',
    statSolanaAudit: 'Блокчейнде расталатын аудит',

    // Farm Modal
    modalTitleNew: 'Жаңа алқап қосу',
    modalTitleEdit: 'Алқап параметрлерін өзгерту',
    modalSubtitle: 'Аймақтық агроклиматтық параметрлерді баптау',
    farmNameLabel: 'Шаруашылық / алқап атауы',
    farmNamePlaceholder: 'Мысалы, Сырдария кооперативі, 4-сектор',
    locationPresetLabel: 'Агроэкологиялық аймақ',
    coordinates: 'Координаталар:',
    fieldSizeLabel: 'Алқап көлемі (га)',
    depthM3Ratio: '1 гектарға 1 мм су мөлшері = 10 м³ су',
    cropTypeLabel: 'Ауыл шаруашылығы дақылы',
    growthStageLabel: 'Өсу кезеңі',
    irrigationMethodLabel: 'Суару әдісі',
    soilTypeLabel: 'Топырақ түрі',
    waterCapacityLabel: 'Топырақтың су ұстау қабілеті:',
    cancelBtn: 'Болдырмау',
    saveFarmBtn: 'Алқапты сақтау',

    // Crops
    cropCotton: 'Мақта (Арал алабы)',
    cropWheat: 'Бидай (Дәнді дақылдар)',
    cropRice: 'Күріш (Қызылорда алабы)',
    cropCorn: 'Жүгері (Жем-шөптік және дәнді)',
    cropVegetables: 'Көкөніс дақылдары',

    // Growth Stages
    stageInitialTitle: 'Бастапқы кезең (Өну)',
    stageInitialDesc: 'Топырақты жабу < 10%. Топырақтан тікелей булану басым.',
    stageDevelopmentTitle: 'Вегетативті өсу',
    stageDevelopmentDesc: 'Жабын 10%-дан 75%-ға дейін ұлғаяды. Транспирация тез артады.',
    stageMidSeasonTitle: 'Гүлдеу және өнім түйіндеу',
    stageMidSeasonDesc: 'Толық жабылған алқап. Суға ең жоғары сұраныс кезеңі.',
    stageLateSeasonTitle: 'Пісу кезеңі',
    stageLateSeasonDesc: 'Жапырақтар сарғаяды. Су қажеттілігі жиын-терімге дейін азаяды.',

    // Irrigation Methods
    methodDripTitle: 'Тамшылатып суару (ПӘК 90%)',
    methodDripDesc: 'Тікелей тамырға беру. Нөлдік ағын және минималды булану.',
    methodSprinklerTitle: 'Жаңбырлатып суару (ПӘК 75%)',
    methodSprinklerDesc: 'Айналмалы және фронтальды машиналар. Жел мен тамшы булануынан шығын.',
    methodFloodTitle: 'Арықпен / Жүйекпен суару (ПӘК 55%)',
    methodFloodDesc: 'Гравитациялық арық суаруы. Тереңге сүзілуден үлкен шығындар.',
    methodDrip: 'Тамшылатып суару (ПӘК 90%)',
    savedWaterMetric: '7 күнде үнемделген су',

    // Soils
    soilSandyLoamTitle: 'Құмайт (Жеңіл)',
    soilSandyLoamDesc: 'Суды тез өткізеді, ылғал ұстау қабілеті төмен.',
    soilLoamTitle: 'Құмдақ (Теңгерімді)',
    soilLoamDesc: 'Тамыр үшін ауа мен ылғалдың оңтайлы арақатынасы.',
    soilClayLoamTitle: 'Ауыр сазды',
    soilClayLoamDesc: 'Суды ұзақ сақтайды, бірақ баяу сіңеді.',
    soilSiltClayTitle: 'Тұнбалы саз (Арал аллювийі)',
    soilSiltClayDesc: 'Сырдария атырабының тығыз, қабықтанатын топырағы.',

    // Footer
    footerSystems: 'AquaAI Systems',
    footerResilience: 'Орталық Азияның климаттық төзімділігі',
    footerCopyright: '© 2026 AquaAI. Қазақстан және Орталық Азия су ресурстарын сақтау.',
  },

  en: {
    // Brand & Header
    brandName: 'AquaAI',
    brandTagline: 'Smart Irrigation Assistant for Central Asia',
    tabDashboard: 'Dashboard',
    tabAnalytics: 'Water Analytics',
    tabSatellite: 'Satellite NDVI',
    tabBlockchain: 'Blockchain Audit',
    tabSubsidies: 'Subsidies & Certificate',
    tabAbout: 'Aral Sea Crisis',
    newFieldBtn: '+ New Field',
    solanaConnected: 'Solana Devnet ● Connected',
    connectWalletBtn: 'Connect Wallet',
    disconnectBtn: 'Disconnect',
    connecting: 'Connecting...',
    devnetBadge: 'DEVNET',

    // Farm Header
    demoFarmBadge: 'Demo Farm',
    activeProdBadge: 'Active Production',
    editParamsBtn: 'Farm Parameters',
    refreshWeatherBtn: 'Refresh Weather',
    recalculating: 'Recalculating...',
    hectares: 'Hectares',
    demoTurkistanName: 'Turkistan Basin Agro-Cooperative (Demo)',
    demoAlmatyName: 'Zhetysu Spring Wheat Farm #7 (Demo)',

    // Hero Section
    heroColosseumBadge: "Colosseum Crypto World's Fair 2026",
    heroColosseumSub: 'Central Asia Climate Tech MVP',
    heroTitle: 'Smarter Irrigation. Every Drop Counts.',
    heroHighlight: 'FAO-56 Agronomic Intelligence',
    heroSubtitle: 'Combating agricultural water waste across Kazakhstan and the Aral Sea basin with FAO-56 Penman-Monteith physics, live Open-Meteo weather forecasting, and Solana Devnet verification.',
    exploreTurkistanBtn: 'Demo: Turkistan (Cotton)',
    launchDashboardBtn: 'Launch Irrigation Engine',
    badgeFao: 'FAO-56 Penman-Monteith',
    badgeWeather: 'Live Open-Meteo',
    badgeGemini: 'Gemini AI Agronomist',
    badgeSolana: 'Solana Devnet Auditing',
    heroAdviceCallout: 'Operator Directive',
    heroAdviceText: 'Optimal application window is early morning (05:30 – 08:30) before high thermal vapor pressure deficit.',
    faoPillarDesc: 'Penman-Monteith ET0 and crop Kc coefficients for cotton, wheat, rice, corn, and vegetables.',
    weatherPillarDesc: '7-day numerical weather prediction: solar radiation, wind, humidity, and rainfall.',
    geminiPillarDesc: 'Transforms complex hydrological formulas into straightforward field execution guidelines.',
    solanaPillarDesc: 'Cryptographic commitment of irrigation proofs to Solana Devnet via Memo instructions.',
    vsFloodBaseline: 'vs flood baseline',

    // Weather Widget
    weatherTitle: 'Numerical Weather & ET₀ Forecast',
    weatherSubtitle: '7-day high resolution atmospheric prediction',
    liveApiBadge: '● Open-Meteo Live API',
    fallbackBadge: '● Climatology Fallback',
    todayMaxTemp: "Today's Max Temp",
    minTemp: 'Min:',
    precipitation: 'Precipitation',
    referenceEt0: 'Reference ET₀',
    et0GrassBaseline: 'FAO-56 Grass Baseline',
    peakWindHum: 'Peak Wind & Hum',
    humidity: 'Humidity:',
    today: 'Today',

    // Irrigation Calculator
    faoDirective: 'FAO-56 Irrigation Directive',
    calculatorTitle: 'FAO-56 Scientific Irrigation Model',
    primaryActionIrrigate: 'IRRIGATION RECOMMENDED',
    primaryActionDelay: 'DELAY IRRIGATION (UPCOMING RAINFALL)',
    primaryActionNoNeed: 'NO IRRIGATION NEEDED',
    statusLabel: 'Status:',
    recommendedWindowLabel: 'Recommended Irrigation Window:',
    windowMinimizesEvap: 'Minimizes midday thermal evaporation and wind drift',
    netEtc: 'Crop Evapotranspiration (ETc)',
    effectiveRain: 'Effective Rainfall',
    netDeficit: 'Net Deficit (Inet)',
    grossIrrigationDepth: 'Gross Irrigation Depth',
    totalVolume: 'Total Water Volume',
    pumpDuration: 'Pump Run Duration',
    totalRainLabel: 'Total Rainfall:',
    efficiency: 'Efficiency',
    scheduleTitle: '7-Day Prescriptive Irrigation Schedule',
    exportCsvBtn: 'Export Schedule (.CSV)',
    dayHeader: 'Day',
    cropDemandHeader: 'Crop Demand (ETc)',
    rainHeader: 'Rainfall',
    volumeM3Header: 'Volume (m³)',
    recommendationHeader: 'Recommendation',
    actionHeader: 'Action',
    timingHeader: 'Timing & Justification',
    assumptionsTitle: 'Hydrological Assumptions & Model Boundaries',
    standard: 'Standard:',
    volumeConversionNote: 'Volume conversion: 1 mm depth per hectare = 10 m³.',
    networkEfficiency: 'Application Efficiency:',
    limitation1: 'Assumes uniform soil infiltration and properly maintained irrigation emitters.',
    limitation2: 'Does not account for unmeasured groundwater capillary rise or salinity leaching fraction.',
    limitation3: 'Numerical forecast skill diminishes beyond 72 hours.',

    // Satellite NDVI
    satelliteTitle: 'Satellite NDVI & Water Stress Monitoring',
    satelliteSubtitle: 'Spectral vegetation index analysis via Sentinel-2 10-meter B04 (Red) and B08 (NIR) bands for dynamic crop coefficient (Kc) calibration.',
    layerNdvi: 'NDVI Layer (Biomass)',
    layerNdwi: 'NDWI Layer (Moisture)',
    meanNdvi: 'Mean NDVI Index',
    denseCover: 'Dense Canopy',
    moderateCover: 'Moderate Growth',
    rangeLabel: 'Range:',
    ndwiWaterStress: 'Water Stress (NDWI)',
    normalHydration: 'Optimal Hydration',
    moistureDeficit: 'Moisture Deficit',
    turgorLabel: 'Canopy Turgor Status',
    kcCorrectionFao: 'Kc Adjustment (FAO-56)',
    applyKcBtn: 'Apply Satellite Kc',
    kcApplied: 'Kc Successfully Applied!',
    interactiveNdviGrid: 'Interactive Sentinel-2 Field Grid (10m Resolution):',
    ndviLegendLow: 'Sparse (<0.4)',
    ndviLegendMid: 'Moderate (0.5–0.7)',
    ndviLegendHigh: 'Dense (>0.75)',
    selectedPixelTitle: 'Selected Grid Pixel Data:',
    clickPixelPrompt: 'Click any pixel on the field grid above for detailed spectral metrics.',
    pixelVigour: 'Canopy Vigour',
    pixelHydration: 'Hydration Level',
    pixelKcContrib: 'Local Kc Contribution',

    // Soil Moisture Telemetry
    soilTelemetryTitle: 'Root-Zone Soil Moisture Profile',
    soilTelemetrySubtitle: 'Volumetric Water Content (VWC %) capacitive sensor readings across 20, 40, and 60 cm depths for Management Allowed Depletion (MAD) control.',
    loraTelemetryBadge: 'LoRaWAN IoT Sensor Telemetry',
    minsAgo: '3 mins ago',
    depth20Label: 'Surface Horizon (Evaporation layer)',
    depth40Label: 'Active Root Zone (Primary uptake)',
    depth60Label: 'Deep Buffer Zone (Capillary fringe)',
    statusOptimal: 'Optimal',
    statusModerateDeficit: 'Moderate Deficit',
    statusCriticalDry: 'Critical Deficit',
    statusSaturated: 'Waterlogged',
    currentMoisture: 'Current Moisture',
    fieldCapacityShort: 'Field Capacity (FC)',
    madThresholdShort: 'MAD Depletion Threshold',
    wiltingPointShort: 'Wilting Point (WP)',
    madSafetyZone: 'MAD Safety Buffer',

    // AI Advisor
    advisorTitle: 'AquaAI Agronomic Advisor (Google Gemini)',
    advisorSubtitle: 'Operational guidance grounded strictly in scientific hydrology',
    refreshAiBtn: 'Refresh AI Advice',
    operationalAdviceTitle: 'Operator Directives',
    impactTitle: 'Conservation Impact & Water Savings',
    confidenceHigh: 'High Model Confidence',
    chatTabLabel: 'Agronomist Chat',
    welcomeMsg: 'Hello! I am your AquaAI hydrological agronomist. Ask me anything regarding irrigation scheduling, salinity management, or evaporation prevention.',
    defaultSummary: 'Your field requires scheduled irrigation over the next 7 days. Forecast precipitation is insufficient to meet crop water demand.',
    defaultAdvice: 'Irrigate during early morning hours (05:30 – 08:30) to minimize wind drift and thermal evaporative flash.',
    defaultImpact: 'Adhering to this schedule conserves water compared to traditional flood irrigation.',
    chatInputPlaceholder: 'Ask the agronomist (e.g., wind impact, soil salinity, pump schedule, fertigation)...',
    sendBtn: 'Send',
    quickPrompt1: '💨 Irrigating in strong winds',
    quickPrompt2: '🧂 Managing soil salinity',
    quickPrompt3: '⏰ Optimal pump operating hours',
    quickPrompt4: '🧪 Fertigation guidelines',
    chatFallbackReply: 'Adhering to the FAO-56 schedule is recommended. Run irrigation pumps in the morning before 09:00 to reduce losses.',
    nowTime: 'Now',

    // Water Analytics
    analyticsTitle: 'Comparative Water Analytics',
    analyticsSubtitle: 'AquaAI Precision Prescriptions vs Traditional 50% Flood Irrigation Baseline',
    metricVolume: 'Volume (m³)',
    metricDepth: 'Depth (mm)',
    baselineConsumption: 'Baseline Consumption',
    baselineBenchmark: '50% efficiency flood benchmark',
    aquaAiPrescribed: 'AquaAI Prescribed Volume',
    projectedWaterSavings: 'Projected Water Savings',
    conservedVsFlood: 'conserved vs flood',
    chartTitleVolume: 'Daily Water Volume: AquaAI Delivery vs Baseline (m³)',
    chartTitleDepth: 'Daily Hydrological Depth: ETc vs Rain vs Gross Delivery (mm)',
    legendBaseline: 'Baseline Flood',
    legendAquaAi: 'AquaAI Plan',
    legendCropEtc: 'Crop ETc',
    legendRain: 'Rainfall',
    legendGross: 'Gross Delivery',
    dailyTableTitle: 'Day-by-Day Water Savings',

    // Solana Cryptographic Audit
    solanaTitle: 'Solana Cryptographic Audit',
    solanaSubtitle: 'Tamper-proof verification of irrigation directives on Solana Devnet',
    memoProgramBadge: 'Solana Memo Program',
    offchainTitle: 'Off-Chain Data Integrity Architecture',
    offchainDesc: 'Sensitive farm identifiers and precise GPS coordinates remain strictly confidential. Only a SHA-256 cryptographic digest of the calculation is committed to the public Solana blockchain.',
    fingerprintLabel: 'Cryptographic Fingerprint (SHA-256):',
    copyHashBtn: 'Copy Hash',
    copied: 'Copied',
    canonicalPayloadLabel: 'Directive Payload:',
    commitStepTitle: '1. Commit Record to Solana Devnet',
    commitStepDesc: 'Signs and broadcasts a live transaction to the Solana Memo Program.',
    recordOnChainBtn: 'Record Proof on Solana',
    recordingInProgress: 'Broadcasting to Solana...',
    verifiedStatus: 'Verified On-Chain',
    viewExplorerBtn: 'View in Solana Explorer',
    verifyRpcStepTitle: '2. Verify Digest via Solana RPC',
    verifyRpcStepDesc: 'Enter a transaction signature to independently verify hash integrity on Devnet.',
    txSignaturePlaceholder: 'Paste Solana transaction signature...',
    verifyNowBtn: 'Verify via RPC',
    verifying: 'Verifying on Solana...',
    hashVerifiedValid: 'Hash match confirmed! Directive is authentic and untampered.',
    hashVerificationFailed: 'Verification failed or transaction not found.',

    // Subsidies & Certificate
    subsidiesTitle: 'Government Subsidies & Water Credits',
    subsidiesSubtitle: 'Monetize verified water conservation under Central Asian water tariff policies',
    exportCertBtn: 'Official Audit Certificate',
    hideCertBtn: 'Hide Certificate',
    calcSavingsKzt: 'Estimated State Eco-Subsidy:',
    kztSubsidyAmount: 'KZT Savings Potential',
    sevenDaysAudit: 'Over 7-day audit window',
    seasonalPotential: 'Seasonal Potential (100 days):',
    seasonProjectedM3: 'Projected seasonal savings',
    waterCreditsEarned: 'Earned Water Conservation Credits',
    creditsUnitDesc: 'AquaAI Water Credits (1 credit = 100 m³ of verifiable water conserved)',
    certTitle: 'CERTIFICATE OF VERIFIED WATER CONSERVATION',
    certPrintBtn: 'Print / Export to PDF',
    certMinistry: 'Republic of Kazakhstan • Basin Water Inspection for Regulation & Conservation',
    certCertifies: 'This certifies that the agricultural enterprise:',
    certAuditPeriod: 'Audit Period:',
    certWaterSaved: 'Water Conserved:',
    certConsumptionDrop: 'Demand Reduction:',
    certEcoSubsidy: 'Eco-Subsidy:',
    certDirectiveHash: 'Cryptographic Directive Hash:',
    certStatus: 'Status: VERIFIED ON-CHAIN ●',
    certEngine: 'AquaAI Hydrological Audit Engine (FAO-56)',

    // Central Asia Ecological Crisis
    crisisBadge: 'Regional Climate & Hydrological Crisis',
    crisisTitle: 'The Water Scarcity Challenge in Central Asia',
    crisisSubtitle: "Central Asia is facing one of the world's most urgent ecological and agricultural crises. Irrigation consumes over 80% of all freshwater withdrawals in the Aral Sea basin, yet more than half is lost through inefficient flood methods and unlined canals.",
    aralDepletionTitle: 'Aral Sea Basin Depletion',
    aralDepletionDesc: 'The diversion of the Syr Darya and Amu Darya rivers for monoculture crops shrank the Aral Sea by over 90%, creating the Aralkum desert and generating toxic dust storms.',
    aralImpact: 'Impact: toxic dust storms & severe regional soil salinization in Southern Kazakhstan.',
    glacierRetreatTitle: 'Tian Shan Glacial Retreat',
    glacierRetreatDesc: 'Glaciers feeding the region are receding at unprecedented rates due to climate warming. Meltwater peaks are shifting earlier, causing severe late-season summer drought.',
    glacierImpact: 'Projection: Up to 25% drop in summer river flow by 2040.',
    floodLossTitle: '50% Inundation Loss',
    floodLossDesc: 'Traditional furrow flooding applies water on fixed calendar schedules rather than crop demand. Excessive flooding causes waterlogging and leaches essential nutrients.',
    floodSolution: 'Solution: Precision FAO-56 irrigation schedules cut waste by 30-45%.',
    interventionBadge: 'The AquaAI Intervention',
    interventionTitle: 'Replacing Guesswork with Agronomic Hydrology & Open Auditing',
    interventionDesc: 'By synchronizing localized numerical weather predictions with Penman-Monteith crop coefficients, AquaAI calculates exact daily crop transpiration. Farmers avoid premature irrigation ahead of rains.',
    statWaterSavings: 'Potential water savings',
    statFaoAdherence: 'FAO-56 standard adherence',
    statSensorBarrier: 'Hardware sensor barrier',
    statSolanaAudit: 'Verifiable on-chain audit',

    // Farm Modal
    modalTitleNew: 'Create New Farm Profile',
    modalTitleEdit: 'Edit Farm Parameters',
    modalSubtitle: 'Configure regional agro-climatic parameters',
    farmNameLabel: 'Farm / Field Name',
    farmNamePlaceholder: 'e.g., Syr Darya Co-op Sector 4',
    locationPresetLabel: 'Agro-Ecological Zone',
    coordinates: 'Coordinates:',
    fieldSizeLabel: 'Field Size (Hectares)',
    depthM3Ratio: '1 mm depth = 10 m³ water per hectare',
    cropTypeLabel: 'Crop Type',
    growthStageLabel: 'Current Growth Stage',
    irrigationMethodLabel: 'Irrigation Method',
    soilTypeLabel: 'Soil Texture Type',
    waterCapacityLabel: 'Available water capacity:',
    cancelBtn: 'Cancel',
    saveFarmBtn: 'Save Farm Profile',

    // Crops
    cropCotton: 'Cotton (Aral Basin Cash Crop)',
    cropWheat: 'Wheat (Steppe Grain Belt)',
    cropRice: 'Rice (Kyzylorda Basin)',
    cropCorn: 'Corn / Maize (Fodder & Grain)',
    cropVegetables: 'Vegetables (Horticulture)',

    // Growth Stages
    stageInitialTitle: 'Initial (Germination & Emergence)',
    stageInitialDesc: 'Ground cover < 10%. Direct soil evaporation dominates.',
    stageDevelopmentTitle: 'Crop Development (Vegetative Growth)',
    stageDevelopmentDesc: 'Canopy expands 10% to 75%. Rapid rise in transpiration.',
    stageMidSeasonTitle: 'Mid-Season (Flowering & Fruit Formation)',
    stageMidSeasonDesc: 'Full canopy cover. Peak water demand and sensitivity.',
    stageLateSeasonTitle: 'Late Season (Ripening & Maturation)',
    stageLateSeasonDesc: 'Leaves yellow. Water demand diminishes until harvest.',

    // Irrigation Methods
    methodDripTitle: 'Drip / Micro-Irrigation (90% Eff.)',
    methodDripDesc: 'Direct root delivery. Minimal evaporation and zero surface runoff.',
    methodSprinklerTitle: 'Center Pivot / Sprinkler (75% Eff.)',
    methodSprinklerDesc: 'Overhead spray. Moderate losses from wind drift and droplet evaporation.',
    methodFloodTitle: 'Traditional Furrow / Flood (55% Eff.)',
    methodFloodDesc: 'Gravity canal inundation. High deep percolation and tailwater losses.',
    methodDrip: 'Drip Irrigation (90% Eff.)',
    savedWaterMetric: 'Water Saved Over 7 Days',

    // Soils
    soilSandyLoamTitle: 'Sandy Loam (Light)',
    soilSandyLoamDesc: 'Rapid infiltration, low water holding capacity.',
    soilLoamTitle: 'Loam (Medium / Balanced)',
    soilLoamDesc: 'Optimal balance of moisture retention and root aeration.',
    soilClayLoamTitle: 'Clay Loam (Heavy)',
    soilClayLoamDesc: 'High moisture retention, slower infiltration rate.',
    soilSiltClayTitle: 'Silty Clay (Dense Aral Basin)',
    soilSiltClayDesc: 'Dense alluvium characteristic of Syr Darya delta zones.',

    // Footer
    footerSystems: 'AquaAI Systems',
    footerResilience: 'Central Asia Climate Resilience',
    footerCopyright: '© 2026 AquaAI. Conservation of water resources across Kazakhstan and the Aral Sea basin.',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'ru',
  setLanguage: () => {},
  t: translations.ru,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ru');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('aqua_ai_lang') as Language;
      if (saved && (saved === 'ru' || saved === 'kk' || saved === 'en')) {
        setLanguageState(saved);
        if (typeof document !== 'undefined') {
          document.documentElement.lang = saved;
        }
      }
    } catch {
      // Ignore localStorage errors (e.g. incognito or SSR)
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('aqua_ai_lang', lang);
    } catch {
      // Ignore
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);

// --- Localized Helper Functions ---

export function getCropLabel(crop: CropType, t: Translations): string {
  switch (crop) {
    case 'cotton':
      return t.cropCotton;
    case 'wheat':
      return t.cropWheat;
    case 'rice':
      return t.cropRice;
    case 'corn':
      return t.cropCorn;
    case 'vegetables':
      return t.cropVegetables;
    default:
      return crop;
  }
}

export function getGrowthStageInfo(
  stage: GrowthStage,
  t: Translations
): { title: string; description: string } {
  switch (stage) {
    case 'initial':
      return { title: t.stageInitialTitle, description: t.stageInitialDesc };
    case 'development':
      return { title: t.stageDevelopmentTitle, description: t.stageDevelopmentDesc };
    case 'mid_season':
      return { title: t.stageMidSeasonTitle, description: t.stageMidSeasonDesc };
    case 'late_season':
      return { title: t.stageLateSeasonTitle, description: t.stageLateSeasonDesc };
    default:
      return { title: stage, description: '' };
  }
}

export function getIrrigationMethodInfo(
  method: IrrigationMethod,
  t: Translations
): { title: string; description: string } {
  switch (method) {
    case 'drip':
      return { title: t.methodDripTitle, description: t.methodDripDesc };
    case 'sprinkler':
      return { title: t.methodSprinklerTitle, description: t.methodSprinklerDesc };
    case 'furrow_flood':
      return { title: t.methodFloodTitle, description: t.methodFloodDesc };
    default:
      return { title: method, description: '' };
  }
}

export function getSoilTypeInfo(
  soil: SoilType,
  t: Translations
): { title: string; description: string } {
  switch (soil) {
    case 'sandy_loam':
      return { title: t.soilSandyLoamTitle, description: t.soilSandyLoamDesc };
    case 'loam':
      return { title: t.soilLoamTitle, description: t.soilLoamDesc };
    case 'clay_loam':
      return { title: t.soilClayLoamTitle, description: t.soilClayLoamDesc };
    case 'silt_clay':
      return { title: t.soilSiltClayTitle, description: t.soilSiltClayDesc };
    default:
      return { title: soil, description: '' };
  }
}

export function formatLocalizedDate(dateStr: string, lang: Language): string {
  try {
    const d = new Date(dateStr);
    const locale = lang === 'kk' ? 'kk-KZ' : lang === 'ru' ? 'ru-RU' : 'en-US';
    return d.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function getLocalizedDayName(dateStr: string, lang: Language, isFirstDay = false): string {
  if (isFirstDay) {
    return lang === 'kk' ? 'Бүгін' : lang === 'ru' ? 'Сегодня' : 'Today';
  }
  try {
    const d = new Date(dateStr);
    const locale = lang === 'kk' ? 'kk-KZ' : lang === 'ru' ? 'ru-RU' : 'en-US';
    return d.toLocaleDateString(locale, { weekday: 'short' });
  } catch {
    return dateStr;
  }
}

export function getLocalizedActionReason(action: 'irrigate' | 'skip' | 'delay', lang: Language, precipMm = 0): string {
  if (lang === 'kk') {
    if (action === 'skip') {
      return precipMm >= 5
        ? `Табиғи жауын-шашын (${precipMm} мм) өсімдік сұранысын толық өтейді.`
        : 'Ылғал тапшылығы төмен (< 1.0 мм). Топырақта ылғал жеткілікті.';
    }
    if (action === 'delay') {
      return 'Ертең жауын күтілуде. Ысырапқа жол бермеу үшін суаруды кейінге қалдырыңыз.';
    }
    return 'Өсімдік булануы күтілетін жауын-шашын көлемінен асып түседі.';
  }
  if (lang === 'ru') {
    if (action === 'skip') {
      return precipMm >= 5
        ? `Естественные осадки (${precipMm} мм) покрывают потребность культуры.`
        : 'Минимальный дефицит влаги (< 1.0 мм). Влаги в почве достаточно.';
    }
    if (action === 'delay') {
      return 'Завтра ожидаются осадки. Отложите полив для экономии воды и ресурса насоса.';
    }
    return 'Водопотребность культуры превышает ожидаемые эффективные осадки.';
  }
  // en
  if (action === 'skip') {
    return precipMm >= 5
      ? `Natural rainfall (${precipMm} mm) covers crop evapotranspiration demand.`
      : 'Minimal moisture deficit (< 1.0 mm). Root zone moisture is adequate.';
  }
  if (action === 'delay') {
    return 'Significant rainfall expected tomorrow. Delay to avoid deep percolation waste.';
  }
  return 'Crop evapotranspiration exceeds expected effective rainfall.';
}

export function getLocalizedWindow(windowStr: string, lang: Language): string {
  if (windowStr.includes('05:30 - 08:30')) {
    if (lang === 'kk') return '05:30 - 08:30 (Таңғы оңтайлы уақыт)';
    if (lang === 'ru') return '05:30 - 08:30 (Утреннее окно с низким испарением)';
    return '05:30 - 08:30 (Morning low VPD window)';
  }
  if (windowStr.includes('20:30 - 23:30')) {
    if (lang === 'kk') return '20:30 - 23:30 (Кешкі/түнгі суару)';
    if (lang === 'ru') return '20:30 - 23:30 (Ночной полив против дневного испарения)';
    return '20:30 - 23:30 (Night application to curb evaporative loss)';
  }
  if (windowStr.includes('No irrigation')) {
    if (lang === 'kk') return 'Суару қажет емес';
    if (lang === 'ru') return 'Полив не требуется';
    return 'No irrigation required';
  }
  if (windowStr.includes('Delay')) {
    if (lang === 'kk') return 'Жауыннан кейін тексергенге дейін кейінге қалдыру';
    if (lang === 'ru') return 'Отложить до оценки осадков';
    return 'Delay until post-storm assessment';
  }
  return windowStr;
}
