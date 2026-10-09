'use client';

import React from 'react';
import {
  Sun,
  CloudSun,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  Wind,
  Droplets,
  Calendar,
  Compass,
} from 'lucide-react';
import { DailyWeatherForecast } from '@/lib/types';

interface WeatherWidgetProps {
  forecast: DailyWeatherForecast[];
  source: 'live' | 'fallback';
  locationName: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  forecast,
  source,
  locationName,
}) => {
  if (!forecast || forecast.length === 0) return null;

  const currentDay = forecast[0];

  const getWeatherIcon = (code: number, className = 'w-5 h-5') => {
    if (code === 0) return <Sun className={`${className} text-amber-500`} />;
    if (code <= 3) return <CloudSun className={`${className} text-sky-500`} />;
    if (code >= 51 && code <= 55) return <CloudDrizzle className={`${className} text-teal-500`} />;
    if (code >= 61 && code <= 82) return <CloudRain className={`${className} text-blue-500`} />;
    if (code >= 95) return <CloudLightning className={`${className} text-indigo-500`} />;
    return <CloudSun className={`${className} text-sky-500`} />;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
            <CloudSun className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Numerical Weather & ET₀ Forecast</h3>
            <p className="text-[11px] text-slate-500">7-day high resolution atmospheric prediction</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              source === 'live'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {source === 'live' ? '● Open-Meteo Live API' : '● Climatology Fallback'}
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline">{locationName}</span>
        </div>
      </div>

      {/* Main current overview banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 my-1">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Today&apos;s Max Temp</span>
          </div>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {currentDay.tempMaxC}°<span className="text-xs font-normal text-slate-500">C</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Min: {currentDay.tempMinC}°C</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
            <Droplets className="w-3.5 h-3.5 text-sky-500" />
            <span>Precipitation</span>
          </div>
          <div className="mt-1 text-2xl font-bold text-sky-700">
            {currentDay.precipitationMm} <span className="text-xs font-normal text-slate-500">mm</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{currentDay.conditionLabel}</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
            <Compass className="w-3.5 h-3.5 text-teal-600" />
            <span>Reference ET₀</span>
          </div>
          <div className="mt-1 text-2xl font-bold text-teal-700">
            {currentDay.et0Mm} <span className="text-xs font-normal text-slate-500">mm/day</span>
          </div>
          <div className="text-[11px] text-teal-600 mt-0.5">FAO-56 Grass Baseline</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
            <Wind className="w-3.5 h-3.5 text-slate-500" />
            <span>Peak Wind & Hum</span>
          </div>
          <div className="mt-1 text-2xl font-bold text-slate-800">
            {currentDay.windSpeedKmh} <span className="text-xs font-normal text-slate-500">km/h</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Humidity: {currentDay.relativeHumidityPercent}%</div>
        </div>
      </div>

      {/* 7-Day Forecast Micro Cards */}
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {forecast.map((day, idx) => {
          const dateObj = new Date(day.date);
          const dayName = idx === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const dateLabel = dateObj.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });

          return (
            <div
              key={day.date}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                idx === 0
                  ? 'bg-sky-50/70 border-sky-300 ring-1 ring-sky-300'
                  : 'bg-white border-slate-150 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="text-[11px] font-bold text-slate-800">{dayName}</div>
              <div className="text-[10px] text-slate-400 mb-1.5">{dateLabel}</div>

              <div className="flex justify-center my-1">
                {getWeatherIcon(day.weatherCode, 'w-6 h-6')}
              </div>

              <div className="text-xs font-bold text-slate-900 mt-1">
                {Math.round(day.tempMaxC)}° <span className="text-[10px] font-normal text-slate-400">{Math.round(day.tempMinC)}°</span>
              </div>

              {/* Rain indicator */}
              <div className="mt-1 text-[10px] text-sky-700 font-medium">
                {day.precipitationMm > 0 ? `💧 ${day.precipitationMm} mm` : <span className="text-slate-400">0.0 mm</span>}
              </div>

              {/* ET0 indicator */}
              <div className="mt-0.5 text-[9px] text-teal-700 font-semibold bg-teal-50/80 rounded py-0.5">
                ET₀ {day.et0Mm}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
