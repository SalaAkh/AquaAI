'use client';

import React from 'react';
import {
  Droplets,
  Sprout,
  ShieldCheck,
  Sparkles,
  Plus,
  Check,
  Globe,
  Award,
  Satellite,
  Wallet,
  LogOut,
} from 'lucide-react';
import { FarmProfile } from '@/lib/types';
import { DEMO_FARM_ALMATY, DEMO_FARM_TURKISTAN } from '@/lib/constants';
import { useTranslation, Language } from '@/lib/i18n';
import { useSolanaWallet } from '@/lib/wallet';

interface NavbarProps {
  currentFarm: FarmProfile;
  farms: FarmProfile[];
  onSelectFarm: (farm: FarmProfile) => void;
  onOpenNewFarmModal: () => void;
  activeTab: 'dashboard' | 'analytics' | 'satellite' | 'blockchain' | 'subsidies' | 'about';
  setActiveTab: (tab: 'dashboard' | 'analytics' | 'satellite' | 'blockchain' | 'subsidies' | 'about') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentFarm,
  farms,
  onSelectFarm,
  onOpenNewFarmModal,
  activeTab,
  setActiveTab,
}) => {
  const { t, language, setLanguage } = useTranslation();
  const {
    publicKey,
    shortAddress,
    isConnected,
    isConnecting,
    balanceSol,
    connectWallet,
    disconnectWallet,
  } = useSolanaWallet();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
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
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Devnet
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">{t.brandTagline}</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              {t.tabDashboard}
            </button>
            <button
              onClick={() => setActiveTab('satellite')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1 ${
                activeTab === 'satellite'
                  ? 'bg-white text-teal-800 shadow-sm border border-teal-200/60 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Satellite className="w-3.5 h-3.5 text-teal-600" />
              <span>{t.tabSatellite}</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              {t.tabAnalytics}
            </button>
            <button
              onClick={() => setActiveTab('subsidies')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1 ${
                activeTab === 'subsidies'
                  ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200/60 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.tabSubsidies}</span>
            </button>
            <button
              onClick={() => setActiveTab('blockchain')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'blockchain'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              {t.tabBlockchain}
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'about'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              {t.tabAbout}
            </button>
          </nav>

          {/* Right Tools: Solana Wallet + Language + Farm Picker + Add Field */}
          <div className="flex items-center gap-2">
            {/* Solana Web3 Wallet Button */}
            {isConnected ? (
              <div className="flex items-center gap-1 bg-purple-50 border border-purple-200 rounded-lg px-2 py-1 text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-purple-950 font-mono">{shortAddress}</span>
                {balanceSol !== null && (
                  <span className="text-[10px] text-purple-700 font-medium hidden sm:inline">
                    {balanceSol} SOL
                  </span>
                )}
                <button
                  onClick={disconnectWallet}
                  className="ml-1 p-0.5 text-purple-400 hover:text-purple-700 transition-colors"
                  title={t.disconnectBtn}
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white active:scale-95 transition-all shadow-2xs"
              >
                <Wallet className="w-3.5 h-3.5 text-purple-200" />
                <span className="hidden sm:inline">{isConnecting ? '...' : t.connectWalletBtn}</span>
              </button>
            )}

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 border border-slate-200/80 rounded-lg p-0.5 text-[11px] font-semibold text-slate-600 shadow-2xs">
              <button
                onClick={() => setLanguage('ru')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  language === 'ru' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
                title="Русский"
              >
                RU
              </button>
              <button
                onClick={() => setLanguage('kk')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  language === 'kk' ? 'bg-white text-emerald-800 shadow-2xs' : 'hover:text-slate-900'
                }`}
                title="Қазақша"
              >
                KZ
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  language === 'en' ? 'bg-white text-sky-800 shadow-2xs' : 'hover:text-slate-900'
                }`}
                title="English"
              >
                EN
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
                className="appearance-none bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer shadow-2xs max-w-[140px] truncate"
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
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.newFieldBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
