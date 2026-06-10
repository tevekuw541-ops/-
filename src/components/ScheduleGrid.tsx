"use client";

import { days, periods, type BusySlots, type DayKey, type PeriodKey } from "@/lib/slots";

export function ScheduleGrid({
  value,
  onChange,
  readonly = false
}: {
  value: BusySlots;
  onChange?: (value: BusySlots) => void;
  readonly?: boolean;
}) {
  const toggle = (day: DayKey, period: PeriodKey) => {
    if (readonly || !onChange) return;
    const selected = value[day].includes(period);
    onChange({
      ...value,
      [day]: selected ? value[day].filter((item) => item !== period) : [...value[day], period]
    });
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-emerald-100 bg-white">
      <table className="w-full min-w-[680px] border-collapse text-sm">
        <thead>
          <tr className="bg-emerald-50 text-emerald-950">
            <th className="w-24 px-3 py-3 text-left">节次</th>
            {days.map((day) => (
              <th key={day.key} className="px-3 py-3 text-center">{day.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map((period) => (
            <tr key={period.key} className="border-t border-emerald-100">
              <th className="px-3 py-3 text-left font-semibold text-slate-700">
                <span className="block text-xs text-slate-400">{period.group}</span>
                {period.label}
              </th>
              {days.map((day) => {
                const checked = value[day.key].includes(period.key);
                return (
                  <td key={`${day.key}-${period.key}`} className="px-2 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => toggle(day.key, period.key)}
                      className={`tap-pop h-9 w-full rounded-xl border text-xs font-semibold ${
                        checked
                          ? "border-coral bg-coral text-white shadow-sm"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {checked ? "有课" : "没课"}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
