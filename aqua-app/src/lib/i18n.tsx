'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ru' | 'kk' | 'en';

export interface Translations {
  // Brand & Nav
  brandName: string;
  brandTagline: string;
  tabDashboard: string;
  tabAnalytics: string;
  tabBlockchain: string;
  tabAbout: string;
  tabSubsidies: string;
  newFieldBtn: string;
  solanaConnected: string;

  // Farm Header
  demoFarmBadge: string;
  activeProdBadge: string;
  editParamsBtn: string;
  refreshWeatherBtn: string;
  hectares: string;

  // Hero
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  exploreTurkistanBtn: string;
  launchDashboardBtn: string;
  badgeFao: string;
  badgeWeather: string;
  badgeGemini: string;
  badgeSolana: string;

  // Irrigation Calculator
  calculatorTitle: string;
  primaryActionIrrigate: string;
  primaryActionDelay: string;
  primaryActionNoNeed: string;
  netEtc: string;
  effectiveRain: string;
  grossIrrigationDepth: string;
  totalVolume: string;
  pumpDuration: string;
  scheduleTitle: string;
  dayHeader: string;
  cropDemandHeader: string;
  rainHeader: string;
  recommendationHeader: string;

  // AI Advisor
  advisorTitle: string;
  advisorSubtitle: string;
  refreshAiBtn: string;
  operationalAdviceTitle: string;
  impactTitle: string;
  confidenceHigh: string;

  // Analytics & Water Savings
  analyticsTitle: string;
  analyticsSubtitle: string;
  aquaAiApproach: string;
  floodBaseline: string;
  savedWaterMetric: string;
  pumpSavedHours: string;

  // Solana
  solanaTitle: string;
  solanaSubtitle: string;
  fingerprintLabel: string;
  recordOnChainBtn: string;
  recordingInProgress: string;
  verifiedStatus: string;
  viewExplorerBtn: string;
  verifyNowBtn: string;

  // Subsidies & Certificate
  subsidiesTitle: string;
  subsidiesSubtitle: string;
  calcSavingsKzt: string;
  kztSubsidyAmount: string;
  waterCreditsEarned: string;
  exportCertBtn: string;
  certTitle: string;
  certIssuedBy: string;

  // Farm Modal
  modalTitleNew: string;
  modalTitleEdit: string;
  farmNameLabel: string;
  locationPresetLabel: string;
  fieldSizeLabel: string;
  cropTypeLabel: string;
  growthStageLabel: string;
  irrigationMethodLabel: string;
  soilTypeLabel: string;
  pumpRateLabel: string;
  cancelBtn: string;
  saveFarmBtn: string;

  // Crops
  cropCotton: string;
  cropWheat: string;
  cropRice: string;
  cropCorn: string;
  cropVegetables: string;

  // Stages
  stageInitial: string;
  stageDevelopment: string;
  stageMidSeason: string;
  stageLateSeason: string;

  // Soil
  soilSandyLoam: string;
  soilLoam: string;
  soilClayLoam: string;
  soilSiltClay: string;

  // Irrigation methods
  methodDrip: string;
  methodSprinkler: string;
  methodFurrowFlood: string;
}

