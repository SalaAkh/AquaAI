'use client';

import React from 'react';
import {
  AlertTriangle,
  Globe2,
  Droplets,
  Layers,
  TrendingDown,
  Mountain,
  Waves,
  ShieldAlert,
} from 'lucide-react';

export const CentralAsiaChallenge: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-8">
      {/* Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 mb-3">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Regional Climate &amp; Hydrological Crisis</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          The Water Scarcity Challenge in Central Asia
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
          Central Asia is facing one of the world&apos;s most urgent ecological and agricultural crises.
          Irrigation consumes over 80% of all freshwater withdrawals in the Aral Sea basin,
          yet more than half is lost through inefficient flood methods and unlined canals.
        </p>
      </div>

      {/* 3 Core Crisis Realities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Waves className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Aral Sea Basin Depletion</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The diversion of the Syr Darya and Amu Darya rivers for cotton and rice monocultures shrank the Aral Sea by over 90%, creating the Aralkum desert and devastating local ecosystems.
          </p>
          <div className="pt-2 border-t border-slate-200 text-[11px] font-semibold text-slate-700">
            Impact: Toxic dust storms &amp; severe regional soil salinization.
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
            <Mountain className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Tian Shan Glacial Retreat</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Glaciers feeding Kazakhstan, Uzbekistan, and Kyrgyzstan are receding at unprecedented rates due to climate warming. Summer meltwater peaks are shifting earlier, causing severe late-season drought.
          </p>
          <div className="pt-2 border-t border-slate-200 text-[11px] font-semibold text-slate-700">
            Projection: Up to 25% drop in summer river flow by 2040.
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">50% Inundation Loss</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Traditional furrow flooding applies water on fixed calendar schedules rather than crop water demand. Excessive inundation causes waterlogging, washes nutrients past root zones, and wastes millions of cubic meters.
          </p>
          <div className="pt-2 border-t border-slate-200 text-[11px] font-semibold text-slate-700">
            Solution: Precision FAO-56 irrigation schedules cut waste by 30-45%.
          </div>
        </div>
      </div>

      {/* How AquaAI Solves It */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-900 to-slate-900 text-white space-y-4">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <Droplets className="w-4 h-4" />
          The AquaAI Intervention
        </div>
        <h3 className="text-xl font-bold text-white">
          Replacing Guesswork with Agronomic Hydrology &amp; Open Auditing
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
          By synchronizing localized numerical weather predictions with FAO-56 Penman-Monteith crop coefficients, AquaAI calculates exactly how much water crops actually transpire every 24 hours. Farmers avoid premature irrigation ahead of rains and reduce evaporative losses by irrigating during optimal low-VPD windows.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs">
            <div className="text-xl font-bold text-cyan-300">30-45%</div>
            <div className="text-[11px] text-slate-300 mt-0.5">Potential water savings</div>
          </div>
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs">
            <div className="text-xl font-bold text-emerald-300">100%</div>
            <div className="text-[11px] text-slate-300 mt-0.5">FAO-56 standard adherence</div>
          </div>
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs">
            <div className="text-xl font-bold text-sky-300">0 kg</div>
            <div className="text-[11px] text-slate-300 mt-0.5">Hardware sensor barrier</div>
          </div>
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs">
            <div className="text-xl font-bold text-purple-300">Solana</div>
            <div className="text-[11px] text-slate-300 mt-0.5">Verifiable audit record</div>
          </div>
        </div>
      </div>
    </div>
  );
};
