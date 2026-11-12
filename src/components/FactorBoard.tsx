"use client";

import { FACTORS } from "@/lib/vitality-analyst";
import { useSeedShield } from "@/lib/store";
import type { IndependentVariables } from "@/lib/types";
import clsx from "clsx";

export function FactorBoard() {
  const { variables, patchVariables, locale } = useSeedShield();
  const ar = locale === "ar";

  const groups = {
    controllable: FACTORS.filter((f) => f.control === "controllable"),
    semi: FACTORS.filter((f) => f.control === "semi"),
    uncontrollable: FACTORS.filter((f) => f.control === "uncontrollable"),
  };

  return (
    <div className="space-y-4">
      <Group
        title={ar ? "قابل للتحكم — حرّك وشاهد المؤشر" : "Controllable — drag & watch the index"}
        color="controllable"
        factors={groups.controllable}
        variables={variables}
        ar={ar}
        onChange={patchVariables}
      />
      <Group
        title={
          ar
            ? "شبه قابل — غالبًا من نوع العمل"
            : "Semi-controllable — often locked by job type"
        }
        color="semi"
        factors={groups.semi}
        variables={variables}
        ar={ar}
        onChange={patchVariables}
      />
      <Group
        title={
          ar
            ? "غير قابل للتحكم — المناخ والضغط الاجتماعي"
            : "Uncontrollable — climate & social pressure"
        }
        color="uncontrollable"
        factors={groups.uncontrollable}
        variables={variables}
        ar={ar}
        onChange={patchVariables}
      />
    </div>
  );
}

function Group({
  title,
  color,
  factors,
  variables,
  ar,
  onChange,
}: {
  title: string;
  color: "controllable" | "semi" | "uncontrollable";
  factors: typeof FACTORS;
  variables: IndependentVariables;
  ar: boolean;
  onChange: (p: Partial<IndependentVariables>) => void;
}) {
  return (
    <section
      className={clsx(
        "rounded-2xl border p-4",
        color === "controllable" && "border-emerald-700/20 bg-emerald-50/40",
        color === "semi" && "border-[var(--brass)]/30 bg-[var(--watch-soft)]/40",
        color === "uncontrollable" && "border-[var(--line)] bg-[var(--mist)]",
      )}
    >
      <h3 className="font-display text-lg text-[var(--cedar)]">{title}</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {factors.map((f) => {
          if (!f.key) return null;
          const raw = variables[f.key];
          const value = typeof raw === "number" ? raw : 0;
          const range = rangeFor(f.key);
          return (
            <label key={f.id} className="rounded-xl border border-[var(--line)] bg-[var(--mist)] p-3">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="font-medium text-[var(--ink)]">
                  {ar ? f.labelAr : f.label}
                </span>
                <span className="tabular-nums text-[var(--cedar)]">
                  {value}
                  {f.unit ? ` ${f.unit}` : ""}
                </span>
              </div>
              <input
                type="range"
                min={range.min}
                max={range.max}
                step={range.step}
                value={value}
                onChange={(e) =>
                  onChange({ [f.key!]: Number(e.target.value) } as Partial<IndependentVariables>)
                }
                className="mt-2 w-full accent-[var(--cedar)]"
              />
              <p className="mt-1 text-[11px] leading-snug text-[var(--muted)]">
                {ar ? f.tipAr : f.tip}
              </p>
            </label>
          );
        })}
      </div>
    </section>
  );
}

function rangeFor(key: keyof IndependentVariables): {
  min: number;
  max: number;
  step: number;
} {
  const map: Partial<Record<keyof IndependentVariables, { min: number; max: number; step: number }>> = {
    sleepHours: { min: 3, max: 10, step: 0.1 },
    hydrationLiters: { min: 0.5, max: 5, step: 0.1 },
    activityMinutes: { min: 0, max: 300, step: 5 },
    occupationalStress: { min: 0, max: 100, step: 1 },
    ultraProcessedScore: { min: 0, max: 100, step: 1 },
    caffeineMg: { min: 0, max: 600, step: 10 },
    sedentaryHours: { min: 1, max: 14, step: 0.5 },
    nightShiftsPerWeek: { min: 0, max: 6, step: 1 },
    heatIndexC: { min: 22, max: 50, step: 0.5 },
    aqi: { min: 20, max: 250, step: 1 },
    outdoorHeatHours: { min: 0, max: 10, step: 0.5 },
    socialPressureIndex: { min: 0, max: 100, step: 1 },
    hrvTrend: { min: -25, max: 10, step: 0.5 },
    restingHr: { min: 50, max: 100, step: 1 },
    moneyStress: { min: 0, max: 100, step: 1 },
    peaceIndex: { min: 0, max: 100, step: 1 },
    screenHours: { min: 1, max: 16, step: 0.5 },
    noiseDbAvg: { min: 30, max: 95, step: 1 },
    plasticFoodContactScore: { min: 0, max: 100, step: 1 },
    sleepApneaRisk: { min: 0, max: 100, step: 1 },
  };
  return map[key] ?? { min: 0, max: 100, step: 1 };
}
