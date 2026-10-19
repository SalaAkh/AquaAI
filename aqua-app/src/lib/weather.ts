import { DailyWeatherForecast } from './types';

// WMO Weather interpretation codes (WW)
export function getWeatherDescription(code: number): string {
  switch (code) {
    case 0:
      return 'Clear sky';
    case 1:
      return 'Mainly clear';
    case 2:
      return 'Partly cloudy';
    case 3:
      return 'Overcast';
    case 45:
    case 48:
      return 'Fog / Depositing rime fog';
    case 51:
    case 53:
    case 55:
      return 'Light to moderate drizzle';
    case 61:
      return 'Slight rain';
    case 63:
      return 'Moderate rain';
    case 65:
      return 'Heavy rain';
    case 71:
    case 73:
    case 75:
      return 'Snowfall';
    case 80:
    case 81:
    case 82:
      return 'Rain showers';
    case 95:
      return 'Thunderstorm';
    case 96:
    case 99:
      return 'Thunderstorm with hail';
    default:
      return 'Partly cloudy';
  }
}

/**
 * Fetch 7-day weather forecast with FAO-56 reference evapotranspiration (ET0) from Open-Meteo
 */
export async function fetchOpenMeteoForecast(
  latitude: number,
  longitude: number
): Promise<{ forecast: DailyWeatherForecast[]; source: 'live' | 'fallback' }> {
  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', latitude.toFixed(4));
    url.searchParams.set('longitude', longitude.toFixed(4));
    url.searchParams.set(
      'daily',
      'weather_code,temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,et0_fao_evapotranspiration,wind_speed_10m_max,shortwave_radiation_sum,relative_humidity_2m_mean'
    );
    url.searchParams.set('timezone', 'auto');
    url.searchParams.set('forecast_days', '7');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 1800 }, // Cache for 30 minutes in Next.js
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Open-Meteo HTTP error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const daily = data.daily;

    if (!daily || !daily.time || daily.time.length === 0) {
      throw new Error('Invalid Open-Meteo daily response');
    }

    const forecast: DailyWeatherForecast[] = daily.time.map((dateStr: string, idx: number) => {
      const code = daily.weather_code?.[idx] ?? 1;
      const tMax = daily.temperature_2m_max?.[idx] ?? 24;
      const tMin = daily.temperature_2m_min?.[idx] ?? 12;
      const tMean = daily.temperature_2m_mean?.[idx] ?? (tMax + tMin) / 2;
      const precip = Math.max(0, daily.precipitation_sum?.[idx] ?? 0);
      const et0 = Math.max(0.5, daily.et0_fao_evapotranspiration?.[idx] ?? 3.8);
      const windSpeed = daily.wind_speed_10m_max?.[idx] ?? 14;
      const radiation = daily.shortwave_radiation_sum?.[idx] ?? 19.5;

      return {
        date: dateStr,
        tempMaxC: Number(tMax.toFixed(1)),
        tempMinC: Number(tMin.toFixed(1)),
        tempMeanC: Number(tMean.toFixed(1)),
        precipitationMm: Number(precip.toFixed(1)),
        et0Mm: Number(et0.toFixed(2)),
        relativeHumidityPercent: Math.min(100, Math.max(0, Number(daily.relative_humidity_2m_mean?.[idx] ?? 50))),
        windSpeedKmh: Number(windSpeed.toFixed(1)),
        solarRadiationMj: Number(radiation.toFixed(1)),
        weatherCode: code,
        conditionLabel: getWeatherDescription(code),
      };
    });

    return { forecast, source: 'live' };
  } catch (err) {
    console.warn('[AquaAI] Open-Meteo live request failed, using realistic regional climatology fallback:', err);
    return {
      forecast: generateCentralAsiaFallbackForecast(latitude, longitude),
      source: 'fallback',
    };
  }
}

/**
 * Realistic synthetic 7-day meteorological forecast modeled for Central Asian continental climate
 */
export function generateCentralAsiaFallbackForecast(
  latitude: number,
  longitude: number
): DailyWeatherForecast[] {
  const days: DailyWeatherForecast[] = [];
  const today = new Date();

  // Climate baseline: continental arid / semi-arid steppe
  // Higher latitude (Kostanay) is cooler; southern (Turkistan/Shymkent) is warmer
  const isSouthern = latitude < 45;
  const baseTMax = isSouthern ? 28.5 : 21.0;
  const baseTMin = isSouthern ? 15.0 : 9.5;
  const baseEt0 = isSouthern ? 4.8 : 3.6;

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];

    // Day 3 slight convective rain shower scenario to test rain-delay logic
    const hasRain = i === 2;
    const precip = hasRain ? 4.8 : i === 5 ? 1.2 : 0.0;
    const weatherCode = hasRain ? 61 : i === 1 ? 2 : 0;
    const tempMax = baseTMax + Math.sin(i * 0.9) * 2.5 - (hasRain ? 3.0 : 0);
    const tempMin = baseTMin + Math.cos(i * 0.7) * 1.8;
    const et0 = Math.max(1.5, baseEt0 + Math.sin(i * 1.1) * 0.8 - (hasRain ? 1.2 : 0));

    days.push({
      date: dateStr,
      tempMaxC: Number(tempMax.toFixed(1)),
      tempMinC: Number(tempMin.toFixed(1)),
      tempMeanC: Number(((tempMax + tempMin) / 2).toFixed(1)),
      precipitationMm: precip,
      et0Mm: Number(et0.toFixed(2)),
      relativeHumidityPercent: hasRain ? 68 : 38 + (i % 3) * 4,
      windSpeedKmh: 12.5 + (i % 4) * 3,
      solarRadiationMj: hasRain ? 14.2 : 21.8,
      weatherCode,
      conditionLabel: getWeatherDescription(weatherCode),
    });
  }

  return days;
}
