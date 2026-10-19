import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import {
  FarmProfile,
  FieldProfile,
  PumpProfile,
  IrrigationEntry,
  IrrigationRecommendation,
  EconomicTariffs,
} from './types';
import { DEMO_FARM_TURKISTAN, DEMO_FARM_ALMATY } from './constants';

const LOCAL_KEY_FARMS = 'aqua_farms_v2';
const LOCAL_KEY_ACTIVE_FARM = 'aqua_active_farm_id_v2';
const LOCAL_KEY_FIELDS = 'aqua_fields_v2';
const LOCAL_KEY_PUMPS = 'aqua_pumps_v2';
const LOCAL_KEY_EVENTS = 'aqua_irrigation_events_v2';
const LOCAL_KEY_RECOMMENDATIONS = 'aqua_recommendations_v2';
const LOCAL_KEY_TARIFFS = 'aqua_tariffs_v2';

export const DEFAULT_TARIFFS: EconomicTariffs = {
  waterPricePerM3: 25, // 25 KZT per m³ (average subsidized irrigation tariff in South Kazakhstan)
  electricityPricePerKwh: 28, // 28 KZT per kWh
  dieselPricePerLiter: 350, // 350 KZT per L
  currency: 'KZT',
};

export const INITIAL_DEMO_PUMPS: PumpProfile[] = [
  {
    id: 'pump-turkistan-main',
    farmId: DEMO_FARM_TURKISTAN.id,
    name: 'ЭЦВ-8 Насосная станция №1',
    flowRateM3H: 45.0,
    powerKw: 18.5,
    energyType: 'electricity',
    notes: 'Основной глубинный насос скважины, напор 45 м',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pump-almaty-drip',
    farmId: DEMO_FARM_ALMATY.id,
    name: 'Дизель-насос Rovatti TK-65',
    flowRateM3H: 30.0,
    powerKw: 15.0,
    energyType: 'diesel',
    notes: 'Дизельный агрегат для капельного блока',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_DEMO_EVENTS: IrrigationEntry[] = [
  {
    id: 'event-demo-1',
    farmId: DEMO_FARM_TURKISTAN.id,
    date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
    time: '06:00',
    actualM3: 270,
    method: 'meter_diff',
    sourceTag: 'meter',
    meterBefore: 12450,
    meterAfter: 12720,
    notes: 'Утренний полив по расходомеру скважины. Напор в норме.',
    savedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'event-demo-2',
    farmId: DEMO_FARM_TURKISTAN.id,
    date: new Date(Date.now() - 86400000 * 1).toISOString().slice(0, 10),
    time: '05:30',
    actualM3: 225,
    method: 'pump_runtime',
    sourceTag: 'pump_estimate',
    pumpFlowRate: 45,
    pumpHours: 5,
    pumpMinutes: 0,
    notes: 'Работа насоса 5 часов при паспортной подаче 45 м³/ч.',
    savedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

// =========================================================================
// FARMS CRUD
// =========================================================================

export async function getFarms(userId?: string): Promise<FarmProfile[]> {
  const supabase = getSupabaseClient();
  if (supabase && userId) {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((row) => ({
          id: row.id,
          name: row.name,
          locationId: 'custom-loc',
          locationName: row.location_name,
          region: row.region,
          latitude: row.latitude,
          longitude: row.longitude,
          fieldSizeHectares: 45, // default if not specified
          cropType: 'cotton',
          growthStage: 'mid_season',
          irrigationMethod: 'drip',
          soilType: 'clay_loam',
          isDemo: row.is_demo,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
      }
    } catch (e) {
      console.warn('Supabase fetch farms error, fallback to local:', e);
    }
  }

  // Local storage fallback
  if (typeof window === 'undefined') {
    return [DEMO_FARM_TURKISTAN, DEMO_FARM_ALMATY];
  }
  try {
    const raw = localStorage.getItem(LOCAL_KEY_FARMS);
    if (!raw) {
      const initial = [DEMO_FARM_TURKISTAN, DEMO_FARM_ALMATY];
      localStorage.setItem(LOCAL_KEY_FARMS, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEMO_FARM_TURKISTAN, DEMO_FARM_ALMATY];
  } catch {
    return [DEMO_FARM_TURKISTAN, DEMO_FARM_ALMATY];
  }
}

export async function saveFarm(farm: FarmProfile, userId?: string): Promise<FarmProfile[]> {
  const supabase = getSupabaseClient();
  if (supabase && userId) {
    try {
      await supabase.from('farms').upsert({
        id: farm.id.startsWith('farm-') ? undefined : farm.id,
        user_id: userId,
        name: farm.name,
        location_name: farm.locationName,
        region: farm.region,
        latitude: farm.latitude,
        longitude: farm.longitude,
        is_demo: Boolean(farm.isDemo),
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Supabase upsert farm error, saving locally:', e);
    }
  }

  if (typeof window === 'undefined') return [];
  const farms = await getFarms();
  const index = farms.findIndex((f) => f.id === farm.id);
  let updated: FarmProfile[];
  if (index >= 0) {
    updated = [...farms];
    updated[index] = { ...farm, updatedAt: new Date().toISOString() };
  } else {
    updated = [farm, ...farms];
  }
  localStorage.setItem(LOCAL_KEY_FARMS, JSON.stringify(updated));
  setActiveFarmIdLocal(farm.id);
  return updated;
}

export async function deleteFarm(farmId: string, userId?: string): Promise<FarmProfile[]> {
  const supabase = getSupabaseClient();
  if (supabase && userId) {
    try {
      await supabase.from('farms').delete().eq('id', farmId);
    } catch (e) {
      console.warn('Supabase delete farm error:', e);
    }
  }

  if (typeof window === 'undefined') return [];
  const farms = (await getFarms()).filter((f) => f.id !== farmId);
  const finalFarms = farms.length > 0 ? farms : [DEMO_FARM_TURKISTAN];
  localStorage.setItem(LOCAL_KEY_FARMS, JSON.stringify(finalFarms));
  if (getActiveFarmIdLocal() === farmId) {
    setActiveFarmIdLocal(finalFarms[0].id);
  }
  return finalFarms;
}

export function getActiveFarmIdLocal(): string {
  if (typeof window === 'undefined') return DEMO_FARM_TURKISTAN.id;
  return localStorage.getItem(LOCAL_KEY_ACTIVE_FARM) || DEMO_FARM_TURKISTAN.id;
}

export function setActiveFarmIdLocal(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_KEY_ACTIVE_FARM, id);
}

// =========================================================================
// PUMP PROFILES CRUD
// =========================================================================

export async function getPumpProfiles(farmId: string): Promise<PumpProfile[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('pump_profiles')
        .select('*')
        .eq('farm_id', farmId)
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map((row) => ({
          id: row.id,
          farmId: row.farm_id,
          userId: row.user_id,
          name: row.name,
          flowRateM3H: row.flow_rate_m3_h,
          powerKw: row.power_kw,
          energyType: row.energy_type,
          notes: row.notes,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
      }
    } catch (e) {
      console.warn('Supabase get pump profiles error:', e);
    }
  }

  if (typeof window === 'undefined') return INITIAL_DEMO_PUMPS.filter((p) => p.farmId === farmId);
  try {
    const raw = localStorage.getItem(LOCAL_KEY_PUMPS);
    if (!raw) {
      localStorage.setItem(LOCAL_KEY_PUMPS, JSON.stringify(INITIAL_DEMO_PUMPS));
      return INITIAL_DEMO_PUMPS.filter((p) => p.farmId === farmId);
    }
    const allPumps: PumpProfile[] = JSON.parse(raw);
    const farmPumps = allPumps.filter((p) => p.farmId === farmId);
    if (farmPumps.length === 0 && farmId === DEMO_FARM_TURKISTAN.id) {
      return INITIAL_DEMO_PUMPS.filter((p) => p.farmId === farmId);
    }
    return farmPumps;
  } catch {
    return INITIAL_DEMO_PUMPS.filter((p) => p.farmId === farmId);
  }
}

export async function savePumpProfile(pump: PumpProfile, userId?: string): Promise<PumpProfile> {
  const supabase = getSupabaseClient();
  if (supabase && userId) {
    try {
      const { data } = await supabase
        .from('pump_profiles')
        .upsert({
          id: pump.id.startsWith('pump-') ? undefined : pump.id,
          farm_id: pump.farmId,
          user_id: userId,
          name: pump.name,
          flow_rate_m3_h: pump.flowRateM3H,
          power_kw: pump.powerKw,
          energy_type: pump.energyType,
          notes: pump.notes,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (data) {
        return {
          id: data.id,
          farmId: data.farm_id,
          userId: data.user_id,
          name: data.name,
          flowRateM3H: data.flow_rate_m3_h,
          powerKw: data.power_kw,
          energyType: data.energy_type,
          notes: data.notes,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch (e) {
      console.warn('Supabase save pump profile error:', e);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_KEY_PUMPS);
      const all: PumpProfile[] = raw ? JSON.parse(raw) : [...INITIAL_DEMO_PUMPS];
      const idx = all.findIndex((p) => p.id === pump.id);
      if (idx >= 0) {
        all[idx] = { ...pump, updatedAt: new Date().toISOString() };
      } else {
        all.unshift(pump);
      }
      localStorage.setItem(LOCAL_KEY_PUMPS, JSON.stringify(all));
    } catch (err) {
      console.error('Local pump save failed:', err);
    }
  }
  return pump;
}

export async function deletePumpProfile(pumpId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('pump_profiles').delete().eq('id', pumpId);
    } catch (e) {
      console.warn('Supabase delete pump error:', e);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_KEY_PUMPS);
      const all: PumpProfile[] = raw ? JSON.parse(raw) : [...INITIAL_DEMO_PUMPS];
      const filtered = all.filter((p) => p.id !== pumpId);
      localStorage.setItem(LOCAL_KEY_PUMPS, JSON.stringify(filtered));
    } catch (err) {
      console.error('Local pump delete failed:', err);
    }
  }
}

// =========================================================================
// IRRIGATION EVENTS (WATER USAGE TRACKING)
// =========================================================================

export async function getIrrigationEvents(farmId: string): Promise<IrrigationEntry[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('irrigation_events')
        .select('*')
        .eq('farm_id', farmId)
        .order('event_date', { ascending: false });
      if (!error && data) {
        return data.map((row) => ({
          id: row.id,
          farmId: row.farm_id,
          fieldId: row.field_id,
          userId: row.user_id,
          date: row.event_date,
          time: row.event_time,
          actualM3: row.actual_m3,
          method: row.measurement_method,
          sourceTag: row.source_tag === 'flowmeter' ? 'meter' : row.source_tag,
          meterBefore: row.meter_before,
          meterAfter: row.meter_after,
          pumpFlowRate: row.pump_flow_rate,
          pumpHours: row.pump_hours,
          pumpMinutes: row.pump_minutes,
          notes: row.notes || '',
          savedAt: row.created_at,
          updatedAt: row.updated_at,
        }));
      }
    } catch (e) {
      console.warn('Supabase fetch events error:', e);
    }
  }

  // Local storage fallback
  if (typeof window === 'undefined') return INITIAL_DEMO_EVENTS.filter((e) => e.farmId === farmId);
  try {
    const raw = localStorage.getItem(LOCAL_KEY_EVENTS);
    if (!raw) {
      localStorage.setItem(LOCAL_KEY_EVENTS, JSON.stringify(INITIAL_DEMO_EVENTS));
      return INITIAL_DEMO_EVENTS.filter((e) => e.farmId === farmId);
    }
    const all: IrrigationEntry[] = JSON.parse(raw);
    const farmEvents = all.filter((e) => e.farmId === farmId);
    if (farmEvents.length === 0 && farmId === DEMO_FARM_TURKISTAN.id) {
      return INITIAL_DEMO_EVENTS.filter((e) => e.farmId === farmId);
    }
    return farmEvents.sort((a, b) => b.date.localeCompare(a.date) || b.savedAt.localeCompare(a.savedAt));
  } catch {
    return INITIAL_DEMO_EVENTS.filter((e) => e.farmId === farmId);
  }
}

export async function saveIrrigationEvent(event: IrrigationEntry, userId?: string): Promise<IrrigationEntry[]> {
  const supabase = getSupabaseClient();
  if (supabase && userId) {
    try {
      await supabase.from('irrigation_events').upsert({
        id: event.id.startsWith('event-') ? undefined : event.id,
        farm_id: event.farmId,
        field_id: event.fieldId,
        user_id: userId,
        event_date: event.date,
        event_time: event.time || '06:00',
        actual_m3: event.actualM3,
        measurement_method: event.method,
        meter_before: event.meterBefore,
        meter_after: event.meterAfter,
        pump_flow_rate: event.pumpFlowRate,
        pump_hours: event.pumpHours,
        pump_minutes: event.pumpMinutes,
        source_tag: event.sourceTag === 'meter' ? 'flowmeter' : event.sourceTag,
        notes: event.notes,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Supabase save irrigation event error:', e);
    }
  }

  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_KEY_EVENTS);
    const all: IrrigationEntry[] = raw ? JSON.parse(raw) : [...INITIAL_DEMO_EVENTS];
    const idx = all.findIndex((e) => e.id === event.id);
    if (idx >= 0) {
      all[idx] = { ...event, updatedAt: new Date().toISOString() };
    } else {
      all.unshift(event);
    }
    localStorage.setItem(LOCAL_KEY_EVENTS, JSON.stringify(all));
    return all.filter((e) => e.farmId === event.farmId);
  } catch (err) {
    console.error('Local event save failed:', err);
    return [];
  }
}

export async function deleteIrrigationEvent(eventId: string, farmId: string): Promise<IrrigationEntry[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('irrigation_events').delete().eq('id', eventId);
    } catch (e) {
      console.warn('Supabase delete event error:', e);
    }
  }

  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_KEY_EVENTS);
    const all: IrrigationEntry[] = raw ? JSON.parse(raw) : [...INITIAL_DEMO_EVENTS];
    const updated = all.filter((e) => e.id !== eventId);
    localStorage.setItem(LOCAL_KEY_EVENTS, JSON.stringify(updated));
    return updated.filter((e) => e.farmId === farmId);
  } catch {
    return [];
  }
}

// =========================================================================
// ECONOMIC TARIFFS
// =========================================================================

export function getTariffs(): EconomicTariffs {
  if (typeof window === 'undefined') return DEFAULT_TARIFFS;
  try {
    const raw = localStorage.getItem(LOCAL_KEY_TARIFFS);
    if (!raw) return DEFAULT_TARIFFS;
    return { ...DEFAULT_TARIFFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_TARIFFS;
  }
}

export function saveTariffs(tariffs: EconomicTariffs): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_KEY_TARIFFS, JSON.stringify(tariffs));
  } catch (err) {
    console.error('Failed saving tariffs:', err);
  }
}
