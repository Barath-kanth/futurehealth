"use client";

import { useSeedShield } from "@/lib/store";
import clsx from "clsx";

export function DataStreamsPanel() {
  const { streams, toggleStream, runMonthlyCheck, autoMode, setAutoMode, locale } =
    useSeedShield();
  const ar = locale === "ar";
  const live = streams.filter((s) => s.connected).length;

  return (
    <div className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-display text-xl text-[var(--cedar)]">
            {ar ? "تيارات بياناتك الحية" : "Your live data streams"}
          </h3>
          <p className="text-xs text-[var(--muted)]">
            {ar
              ? `${live} متصل — الملف يتحدّث تلقائيًا من الساعة والحاسوب والبيئة والحياة`
              : `${live} connected — profile updates automatically from watch, PC, environment & life context`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAutoMode(!autoMode)}
            className={clsx(
              "rounded-full px-3 py-1 text-xs",
              autoMode
                ? "bg-emerald-700 text-white"
                : "border border-[var(--line)] text-[var(--muted)]",
            )}
          >
            {autoMode ? (ar ? "تلقائي ON" : "Auto ON") : ar ? "تلقائي OFF" : "Auto OFF"}
          </button>
          <button
            type="button"
            onClick={runMonthlyCheck}
            className="rounded-full border border-[var(--cedar)] px-3 py-1 text-xs text-[var(--cedar)]"
          >
            {ar ? "فحص BMI شهري" : "Run monthly BMI"}
          </button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {streams.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => toggleStream(s.id)}
            className={clsx(
              "rounded-xl border p-3 text-start",
              s.connected
                ? "border-emerald-700/30 bg-emerald-50/50"
                : "border-[var(--line)] bg-[var(--sand)]/40 opacity-70",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-[var(--ink)]">
                {ar ? s.labelAr : s.label}
              </span>
              <span
                className={clsx(
                  "h-2 w-2 rounded-full",
                  s.connected && s.freshness === "live" && "animate-pulse bg-emerald-500",
                  s.connected && s.freshness !== "live" && "bg-[var(--brass)]",
                  !s.connected && "bg-[var(--muted)]",
                )}
              />
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-wide text-[var(--muted)]">
              {s.connected ? s.freshness : ar ? "غير متصل" : "disconnected"}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {s.fields.slice(0, 3).map((f) => (
                <span key={f} className="rounded bg-white/70 px-1.5 py-0.5 font-mono text-[9px] text-[var(--muted)]">
                  {f}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
