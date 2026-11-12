"use client";

import { useSeedShield } from "@/lib/store";
import type { IndependentVariables } from "@/lib/types";

type SliderKey = keyof IndependentVariables;

const SLIDERS: {
  key: SliderKey;
  label: string;
  labelAr: string;
  min: number;
  max: number;
  step: number;
}[] = [
  { key: "heatIndexC", label: "Heat index °C", labelAr: "مؤشر الحرارة", min: 20, max: 50, step: 0.5 },
  { key: "aqi", label: "AQI", labelAr: "مؤشر الهواء", min: 20, max: 250, step: 1 },
  { key: "outdoorHeatHours", label: "Outdoor heat hours", labelAr: "ساعات الحر خارجًا", min: 0, max: 10, step: 0.5 },
  { key: "nightShiftsPerWeek", label: "Night shifts / week", labelAr: "ورديات ليلية/أسبوع", min: 0, max: 6, step: 1 },
  { key: "sedentaryHours", label: "Sedentary hours", labelAr: "ساعات الجلوس", min: 2, max: 14, step: 0.5 },
  { key: "occupationalStress", label: "Work stress", labelAr: "إجهاد العمل", min: 0, max: 100, step: 1 },
  { key: "hydrationLiters", label: "Hydration L", labelAr: "الترطيب لتر", min: 0.5, max: 5, step: 0.1 },
  { key: "ultraProcessedScore", label: "Ultra-processed diet", labelAr: "غذاء معالج", min: 0, max: 100, step: 1 },
  { key: "sleepHours", label: "Sleep hours", labelAr: "ساعات النوم", min: 3, max: 10, step: 0.1 },
  { key: "sleepRegularity", label: "Sleep regularity", labelAr: "انتظام النوم", min: 0, max: 100, step: 1 },
  { key: "hrvTrend", label: "HRV trend", labelAr: "اتجاه HRV", min: -25, max: 10, step: 1 },
  { key: "socialPressureIndex", label: "Privacy pressure", labelAr: "ضغط الخصوصية", min: 0, max: 100, step: 1 },
  { key: "activityMinutes", label: "Activity minutes", labelAr: "دقائق النشاط", min: 0, max: 300, step: 5 },
];

export function VariableSliders() {
  const { variables, patchVariables, locale } = useSeedShield();
  const ar = locale === "ar";

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg text-[var(--cedar)]">
          {ar ? "المتغيرات المستقلة" : "Independent variables"}
        </h3>
        <div className="flex gap-2">
          <Toggle
            label={ar ? "ورديات" : "Shift work"}
            on={variables.shiftWork}
            onClick={() => patchVariables({ shiftWork: !variables.shiftWork })}
          />
          <Toggle
            label={ar ? "صيام" : "Fasting"}
            on={variables.fastingWindow}
            onClick={() => patchVariables({ fastingWindow: !variables.fastingWindow })}
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {SLIDERS.map((s) => {
          const raw = variables[s.key];
          const value = typeof raw === "number" ? raw : 0;
          return (
            <label key={s.key} className="block text-sm">
              <div className="mb-1 flex justify-between text-[var(--muted)]">
                <span>{ar ? s.labelAr : s.label}</span>
                <span className="tabular-nums text-[var(--ink)]">{value}</span>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={value}
                onChange={(e) =>
                  patchVariables({ [s.key]: Number(e.target.value) } as Partial<IndependentVariables>)
                }
                className="w-full accent-[var(--cedar)]"
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}

function Toggle({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        on
          ? "rounded-full bg-[var(--brass)] px-3 py-1 text-xs font-medium text-[var(--ink)]"
          : "rounded-full border border-[var(--line)] px-3 py-1 text-xs text-[var(--muted)]"
      }
    >
      {label}
    </button>
  );
}
