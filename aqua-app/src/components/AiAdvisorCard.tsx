'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  ShieldCheck,
  RefreshCw,
  Lightbulb,
  Droplets,
  CheckCircle2,
  Send,
  MessageSquare,
  User,
} from 'lucide-react';
import { FarmProfile, IrrigationRecommendation } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';

interface AiAdvisorCardProps {
  recommendation: IrrigationRecommendation;
  farm?: FarmProfile;
  onUpdateExplanation?: (explanation: NonNullable<IrrigationRecommendation['aiExplanation']>) => void;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  time: string;
}

export const AiAdvisorCard: React.FC<AiAdvisorCardProps> = ({
  recommendation,
  farm,
  onUpdateExplanation,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [inputQuery, setInputQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: `Здравствуйте! Я агроном-гидролог AquaAI. Готов ответить на любые вопросы по поливу поля «${farm?.name || recommendation.farmName}», защите от испарения или минерализации воды.`,
      time: 'Сейчас',
    },
  ]);

  const [explanation, setExplanation] = useState(
    recommendation.aiExplanation || {
      summary: `Хозяйству ${recommendation.farmName} требуется ориентировочно ${recommendation.totalGrossIrrigationMm} мм (${recommendation.totalVolumeM3.toLocaleString()} м³) полива на ближайшие ${recommendation.forecastDays} дней. Прогноз осадков (${recommendation.totalPrecipitationMm} мм) недостаточен для покрытия водного дефицита культуры.`,
      farmerAdvice: `Распределите полив на ранние утренние часы (${recommendation.recommendedWindowSummary}), чтобы минимизировать ветровой снос и пиковое испарение.`,
      conservationImpact: `Соблюдение данного графика экономит ориентировочно ${recommendation.potentialTotalSavingsM3.toLocaleString()} м³ (${recommendation.potentialSavingsPercentage}%) по сравнению с традиционным затоплением.`,
      modelConfidence: 'high' as const,
      source: 'algorithmic_fallback' as const,
    }
  );

  React.useEffect(() => {
    if (recommendation.aiExplanation) {
      setExplanation(recommendation.aiExplanation);
    }
  }, [recommendation]);

  const handleAskGemini = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendation }),
      });

      if (res.ok) {
        const data = await res.json();
        const updated = {
          summary: data.summary,
          farmerAdvice: data.farmerAdvice,
          conservationImpact: data.conservationImpact,
          modelConfidence: data.modelConfidence || 'high',
          source: data.source || 'gemini',
        };
        setExplanation(updated);
        if (onUpdateExplanation) {
          onUpdateExplanation(updated);
        }
      }
    } catch (err) {
      console.error('Failed to query AI advisor:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const q = (textToSend || inputQuery).trim();
    if (!q || isSending) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsSending(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          recommendation,
          farm,
          history: chatMessages.slice(-4),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'model',
            text: data.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        throw new Error('Chat failed');
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: 'Рекомендуется придерживаться текущей нормы полива FAO-56. Для минимизации потерь включайте полив в утреннее время до 09:00.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const quickPrompts = [
    '💨 Полив при сильном ветре',
    '🧂 Что делать при засолении почвы?',
    '⏰ В какие часы лучше включать насос?',
    '🧪 Как проводить фертигацию?',
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden space-y-0">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-sky-50/70 via-white to-emerald-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-sky-600 to-emerald-500 text-white rounded-2xl shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">{t.advisorTitle}</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                FAO-56 Grounded
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Интерактивный научный консультант по поливу и защите почвы
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAskGemini}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Консультация...' : t.refreshAiBtn}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Core summary highlight */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-sky-600" />
            Ключевой вывод гидромодели
          </div>
          <p className="text-sm font-semibold text-slate-800 leading-relaxed">
            &ldquo;{explanation.summary}&rdquo;
          </p>
        </div>

        {/* Practical Farmer Guidance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              {t.operationalAdviceTitle}
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {explanation.farmerAdvice}
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/40 shadow-2xs">
            <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {t.impactTitle}
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed font-semibold">
              {explanation.conservationImpact}
            </p>
          </div>
        </div>

        {/* Interactive Chat with Agronomist */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
              Задать вопрос ИИ-агроному
            </h4>
            <span className="text-[11px] text-slate-400">В режиме реального диалога</span>
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((promptText, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(promptText.replace(/^[^\s]+\s/, ''))}
                className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-800 text-slate-600 border border-slate-200/60 transition-colors"
              >
                {promptText}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="space-y-2.5 max-h-60 overflow-y-auto p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 scrollbar-thin">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 text-xs ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'model' && (
                  <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed shadow-2xs ${
                    msg.role === 'user'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-800 border border-slate-200/80'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1 ${
                      msg.role === 'user' ? 'text-slate-400 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
            {isSending && (
              <div className="flex gap-2 text-xs items-center text-slate-500 italic py-1">
                <Bot className="w-3.5 h-3.5 text-sky-600 animate-spin" />
                <span>Агроном готовит обоснованный ответ...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form
            id="ai-advisor-chat-form"
            name="aiAdvisorChatForm"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="ai-advisor-query-input"
              name="aiAdvisorQuery"
              type="text"
              autoComplete="off"
              aria-label="Вопрос агроному-гидрологу"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Спросите агронома (например: «Можно ли поливать завтра днем?»)..."
              disabled={isSending}
              className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 placeholder:text-slate-400"
            />
            <button
              id="ai-advisor-submit-btn"
              name="aiAdvisorSubmit"
              type="submit"
              disabled={isSending || !inputQuery.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-semibold text-xs shadow-2xs transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Спросить</span>
            </button>
          </form>
        </div>

        {/* Scientific Integrity Disclaimer */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Рекомендации строго верифицированы принципами гидрологии FAO-56.</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">
            Достоверность: {explanation.modelConfidence.toUpperCase()} • Режим: {explanation.source}
          </span>
        </div>
      </div>
    </div>
  );
};
