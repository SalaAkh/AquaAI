-- AquaAI PostgreSQL Schema for Supabase
-- Production schema with multi-tenant Row Level Security (RLS)
-- Supports users, farms, fields, pump_profiles, irrigation_events, recommendations, and weather snapshots

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'farmer' CHECK (role IN ('farmer', 'agronomist', 'admin', 'demo')),
  preferred_language TEXT DEFAULT 'ru' CHECK (preferred_language IN ('ru', 'kk', 'en')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. FARMS (Agricultural enterprises / holdings)
CREATE TABLE IF NOT EXISTS public.farms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location_name TEXT NOT NULL,
  region TEXT NOT NULL,
  country TEXT DEFAULT 'Kazakhstan' NOT NULL,
  latitude DOUBLE PRECISION NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
  longitude DOUBLE PRECISION NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
  is_demo BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. PUMP PROFILES (Irrigation equipment specifications)
CREATE TABLE IF NOT EXISTS public.pump_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  flow_rate_m3_h DOUBLE PRECISION NOT NULL CHECK (flow_rate_m3_h > 0),
  power_kw DOUBLE PRECISION DEFAULT 15.0 CHECK (power_kw > 0),
  energy_type TEXT DEFAULT 'electricity' CHECK (energy_type IN ('electricity', 'diesel', 'solar', 'gravity')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. FIELDS (Individual agricultural parcels)
CREATE TABLE IF NOT EXISTS public.fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pump_profile_id UUID REFERENCES public.pump_profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  area_hectares DOUBLE PRECISION NOT NULL CHECK (area_hectares > 0),
  crop_type TEXT NOT NULL CHECK (crop_type IN ('wheat', 'cotton', 'rice', 'corn', 'vegetables')),
  growth_stage TEXT NOT NULL CHECK (growth_stage IN ('initial', 'development', 'mid_season', 'late_season')),
  irrigation_method TEXT NOT NULL CHECK (irrigation_method IN ('drip', 'sprinkler', 'furrow_flood')),
  custom_efficiency DOUBLE PRECISION CHECK (custom_efficiency > 0 AND custom_efficiency <= 1.0),
  soil_type TEXT NOT NULL CHECK (soil_type IN ('sandy_loam', 'loam', 'clay_loam', 'silt_clay')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. IRRIGATION EVENTS (Water Usage Tracking)
CREATE TABLE IF NOT EXISTS public.irrigation_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  field_id UUID REFERENCES public.fields(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  event_time TEXT DEFAULT '06:00',
  actual_m3 DOUBLE PRECISION NOT NULL CHECK (actual_m3 >= 0 AND actual_m3 <= 1000000000),
  measurement_method TEXT NOT NULL CHECK (measurement_method IN ('meter_diff', 'pump_runtime', 'manual_source')),
  meter_before DOUBLE PRECISION,
  meter_after DOUBLE PRECISION,
  pump_flow_rate DOUBLE PRECISION,
  pump_hours DOUBLE PRECISION,
  pump_minutes DOUBLE PRECISION,
  source_tag TEXT NOT NULL DEFAULT 'flowmeter' CHECK (source_tag IN ('flowmeter', 'pump_calculated', 'channel_coupon', 'hydropost', 'manual_estimate')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. IRRIGATION RECOMMENDATIONS (Computed FAO-56 History)
CREATE TABLE IF NOT EXISTS public.irrigation_recommendations (
  id TEXT PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  field_id UUID REFERENCES public.fields(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calculated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  forecast_days INTEGER DEFAULT 7,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_etc_mm DOUBLE PRECISION NOT NULL,
  total_effective_rainfall_mm DOUBLE PRECISION NOT NULL,
  total_net_irrigation_mm DOUBLE PRECISION NOT NULL,
  total_gross_irrigation_mm DOUBLE PRECISION NOT NULL,
  total_volume_m3 DOUBLE PRECISION NOT NULL,
  baseline_total_volume_m3 DOUBLE PRECISION NOT NULL,
  potential_total_savings_m3 DOUBLE PRECISION NOT NULL,
  potential_savings_percentage DOUBLE PRECISION NOT NULL,
  primary_action TEXT NOT NULL CHECK (primary_action IN ('irrigate', 'skip', 'monitor')),
  recommended_window_summary TEXT,
  schedule_data JSONB NOT NULL,
  assumptions_data JSONB NOT NULL,
  limitations_data JSONB NOT NULL,
  ai_explanation JSONB
);

-- 7. WEATHER SNAPSHOTS (Open-Meteo Cached Forecasts)
CREATE TABLE IF NOT EXISTS public.weather_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('live', 'fallback')),
  forecast_data JSONB NOT NULL
);

-- =========================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE & FILTERING
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON public.farms(user_id);
CREATE INDEX IF NOT EXISTS idx_fields_farm_id ON public.fields(farm_id);
CREATE INDEX IF NOT EXISTS idx_fields_user_id ON public.fields(user_id);
CREATE INDEX IF NOT EXISTS idx_pump_profiles_farm_id ON public.pump_profiles(farm_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_events_farm_id ON public.irrigation_events(farm_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_events_field_id ON public.irrigation_events(field_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_events_user_id ON public.irrigation_events(user_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_events_date ON public.irrigation_events(event_date);
CREATE INDEX IF NOT EXISTS idx_recommendations_farm_id ON public.irrigation_recommendations(farm_id);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Zero cross-tenant data leaks: Each authenticated user sees ONLY their data
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pump_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_snapshots ENABLE ROW LEVEL SECURITY;

-- Profiles: user can only view and update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Farms
CREATE POLICY "Users can view own farms"
  ON public.farms FOR SELECT
  USING (auth.uid() = user_id OR is_demo = true);

CREATE POLICY "Users can insert own farms"
  ON public.farms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own farms"
  ON public.farms FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own farms"
  ON public.farms FOR DELETE
  USING (auth.uid() = user_id);

-- Fields
CREATE POLICY "Users can view own fields"
  ON public.fields FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fields"
  ON public.fields FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fields"
  ON public.fields FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own fields"
  ON public.fields FOR DELETE
  USING (auth.uid() = user_id);

-- Pump Profiles
CREATE POLICY "Users can view own pump profiles"
  ON public.pump_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pump profiles"
  ON public.pump_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pump profiles"
  ON public.pump_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own pump profiles"
  ON public.pump_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Irrigation Events
CREATE POLICY "Users can view own irrigation events"
  ON public.irrigation_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own irrigation events"
  ON public.irrigation_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own irrigation events"
  ON public.irrigation_events FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own irrigation events"
  ON public.irrigation_events FOR DELETE
  USING (auth.uid() = user_id);

-- Irrigation Recommendations
CREATE POLICY "Users can view own recommendations"
  ON public.irrigation_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations"
  ON public.irrigation_recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Weather Snapshots
CREATE POLICY "Users can view weather snapshots for own farms"
  ON public.weather_snapshots FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.farms WHERE farms.id = weather_snapshots.farm_id AND (farms.user_id = auth.uid() OR farms.is_demo = true)
  ));

CREATE POLICY "Users can insert weather snapshots for own farms"
  ON public.weather_snapshots FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.farms WHERE farms.id = weather_snapshots.farm_id AND farms.user_id = auth.uid()
  ));

-- =========================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, preferred_language)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'ru')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
