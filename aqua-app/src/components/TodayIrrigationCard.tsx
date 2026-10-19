'use client';
import { useTranslation } from '@/lib/i18n';
import type { IrrigationRecommendation } from '@/lib/types';

export function TodayIrrigationCard({ recommendation, weatherSource }: {
  recommendation: IrrigationRecommendation;
  weatherSource: 'live' | 'fallback';
}) {
  const { language } = useTranslation();
  const today = recommendation.schedule[0];
  if (!today) return null;
  const ru = language === 'ru';
  const kk = language === 'kk';
  const demo = weatherSource !== 'live';
  const labels = {
    heading: ru ? 'План полива на сегодня' : kk ? 'Бүгінгі суару жоспары' : 'Today’s irrigation plan',
    volume: ru ? 'Расчётная потребность' : kk ? 'Есептік су қажеттілігі' : 'Modelled water requirement',
    rain: ru ? 'Осадки в прогнозе' : kk ? 'Болжамдағы жауын-шашын' : 'Forecast rainfall',
    et: ru ? 'Потребность культуры ETc' : kk ? 'Дақылдың су қажеттілігі ETc' : 'Crop water demand ETc',
    warning: ru ? 'ДЕМО: синтетический прогноз. Не использовать для решений на поле.' : kk ? 'ДЕМО: синтетикалық болжам. Нақты суару үшін қолданбаңыз.' : 'DEMO: synthetic weather. Do not use for real irrigation decisions.',
    live: ru ? 'Прогноз Open-Meteo, не измерение влажности почвы' : kk ? 'Open-Meteo болжамы, топырақ өлшемі емес' : 'Open-Meteo forecast, not measured soil moisture',
    check: ru ? 'Перед поливом проверьте влажность почвы, насос и прогноз.' : kk ? 'Суарудан бұрын топырақ ылғалын, сорғыны және болжамды тексеріңіз.' : 'Check soil moisture, pump capacity and current weather before irrigating.',
    water: ru ? 'Потенциальная подача воды (не факт)' : kk ? 'Есептік су көлемі (нақты емес)' : 'Potential water delivery (not actual)',
  };
  return (
    <section aria-label={labels.heading} className="bg-white rounded-3xl border border-sky-200 shadow-sm p-5 sm:p-8 space-y-4">
      <div className="flex flex-wrap gap-3 justify-between items-start">
        <div>
          <div className="text-xs text-sky-800 font-bold uppercase">{labels.heading}</div>
          <h2 className="text-2xl font-black text-slate-900 mt-1">{today.date}</h2>
        </div>
        <span className={demo ? 'rounded-xl px-3 py-2 bg-amber-100 text-amber-900 text-sm font-bold' : 'rounded-xl px-3 py-2 bg-sky-50 text-sky-900 text-sm font-bold'}>
          {demo ? 'SIMULATED / DEMO' : 'OPEN-METEO FORECAST'}
        </span>
      </div>
      {demo && <p role="alert" className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-sm font-bold">{labels.warning}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-sky-50 rounded-xl p-4"><p className="text-xs text-sky-800">{labels.volume}</p><p className="text-3xl font-black text-slate-900">{today.waterVolumeM3.toLocaleString()} м³</p><p className="text-xs text-sky-700">{labels.water}</p></div>
        <div className="bg-slate-50 rounded-xl p-4"><p className="text-xs text-slate-600">{labels.rain}</p><p className="text-2xl font-bold text-slate-900">{today.precipitationMm} мм</p></div>
        <div className="bg-slate-50 rounded-xl p-4"><p className="text-xs text-slate-600">{labels.et}</p><p className="text-2xl font-bold text-slate-900">{today.etcMm} мм</p></div>
      </div>
      <p className="text-sm font-medium text-slate-800">{today.actionReason}</p>
      <p className="text-sm text-slate-600">{demo ? labels.warning : labels.live}. {labels.check}</p>
    </section>
  );
}
