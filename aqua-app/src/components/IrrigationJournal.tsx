'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  FarmProfile,
  IrrigationEntry,
  IrrigationMeasurementMethod,
  IrrigationRecommendation,
  PumpProfile,
} from '@/lib/types';
import {
  getIrrigationEvents,
  saveIrrigationEvent,
  deleteIrrigationEvent,
  getPumpProfiles,
} from '@/lib/db-service';
import { useAuth } from '@/lib/auth-context';
import {
  Droplets,
  Gauge,
  Clock,
  FileSpreadsheet,
  Trash2,
  Edit2,
  Plus,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface IrrigationJournalProps {
  farm: FarmProfile;
  recommendation: IrrigationRecommendation;
}

export const IrrigationJournal: React.FC<IrrigationJournalProps> = ({
  farm,
  recommendation,
}) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<IrrigationEntry[]>([]);
  const [pumps, setPumps] = useState<PumpProfile[]>([]);
  const [selectedPumpId, setSelectedPumpId] = useState<string>('');

  // Mode selection: 'meter_diff' | 'pump_runtime' | 'manual_source'
  const [method, setMethod] = useState<IrrigationMeasurementMethod>('meter_diff');

  // Form Fields
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('06:00');
  const [notes, setNotes] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Flowmeter readings
  const [meterBefore, setMeterBefore] = useState<string>('');
  const [meterAfter, setMeterAfter] = useState<string>('');

  // Pump runtime
  const [customFlowRate, setCustomFlowRate] = useState<string>('45');
  const [pumpHours, setPumpHours] = useState<string>('4');
  const [pumpMinutes, setPumpMinutes] = useState<string>('0');

  // Manual volume & mandatory source
  const [manualVolume, setManualVolume] = useState<string>('');
  const [manualSourceTag, setManualSourceTag] = useState<'channel_coupon' | 'hydropost' | 'manual_estimate'>('channel_coupon');

  // Editing state
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  // Load entries and pumps
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const evs = await getIrrigationEvents(farm.id);
      const pmps = await getPumpProfiles(farm.id);
      if (isMounted) {
        setEntries(evs);
        setPumps(pmps);
        if (pmps.length > 0) {
          setSelectedPumpId(pmps[0].id);
          setCustomFlowRate(pmps[0].flowRateM3H.toString());
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [farm.id]);

  // Sync selected pump with flow rate input
  const handlePumpSelect = (pId: string) => {
    setSelectedPumpId(pId);
    const found = pumps.find((p) => p.id === pId);
    if (found) {
      setCustomFlowRate(found.flowRateM3H.toString());
    }
  };

  // Calculated preview volume based on active method
  const calculatedPreviewVolume = useMemo(() => {
    if (method === 'meter_diff') {
      const b = parseFloat(meterBefore);
      const a = parseFloat(meterAfter);
      if (Number.isFinite(b) && Number.isFinite(a) && a >= b) {
        return Number((a - b).toFixed(1));
      }
      return null;
    }
    if (method === 'pump_runtime') {
      const rate = parseFloat(customFlowRate);
      const h = parseFloat(pumpHours) || 0;
      const m = parseFloat(pumpMinutes) || 0;
      const totalHours = h + m / 60;
      if (Number.isFinite(rate) && rate > 0 && totalHours > 0) {
        return Number((rate * totalHours).toFixed(1));
      }
      return null;
    }
    if (method === 'manual_source') {
      const vol = parseFloat(manualVolume);
      if (Number.isFinite(vol) && vol > 0) {
        return Number(vol.toFixed(1));
      }
      return null;
    }
    return null;
  }, [method, meterBefore, meterAfter, customFlowRate, pumpHours, pumpMinutes, manualVolume]);

  // Aggregate statistics for farm
  const stats = useMemo(() => {
    const farmEntries = entries.filter((e) => e.farmId === farm.id);
    let measuredM3 = 0;
    let estimatedM3 = 0;

    farmEntries.forEach((e) => {
      if (e.method === 'meter_diff') {
        measuredM3 += e.actualM3;
      } else {
        estimatedM3 += e.actualM3;
      }
    });

    const totalActual = measuredM3 + estimatedM3;
    const recordedDates = Array.from(new Set(farmEntries.map((e) => e.date)));

    const plannedForMatchingDates = recordedDates.reduce((sum, d) => {
      const daySchedule = recommendation.schedule.find((s) => s.date === d);
      return sum + (daySchedule?.waterVolumeM3 ?? 0);
    }, 0);

    return {
      measuredM3,
      estimatedM3,
      totalActual,
      plannedForMatchingDates,
      count: farmEntries.length,
    };
  }, [entries, farm.id, recommendation.schedule]);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const actualM3 = calculatedPreviewVolume;
    if (actualM3 === null || actualM3 < 0) {
      setStatusMessage({
        text: 'Пожалуйста, проверьте корректность введённых данных расхода.',
        type: 'error',
      });
      return;
    }

    if (actualM3 > 1_000_000_000) {
      setStatusMessage({
        text: 'Введённое значение объёма превышает допустимый предел.',
        type: 'error',
      });
      return;
    }

    let sourceTag: IrrigationEntry['sourceTag'] = 'meter';
    let mBefore: number | undefined;
    let mAfter: number | undefined;
    let pRate: number | undefined;
    let pHours: number | undefined;
    let pMins: number | undefined;

    if (method === 'meter_diff') {
      sourceTag = 'meter';
      mBefore = parseFloat(meterBefore);
      mAfter = parseFloat(meterAfter);
    } else if (method === 'pump_runtime') {
      sourceTag = 'pump_estimate';
      pRate = parseFloat(customFlowRate);
      pHours = parseFloat(pumpHours) || 0;
      pMins = parseFloat(pumpMinutes) || 0;
    } else {
      sourceTag = manualSourceTag;
    }

    const newOrUpdatedEntry: IrrigationEntry = {
      id: editingEntryId || `entry-${Date.now().toString(36)}`,
      farmId: farm.id,
      userId: user?.id,
      date,
      time,
      actualM3,
      method,
      sourceTag,
      meterBefore: mBefore,
      meterAfter: mAfter,
      pumpFlowRate: pRate,
      pumpHours: pHours,
      pumpMinutes: pMins,
      notes: notes.trim(),
      savedAt: editingEntryId
        ? entries.find((x) => x.id === editingEntryId)?.savedAt || new Date().toISOString()
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedList = await saveIrrigationEvent(newOrUpdatedEntry, user?.id);
    setEntries(updatedList);

    // Reset form
    setEditingEntryId(null);
    setMeterBefore('');
    setMeterAfter('');
    setManualVolume('');
    setNotes('');
    setStatusMessage({
      text: editingEntryId ? 'Запись полива успешно обновлена!' : 'Запись полива успешно добавлена в журнал!',
      type: 'success',
    });
  };

  const handleEdit = (entry: IrrigationEntry) => {
    setEditingEntryId(entry.id);
    setDate(entry.date);
    setTime(entry.time || '06:00');
    setNotes(entry.notes);
    setMethod(entry.method);

    if (entry.method === 'meter_diff') {
      setMeterBefore(entry.meterBefore !== undefined ? entry.meterBefore.toString() : '');
      setMeterAfter(entry.meterAfter !== undefined ? entry.meterAfter.toString() : '');
    } else if (entry.method === 'pump_runtime') {
      setCustomFlowRate(entry.pumpFlowRate ? entry.pumpFlowRate.toString() : '45');
      setPumpHours(entry.pumpHours !== undefined ? entry.pumpHours.toString() : '4');
      setPumpMinutes(entry.pumpMinutes !== undefined ? entry.pumpMinutes.toString() : '0');
    } else {
      setManualVolume(entry.actualM3.toString());
      if (entry.sourceTag === 'channel_coupon' || entry.sourceTag === 'hydropost' || entry.sourceTag === 'manual_estimate') {
        setManualSourceTag(entry.sourceTag);
      }
    }

    // Scroll smoothly to form
    const formElement = document.getElementById('irrigation-entry-form');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Удалить эту запись полива из журнала?')) return;
    const updated = await deleteIrrigationEvent(id, farm.id);
    setEntries(updated);
    if (editingEntryId === id) {
      setEditingEntryId(null);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const farmEntries = entries.filter((e) => e.farmId === farm.id);
    if (farmEntries.length === 0) {
      alert('Нет записей для экспорта.');
      return;
    }

    const headers = [
      'ID',
      'Хозяйство',
      'Дата',
      'Время',
      'Объём (м³)',
      'Способ учёта',
      'Источник данных',
      'Показания ДО',
      'Показания ПОСЛЕ',
      'Подача насоса (м³/ч)',
      'Время работы (ч)',
      'Примечание',
      'Создано',
    ];

    const rows = farmEntries.map((e) => [
      e.id,
      `"${farm.name.replace(/"/g, '""')}"`,
      e.date,
      e.time || '',
      e.actualM3,
      e.method,
      e.sourceTag,
      e.meterBefore ?? '',
      e.meterAfter ?? '',
      e.pumpFlowRate ?? '',
      e.pumpHours !== undefined ? `${e.pumpHours}ч ${e.pumpMinutes || 0}м` : '',
      `"${(e.notes || '').replace(/"/g, '""')}"`,
      e.savedAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aqua_ai_irrigation_journal_${farm.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="irrigation-tracking-section" className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-8 space-y-6 shadow-xs">
      {/* Header with Title and Export Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-100 text-sky-800 rounded-xl">
              <Droplets className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              Учёт фактического расхода воды (Water Usage Tracking)
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-3xl">
            Фиксация реального объёма по расходомеру, расчёту насоса или талонам канала для хозяйства «{farm.name}».
            Разграничивает измеренные и оценочные объёмы.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs cursor-pointer"
          title="Экспортировать журнал в CSV"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Выгрузить CSV</span>
        </button>
      </div>

      {/* Aggregate KPI Summary Cards */}
      <div className="grid grid-cols-1 min-[390px]:grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Всего внесено</div>
          <div className="mt-1 text-xl sm:text-2xl font-black text-slate-900">
            {stats.totalActual.toLocaleString('ru-RU')} <span className="text-xs font-normal text-slate-500">м³</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">{stats.count} записей в журнале</div>
        </div>

        <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-200/70">
          <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
            <Gauge className="w-3 h-3 text-emerald-600" />
            <span>Измерено (Счётчик)</span>
          </div>
          <div className="mt-1 text-xl sm:text-2xl font-black text-emerald-900">
            {stats.measuredM3.toLocaleString('ru-RU')} <span className="text-xs font-normal text-emerald-700">м³</span>
          </div>
          <div className="text-[10px] text-emerald-700 mt-1">Прямой приборный замер</div>
        </div>

        <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/70">
          <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Оценочно (Насос/Талон)</span>
          </div>
          <div className="mt-1 text-xl sm:text-2xl font-black text-amber-900">
            {stats.estimatedM3.toLocaleString('ru-RU')} <span className="text-xs font-normal text-amber-700">м³</span>
          </div>
          <div className="text-[10px] text-amber-700 mt-1">Оценка по времени / нормативу</div>
        </div>

        <div className="bg-sky-50/60 rounded-2xl p-4 border border-sky-200/70">
          <div className="text-[11px] font-semibold text-sky-800 uppercase tracking-wider">План FAO-56 на эти дни</div>
          <div className="mt-1 text-xl sm:text-2xl font-black text-sky-900">
            {stats.plannedForMatchingDates.toLocaleString('ru-RU')} <span className="text-xs font-normal text-sky-700">м³</span>
          </div>
          <div className="text-[10px] text-sky-700 mt-1">Расчёт на сопоставимые даты</div>
        </div>
      </div>

      {/* Input Mode Selector Tabs */}
      <div id="irrigation-entry-form" className="bg-slate-50/80 rounded-2xl p-3 sm:p-5 border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-sky-600" />
            {editingEntryId ? 'Редактирование записи' : 'Новая запись фактического полива'}
          </span>

          {editingEntryId && (
            <button
              onClick={() => {
                setEditingEntryId(null);
                setMeterBefore('');
                setMeterAfter('');
                setManualVolume('');
                setNotes('');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              Отменить редактирование
            </button>
          )}
        </div>

        {/* 3 Radio-like Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setMethod('meter_diff')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              method === 'meter_diff'
                ? 'bg-white border-sky-500 ring-2 ring-sky-500/20 shadow-xs'
                : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <Gauge className={`w-4 h-4 ${method === 'meter_diff' ? 'text-sky-600' : 'text-slate-400'}`} />
              <span className="text-xs font-bold text-slate-800">1. По расходомеру</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Показания счётчика до и после полива
            </p>
          </button>

          <button
            type="button"
            onClick={() => setMethod('pump_runtime')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              method === 'pump_runtime'
                ? 'bg-white border-sky-500 ring-2 ring-sky-500/20 shadow-xs'
                : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${method === 'pump_runtime' ? 'text-sky-600' : 'text-slate-400'}`} />
              <span className="text-xs font-bold text-slate-800">2. По насосу</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Подача (м³/ч) × часы и минуты работы
            </p>
          </button>

          <button
            type="button"
            onClick={() => setMethod('manual_source')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              method === 'manual_source'
                ? 'bg-white border-sky-500 ring-2 ring-sky-500/20 shadow-xs'
                : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <HelpCircle className={`w-4 h-4 ${method === 'manual_source' ? 'text-sky-600' : 'text-slate-400'}`} />
              <span className="text-xs font-bold text-slate-800">3. Ручной ввод / Талон</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Талоны канала, гидропост или оценка
            </p>
          </button>
        </div>

        {/* Dynamic Form Content */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Method 1: Flowmeter Difference */}
          {method === 'meter_diff' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Показания счётчика ДО полива (м³)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  placeholder="Например, 14200"
                  value={meterBefore}
                  onChange={(e) => setMeterBefore(e.target.value)}
                  className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Показания счётчика ПОСЛЕ полива (м³)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  placeholder="Например, 14550"
                  value={meterAfter}
                  onChange={(e) => setMeterAfter(e.target.value)}
                  className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 flex flex-col justify-center">
                <span className="text-[11px] text-sky-800 font-medium">Расчётный расход по счётчику:</span>
                <span className="text-lg font-bold text-sky-950">
                  {calculatedPreviewVolume !== null ? `${calculatedPreviewVolume.toLocaleString('ru-RU')} м³` : '—'}
                </span>
              </div>
            </div>
          )}

          {/* Method 2: Pump Runtime */}
          {method === 'pump_runtime' && (
            <div className="space-y-3">
              {pumps.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Выберите насос из профиля хозяйства
                  </label>
                  <select
                    value={selectedPumpId}
                    onChange={(e) => handlePumpSelect(e.target.value)}
                    className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
                  >
                    {pumps.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.flowRateM3H} м³/ч, {p.energyType === 'diesel' ? 'дизель' : 'электро'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Производительность насоса (м³/час)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={customFlowRate}
                    onChange={(e) => setCustomFlowRate(e.target.value)}
                    className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Время работы (часов)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={pumpHours}
                    onChange={(e) => setPumpHours(e.target.value)}
                    className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Минут (0–59)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    step="1"
                    value={pumpMinutes}
                    onChange={(e) => setPumpMinutes(e.target.value)}
                    className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center justify-between">
                <span className="text-xs text-amber-800">
                  Расчётная подача насоса ({customFlowRate} м³/ч × {pumpHours}ч {pumpMinutes}м):
                </span>
                <span className="text-lg font-bold text-amber-950">
                  {calculatedPreviewVolume !== null ? `${calculatedPreviewVolume.toLocaleString('ru-RU')} м³` : '—'}
                </span>
              </div>
            </div>
          )}

          {/* Method 3: Manual Input with Mandatory Source */}
          {method === 'manual_source' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Объём воды (м³)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  placeholder="Например, 350"
                  value={manualVolume}
                  onChange={(e) => setManualVolume(e.target.value)}
                  className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Обязательная маркировка источника
                </label>
                <select
                  value={manualSourceTag}
                  onChange={(e) => setManualSourceTag(e.target.value as any)}
                  className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
                >
                  <option value="channel_coupon">Талоны магистрального канала (Казводхоз)</option>
                  <option value="hydropost">Показания гидропоста / водомерного лотка</option>
                  <option value="manual_estimate">Оценка агронома по площади и глубине</option>
                </select>
              </div>
            </div>
          )}

          {/* Common Meta Fields: Date, Time, Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Дата полива</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Время начала полива</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Примечание</label>
              <input
                type="text"
                maxLength={200}
                placeholder="Сектор А-1, давление 2.2 бар"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Droplets className="w-4 h-4 text-cyan-300" />
              <span>{editingEntryId ? 'Сохранить изменения' : 'Записать полив'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Disclaimers & Integrity Note */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-sky-600" />
          <span>Методологическая строгость учёта воды:</span>
        </div>
        <p className="leading-relaxed">
          • <strong>Измеренное потребление:</strong> только прямые показания физического расходомера.
          <br />• <strong>Оценочное потребление:</strong> расчёт по паспорту насоса или талонам водораспределителя не является инструментальным замером.
          <br />• <strong>Разница «план минус факт»:</strong> отражает оперативное отклонение полива от агрономической модели FAO-56. Система не заявляет эту разницу как официально подтверждённую экономию без калиброванного исторического базового периода.
        </p>
      </div>

      {/* Table of Recorded Entries */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">
          История поливов хозяйства ({entries.filter((e) => e.farmId === farm.id).length})
        </h3>

        {entries.filter((e) => e.farmId === farm.id).length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
            В журнале пока нет записей о поливе. Используйте форму выше, чтобы зафиксировать первый полив.
          </div>
        ) : (
          <div className="overflow-x-auto max-w-full border border-slate-200 rounded-2xl">
            <table className="min-w-[650px] w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">Дата и время</th>
                  <th className="py-3 px-4">Объём (м³)</th>
                  <th className="py-3 px-4">Способ определения</th>
                  <th className="py-3 px-4">Детали / Примечания</th>
                  <th className="py-3 px-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries
                  .filter((e) => e.farmId === farm.id)
                  .map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {entry.date} <span className="text-slate-400 font-normal">{entry.time || ''}</span>
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {entry.actualM3.toLocaleString('ru-RU')} м³
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {entry.method === 'meter_diff' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <Gauge className="w-3 h-3 text-emerald-600" />
                            Измерено расходомером
                          </span>
                        ) : entry.method === 'pump_runtime' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Оценка по насосу
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                            <HelpCircle className="w-3 h-3 text-sky-600" />
                            {entry.sourceTag === 'channel_coupon'
                              ? 'Талон канала'
                              : entry.sourceTag === 'hydropost'
                              ? 'Гидропост'
                              : 'Оценка'}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {entry.method === 'meter_diff' && entry.meterBefore !== undefined && entry.meterAfter !== undefined && (
                          <span className="text-slate-500 font-mono text-[11px] mr-2">
                            [{entry.meterBefore} → {entry.meterAfter}]
                          </span>
                        )}
                        {entry.method === 'pump_runtime' && entry.pumpFlowRate && (
                          <span className="text-slate-500 font-mono text-[11px] mr-2">
                            [{entry.pumpFlowRate} м³/ч × {entry.pumpHours || 0}ч]
                          </span>
                        )}
                        <span>{entry.notes || '—'}</span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(entry)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            title="Редактировать запись"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            title="Удалить запись"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
