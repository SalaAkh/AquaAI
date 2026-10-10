'use client';

import React, { useState } from 'react';
import { FarmProfile } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';
import {
  Radio,
  Wifi,
  BatteryCharging,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Droplets,
  Activity,
} from 'lucide-react';

interface SoilMoistureSensorCardProps {
  farm: FarmProfile;
}

interface DepthReading {
  depthCm: number;
  label: string;
  vwcPercent: number; // Volumetric Water Content
  wiltingPoint: number;
  madThreshold: number; // Management Allowed Depletion threshold
  fieldCapacity: number;
  status: 'optimal' | 'moderate_deficit' | 'critical_dry' | 'saturated';
}

export const SoilMoistureSensorCard: React.FC<SoilMoistureSensorCardProps> = ({ farm }) => {
  const { t } = useTranslation();

  // Realistic sensor readings calibrated for soil type
  const [readings] = useState<DepthReading[]>([
    {
      depthCm: 20,
      label: 'Поверхностный слой (испарение)',
      vwcPercent: 19.4,
      wiltingPoint: 11.0,
      madThreshold: 20.5,
      fieldCapacity: 31.0,
      status: 'moderate_deficit',
    },
    {
      depthCm: 40,
      label: 'Основной корневой горизонт (активное водопотребление)',
      vwcPercent: 26.8,
      wiltingPoint: 12.0,
      madThreshold: 21.0,
      fieldCapacity: 32.5,
      status: 'optimal',
    },
    {
      depthCm: 60,
      label: 'Глубинный буферный горизонт (капиллярный подпор)',
      vwcPercent: 30.2,
      wiltingPoint: 13.0,
      madThreshold: 22.0,
      fieldCapacity: 33.0,
      status: 'optimal',
    },
  ]);

  const getStatusBadge = (status: DepthReading['status']) => {
    switch (status) {
      case 'optimal':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Оптимально
          </span>
        );
      case 'moderate_deficit':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
            <AlertTriangle className="w-3 h-3" /> Умеренный дефицит
          </span>
        );
      case 'critical_dry':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3" /> Критический дефицит
          </span>
        );
      case 'saturated':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
            <Droplets className="w-3 h-3" /> Переувлажнение
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 text-xs font-semibold border border-indigo-200/80 mb-2">
            <Radio className="w-3.5 h-3.5" />
            <span>LoRaWAN IoT-телеметрия зондов</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Влажность почвы в корнеобитаемом профиле</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Данные ёмкостных датчиков VWC (%) на глубинах 20, 40 и 60 см для контроля порога допустимого истощения (MAD).
          </p>
        </div>

        {/* Hardware Status Pills */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/80 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white shadow-2xs text-emerald-700">
            <Wifi className="w-3.5 h-3.5" />
            <span>-82 dBm</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white shadow-2xs text-slate-700">
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
            <span>94%</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 text-[11px] text-slate-400">
            <Clock className="w-3 h-3" />
            <span>3 мин назад</span>
          </div>
        </div>
      </div>

      {/* 3 Depth Horizons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {readings.map((r) => {
          // Progress calculation: 0 to 40% VWC scale
          const fillWidth = Math.min(100, Math.max(0, (r.vwcPercent / 38) * 100));
          const madPosition = (r.madThreshold / 38) * 100;
          const fcPosition = (r.fieldCapacity / 38) * 100;

          return (
            <div
              key={r.depthCm}
              className="p-5 rounded-2xl bg-gradient-to-b from-slate-50/80 to-white border border-slate-200 shadow-2xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                    -{r.depthCm}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-sm">Глубина {r.depthCm} см</span>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{r.label}</p>
                  </div>
                </div>
                {getStatusBadge(r.status)}
              </div>

              {/* Big VWC Percentage */}
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-3xl font-extrabold text-slate-900">{r.vwcPercent}%</span>
                  <span className="text-xs text-slate-500 ml-1.5 font-medium">VWC (объёмная влажность)</span>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <div>ППВ: {r.fieldCapacity}%</div>
                  <div>MAD: {r.madThreshold}%</div>
                </div>
              </div>

              {/* Visual Gauge Bar with MAD threshold line */}
              <div className="space-y-1">
                <div className="relative h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${fillWidth}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      r.status === 'optimal'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        : r.status === 'moderate_deficit'
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                        : 'bg-gradient-to-r from-red-500 to-rose-600'
                    }`}
                  />
                  {/* Vertical line for MAD */}
                  <div
                    style={{ left: `${madPosition}%` }}
                    className="absolute top-0 bottom-0 w-0.5 bg-amber-600/80"
                    title={`Порог истощения MAD (${r.madThreshold}%)`}
                  />
                  {/* Vertical line for Field Capacity */}
                  <div
                    style={{ left: `${fcPosition}%` }}
                    className="absolute top-0 bottom-0 w-0.5 bg-sky-700/80"
                    title={`Полевая влагоёмкость (${r.fieldCapacity}%)`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                  <span>Увядание ({r.wiltingPoint}%)</span>
                  <span className="text-amber-700 font-semibold">Порог полива (MAD)</span>
                  <span className="text-sky-700 font-semibold">ППВ (100%)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sensor Interpretation Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3 text-xs text-indigo-950">
        <Activity className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-indigo-900">
            Синхронизация гидромодели FAO-56 и телеметрии зонда:
          </span>
          <p className="text-indigo-800 leading-relaxed">
            Основная масса корней культуры <strong>{farm.cropType}</strong> сосредоточена в горизонте 40 см, где влажность составляет <strong>26.8%</strong> (выше критического порога 21.0%). Поверхностный слой 20 см подсыхает быстрее из-за солнечной инсоляции, однако запаса влаги в корневой зоне достаточно для отсрочки полива до рекомендованного утреннего окна.
          </p>
        </div>
      </div>
    </div>
  );
};
