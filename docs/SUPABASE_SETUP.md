# AquaAI Supabase PostgreSQL Setup Guide

AquaAI incorporates an enterprise-grade cloud database layer using Supabase PostgreSQL with **Row Level Security (RLS)**.

---

## 1. Quick Overview

AquaAI operates in **dual-storage mode**:
1. **Cloud PostgreSQL Mode (Connected)**: Active when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are provided. All data is synchronized to Supabase with strict per-user RLS policies.
2. **Local Demo Mode (Zero Configuration)**: If Supabase keys are omitted, AquaAI operates with local state persistence in the browser. Registered accounts, farms, pump equipment, and actual irrigation events are preserved across page reloads without requiring any third-party credentials.

---

## 2. Setting Up Supabase (3 Simple Steps)

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Choose your region (e.g., Central EU or nearest to Central Asia).

### Step 2: Apply SQL Migrations
1. In the Supabase Dashboard, open the **SQL Editor**.
2. Open the file [`aqua-app/supabase/migrations/20261019_aqua_initial_schema.sql`](../aqua-app/supabase/migrations/20261019_aqua_initial_schema.sql).
3. Paste the contents into the SQL Editor and click **Run**.
4. The script will create:
   - `profiles` (User metadata & roles)
   - `farms` (Agricultural holdings)
   - `pump_profiles` (Irrigation pump specifications: flow rate m³/h, power kW, energy type)
   - `fields` (Fields, crops, soil types, irrigation methods)
   - `irrigation_events` (Flowmeter before/after, pump runtime, manual entries)
   - `irrigation_recommendations` (Computed FAO-56 histories)
   - `weather_snapshots` (Open-Meteo cache)
   - Row Level Security (RLS) policies protecting tenant isolation.

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env.local` in `aqua-app/`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key
```

Restart the dev server:
```bash
npm run dev
```

The header badge will immediately reflect **Cloud DB (Connected)**.

---

## 3. Security & Row Level Security (RLS) Guarantees

- **Zero Cross-Tenant Leakage**: Every table has `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`.
- **Policy Enforcement**: `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)` ensures farmers can never inspect or modify another farm's fields or water meters.
- **Service Keys Protected**: Only the public `ANON_KEY` is exposed to the frontend; administrative service roles are never bundled in client code.
