# AquaAI — постоянный публичный сайт (24/7)

## Рекомендуемый хостинг: Vercel (Next.js SSR)

**Текущее состояние репозитория не означает, что сайт уже опубликован.**
Для реального запуска нужно связать GitHub с аккаунтом Vercel один раз.
После успешного первого deploy проект получает постоянный адрес `https://<project>.vercel.app`.
Не используйте временный `loca.lt`-туннель, GitHub Pages или чистый Firebase static Hosting для этого SSR-приложения.

### 1. Подключите существующий репозиторий

1. Откройте https://vercel.com/new и войдите в свой аккаунт.
2. Выберите **Import Git Repository** → **SalaAkh/AquaAI** (не создавайте новый fork).
3. **Root Directory: `aqua-app` — ОБЯЗАТЕЛЬНО**. Файл `package.json` с Next.js находится именно там.
4. **Framework Preset: Next.js**.
5. **Production Branch: `main`**.
6. **Build Command: `npm run build`** (default).
7. **Install Command: `npm ci`** (default).
8. **Output Directory: framework default** (не вписывайте `aqua-app/.next`).
9. Нажмите **Deploy**. Дождитесь состояния `Ready`.

**Важно:** репозиторий также содержит старый корневой `vercel.json`, рассчитанный на нестандартную сборку от корня. Если проект Vercel создан с `Root Directory = aqua-app`, используйте именно эту настройку; конфигурация приложения находится в `aqua-app/vercel.json`.

### 2. Переменные окружения

Vercel Project → Settings → Environment Variables.

Для **демонстрационного режима** (без облачных аккаунтов и AI) переменные не обязательны.

Для полнофункционального облачного режима:

- `NEXT_PUBLIC_SUPABASE_URL` — URL действующего проекта Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — публичный ключ Supabase. В Supabase должны быть применены SQL migrations и включен RLS (см. `docs/SUPABASE_SETUP.md`).
- `GEMINI_API_KEY` — необязательный серверный ключ Gemini для объяснений.

После добавления/изменения переменных окружения запустите **Redeploy**.
Не добавляйте секреты в GitHub/README; не используйте `NEXT_PUBLIC_` для Gemini API key или Solana secret key.

### 3. Проверка реальной публикации

Замените `<host>` на домен, который действительно выдаст Vercel:

```bash
curl --fail -i https://<host>/api/health
curl --fail -I https://<host>/
curl --fail 'https://<host>/api/weather?lat=43.3015&lon=68.2723'
```

- Health должен вернуть `200` и JSON с `"status":"ok","service":"aqua-ai"`.
- Главная страница должна открываться без логина в Vercel; если возвращает 401/403, проверьте Deployment Protection.
- Погодный endpoint может показать `source: "fallback"` при недоступности Open-Meteo; это **не** подтверждение доступа к живой погоде.
- Протестируйте создание поля, расчёт, запись полива, AI fallback и мобильный интерфейс.

### 4. Автоматические обновления

При соединении Vercel с `SalaAkh/AquaAI` коммиты в `main` запускают production deployment, а изменения из PR могут публиковаться в preview окружении. Новый код не нужно вручную копировать на сервер.

### 5. Мониторинг доступности

В GitHub: Settings → Secrets and variables → Actions → **Variables** → New repository variable:

- Name: `AQUA_PRODUCTION_URL`
- Value: фактический production адрес, например `https://<host>`, **без** `/api/health`.

После этого workflow `.github/workflows/production-uptime.yml` проверяет главную страницу и `/api/health` два раза в час и завершается с ошибкой, если сайт недоступен. Следите за уведомлениями GitHub Actions. Это диагностика, **не гарантия 100% uptime**. GitHub может задерживать scheduled workflows. Если нужен внешний мониторинг и оперативные уведомления, подключите сервис мониторинга отдельно.

### 6. Ограничения бесплатных тарифов

- **Vercel Hobby** подходит для личного некоммерческого прототипа, но запрещён для коммерческого использования. Для настоящего платного стартапа рассмотрите **Vercel Pro**.
- **Supabase Free** может приостановить базу при недостаточной активности в течение 7 дней. Для базы без автоматической приостановки нужен платный план.
- Платформы могут иметь технические сбои и лимиты — обещание абсолютной 24/7 доступности невозможно.
- `/api/health` проверяет доступность Next.js, **не** исправность Supabase, Gemini или Open-Meteo.

### 7. Свой домен (по желанию)

Vercel Project → Settings → Domains → Add Domain. Следуйте конкретным DNS записям, которые покажет Vercel. SSL сертификат для прикреплённого домена настраивается хостингом.

## Definition of Done

- [ ] Vercel связан с `SalaAkh/AquaAI`, Root Directory = `aqua-app`.
- [ ] Production deployment имеет статус `Ready`.
- [ ] HTTPS URL проверен снаружи, без защиты от публичного доступа.
- [ ] `GET /api/health` возвращает 200 и корректный JSON.
- [ ] Главный экран и основные API работают снаружи.
- [ ] `AQUA_PRODUCTION_URL` добавлена в GitHub Actions Variables.
- [ ] Scheduled monitoring успешен.
- [ ] Условия тарифа хостинга и доступности базы данных соответствуют стадии проекта.
