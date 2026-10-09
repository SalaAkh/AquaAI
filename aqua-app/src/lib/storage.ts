import { DEMO_FARM_ALMATY, DEMO_FARM_TURKISTAN } from './constants';
import { FarmProfile, IrrigationRecommendation } from './types';

const STORAGE_KEY_FARMS = 'aqua_farms_v1';
const STORAGE_KEY_ACTIVE_FARM = 'aqua_active_farm_id_v1';
const STORAGE_KEY_HISTORY = 'aqua_history_v1';

export function getSavedFarms(): FarmProfile[] {
  if (typeof window === 'undefined') {
    return [DEMO_FARM_TURKISTAN, DEMO_FARM_ALMATY];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FARMS);
    if (!raw) {
      const initial = [DEMO_FARM_TURKISTAN, DEMO_FARM_ALMATY];
      localStorage.setItem(STORAGE_KEY_FARMS, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEMO_FARM_TURKISTAN, DEMO_FARM_ALMATY];
  } catch (err) {
    console.error('Failed reading farms from storage:', err);
    return [DEMO_FARM_TURKISTAN, DEMO_FARM_ALMATY];
  }
}

export function saveFarmProfile(farm: FarmProfile): FarmProfile[] {
  if (typeof window === 'undefined') return [];
  const farms = getSavedFarms();
  const index = farms.findIndex((f) => f.id === farm.id);

  let updated: FarmProfile[];
  if (index >= 0) {
    updated = [...farms];
    updated[index] = { ...farm, updatedAt: new Date().toISOString() };
  } else {
    updated = [farm, ...farms];
  }

  localStorage.setItem(STORAGE_KEY_FARMS, JSON.stringify(updated));
  setActiveFarmId(farm.id);
  return updated;
}

export function deleteFarmProfile(farmId: string): FarmProfile[] {
  if (typeof window === 'undefined') return [];
  const farms = getSavedFarms().filter((f) => f.id !== farmId);
  const finalFarms = farms.length > 0 ? farms : [DEMO_FARM_TURKISTAN];
  localStorage.setItem(STORAGE_KEY_FARMS, JSON.stringify(finalFarms));
  if (getActiveFarmId() === farmId) {
    setActiveFarmId(finalFarms[0].id);
  }
  return finalFarms;
}

export function getActiveFarmId(): string {
  if (typeof window === 'undefined') return DEMO_FARM_TURKISTAN.id;
  return localStorage.getItem(STORAGE_KEY_ACTIVE_FARM) || DEMO_FARM_TURKISTAN.id;
}

export function setActiveFarmId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_ACTIVE_FARM, id);
}

export function getSavedRecommendations(): IrrigationRecommendation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveRecommendationToHistory(rec: IrrigationRecommendation): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getSavedRecommendations();
    const filtered = history.filter((h) => h.id !== rec.id);
    const updated = [rec, ...filtered].slice(0, 20); // keep last 20
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed saving recommendation history:', err);
  }
}
