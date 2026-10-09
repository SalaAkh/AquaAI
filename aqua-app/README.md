# AquaAI — Smart Irrigation Assistant for Central Asia

> **Colosseum Crypto World's Fair 2026 Hackathon MVP**  
> *Smarter Irrigation. Every Drop Counts.*

AquaAI is a production-quality, full-stack climate technology web application designed to combat agricultural water waste in Kazakhstan and the Aral Sea basin. It combines:
1. **FAO-56 Penman-Monteith Agronomic Engine**: Single crop coefficient model ($ET_c = ET_0 \times K_c$), effective rainfall filtering, application efficiency adjustment, and exact volumetric calculation ($1\text{ mm} \times 1\text{ ha} = 10\text{ m}^3$).
2. **Open-Meteo Live Numerical Weather Prediction**: High-resolution 7-day meteorological forecasts with reference evapotranspiration ($ET_0$), precipitation, solar radiation, and vapor pressure deficit tracking.
3. **Google Gemini AI Agronomic Advisor**: Practical, plain-language operational directives grounded strictly in scientific hydrology without hallucinated sensor observations.
4. **Solana Devnet Cryptographic Auditing**: Immutable verification of irrigation directives via Solana Memo transactions without exposing sensitive farmer metadata on-chain.
5. **Interactive Demo Farm Experience**: Out-of-the-box demo profiles for the Turkistan Aral Cotton Basin (45 ha) and the Almaty Zhetysu Wheat Plain (120 ha).

---

## Architecture Overview

```
AquaAI Architecture
├── /src/lib/types.ts           # Core TypeScript data contracts
├── /src/lib/constants.ts       # Central Asian agro-ecological zones & FAO-56 Kc values
├── /src/lib/fao56.ts           # FAO-56 Penman-Monteith calculation engine
├── /src/lib/weather.ts         # Open-Meteo live API client + realistic regional fallback
├── /src/lib/solana.ts          # Solana Devnet client, SHA-256 fingerprinting & Memo verification
├── /src/lib/storage.ts         # Local persistence for custom farms & audit history
├── /src/app/api/weather        # Live weather proxy endpoint with server caching
├── /src/app/api/ai/advisor     # Gemini-powered agronomic translation API route
├── /src/components/Navbar.tsx  # Responsive brand navbar, demo switcher & tab router
├── /src/components/LandingHero # Startup landing page with live agronomic preview
├── /src/components/Weather     # 7-day numerical weather & ET0 forecast visualizer
├── /src/components/Calculator  # FAO-56 water balance breakdown & 7-day prescriptive schedule
├── /src/components/AiAdvisor   # Grounded operational farmer guidance card
├── /src/components/Analytics   # Comparative water analytics (AquaAI vs 50% flood baseline)
├── /src/components/Solana      # Solana Devnet verification, memo broadcaster & RPC audit
└── /tests/fao56.test.mjs       # Unit tests verifying agricultural hydrology calculations
```

---

## Getting Started

### 1. Installation & Prerequisites
Ensure Node.js (v18+) is installed.

```bash
cd aqua-app
npm install
```

### 2. Environment Setup (Optional)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
- `GEMINI_API_KEY`: *(Optional)* If provided, connects to Google Gemini for real-time generative reasoning. If omitted, the application uses its built-in deterministic agronomist engine.
- `NEXT_PUBLIC_SOLANA_RPC`: Solana Devnet RPC endpoint (defaults to `https://api.devnet.solana.com`).

### 3. Running Unit Tests
```bash
npm test
```
Validates the conversion formulas:
- $1\text{ mm} \times 1\text{ ha} = 10\text{ m}^3$
- $ET_c = ET_0 \times K_c$
- USDA SCS / FAO effective rainfall bounds
- Application efficiency gross depth formulas

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Regional Context & Climate Challenge

In the Aral Sea basin of Central Asia, over 80% of freshwater withdrawals are dedicated to irrigated agriculture. Traditional unlined earthen canals and calendar-based furrow flooding lose up to 50% of water to deep percolation and evaporation. 

AquaAI provides farmers and water user associations with predictive, science-backed guidance on exactly **when** and **how much** water to apply, targeting a 30–45% reduction in wasted withdrawals while preserving crop yields.