const translations: Record<Language, Translations> = {
  ru: {
    brandName: 'AquaAI',
    brandTagline: 'Интеллектуальный полив для Центральной Азии',
    tabDashboard: 'Рабочая панель',
    tabAnalytics: 'Аналитика расхода',
    tabBlockchain: 'Solana-аудит',
    tabSubsidies: 'Субсидии и сертификат',
    tabAbout: 'Кризис Арала',
    newFieldBtn: '+ Новое поле',
    solanaConnected: 'Solana Devnet ● Активен',

    demoFarmBadge: 'Демо-хозяйство',
    activeProdBadge: 'Действующее поле',
    editParamsBtn: 'Параметры поля',
    refreshWeatherBtn: 'Обновить метеоданные',
    hectares: 'гектаров',

    heroTitle: 'Точный полив. Каждая капля на счету.',
    heroHighlight: 'Агрономический ИИ и гидрология FAO-56',
    heroSubtitle: 'Защита водных ресурсов Казахстана и бассейна Аральского моря. Научно обоснованные нормы орошения, предотвращающие до 45% потерь поливной воды.',
    exploreTurkistanBtn: 'Демо: Туркестан (Хлопок)',
    launchDashboardBtn: 'Открыть расчёт полива',
    badgeFao: 'FAO-56 Пенман-Монтейт',
    badgeWeather: 'Open-Meteo онлайн',
    badgeGemini: 'ИИ-агроном Gemini',
    badgeSolana: 'Ончейн-аудит Solana',

    calculatorTitle: 'Научный расчёт норм полива (FAO-56)',
    primaryActionIrrigate: 'НЕОБХОДИМ ПОЛИВ',
    primaryActionDelay: 'ОТЛОЖИТЬ ПОЛИВ (ОЖИДАЮТСЯ ОСАДКИ)',
    primaryActionNoNeed: 'ПОЛИВ НЕ ТРЕБУЕТСЯ',
    netEtc: 'Потребность культуры (ETc)',
    effectiveRain: 'Эффективные осадки',
    grossIrrigationDepth: 'Брутто-норма полива',
    totalVolume: 'Общий объём воды',
    pumpDuration: 'Время работы насоса',
    scheduleTitle: '7-дневный подекадный график полива',
    dayHeader: 'День',
    cropDemandHeader: 'Потребность (ETc)',
    rainHeader: 'Осадки',
    recommendationHeader: 'Рекомендация по поливу',

    advisorTitle: 'ИИ-агроном AquaAI (Google Gemini)',
    advisorSubtitle: 'Оперативные полевые рекомендации на основе физической гидрологии',
    refreshAiBtn: 'Обновить консультацию ИИ',
    operationalAdviceTitle: 'Практические указания поливальщику',
    impactTitle: 'Экологический эффект и экономия',
    confidenceHigh: 'Высокая достоверность модели',

    analyticsTitle: 'Сравнительная аналитика водопотребления',
    analyticsSubtitle: 'Нормативный полив AquaAI против традиционного арычного затопления (потери до 50%)',
    aquaAiApproach: 'Точный полив AquaAI',
    floodBaseline: 'Традиционное затопление (Базовый уровень)',
    savedWaterMetric: 'Сэкономлено воды за 7 дней',
    pumpSavedHours: 'Сэкономлено моточасов насоса',

    solanaTitle: 'Криптографический аудит Solana',
    solanaSubtitle: 'Неизменяемая фиксация директив водосбережения в блокчейне Solana Devnet',
    fingerprintLabel: 'Криптографический отпечаток (SHA-256):',
    recordOnChainBtn: 'Записать доказательство в Solana',
    recordingInProgress: 'Запись транзакции в Solana...',
    verifiedStatus: 'Подтверждено в блокчейне',
    viewExplorerBtn: 'Смотреть в Solana Explorer',
    verifyNowBtn: 'Проверить хеш в RPC',

    subsidiesTitle: 'Государственные субсидии и Водные кредиты',
    subsidiesSubtitle: 'Монетизация подтверждённой экономии воды по тарифным программам РК',
    calcSavingsKzt: 'Оценка государственной эко-субсидии:',
    kztSubsidyAmount: 'тенге экономии',
    waterCreditsEarned: 'Начислено водных эко-кредитов (Water Credits)',
    exportCertBtn: 'Скачать/Печать официальный сертификат аудита',
    certTitle: 'СЕРТИФИКАТ ПОДТВЕРЖДЁННОГО ВОДОСБЕРЕЖЕНИЯ',
    certIssuedBy: 'Выдан валидатором гидрологического аудита AquaAI',

    modalTitleNew: 'Добавление нового поля',
    modalTitleEdit: 'Редактирование параметров поля',
    farmNameLabel: 'Название хозяйства / поля',
    locationPresetLabel: 'Агроэкологическая зона',
    fieldSizeLabel: 'Площадь поля (га)',
    cropTypeLabel: 'Сельскохозяйственная культура',
    growthStageLabel: 'Текущая фаза вегетации',
    irrigationMethodLabel: 'Способ орошения',
    soilTypeLabel: 'Тип почвы',
    pumpRateLabel: 'Дебит насосной станции (м³/час)',
    cancelBtn: 'Отмена',
    saveFarmBtn: 'Сохранить поле',

    cropCotton: 'Хлопчатник',
    cropWheat: 'Озимая/Яровая пшеница',
    cropRice: 'Рис',
    cropCorn: 'Кукуруза',
    cropVegetables: 'Овощные культуры',

    stageInitial: 'Начальная (всходы)',
    stageDevelopment: 'Вегетативный рост',
    stageMidSeason: 'Цветение / Формирование урожая',
    stageLateSeason: 'Созревание',

    soilSandyLoam: 'Супесчаная',
    soilLoam: 'Суглинистая',
    soilClayLoam: 'Тяжелосуглинистая',
    soilSiltClay: 'Илисто-глинистая',

    methodDrip: 'Капельное орошение (КПД 90%)',
    methodSprinkler: 'Дождевание / Спринклеры (КПД 75-80%)',
    methodFurrowFlood: 'Арычный / Бороздовой полив (КПД 50%)',
  },

  kk: {
    brandName: 'AquaAI',
    brandTagline: 'Орталық Азияға арналған ақылды суару жүйесі',
    tabDashboard: 'Басқару тақтасы',
    tabAnalytics: 'Су үнемдеу талдауы',
    tabBlockchain: 'Solana аудиті',
    tabSubsidies: 'Субсидиялар мен сертификат',
    tabAbout: 'Арал дағдарысы',
    newFieldBtn: '+ Жаңа алқап',
    solanaConnected: 'Solana Devnet ● Белсенді',

    demoFarmBadge: 'Демо-шаруашылық',
    activeProdBadge: 'Өндірістік алқап',
    editParamsBtn: 'Алқап параметрлері',
    refreshWeatherBtn: 'Ауа райын жаңарту',
    hectares: 'гектар',

    heroTitle: 'Дәл суару. Әр тамшы есепте.',
    heroHighlight: 'Агрономиялық ЖИ және FAO-56 гидрологиясы',
    heroSubtitle: 'Қазақстан мен Арал теңізі алабының су ресурстарын қорғау. Суару суының 45%-ға дейін ысырап болуын болдырмайтын ғылыми нормалар.',
    exploreTurkistanBtn: 'Демо: Түркістан (Мақта)',
    launchDashboardBtn: 'Суару есебін ашу',
    badgeFao: 'FAO-56 Пенман-Монтейт',
    badgeWeather: 'Open-Meteo онлайн',
    badgeGemini: 'Gemini ЖИ-агрономы',
    badgeSolana: 'Solana ончейн-аудиті',

    calculatorTitle: 'Суару нормаларын ғылыми есептеу (FAO-56)',
    primaryActionIrrigate: 'СУАРУ ҚАЖЕТ',
    primaryActionDelay: 'СУАРУДЫ КЕЙІНГЕ ҚАЛДЫРУ (ЖАУЫН КҮТІЛУДЕ)',
    primaryActionNoNeed: 'СУАРУ ҚАЖЕТ ЕМЕС',
    netEtc: 'Өсімдік сұранысы (ETc)',
    effectiveRain: 'Тиімді жауын-шашын',
    grossIrrigationDepth: 'Брутто суару мөлшері',
    totalVolume: 'Жалпы су көлемі',
    pumpDuration: 'Сорғының жұмыс уақыты',
    scheduleTitle: '7 күндік суару кестесі',
    dayHeader: 'Күн',
    cropDemandHeader: 'Сұраныс (ETc)',
    rainHeader: 'Жауын-шашын',
    recommendationHeader: 'Суару бойынша кеңес',

    advisorTitle: 'AquaAI ЖИ-агрономы (Google Gemini)',
    advisorSubtitle: 'Физикалық гидрологияға негізделген жедел далалық нұсқаулар',
    refreshAiBtn: 'ЖИ кеңесін жаңарту',
    operationalAdviceTitle: 'Суарушыға практикалық нұсқаулар',
    impactTitle: 'Экологиялық нәтиже және үнемдеу',
    confidenceHigh: 'Үлгінің жоғары сенімділігі',

    analyticsTitle: 'Су тұтынуды салыстырмалы талдау',
    analyticsSubtitle: 'AquaAI дәл суаруы дәстүрлі арықпен бастыруға қарсы (50%-ға дейін шығын)',
    aquaAiApproach: 'AquaAI дәл суаруы',
    floodBaseline: 'Дәстүрлі суару (Базалық деңгей)',
    savedWaterMetric: '7 күнде үнемделген су',
    pumpSavedHours: 'Үнемделген сорғы уақыты',

    solanaTitle: 'Solana криптографиялық аудиті',
    solanaSubtitle: 'Solana Devnet блокчейнінде су үнемдеу директиваларын өзгеріссіз бекіту',
    fingerprintLabel: 'Криптографиялық таңба (SHA-256):',
    recordOnChainBtn: 'Дәлелді Solana-ға жазу',
    recordingInProgress: 'Solana-ға транзакция жазылуда...',
    verifiedStatus: 'Блокчейнде расталған',
    viewExplorerBtn: 'Solana Explorer-ден көру',
    verifyNowBtn: 'RPC арқылы тексеру',

    subsidiesTitle: 'Мемлекеттік субсидиялар және Су несиелері',
    subsidiesSubtitle: 'ҚР тарифтік бағдарламалары бойынша расталған су үнемдеуді монетизациялау',
    calcSavingsKzt: 'Мемлекеттік эко-субсидия бағалауы:',
    kztSubsidyAmount: 'теңге үнемдеу',
    waterCreditsEarned: 'Есептелген су несиелері (Water Credits)',
    exportCertBtn: 'Ресми аудит сертификатын жүктеу/басып шығару',
    certTitle: 'РАСТАЛҒАН СУ ҮНЕМДЕУ СЕРТИФИКАТЫ',
    certIssuedBy: 'AquaAI гидрологиялық аудит валидаторымен берілген',

    modalTitleNew: 'Жаңа алқап қосу',
    modalTitleEdit: 'Алқап параметрлерін өзгерту',
    farmNameLabel: 'Шаруашылық / алқап атауы',
    locationPresetLabel: 'Агроэкологиялық аймақ',
    fieldSizeLabel: 'Алқап көлемі (га)',
    cropTypeLabel: 'Ауыл шаруашылығы дақылы',
    growthStageLabel: 'Өсу кезеңі',
    irrigationMethodLabel: 'Суару әдісі',
    soilTypeLabel: 'Топырақ түрі',
    pumpRateLabel: 'Сорғы станциясының қуаты (м³/сағ)',
    cancelBtn: 'Болдырмау',
    saveFarmBtn: 'Алқапты сақтау',

    cropCotton: 'Мақта',
    cropWheat: 'Күздік/Жаздық бидай',
    cropRice: 'Күріш',
    cropCorn: 'Жүгері',
    cropVegetables: 'Көкөністер',

    stageInitial: 'Бастапқы (өну)',
    stageDevelopment: 'Вегетативті өсу',
    stageMidSeason: 'Гүлдеу / Өнім түйіндеу',
    stageLateSeason: 'Пісу кезеңі',

    soilSandyLoam: 'Құмайт',
    soilLoam: 'Құмдақ топырақ',
    soilClayLoam: 'Ауыр сазды',
    soilSiltClay: 'Тұнбалы саз',

    methodDrip: 'Тамшылатып суару (ПӘК 90%)',
    methodSprinkler: 'Жаңбырлатып суару (ПӘК 75-80%)',
    methodFurrowFlood: 'Арықпен / жүйекпен бастыру (ПӘК 50%)',
  },

  en: {
    brandName: 'AquaAI',
    brandTagline: 'Smart Irrigation Assistant for Central Asia',
    tabDashboard: 'Dashboard',
    tabAnalytics: 'Water Analytics',
    tabBlockchain: 'Blockchain Audit',
    tabSubsidies: 'Subsidies & Certificate',
    tabAbout: 'Aral Sea Crisis',
    newFieldBtn: '+ New Field',
    solanaConnected: 'Solana Devnet ● Connected',

    demoFarmBadge: 'Demo Farm',
    activeProdBadge: 'Active Production',
    editParamsBtn: 'Edit Farm Parameters',
    refreshWeatherBtn: 'Refresh Weather',
    hectares: 'Hectares',

    heroTitle: 'Smarter Irrigation. Every Drop Counts.',
    heroHighlight: 'FAO-56 Agronomic Intelligence',
    heroSubtitle: 'Combating agricultural water waste across Kazakhstan and the Aral Sea basin with FAO-56 Penman-Monteith physics, live numerical weather, and Solana Devnet verification.',
    exploreTurkistanBtn: 'Demo: Turkistan (Cotton)',
    launchDashboardBtn: 'Launch Irrigation Engine',
    badgeFao: 'FAO-56 Penman-Monteith',
    badgeWeather: 'Live Open-Meteo',
    badgeGemini: 'Gemini AI Agronomist',
    badgeSolana: 'Solana Devnet Auditing',

    calculatorTitle: 'FAO-56 Scientific Irrigation Model',
    primaryActionIrrigate: 'IRRIGATION RECOMMENDED',
    primaryActionDelay: 'DELAY IRRIGATION (UPCOMING RAINFALL)',
    primaryActionNoNeed: 'NO IRRIGATION NEEDED',
    netEtc: 'Crop Evapotranspiration (ETc)',
    effectiveRain: 'Effective Rainfall',
    grossIrrigationDepth: 'Gross Irrigation Depth',
    totalVolume: 'Total Water Volume',
    pumpDuration: 'Pump Run Duration',
    scheduleTitle: '7-Day Prescriptive Irrigation Schedule',
    dayHeader: 'Day',
    cropDemandHeader: 'Crop Demand (ETc)',
    rainHeader: 'Rainfall',
    recommendationHeader: 'Irrigation Recommendation',

    advisorTitle: 'AquaAI Agronomic Advisor (Google Gemini)',
    advisorSubtitle: 'Operational guidance grounded strictly in scientific hydrology',
    refreshAiBtn: 'Refresh Guidance',
    operationalAdviceTitle: 'Operator Directives',
    impactTitle: 'Conservation Impact & Water Savings',
    confidenceHigh: 'High Model Confidence',

    analyticsTitle: 'Comparative Water Analytics',
    analyticsSubtitle: 'AquaAI Precision Prescriptions vs Traditional 50% Flood Irrigation Baseline',
    aquaAiApproach: 'AquaAI Precision Irrigation',
    floodBaseline: 'Traditional Flood Baseline (50% loss)',
    savedWaterMetric: 'Water Saved Over 7 Days',
    pumpSavedHours: 'Pump Operational Hours Saved',

    solanaTitle: 'Solana Cryptographic Audit',
    solanaSubtitle: 'Tamper-proof verification of irrigation directives on Solana Devnet',
    fingerprintLabel: 'Cryptographic Fingerprint (SHA-256):',
    recordOnChainBtn: 'Record Proof on Solana',
    recordingInProgress: 'Broadcasting to Solana...',
    verifiedStatus: 'Verified On-Chain',
    viewExplorerBtn: 'View in Solana Explorer',
    verifyNowBtn: 'Verify via Solana RPC',

    subsidiesTitle: 'Government Subsidies & Water Credits',
    subsidiesSubtitle: 'Monetize verified water conservation under Central Asian water tariff policies',
    calcSavingsKzt: 'Estimated State Eco-Subsidy:',
    kztSubsidyAmount: 'KZT Savings Potential',
    waterCreditsEarned: 'Earned Water Conservation Credits',
    exportCertBtn: 'Download / Print Official Audit Certificate',
    certTitle: 'CERTIFICATE OF VERIFIED WATER CONSERVATION',
    certIssuedBy: 'Issued by AquaAI Hydrological Audit Engine',

    modalTitleNew: 'Create New Farm Profile',
    modalTitleEdit: 'Edit Farm Parameters',
    farmNameLabel: 'Farm / Field Name',
    locationPresetLabel: 'Agro-Ecological Zone',
    fieldSizeLabel: 'Field Size (Hectares)',
    cropTypeLabel: 'Crop Type',
    growthStageLabel: 'Growth Stage',
    irrigationMethodLabel: 'Irrigation Method',
    soilTypeLabel: 'Soil Type',
    pumpRateLabel: 'Pump Station Flow Rate (m³/hour)',
    cancelBtn: 'Cancel',
    saveFarmBtn: 'Save Farm Profile',

    cropCotton: 'Cotton',
    cropWheat: 'Wheat',
    cropRice: 'Rice',
    cropCorn: 'Corn',
    cropVegetables: 'Vegetables',

    stageInitial: 'Initial (Germination)',
    stageDevelopment: 'Vegetative Development',
    stageMidSeason: 'Mid-Season (Yield Formation)',
    stageLateSeason: 'Late-Season (Ripening)',

    soilSandyLoam: 'Sandy Loam',
    soilLoam: 'Loam',
    soilClayLoam: 'Clay Loam',
    soilSiltClay: 'Silt Clay',

    methodDrip: 'Drip Irrigation (90% Eff.)',
    methodSprinkler: 'Sprinkler / Center Pivot (75-80% Eff.)',
    methodFurrowFlood: 'Furrow / Earthen Flood (50% Eff.)',
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
    const saved = localStorage.getItem('aqua_ai_lang') as Language;
    if (saved && (saved === 'ru' || saved === 'kk' || saved === 'en')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('aqua_ai_lang', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);
