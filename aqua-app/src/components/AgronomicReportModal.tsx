'use client';

import React, { useRef } from 'react';
import {
  FarmProfile,
  IrrigationRecommendation,
  IrrigationEntry,
  EconomicTariffs,
} from '@/lib/types';
import {
  X,
  Printer,
  Download,
  Droplets,
  Calendar,
  MapPin,
  ShieldAlert,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { formatLocalizedDate } from '@/lib/i18n';

interface AgronomicReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  farm: FarmProfile;
  recommendation: IrrigationRecommendation;
  events: IrrigationEntry[];
  tariffs: EconomicTariffs;
}

export const AgronomicReportModal: React.FC<AgronomicReportModalProps> = ({
  isOpen,
  onClose,
  farm,
  recommendation,
  events,
  tariffs,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const farmEvents = events.filter((e) => e.farmId === farm.id);
  const totalActualM3 = farmEvents.reduce((sum, e) => sum + e.actualM3, 0);
  const measuredM3 = farmEvents
    .filter((e) => e.method === 'meter_diff')
    .reduce((sum, e) => sum + e.actualM3, 0);
  const estimatedM3 = totalActualM3 - measuredM3;

  // Economic calculations
  const modeledWaterCost = recommendation.totalVolumeM3 * tariffs.waterPricePerM3;
  const baselineWaterCost = recommendation.baselineTotalVolumeM3 * tariffs.waterPricePerM3;
  const potentialWaterSavingsCost = recommendation.potentialTotalSavingsM3 * tariffs.waterPricePerM3;

  const electricityKwh = recommendation.potentialTotalSavingsM3 * 0.35;
  const potentialEnergySavingsCost = electricityKwh * tariffs.electricityPricePerKwh;
  const totalPotentialEconomicBenefit = potentialWaterSavingsCost + potentialEnergySavingsCost;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[96dvh] sm:max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Modal Controls Bar (hidden during print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-3 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-bold text-slate-900">
              Агрономический отчёт по водопользованию (PDF / Печать)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-sky-700 hover:bg-sky-800 text-white transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Печать / Сохранить в PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div ref={printRef} className="p-6 sm:p-10 overflow-y-auto space-y-6 text-slate-800 text-xs print:p-8 print:text-xs">
          {/* Document Header */}
          <div className="flex flex-wrap items-center justify-between pb-6 border-b-2 border-slate-900 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900">Aqua</span>
                <span className="text-2xl font-black tracking-tight text-sky-700">AI</span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-2">
                  AgriTech Intelligence
                </span>
              </div>
              <h1 className="text-lg font-extrabold text-slate-900 mt-1">
                Сводный отчёт по планированию и расходу оросительной воды
              </h1>
              <p className="text-slate-500 text-[11px]">
                Моделирование по международному стандарту FAO-56 Penman-Monteith • Казахстан и Центральная Азия
              </p>
            </div>

            <div className="text-right text-[11px] text-slate-500">
              <div>Дата формирования: {new Date().toLocaleDateString('ru-RU')}</div>
              <div>ID Рекомендации: <span className="font-mono font-semibold text-slate-700">{recommendation.id}</span></div>
              <div>Статус: <span className="font-semibold text-emerald-700">Официальная версия AquaAI</span></div>
            </div>
          </div>

          {/* Farm and Field Identification */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Хозяйство</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{farm.name}</div>
              <div className="text-[11px] text-slate-500">{farm.region}</div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Координаты</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono">
                {farm.latitude.toFixed(4)}°N, {farm.longitude.toFixed(4)}°E
              </div>
              <div className="text-[11px] text-slate-500">{farm.locationName}</div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Культура и площадь</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {farm.fieldSizeHectares} га • {farm.cropType.toUpperCase()}
              </div>
              <div className="text-[11px] text-slate-500">Фаза: {farm.growthStage}</div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Способ орошения</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {farm.irrigationMethod === 'drip' ? 'Капельное (КПД 90%)' : farm.irrigationMethod === 'sprinkler' ? 'Дождевание (КПД 75%)' : 'Бороздной полив (КПД 55%)'}
              </div>
              <div className="text-[11px] text-slate-500">Тип почвы: {farm.soilType}</div>
            </div>
          </div>

          {/* Core Hydrological Summary */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. Расчётный водный баланс на период ({recommendation.periodStart} — {recommendation.periodEnd})
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-100/70 rounded-xl">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Водопотребность (ETc)</span>
                <div className="text-base font-bold text-slate-900 mt-1">{recommendation.totalEtcMm} мм</div>
                <div className="text-[10px] text-slate-500">Биологическая потребность</div>
              </div>

              <div className="p-3 bg-slate-100/70 rounded-xl">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Эффективные осадки</span>
                <div className="text-base font-bold text-slate-900 mt-1">{recommendation.totalEffectiveRainfallMm} мм</div>
                <div className="text-[10px] text-slate-500">Из {recommendation.totalPrecipitationMm} мм осадков</div>
              </div>

              <div className="p-3 bg-sky-50 rounded-xl border border-sky-100">
                <span className="text-[10px] font-semibold text-sky-800 uppercase">Норма AquaAI</span>
                <div className="text-base font-bold text-sky-950 mt-1">{recommendation.totalVolumeM3.toLocaleString()} м³</div>
                <div className="text-[10px] text-sky-700">{recommendation.totalGrossIrrigationMm} мм брутто</div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-[10px] font-semibold text-emerald-800 uppercase">Потенциал сбережения</span>
                <div className="text-base font-bold text-emerald-950 mt-1">{recommendation.potentialTotalSavingsM3.toLocaleString()} м³</div>
                <div className="text-[10px] text-emerald-700">↓ {recommendation.potentialSavingsPercentage}% vs арычный полив</div>
              </div>
            </div>
          </div>

          {/* Daily Schedule Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              2. Суточный график полива (FAO-56 Schedule)
            </h3>

            <table className="w-full text-[11px] text-left border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Дата</th>
                  <th className="py-2 px-3">Погода</th>
                  <th className="py-2 px-3">ET0, мм</th>
                  <th className="py-2 px-3">Kc</th>
                  <th className="py-2 px-3">ETc, мм</th>
                  <th className="py-2 px-3">Осадки, мм</th>
                  <th className="py-2 px-3">Объём, м³</th>
                  <th className="py-2 px-3">Рекомендация</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recommendation.schedule.map((day) => (
                  <tr key={day.date} className="hover:bg-slate-50">
                    <td className="py-1.5 px-3 font-semibold text-slate-900">{day.date}</td>
                    <td className="py-1.5 px-3 text-slate-600">{day.conditionLabel} ({day.tempMaxC}°C)</td>
                    <td className="py-1.5 px-3">{day.et0Mm}</td>
                    <td className="py-1.5 px-3 font-mono">{day.kc}</td>
                    <td className="py-1.5 px-3 font-bold text-slate-800">{day.etcMm}</td>
                    <td className="py-1.5 px-3">{day.precipitationMm} ({day.effectiveRainfallMm} эфф)</td>
                    <td className="py-1.5 px-3 font-bold text-sky-800">{day.waterVolumeM3.toLocaleString()}</td>
                    <td className="py-1.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        day.action === 'irrigate' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {day.action === 'irrigate' ? 'Полив' : 'Пропуск'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Actual Logged Consumption & Plan vs Fact */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              3. Фактический расход воды по записям хозяйства
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500">Фактически внесено всего:</span>
                <div className="text-base font-bold text-slate-900">{totalActualM3.toLocaleString('ru-RU')} м³</div>
              </div>
              <div>
                <span className="text-slate-500">Измерено расходомером:</span>
                <div className="text-base font-bold text-emerald-800">{measuredM3.toLocaleString('ru-RU')} м³</div>
              </div>
              <div>
                <span className="text-slate-500">Оценочно по насосу / талону:</span>
                <div className="text-base font-bold text-amber-800">{estimatedM3.toLocaleString('ru-RU')} м³</div>
              </div>
            </div>

            {farmEvents.length > 0 ? (
              <table className="w-full text-[11px] text-left border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Дата и время</th>
                    <th className="py-2 px-3">Объём, м³</th>
                    <th className="py-2 px-3">Метод учёта</th>
                    <th className="py-2 px-3">Источник / Примечание</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {farmEvents.slice(0, 10).map((ev) => (
                    <tr key={ev.id}>
                      <td className="py-1.5 px-3 font-semibold">{ev.date} {ev.time}</td>
                      <td className="py-1.5 px-3 font-bold">{ev.actualM3.toLocaleString('ru-RU')}</td>
                      <td className="py-1.5 px-3">
                        {ev.method === 'meter_diff' ? 'Расходомер (прибор)' : ev.method === 'pump_runtime' ? 'Насос (время работы)' : 'Ручной талон'}
                      </td>
                      <td className="py-1.5 px-3 text-slate-600 truncate max-w-xs">{ev.notes || ev.sourceTag}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-slate-400 italic text-[11px]">Нет записей фактического расхода за указанный период.</div>
            )}
          </div>

          {/* Economic ROI Scenario Evaluation */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              4. Сценарная экономическая оценка (тариф: {tariffs.waterPricePerM3} {tariffs.currency}/м³, {tariffs.electricityPricePerKwh} {tariffs.currency}/кВт⋅ч)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gradient-to-r from-slate-50 to-emerald-50/50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500">Затраты воды по плану:</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {Math.round(modeledWaterCost).toLocaleString()} {tariffs.currency}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Затраты при арычном поливе:</span>
                <div className="text-sm font-bold text-slate-600 mt-0.5">
                  {Math.round(baselineWaterCost).toLocaleString()} {tariffs.currency}
                </div>
              </div>
              <div>
                <span className="text-emerald-800 font-semibold">Сценарная экономия воды:</span>
                <div className="text-sm font-bold text-emerald-900 mt-0.5">
                  {Math.round(potentialWaterSavingsCost).toLocaleString()} {tariffs.currency}
                </div>
              </div>
              <div>
                <span className="text-emerald-800 font-semibold">Экономия энергии насоса:</span>
                <div className="text-sm font-bold text-emerald-900 mt-0.5">
                  {Math.round(potentialEnergySavingsCost).toLocaleString()} {tariffs.currency}
                </div>
              </div>
            </div>
          </div>

          {/* Legal / Agronomic Disclaimer */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-[10px] text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 uppercase tracking-wide">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
              <span>Официальное уведомление об ограничениях и статусе документа:</span>
            </div>
            <p className="leading-relaxed">
              Данный расчёт сформирован программным модулем AquaAI на базе математической модели Penman-Monteith (FAO-56)
              и численных прогнозов погоды Open-Meteo. Сценарные денежные и ресурсные показатели являются прогнозными оценками
              и не могут рассматриваться как государственный акт поверки водоучёта или официальный верифицированный сертификат экономии.
              Фактические показатели зависят от калибровки расходомеров, рельефа поля и локальной влажности почвы.
            </p>
          </div>

          {/* Signature Line */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-[11px] text-slate-600">
            <div>
              <div>Ответственный агроном / оператор: ______________________</div>
              <div className="text-slate-400 text-[10px] mt-1">Подпись / ФИО</div>
            </div>
            <div className="text-right">
              <div>Система AquaAI AgriTech • Версия MVP 2026.1</div>
              <div className="text-slate-400 text-[10px] mt-1">Хеш верификации: {recommendation.id}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
