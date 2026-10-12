# 🎬 Сценарии видео для подачи AquaAI на Colosseum Hackathon & Accelerator

> **Дедлайн подачи**: 12 октября, 23:59 PDT  
> **Проект**: [AquaAI](https://colosseum.com/arena/projects/aquaai)  
> **Рекомендуемые сервисы**: Loom, YouTube (Unlisted), Vimeo  
> **Язык видео**: Для Colosseum рекомендуется английский язык (основной язык судейства). Ниже представлены готовые тексты на **английском** и **русском** языках.

---

## 📌 ВИДЕО 1: PRODUCT DEMO (Демонстрация живого продукта)
* **Максимальная длительность**: **до 3 минут** (целевой хронометраж: **2:40 – 2:50**).
* **Требование Colosseum**: *«Should show the live product, not a slide deck, not a code walkthrough»* (строго показ живого работающего приложения, без слайдов и без кода).
* **Формат**: Запись экрана (с веб-камерой спикера в кружке Loom или чистый скрин-рекординг).

### План тайминга и действий:
| Время | Экран / Блок интерфейса | Действие мышью / на экране | Текст и фокус внимания |
| :--- | :--- | :--- | :--- |
| **0:00 – 0:25** | Главный экран / Hero Banner | Открыть сайт, скролл к шапке поля Туркестана (45 га) | **Боль Аральского моря и суть AquaAI** |
| **0:25 – 0:55** | Open-Meteo виджет + FAO-56 расчёт | Показать $ET_0$, дефицит влаги, перевод мм в $м^3$, экономию 38% | **Научный гидрологический движок** |
| **0:55 – 1:25** | Sentinel-2 NDVI + IoT датчики | Показать NDVI (0.72), нажать «Калибровка Kc», показать датчики влажности 20-40-60 см | **Спутниковая телеметрия и IoT-почва** |
| **1:25 – 1:55** | Google Gemini AI Advisor | Показать умные советы (ночной полив), задать вопрос в чат, показать мультиязычность (KZ/RU/EN) | **Оперативный ИИ-агроном** |
| **1:55 – 2:25** | Solana Verifier & Водные субсидии | Показать SHA-256 хеш, нажать «Commit to Solana Devnet», показать ссылку на Solana Explorer, открыть сертификат субсидий | **Неизменяемый аудит на Solana и субсидии** |
| **2:25 – 2:45** | Графики Water Analytics & Финал | Показать графики сбережения воды и денег, финальный призыв | **Итог и экологический импакт** |

---

### Текст сценария Demo Video (Word-for-Word)

#### 🔹 [0:00 – 0:25] The Hook & Overview
* **На экране**: Открыт сайт AquaAI. Курсор плавно указывает на логотип и карточку Туркестанского хлопкового поля (45 га).
* **English**:
  > *"Welcome to AquaAI. In Central Asia’s Aral Sea basin, over 80% of all freshwater is consumed by agriculture, and up to half of that is lost to unlined earthen ditches and unoptimized flood irrigation. AquaAI is an autonomous, AI-driven precision irrigation and on-chain verification platform on Solana. Today, I'll walk you through our live application."*
* **Русский**:
  > *«Добро пожаловать в AquaAI. В бассейне Аральского моря более 80% пресной воды уходит на полив, и до половины теряется в арыках из-за поверхностного испарения. AquaAI — это интеллектуальная платформа точного орошения с криптографическим аудитом на Solana. Давайте посмотрим на живой продукт в действии.»*

---

#### 🔹 [0:25 – 0:55] Live Weather & FAO-56 Agronomic Core
* **На экране**: Скролл к блоку прогноза Open-Meteo. Наводим курсор на показатели $ET_0$, температуру, влажность и карточку «Рекомендация по поливу».
* **English**:
  > *"Here on the dashboard, we have our active farm in Turkistan — 45 hectares of cotton. AquaAI automatically connects to the Open-Meteo numerical weather model, pulling 7-day evapotranspiration ($ET_0$), vapor pressure deficit, and rainfall.  
  > Our agronomic core implements the rigorous United Nations FAO-56 Penman-Monteith equation. It filters effective precipitation and dynamically calculates the exact crop water demand: converting millimeters into cubic meters adjusted for drip system efficiency. Rather than flooding by calendar, the farmer saves thirty-eight percent of water this week alone."*
* **Русский**:
  > *«На панели активно демонстрационное поле в Туркестане — 45 гектаров хлопчатника. AquaAI в реальном времени получает данные Open-Meteo: эталонное испарение $ET_0$, дефицит упругости пара и осадки.  
  > Наш движок реализует методику ООН FAO-56 Пенмана-Монтейса. Система отсекает неэффективные осадки и точно переводит миллиметры дефицита влаги в кубические метры с учетом КПД капельного орошения. Экономия составляет 38% по сравнению с обычным затоплением.»*

---

#### 🔹 [0:55 – 1:25] Satellite Sentinel-2 NDVI & Ground IoT Sensors
* **На экране**: Переходим в карточку Sentinel-2 NDVI. Показываем индекс 0.72. Кликаем «Применить калибровку Kc». Затем показываем карточку датчиков влажности почвы (20 см, 40 см, 60 см).
* **English**:
  > *"Next, we fuse spaceborne imagery with ground truth. Our Sentinel-2 satellite module tracks the NDVI vegetative index across the canopy. When we detect biomass changes, a single click calibrates the crop coefficient $K_c$, instantly adjusting the irrigation curve.  
  > Below, we cross-validate this with multi-depth IoT soil moisture probes at 20, 40, and 60 centimeters, ensuring irrigation occurs strictly when the root zone demands it."*
* **Русский**:
  > *«Далее мы объединяем спутниковые данные с датчиками на земле. Модуль Sentinel-2 отслеживает индекс вегетации NDVI. Если индекс меняется, один клик калибрует коэффициент культуры $K_c$, моментально пересчитывая график полива.  
  > Ниже мы верифицируем это телеметрией IoT-датчиков влажности почвы на глубине 20, 40 и 60 см, гарантируя полив строго в корнеобитаемом слое.»*

---

#### 🔹 [1:25 – 1:55] Google Gemini AI Agronomist
* **На экране**: Карточка «AI-Агроном Google Gemini». Кликаем «Обновить совет» / вводим короткий вопрос в чат («Какое время оптимально для полива?»). Показываем переключение языка в шапке (EN/RU/KZ).
* **English**:
  > *"To make this operational for local farmers, Google Gemini powers our AI Hydrologist. It synthesizes weather forecasts, soil salinity, and irrigation physics into clear tactical directives — such as running pumps between 10 PM and 4 AM to prevent evaporative flash, cutting energy tariffs. It also features interactive chat and full trilingual localization in Kazakh, Russian, and English."*
* **Русский**:
  > *«Чтобы инструкции были понятны фермеру, Google Gemini выступает в роли цифрового агронома. ИИ анализирует погоду и физику почвы, выдавая практические советы: например, включение насосов с 22:00 до 04:00 для снижения испарения и экономии на ночном тарифе электроэнергии. Доступен интерактивный чат и полная локализация на казахском, русском и английском.»*

---

#### 🔹 [1:55 – 2:25] Solana Devnet Verification & Green Subsidies
* **На экране**: Карточка Solana Verifier. Показываем сгенерированный SHA-256 хеш. Нажимаем кнопку **«Зафиксировать в Solana Devnet»**. Ждем появление зеленого бейджа «Verified on Solana», кликаем по ссылке в **Solana Explorer**. Затем прокручиваем к блоку «Водные субсидии».
* **English**:
  > *"Here is where Solana changes the game. Historically, regional water subsidies and ESG reporting are plagued by paper fraud. AquaAI cryptographically hashes every irrigation recommendation using SHA-256.  
  > When the farmer commits the schedule, we publish a lightweight proof directly onto Solana Devnet via the Solana Memo Program. Within seconds, it’s immutably confirmed on-chain. Governments and climate funds can verify water conservation without exposing sensitive GPS coordinates. In our Subsidies module, this automatically calculates verified green subsidies and water credits."*
* **Русский**:
  > *«А здесь ключевая роль блокчейна Solana. Традиционно водные субсидии страдают от бумажных приписок. AquaAI генерирует криптографический SHA-256 хеш каждой рекомендации.  
  > При фиксации мы отправляем транзакцию в Solana Devnet через Solana Memo Program. За секунды транзакция подтверждается в сети. Государство и климатические фонды могут верифицировать сбережение воды без раскрытия приватных координат поля. Это формирует базу для прозрачных 'зеленых' субсидий и водных кредитов.»*

---

#### 🔹 [2:25 – 2:45] Impact & Closing Call to Action
* **На экране**: Показываем графики экономии воды (Water Analytics Chart), итоговую цифру сбереженных кубометров воды.
* **English**:
  > *"In just one week on this farm, AquaAI saves over 8,000 cubic meters of water. By combining scientific agronomy, AI, and Solana's fast, low-cost rails, we turn every drop into verifiable ecological impact.  
  > Thank you for exploring AquaAI at the Crypto World's Fair!"*
* **Русский**:
  > *«Только за одну неделю на одном хозяйстве AquaAI сберегает более 8 000 кубометров воды. Объединяя научную гидрологию, ИИ и дешевые транзакции Solana, мы делаем спасение Аральского бассейна измеримым и проверяемым. Спасибо за внимание!»*

---

## 📌 ВИДЕО 2: FOUNDER PITCH (Питч для Акселератора Colosseum)
* **Максимальная длительность**: **до 2 минут** (целевой хронометраж: **1:30 – 1:45**).
* **Требование Colosseum**: *«Separate from the demo video — introduce yourselves, tell us what you're building, and tell us why you're the people to build it. Nothing fancy required. We're interested in how you think and communicate.»* (Личное видео фаундера, фокус на ясности мысли, понимании рынка и мотивации).
* **Формат**: Съемка основателя лицом в камеру (смартфон / веб-камера с хорошим светом) или свернутый экран ноутбука позади.

### Структура питча (3 обязательных вопроса Colosseum):
1. **Who you are & The Problem** (0:00 – 0:35): Кто вы, локация и масштаб боли в Центральной Азии.
2. **What you are building & Why Solana** (0:35 – 1:15): Суть продукта и почему блокчейн Solana здесь критически необходим.
3. **Why you are the people to build it & Accelerator Goal** (1:15 – 1:45): Почему именно вы, скорость реализации и цель в акселераторе.

---

### Текст сценария Pitch Video (Word-for-Word)

#### 🔹 [0:00 – 0:35] Introduction & The Crisis
* **Кадр**: Спикер смотрит прямо в камеру, уверенный тон, живая подача.
* **English**:
  > *"Hi Colosseum team and judges! My name is Salah, and I am the founder of AquaAI.  
  > Central Asia is currently facing one of the most critical environmental emergencies on the planet: the depletion of the Aral Sea basin. Agriculture here consumes more than eighty percent of all freshwater, and because farmers still rely on Soviet-era flood irrigation, half of that water literally evaporates into thin air. We don't have decades to solve this — climate stress is compounding every single season."*
* **Русский**:
  > *«Привет команде Colosseum и судьям! Меня зовут Салах, я основатель AquaAI.  
  > Центральная Азия сегодня переживает одну из самых острых экологических катастроф на планете — высыхание Аральского бассейна. Сельское хозяйство потребляет свыше 80% пресной воды, и из-за устаревшего арычного полива половина этой воды просто испаряется в воздух. У нас нет десятилетий на ожидание — климатический кризис нарастает с каждым сезоном.»*

---

#### 🔹 [0:35 – 1:15] What We’re Building & Why Solana
* **English**:
  > *"We built AquaAI to turn agricultural water management from guesswork into an exact, verifiable science.  
  > AquaAI combines UN FAO-56 hydrological modeling, live Open-Meteo forecasts, and Sentinel-2 satellite telemetry with Google Gemini to give farmers daily, precision irrigation schedules.  
  > But calculation is only half the battle. Governments and international climate funds allocate millions of dollars in water subsidies, but there is zero tamper-proof verification. With Solana’s sub-second finality and negligible transaction costs, we notarize every irrigation recommendation and water-saving event on-chain via Solana Memo. Solana serves as the trustless settlement layer for transparent green water subsidies and future DePIN water-credit markets."*
* **Русский**:
  > *«Мы создали AquaAI, чтобы превратить полив из слепого метода в точную, верифицируемую науку.  
  > AquaAI объединяет гидрологическую физику FAO-56, метеопрогнозы Open-Meteo, спутники Sentinel-2 и искусственный интеллект Gemini, предоставляя фермеру точнейшие суточные директивы.  
  > Но рассчитать воду — это лишь полдела. Государства и климатические фонды выделяют миллионы на водные субсидии, но контроль ведется на бумаге. Благодаря субсекундной скорости и копеечным комиссиям Solana, мы фиксируем каждую рекомендацию и факт экономии воды в блокчейне. Solana становится неизменяемым слоем доверия для 'зеленых' субсидий и будущих рынков DePIN-водных кредитов.»*

---

#### 🔹 [1:15 – 1:45] Why Us & The Colosseum Accelerator
* **English**:
  > *"Why are we the team to build this?  
  > We have roots directly in Central Asia. We understand the physical geography of the Syr Darya and Amu Darya river basins, the regulatory landscape of regional water ministries, and the operational pain points of local farmers. Technically, we ship fast: our full-stack platform, agronomic engine, and Solana Devnet integration are fully functional today.  
  > We are applying to the Colosseum Accelerator because we want to transition from this working MVP to deploying live pilots across 10,000 hectares in Southern Kazakhstan and Uzbekistan, integrate DePIN smart water flow meters, and build Solana's flagship climate-tech protocol.  
  > Thank you, and we'd love to join the Colosseum cohort!"*
* **Русский**:
  > *«Почему именно мы способны это реализовать?  
  > Мы родом из Центральной Азии. Мы детально знаем специфику речных бассейнов Сырдарьи и Амударьи, требования министерств водных ресурсов и реальные проблемы фермеров. С технической стороны мы работаем быстро: готовый веб-продукт, агрономический движок и смарт-контракты Solana Devnet работают уже сейчас.  
  > Мы подаем заявку в Colosseum Accelerator, чтобы масштабировать рабочий MVP в пилот на 10 000 гектаров в Южном Казахстане и Узбекистане, интегрировать аппаратные DePIN счетчики расхода воды и создать главный климатический протокол на Solana.  
  > Спасибо за внимание, будем рады встрече в акселераторе Colosseum!»*

---

## ⚡ Чек-лист перед отправкой формы в Colosseum:
1. Загрузить оба видео на **YouTube** (выбрать доступ **«Unlisted» / По ссылке**) или в **Loom**.
2. Проверить, что ссылка открывается в режиме инкогнито без логина.
3. Вставить ссылки в соответствующие поля в форме:
   * Поле 1: *«Please submit a demo video of your product*»* ➔ Ссылка на Demo (до 3 мин).
   * Поле 2: *«Pitch video* Public»* ➔ Ссылка на Pitch (до 2 мин).
4. Убедиться, что ссылка на GitHub указывает на актуальный публичный репозиторий [SalaAkh/AquaAI](https://github.com/SalaAkh/AquaAI).
