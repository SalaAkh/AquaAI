'use client';

import React, { useState } from 'react';
import {
  Sun,
  CloudSun,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  Wind,
  Droplets,
  Compass,
  RefreshCw,
  AlertCircle,
  BarChart2,
  Calendar,
} from 'lucide-react';
import { DailyWeatherForecast } from '@/lib/types';
import { useTranslation, getLocalizedDayName } from '@/lib/i18n';

interface WeatherWidgetProps {
  forecast: DailyWeatherForecast[];
  source: 'live' | 'fallback';
  locationName: string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  forecast,
  source,
  locationName,
  isLoading = false,
  error = null,
  onRetry,
}) => {
  const { t, language } = useTranslation();
  const [viewMode, setViewMode] = useState<'cards' | 'chart'>('cards');

  const getWeatherIcon = (code: number, className = 'w-5 h-5') => {
    if (code === 0) return <Sun className={`${className} text-amber-500`} />;
    if (code <= 3) return <CloudSun className={`${className} text-sky-500`} />;
    if (code >= 51 && code <= 55) return <CloudDrizzle className={`${className} text-teal-500`} />;
    if (code >= 61 && code <= 82) return <CloudRain className={`${className} text-blue-500`} />;
    if (code >= 95) return <CloudLightning className={`${className} text-indigo-500`} />;
    return <CloudSun className={`${className} text-sky-500`} />;
  };

  const getLocalizedCondition = (condition: string, code: number) => {
    if (language === 'kk') {
      if (code === 0) return 'Ашық күн';
      if (code <= 3) return 'Аздаған бұлтты';
      if (code >= 51 && code <= 55) return 'Сіркіреген жаңбыр';
      if (code >= 61 && code <= 82) return 'Жаңбырлы';
      if (code >= 95) return 'Найзағайлы';
      return condition;
    }
    if (language === 'ru') {
      if (code === 0) return 'Ясно';
      if (code <= 3) return 'Переменная облачность';
      if (code >= 51 && code <= 55) return 'Моросящий дождь';
      if (code >= 61 && code <= 82) return 'Дождь';
      if (code >= 95) return 'Гроза';
      return condition;
    }
    return condition;
  };

  // Loading State Skeleton
  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4 animate-pulse">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-200" />
            <div className="space-y-1.5">
              <div className="w-32 h-4 bg-slate-200 rounded" />
              <div className="w-48 h-3 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="w-24 h-6 bg-slate-200 rounded-full" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 pt-2">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // Error / Empty State
  if (error || !forecast || forecast.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-rose-200 p-6 sm:p-8 shadow-xs text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">
          {error ? 'Weather Forecast Unavailable' : 'No Meteorological Data Found'}
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          {error || 'Unable to retrieve meteorological data for this geographic coordinate. Please check network connectivity or try again.'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Weather Fetch</span>
          </button>
        )}
      </div>
    );
  }

  const currentDay = forecast[0];
  const maxTempInForecast = Math.max(...forecast.map((f) => f.tempMaxC), 30);
  const maxRainInForecast = Math.max(...forecast.map((f) => f.precipitationMm), 10);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">{t.weatherTitle}</h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  source === 'live'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
                title={source === 'live' ? 'Live data from Open-Meteo API' : 'Regional continental climatology fallback'}
              >
                {source === 'live' ? t.liveApiBadge : t.fallbackBadge}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{locationName} • 7-Day Forecast</p>
          </div>
        </div>

        {/* View Switcher: Cards vs Chart */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-all ${
                viewMode === 'chart'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Forecast Chart</span>
            </button>
          </div>

          {onRetry && (
            <button
              onClick={onRetry}
              disabled={isLoading}
              className="p-2 text-slate-400 hover:text-sky-600 hover:bg-slate-50 rounded-xl transition-colors"
              title="Refresh Weather Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Main current overview banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/60 to-white border border-amber-100/80 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>{t.todayMaxTemp}</span>
          </div>
          <div className="mt-1 text-2xl font-black text-slate-900">
            {currentDay.tempMaxC}°<span className="text-xs font-normal text-slate-500">C</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{t.minTemp} {currentDay.tempMinC}°C</div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50/60 to-white border border-sky-100/80 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
            <Droplets className="w-4 h-4 text-sky-500" />
            <span>{t.precipitation}</span>
          </div>
          <div className="mt-1 text-2xl font-black text-sky-700">
            {currentDay.precipitationMm} <span className="text-xs font-normal text-slate-500">mm</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {getLocalizedCondition(currentDay.conditionLabel, currentDay.weatherCode)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/60 to-white border border-teal-100/80 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
            <Compass className="w-4 h-4 text-teal-600" />
            <span>{t.referenceEt0}</span>
          </div>
          <div className="mt-1 text-2xl font-black text-teal-700">
            {currentDay.et0Mm} <span className="text-xs font-normal text-slate-500">mm/day</span>
          </div>
          <div className="text-[11px] text-teal-600 mt-0.5">{t.et0GrassBaseline}</div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
            <Wind className="w-4 h-4 text-slate-500" />
            <span>{t.peakWindHum}</span>
          </div>
          <div className="mt-1 text-2xl font-black text-slate-800">
            {currentDay.windSpeedKmh} <span className="text-xs font-normal text-slate-500">km/h</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{t.humidity} {currentDay.relativeHumidityPercent}%</div>
        </div>
      </div>

      {/* View: 7-Day Micro Cards */}
      {viewMode === 'cards' ? (
        <div className="grid grid-flow-col auto-cols-[minmax(112px,40%)] sm:grid-flow-row sm:grid-cols-4 md:grid-cols-7 gap-2 overflow-x-auto sm:overflow-visible pb-3 sm:pb-0 snap-x snap-mandatory">
          {forecast.map((day, idx) => {
            const dayName = getLocalizedDayName(day.date, language, idx === 0);
            const dateObj = new Date(day.date);
            const dateLabel = `${dateObj.getDate()}.${dateObj.getMonth() + 1}`;

            return (
              <div
                key={day.date}
                className={`snap-start p-3 rounded-2xl border text-center transition-all ${
                  idx === 0
                    ? 'bg-sky-50/70 border-sky-300 ring-1 ring-sky-300 shadow-2xs'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="text-xs font-bold text-slate-800">{dayName}</div>
                <div className="text-[10px] text-slate-400 mb-1">{dateLabel}</div>

                <div className="flex justify-center my-1.5">
                  {getWeatherIcon(day.weatherCode, 'w-6 h-6')}
                </div>

                <div className="text-xs font-bold text-slate-900 mt-1">
                  {Math.round(day.tempMaxC)}° <span className="text-[10px] font-normal text-slate-400">{Math.round(day.tempMinC)}°</span>
                </div>

                {/* Rain indicator */}
                <div className="mt-1 text-[11px] font-medium text-sky-700">
                  {day.precipitationMm > 0 ? `💧 ${day.precipitationMm} mm` : <span className="text-slate-400">0.0 mm</span>}
                </div>

                {/* ET0 indicator */}
                <div className="mt-1 text-[9px] text-teal-700 font-bold bg-teal-50 rounded py-0.5">
                  ET₀ {day.et0Mm}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* View: Forecast Chart Visualizer (Rainfall & Temperature Curve) */
        <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/80 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <span className="font-bold text-slate-800">7-Day Rainfall &amp; Temperature Profile</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-sky-500" />
                <span>Precipitation (mm)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500" />
                <span>Max Temp (°C)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-teal-500" />
                <span>Reference ET₀</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 h-48 items-end pt-6 pb-2 px-2 border-b border-slate-200">
            {forecast.map((day, idx) => {
              const dayName = getLocalizedDayName(day.date, language, idx === 0);
              const rainHeight = Math.max(4, (day.precipitationMm / Math.max(maxRainInForecast, 5)) * 100);
              const tempHeight = Math.max(10, (day.tempMaxC / Math.max(maxTempInForecast, 35)) * 100);

              return (
                <div key={day.date} className="flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] rounded-lg px-2 py-1 pointer-events-none whitespace-nowrap z-20 shadow-md">
                    Rain: {day.precipitationMm} mm • Temp: {day.tempMaxC}°C • ET₀: {day.et0Mm}
                  </div>

                  {/* Dual Bar Display */}
                  <div className="w-full flex items-end justify-center gap-1 h-36">
                    {/* Rain Bar */}
                    <div
                      style={{ height: `${rainHeight}%` }}
                      className="w-3 sm:w-4 rounded-t-md bg-sky-500 transition-all group-hover:brightness-110"
                      title={`Rain: ${day.precipitationMm} mm`}
                    />
                    {/* Temp Bar */}
                    <div
                      style={{ height: `${tempHeight}%` }}
                      className="w-3 sm:w-4 rounded-t-md bg-amber-400 transition-all group-hover:brightness-110"
                      title={`Max Temp: ${day.tempMaxC}°C`}
                    />
                  </div>

                  {/* Date label */}
                  <div className="text-[11px] font-bold text-slate-700 mt-2">{dayName}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{day.precipitationMm}mm</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
