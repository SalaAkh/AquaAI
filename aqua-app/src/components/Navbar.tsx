'use client';

import React from 'react';
import { Droplets, Sprout, ShieldCheck, Sparkles, Plus, Check } from 'lucide-react';
import { FarmProfile } from '@/lib/types';
import { DEMO_FARM_ALMATY, DEMO_FARM_TURKISTAN } from '@/lib/constants';

interface NavbarProps {
  currentFarm: FarmProfile;
  farms: FarmProfile[];
  onSelectFarm: (farm: FarmProfile) => void;
  onOpenNewFarmModal: () => void;
  activeTab: 'dashboard' | 'analytics' | 'blockchain' | 'about';
  setActiveTab: (tab: 'dashboard' | 'analytics' | 'blockchain' | 'about') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentFarm,
  farms,
  onSelectFarm,
  onOpenNewFarmModal,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-emerald-400 p-0.5 shadow-md shadow-sky-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Droplets className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900">Aqua</span>
                <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-emerald-600">AI</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                  Devnet
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Central Asia Smart Irrigation</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              Water Analytics
            </button>
            <button
              onClick={() => setActiveTab('blockchain')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'blockchain'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              Solana Verification
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'about'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              Aral Crisis
            </button>
          </nav>

          {/* Farm Switcher & Quick Demo Selector */}
          <div className="flex items-center gap-2.5">
            {/* Quick Demo Toggle Pill */}
            <div className="hidden lg:flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => onSelectFarm(DEMO_FARM_TURKISTAN)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 ${
                  currentFarm.id === DEMO_FARM_TURKISTAN.id
                    ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Turkistan Cotton</span>
                {currentFarm.id === DEMO_FARM_TURKISTAN.id && <Check className="w-3 h-3 text-emerald-600" />}
              </button>
              <button
                onClick={() => onSelectFarm(DEMO_FARM_ALMATY)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 ${
                  currentFarm.id === DEMO_FARM_ALMATY.id
                    ? 'bg-white text-sky-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Almaty Wheat</span>
                {currentFarm.id === DEMO_FARM_ALMATY.id && <Check className="w-3 h-3 text-sky-600" />}
              </button>
            </div>

            {/* Farm Profile Dropdown */}
            <div className="relative">
              <select
                id="navbar-active-farm-select"
                name="activeFarmSelect"
                aria-label="Select Active Farm"
                value={currentFarm.id}
                onChange={(e) => {
                  const selected = farms.find((f) => f.id === e.target.value);
                  if (selected) onSelectFarm(selected);
                }}
                className="appearance-none bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer shadow-xs max-w-[170px] truncate"
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.isDemo ? '🧪 ' : '🌾 '}
                    {f.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* New Farm Button */}
            <button
              onClick={onOpenNewFarmModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Field</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
