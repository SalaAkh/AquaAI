# 🌊 AquaAI — AI-Powered Smart Irrigation for Central Asia

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSalaAkh%2FAquaAI&root-directory=aqua-app)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/SalaAkh/AquaAI)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.0-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.3.0-61dafb?logo=react)](https://react.dev/)
[![Solana Devnet](https://img.shields.io/badge/Solana-Devnet-14F195?logo=solana)](https://solana.com/)

> **Colosseum Crypto World's Fair 2026 Hackathon MVP**  
> *Smarter Irrigation. Every Drop Counts. / Умный полив. Каждая капля на счету.*

AquaAI — это полнофункциональная климатическая веб-платформа (Full-Stack Climate Tech), созданная для предотвращения потерь воды в сельском хозяйстве Казахстана и бассейна Аральского моря.

---

## 🚀 Как развернуть сайт онлайн (Instant Online Deployment)

### Вариант 1: Развертывание в 1 клик на Vercel (Рекомендуется)
Нажмите на кнопку ниже, чтобы автоматически создать и запустить ваш онлайн сайт на Vercel бесплатно с SSL-сертификатом и глобальным CDN:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSalaAkh%2FAquaAI&root-directory=aqua-app)

* **Root Directory**: `aqua-app` (уже настроено в ссылке и в `vercel.json`)
* **Environment Variables** (опционально):
  * `GEMINI_API_KEY`: Google Gemini API ключ для адаптивного AI-агронома (если не указан, работает встроенный научный движок FAO-56).
  * `NEXT_PUBLIC_SOLANA_RPC`: `https://api.devnet.solana.com`

---

### Вариант 2: Бесплатное развертывание на Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/SalaAkh/AquaAI)

Конфигурационный файл `netlify.toml` уже включен в корень репозитория.

---

### Вариант 3: Локальный запуск (Local Development)

```bash
# Клонирование репозитория
git clone https://github.com/SalaAkh/AquaAI.git
cd AquaAI

# Установка зависимостей в приложении
cd aqua-app
npm install

# Запуск тестов гидрологических формул
npm test

# Запуск локального сервера разработки
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

---

### Вариант 4: Docker контейнер

```bash
docker build -t aqua-ai .
docker run -p 3000:3000 aqua-ai
```

---

## 🌟 Ключевые возможности проекта (Core Capabilities)

1. **Агрономический движок FAO-56 Penman-Monteith**:
   - Расчет водопотребления сельскохозяйственных культур ($ET_c = ET_0 \times K_c$).
   - Фильтрация эффективных осадков (USDA SCS / FAO method).
   - Точный объемный расчет ($1\text{ мм} \times 1\text{ га} = 10\text{ м}^3$).
   - Корректировка нормы полива с учетом эффективности оросительных систем (капельный, спринклерный, поверхностный полив).

2. **Интеграция с метеорологическими моделями Open-Meteo**:
   - 7-дневные прогнозы погоды высокого разрешения для Туркестана, Алматы и других агроэкологических зон Казахстана.
   - Отслеживание эталонного испарения ($ET_0$), дефицита давления пара (VPD) и солнечной радиации.

3. **Google Gemini AI Agronomic Advisor**:
   - Практические операционные рекомендации для фермеров на понятном языке.
   - Обоснованные гидрологические директивы без галлюцинаций.

4. **Криптографический аудит Solana Devnet**:
   - Неизменяемая фиксация рекомендаций по поливу в блокчейне Solana с помощью транзакций Solana Memo.
   - Верификация без раскрытия конфиденциальных персональных данных фермера.

5. **Интерактивные демо-профили хозяйств**:
   - Туркестанский хлопковый бассейн Арала (45 га).
   - Жетысуйская пшеничная равнина Алматы (120 га).
   - Возможность добавления собственных фермерских полей с индивидуальными культурами и почвами.

6. **Многоязычность**:
   - Казахский (Қазақша), русский и английский интерфейсы.

---

## 🏛️ Архитектура репозитория

```
AquaAI/
├── package.json               # Корневые прокси-скрипты (npm run dev/build/test)
├── vercel.json                # Конфигурация деплоя на Vercel
├── netlify.toml               # Конфигурация деплоя на Netlify
├── Dockerfile                 # Многостадийный production Docker образ
├── .github/workflows/ci.yml   # Автоматическое тестирование в GitHub Actions
└── aqua-app/                  # Полнофункциональное Next.js приложение
    ├── src/
    │   ├── app/               # Next.js App Router (страницы и API)
    │   ├── components/        # UI-компоненты (карточки, графики, модальные окна)
    │   └── lib/               # Гидрологический движок FAO-56, Solana, погода, i18n
    ├── tests/                 # Модульные тесты FAO-56 и E2E тесты
    └── package.json           # Зависимости Next.js, React, Tailwind, Solana Web3
```

---

## 💧 Экологическая миссия

В бассейне Аральского моря в Центральной Азии более 80% забора пресной воды расходуется на орошаемое земледелие. Традиционный поверхностный полив по земляным арыкам приводит к потерям до 50% воды из-за испарения и фильтрации. 

**AquaAI** предоставляет фермерам и ассоциациям водопользователей предиктивные, научно обоснованные расчеты полива, снижая избыточный забор воды на **30–45%** и сохраняя урожайность культур.
