'use client';

import React from 'react';
import {
  Droplets,
  Satellite,
  TrendingUp,
  Award,
  ShieldCheck,
  Globe,
  Plus,
  Wallet,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { FarmProfile } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';
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

  const navItems = [
    { id: 'dashboard' as const, label: t.tabDashboard, icon: Droplets, color: 'text-sky-600' },
    { id: 'satellite' as const, label: t.tabSatellite, icon: Satellite, color: 'text-teal-600' },
    { id: 'analytics' as const, label: t.tabAnalytics, icon: TrendingUp, color: 'text-emerald-600' },
    { id: 'subsidies' as const, label: t.tabSubsidies, icon: Award, color: 'text-amber-600' },
    { id: 'blockchain' as const, label: t.tabBlockchain, icon: ShieldCheck, color: 'text-purple-600' },
    { id: 'about' as const, label: t.tabAbout, icon: Globe, color: 'text-blue-600' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs transition-all">
      {/* TIER 1: Main Brand, Active Farm, Web3 Wallet & Global Tools */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Slogan */}
          <div
            className="flex items-center gap-3 cursor-pointer shrink-0"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-emerald-400 p-0.5 shadow-md shadow-sky-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Droplets className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900">Aqua</span>
                <span className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-emerald-600">AI</span>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  DEVNET
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
                {t.brandTagline}
              </p>
            </div>
          </div>

          {/* Right Controls: Farm Selector + Add Field + Wallet + Language */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            {/* Active Farm Dropdown */}
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
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer shadow-2xs max-w-[210px] sm:max-w-[260px] truncate transition-colors"
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.isDemo ? '🧪 ' : '🌾 '}
                    {f.id === 'demo-turkistan-cotton' ? t.demoTurkistanName : f.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Add New Field Button */}
            <button
              onClick={onOpenNewFarmModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white active:scale-95 transition-all shadow-2xs shrink-0"
              title={t.newFieldBtn}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.newFieldBtn}</span>
            </button>

            {/* Solana Web3 Wallet Button / Badge */}
            {isConnected ? (
              <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 rounded-xl px-2.5 py-1.5 text-xs shrink-0 shadow-2xs">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-purple-950 font-mono">{shortAddress}</span>
                {balanceSol !== null && (
                  <span className="text-[10px] text-purple-700 font-semibold hidden md:inline">
                    {balanceSol} SOL
                  </span>
                )}
                <button
                  onClick={disconnectWallet}
                  className="ml-1 p-0.5 text-purple-400 hover:text-purple-700 transition-colors"
                  title={t.disconnectBtn}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white active:scale-95 transition-all shadow-2xs shrink-0"
              >
                <Wallet className="w-3.5 h-3.5 text-purple-200" />
                <span>{isConnecting ? t.connecting : t.connectWalletBtn}</span>
              </button>
            )}

            {/* Language Selector Pill */}
            <div
              className="flex items-center bg-slate-100 border border-slate-200/80 rounded-xl p-0.5 text-[11px] font-bold text-slate-600 shadow-2xs shrink-0"
              aria-label="Language Selector"
            >
              <button
                onClick={() => setLanguage('ru')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  language === 'ru' ? 'bg-white text-slate-900 shadow-2xs font-extrabold ring-1 ring-slate-200/80' : 'hover:text-slate-900'
                }`}
                title="Русский язык"
              >
                RU
              </button>
              <button
                onClick={() => setLanguage('kk')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  language === 'kk' ? 'bg-white text-emerald-800 shadow-2xs font-extrabold ring-1 ring-emerald-200/80' : 'hover:text-slate-900'
                }`}
                title="Қазақ тілі"
              >
                ҚАЗ
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  language === 'en' ? 'bg-white text-sky-800 shadow-2xs font-extrabold ring-1 ring-sky-200/80' : 'hover:text-slate-900'
                }`}
                title="English Language"
              >
                ENG
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TIER 2: Dedicated Module Navigation Bar with Icons & Breathing Room */}
      <div className="border-t border-slate-200/70 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/90 font-bold scale-[1.01]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${item.color} ${isActive ? 'scale-110' : 'opacity-80'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
