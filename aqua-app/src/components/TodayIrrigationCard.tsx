'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n';
import type { IrrigationRecommendation } from '@/lib/types';
import {
  Droplets,
  CloudRain,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Info,
} from 'lucide-react';

interface TodayIrrigationCardProps {
  recommendation: IrrigationRecommendation;
  weatherSource: 'live' | 'fallback';
  onLogIrrigationClick?: () => void;
}

export const TodayIrrigationCard: React.FC<TodayIrrigationCardProps> = ({
  recommendation,
  weatherSource,
  onLogIrrigationClick,
}) => {
  const { language } = useTranslation();
  const today = recommendation.schedule[0];
  if (!today) return null;

  const isRu = language === 'ru';
  const isKk = language === 'kk';
  const isDemoWeather = weatherSource !== 'live';
  const isIrrigate = today.action === 'irrigate';

  const scrollToJournal = () => {
    if (onLogIrrigationClick) {
      onLogIrrigationClick();
      return;
    }
    const el = document.getElementById('irrigation-entry-form') || document.getElementById('irrigation-tracking-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      aria-label="План полива на сегодня"
      className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6 overflow-hidden relative"
    >
      {/* Background soft ambient gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-sky-100/40 via-emerald-100/20 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none blur-2xl" />

      {/* Top Meta Bar: Heading, Status & Primary Action Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-800 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
              {isRu ? 'План полива на сегодня' : isKk ? 'Бүгінгі суару жоспары' : 'Today’s Irrigation Plan'}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {today.dayLabel} ({today.date})
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {recommendation.farmName}
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Weather Source Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
              isDemoWeather
                ? 'bg-amber-50 text-amber-900 border-amber-200'
                : 'bg-emerald-50 text-emerald-900 border-emerald-200'
            }`}
          >
            {isDemoWeather ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Синтетический прогноз (Demo)</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Open-Meteo Live API</span>
              </>
            )}
          </span>

          {/* Action Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${
              isIrrigate
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-200 text-slate-800'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>{isIrrigate ? (isRu ? 'Рекомендован полив' : isKk ? 'Суару қажет' : 'Irrigate Today') : (isRu ? 'Полив не требуется' : isKk ? 'Суару қажет емес' : 'Skip Irrigation')}</span>
          </span>
        </div>
      </div>

      {/* Warning Alert if Demo Weather */}
      {isDemoWeather && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            {isRu
              ? 'ДЕМОНСТРАЦИОННЫЙ РЕЖИМ: Используется синтетический климатический сценарий. Не использовать для принятия полевых решений.'
              : isKk
              ? 'ДЕМО РЕЖИМІ: Синтетикалық климаттық болжам қолданылуда. Нақты егістік шешімдері үшін пайдаланбаңыз.'
              : 'DEMO MODE: Synthetic meteorological scenario applied. Do not rely for field production.'}
          </span>
        </div>
      )}

      {/* 3 Core Metric Cards + Large CTA Button */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {/* Metric 1: Need in m³ */}
        <div className="bg-gradient-to-br from-sky-50 to-cyan-50/50 rounded-2xl p-4 sm:p-5 border border-sky-100 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider">
              {isRu ? 'Расчётная потребность' : isKk ? 'Есептік қажеттілік' : 'Modelled Need'}
            </span>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">
              {today.waterVolumeM3.toLocaleString('ru-RU')}{' '}
              <span className="text-sm font-semibold text-sky-700">м³</span>
            </div>
          </div>
          <div className="text-[11px] text-sky-700 font-medium mt-2">
            {today.grossIrrigationMm} мм брутто (с учётом КПД)
          </div>
        </div>

        {/* Metric 2: Forecast Rain */}
        <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <CloudRain className="w-3.5 h-3.5 text-blue-500" />
              <span>{isRu ? 'Осадки в прогнозе' : isKk ? 'Болжамдағы жауын' : 'Forecast Rain'}</span>
            </span>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">
              {today.precipitationMm}{' '}
              <span className="text-sm font-semibold text-slate-500">мм</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Эффективное пополнение: {today.effectiveRainfallMm} мм
          </div>
        </div>

        {/* Metric 3: Optimal Window */}
        <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{isRu ? 'Рекомендованное окно' : isKk ? 'Ұсынылған уақыт' : 'Optimal Window'}</span>
            </span>
            <div className="mt-1 text-base font-bold text-slate-900 leading-snug">
              {today.recommendedWindow}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Снижение испарения в прохладные часы
          </div>
        </div>

        {/* Primary CTA Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-md">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-300">
              Оперативное действие
            </span>
            <p className="text-xs text-slate-300 mt-1">
              {isRu ? 'Зафиксируйте подачу воды по счётчику или насосу' : 'Су шығынын есептегіш немесе сорғымен жазыңыз'}
            </p>
          </div>
          <button
            onClick={scrollToJournal}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-black uppercase tracking-wider rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Droplets className="w-4 h-4" />
            <span>Записать полив</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Agronomic Reasoning & Limitation */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs text-slate-700">
        <div className="font-bold text-slate-900 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-sky-600" />
          <span>Обоснование рекомендации FAO-56:</span>
        </div>
        <p className="leading-relaxed text-slate-600 font-medium">
          {today.actionReason}
        </p>
        <p className="text-[11px] text-slate-500 italic pt-1">
          * Модель рассчитывает замещение дефицита испарения культуры (ETc - Peff). Без физического датчика влажности почвы расчёт является научно обоснованным ориентиром, а не безусловным предписанием.
        </p>
      </div>
    </section>
  );
};
