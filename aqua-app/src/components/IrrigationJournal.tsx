'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { FarmProfile, IrrigationRecommendation } from '@/lib/types';

type IrrigationEntry = {
  id: string;
  farmId: string;
  date: string;
  actualM3: number;
  source: 'meter' | 'pump_estimate';
  notes: string;
  savedAt: string;
};

const KEY = 'aqua_irrigation_log_v1';

function readEntries(): IrrigationEntry[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(data)) return [];
    return data.filter((x): x is IrrigationEntry =>
      !!x && typeof x === 'object' &&
      typeof x.id === 'string' && typeof x.farmId === 'string' &&
      typeof x.date === 'string' && typeof x.actualM3 === 'number' &&
      Number.isFinite(x.actualM3) && x.actualM3 >= 0 &&
      (x.source === 'meter' || x.source === 'pump_estimate')
    );
  } catch {
    return [];
  }
}

export function IrrigationJournal({ farm, recommendation }: {
  farm: FarmProfile;
  recommendation: IrrigationRecommendation;
}) {
  const [entries, setEntries] = useState<IrrigationEntry[]>([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [volume, setVolume] = useState('');
  const [source, setSource] = useState<'meter' | 'pump_estimate'>('meter');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => { setEntries(readEntries()); }, []);
  const forFarm = useMemo(() => entries.filter((e) => e.farmId === farm.id).sort(
    (a, b) => b.date.localeCompare(a.date) || b.savedAt.localeCompare(a.savedAt)
  ), [entries, farm.id]);
  const actualTotal = forFarm.reduce((sum, e) => sum + e.actualM3, 0);
  const recordedDates = [...new Set(forFarm.map(e => e.date))];
  const plannedForRecordedDates = recordedDates.reduce((sum, date) => {
    const day = recommendation.schedule.find((x) => x.date === date);
    return sum + (day?.waterVolumeM3 ?? 0);
  }, 0);

  function addEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const actualM3 = Number(volume);
    if (!date || !Number.isFinite(actualM3) || actualM3 < 0 || volume.trim() === '') {
      setMessage('Укажите дату и корректный объём воды.');
      return;
    }
    if (actualM3 > 1_000_000_000) {
      setMessage('Проверьте введённый объём воды.');
      return;
    }
    const entry: IrrigationEntry = {
      id: crypto.randomUUID(), farmId: farm.id, date, actualM3,
      source, notes: notes.slice(0, 240), savedAt: new Date().toISOString(),
    };
    const updated = [entry, ...readEntries()].slice(0, 1000);
    try {
      localStorage.setItem(KEY, JSON.stringify(updated));
      setEntries(updated);
      setVolume(''); setNotes('');
      setMessage('Запись сохранена в этом браузере.');
    } catch {
      setMessage('Не удалось сохранить запись: проверьте доступное место в браузере.');
    }
  }

  function removeEntry(id: string) {
    const updated = readEntries().filter((entry) => entry.id !== id);
    try {
      localStorage.setItem(KEY, JSON.stringify(updated));
      setEntries(updated);
    } catch {
      setMessage('Не удалось удалить запись.');
    }
  }

  return (
    <section className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Журнал фактических поливов</h2>
        <p className="mt-1 text-sm text-slate-600">
          Сравнивайте расчётную норму с водой, которую действительно подали на поле «{farm.name}».
          Записи сохраняются только в текущем браузере. Это не верифицированная экономия воды.
        </p>
      </div>
      <form onSubmit={addEntry} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
        <label className="block text-xs font-medium text-slate-700">
          Дата полива
          <input type="date" required value={date} onChange={e => setDate(e.target.value)}
            className="mt-1 w-full border rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="block text-xs font-medium text-slate-700">
          Фактический объём, м³
          <input type="number" required min="0" max="1000000000" step="0.1" placeholder="Например, 250"
            value={volume} onChange={e => setVolume(e.target.value)}
            className="mt-1 w-full border rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="block text-xs font-medium text-slate-700">
          Источник данных
          <select value={source} onChange={e => setSource(e.target.value as IrrigationEntry['source'])}
            className="mt-1 w-full border rounded-xl px-3 py-2 text-sm">
            <option value="meter">Расходомер</option>
            <option value="pump_estimate">Оценка по насосу</option>
          </select>
        </label>
        <button type="submit" className="rounded-xl bg-sky-700 text-white font-semibold px-4 py-2">
          Записать полив
        </button>
        <label className="sm:col-span-2 lg:col-span-4 block text-xs font-medium text-slate-700">
          Примечание (необязательно)
          <input type="text" maxLength={240} value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Показания счётчика / расход насоса"
            className="mt-1 w-full border rounded-xl px-3 py-2 text-sm" />
        </label>
      </form>
      {message && <p role="status" className="text-sm text-slate-600">{message}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="text-xs text-slate-600">Записанный фактический расход</div>
          <div className="text-2xl font-bold">{actualTotal.toLocaleString('ru-RU')} м³</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="text-xs text-slate-600">План на даты записей в текущем прогнозе</div>
          <div className="text-2xl font-bold">{plannedForRecordedDates.toLocaleString('ru-RU')} м³</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="text-xs text-slate-600">Число записей</div>
          <div className="text-2xl font-bold">{forFarm.length}</div>
        </div>
      </div>
      <p className="text-xs text-slate-500">
        План и факт сопоставимы только для дат, входящих в текущий семидневный прогноз.
        Повторные записи за один день отражают несколько циклов полива; план для них нельзя суммировать несколько раз.
        Для доказательства экономии потребуется сопоставимый исторический базовый период.
      </p>
      {forFarm.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead><tr className="border-b"><th className="py-2">Дата</th><th>Факт, м³</th><th>Источник</th><th>Заметка</th><th /></tr></thead>
            <tbody>{forFarm.slice(0, 20).map(entry => (
              <tr key={entry.id} className="border-b">
                <td className="py-2">{entry.date}</td>
                <td>{entry.actualM3.toLocaleString('ru-RU')}</td>
                <td>{entry.source === 'meter' ? 'Расходомер' : 'Оценка по насосу'}</td>
                <td className="max-w-xs break-words">{entry.notes}</td>
                <td><button type="button" onClick={() => removeEntry(entry.id)}
                  className="text-red-700 underline">Удалить</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
