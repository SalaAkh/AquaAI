'use client';

import React from 'react';
import {
  Droplets,
  ShieldCheck,
  Cpu,
  ArrowRight,
  CloudSun,
  Layers,
  MapPin,
} from 'lucide-react';
import { FarmProfile } from '@/lib/types';
import { useTranslation, getCropLabel } from '@/lib/i18n';

interface LandingHeroProps {
  onLaunchDashboard: () => void;
  onExploreDemo: () => void;
  farm: FarmProfile;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onLaunchDashboard,
  onExploreDemo,
  farm,
}) => {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-sky-50/50 via-white to-slate-50 border-b border-slate-200">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-96 bg-gradient-to-br from-sky-200/30 via-emerald-100/20 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-9 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-24">
        {/* Top Announcement Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-sky-200 shadow-xs text-xs font-medium text-slate-700">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-sky-800">{t.heroColosseumBadge}</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">{t.heroColosseumSub}</span>
          </div>
        </div>

        {/* Hero Heading & Subtitle */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            {t.heroTitle} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600">
              {t.heroHighlight}
            </span>
          </h1>
          <p className="mt-5 text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* Action CTAs */}
          <div className="mt-7 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={onLaunchDashboard}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 active:scale-98 transition-all shadow-md shadow-slate-950/10"
            >
              <span>{t.launchDashboardBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onExploreDemo}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-700 border border-slate-200 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
            >
              <span>{t.exploreTurkistanBtn}</span>
            </button>
          </div>
        </div>

        {/* Interactive Hero Preview Card */}
        <div className="mt-8 sm:mt-14 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 sm:p-6 shadow-xl shadow-slate-900/5 backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  {farm.name}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                  {farm.fieldSizeHectares} {t.hectares} • {getCropLabel(farm.cropType, t)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{farm.region}</span>
              </div>
            </div>

            {/* Quick Metrics Bar in Preview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[11px] font-medium text-slate-500 uppercase">{t.netEtc}</div>
                <div className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">18.4 <span className="text-xs font-normal text-slate-500">mm</span></div>
                <div className="text-[11px] text-teal-600 mt-0.5">{t.badgeFao}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[11px] font-medium text-slate-500 uppercase">{t.effectiveRain}</div>
                <div className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">4.8 <span className="text-xs font-normal text-slate-500">mm</span></div>
                <div className="text-[11px] text-sky-600 mt-0.5">{t.badgeWeather}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[11px] font-medium text-slate-500 uppercase">{t.totalVolume}</div>
                <div className="mt-1 text-xl sm:text-2xl font-bold text-sky-600">6,840 <span className="text-xs font-normal text-slate-500">m³</span></div>
                <div className="text-[11px] text-emerald-600 mt-0.5">{t.methodDrip}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <div className="text-[11px] font-medium text-emerald-800 uppercase">{t.savedWaterMetric}</div>
                <div className="mt-1 text-xl sm:text-2xl font-bold text-emerald-700">5,472 <span className="text-xs font-normal text-emerald-600">m³</span></div>
                <div className="text-[11px] text-emerald-600 mt-0.5">{t.vsFloodBaseline}</div>
              </div>
            </div>

            {/* Quick Preview Callout */}
            <div className="mt-4 p-3 rounded-xl bg-sky-50/60 border border-sky-100 text-xs text-sky-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-600 flex-shrink-0" />
                <span>
                  <strong>{t.heroAdviceCallout}:</strong> {t.heroAdviceText}
                </span>
              </div>
              <button
                onClick={onLaunchDashboard}
                className="hidden sm:inline-flex text-xs font-semibold text-sky-700 hover:text-sky-900 underline underline-offset-2 ml-4 flex-shrink-0"
              >
                {t.launchDashboardBtn} →
              </button>
            </div>
          </div>
        </div>

        {/* 4 Core Pillars */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">{t.badgeFao}</h2>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              {t.faoPillarDesc}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center mb-3">
              <CloudSun className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">{t.badgeWeather}</h2>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              {t.weatherPillarDesc}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
              <Cpu className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">{t.badgeGemini}</h2>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              {t.geminiPillarDesc}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">{t.badgeSolana}</h2>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              {t.solanaPillarDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
