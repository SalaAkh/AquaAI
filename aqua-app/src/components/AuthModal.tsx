'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  X,
  User,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Database,
  CheckCircle2,
  AlertCircle,
  LogOut,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, isDemo, isCloudConnected, signIn, signUp, signOut, enterDemoMode } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        const res = await signIn(email, password);
        if (res.error) {
          setErrorMessage(res.error);
        } else {
          setSuccessMessage('Успешный вход в систему!');
          setTimeout(() => onClose(), 800);
        }
      } else {
        if (!fullName.trim()) {
          setErrorMessage('Укажите ваше имя или название хозяйства');
          setLoading(false);
          return;
        }
        const res = await signUp(email, password, fullName);
        if (res.error) {
          setErrorMessage(res.error);
        } else {
          setSuccessMessage('Аккаунт успешно создан!');
          setTimeout(() => onClose(), 800);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Ошибка аутентификации');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSwitch = () => {
    enterDemoMode();
    setSuccessMessage('Активирован демонстрационный режим!');
    setTimeout(() => onClose(), 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-100 text-sky-800 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isAuthenticated && !isDemo ? 'Профиль фермера' : 'Вход в AquaAI'}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5 text-[11px]">
                {isCloudConnected ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Database className="w-3 h-3 text-emerald-600" />
                    Supabase PostgreSQL (Cloud RLS)
                  </span>
                ) : (
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Автономный демо-режим (Local Storage)
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If user is already logged in with non-demo account */}
        {isAuthenticated && !isDemo ? (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <div className="text-xs text-slate-500">Авторизованный пользователь:</div>
              <div className="text-sm font-bold text-slate-900">{user?.fullName}</div>
              <div className="text-xs text-slate-600 font-mono">{user?.email}</div>
              <div className="text-[10px] text-emerald-700 font-semibold pt-1">
                ✓ Ваши поля и замеры защищены Row Level Security
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleDemoSwitch}
                className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Переключиться в демо-режим с эталонными хозяйствами
              </button>

              <button
                onClick={async () => {
                  await signOut();
                  onClose();
                }}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Выйти из аккаунта</span>
              </button>
            </div>
          </div>
        ) : (
          /* Sign In / Sign Up form */
          <div className="space-y-4">
            {/* Mode Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setMode('signin')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  mode === 'signin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Вход
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  mode === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Регистрация
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ФИО или Название КХ
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="Алибек Смагулов (КХ «Дала»)"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Электронная почта
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="farmer@aquaai.kz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Пароль
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Обработка...' : mode === 'signin' ? 'Войти в личный кабинет' : 'Зарегистрировать хозяйство'}
              </button>
            </form>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleDemoSwitch}
                className="text-xs text-sky-700 hover:text-sky-900 font-semibold underline"
              >
                Продолжить без регистрации в демо-режиме жюри
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
