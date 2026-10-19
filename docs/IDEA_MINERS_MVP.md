# IDEA MINERS 2026 — AquaAI MVP

## Changes in this branch
- Working Next.js API routes under `src/app/api/` and SSR-capable configuration.
- Server-only Gemini credentials; when unavailable, transparent rule-based guidance.
- Demonstration Solana sponsorship disabled by default; never reuse exposed credentials from history.
- Water demand logic no longer skips irrigation solely on a 5 mm rain forecast.
- Modelled savings labels are clearly distinct from measured consumption and official subsidies.
- Local first irrigation journal: farm, date, actual water volume, measurement source, notes, history.

## Run locally
```bash
cd aqua-app
npm ci
npm test
npm run build
npm run dev
```

## Secrets
Use `aqua-app/.env.local` (never commit it) for server `GEMINI_API_KEY`. Optional sponsored Solana transaction API requires BOTH `SOLANA_SPONSOR_SECRET_KEY` and `SOLANA_SPONSOR_ACCESS_TOKEN`, and a funded Devnet address. Default browser UI uses a normal wallet or temporary demo Devnet wallet. Revoke and rotate all secrets previously committed in repository history.

## Cautions
- Satellite NDVI and IoT moisture are simulated. Weather has a clearly marked synthetic fallback.
- The journal uses `localStorage`; do not rely on it for official or multi-device records.
- The 'potential saving' calculation compares modelled irrigation efficiency scenarios, not pre/post recorded consumption.
- This branch has not undergone field validation, browser E2E tests or external deployment verification.
