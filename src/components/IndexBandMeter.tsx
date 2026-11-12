"use client";

import { SimulatedBadge } from "@/components/SimulatedBadge";
import { INDEX_EXPLAIN, MVI_BANDS, bandForIndex } from "@/lib/index-bands";
import { useSeedShield } from "@/lib/store";
import Link from "next/link";

export function IndexBandMeter() {
  const {
    vitalityIndex,
    locale,
    assignedDoctor,
    doctorAlerts,
    doctorAlertOptIn,
    simulateIndexDrop,
  } = useSeedShield();
  const ar = locale === "ar";
  const band = bandForIndex(vitalityIndex);
  const meta = MVI_BANDS[band];
  const pct = Math.min(100, Math.max(0, vitalityIndex));

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
              {ar ? "درجة صحة بسيطة" : "Simple health score"}
            </p>
            <SimulatedBadge label="Guide only" labelAr="إرشاد فقط" ar={ar} />
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="font-display text-5xl text-[var(--cedar)]">
              {vitalityIndex}
            </span>
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold text-white"
              style={{ background: meta.color }}
            >
              {ar ? meta.labelAr : meta.label}
            </span>
          </div>
          <p className="mt-2 max-w-xl text-xs text-[var(--muted)]">
            {ar ? INDEX_EXPLAIN.ar : INDEX_EXPLAIN.en}
          </p>
          <Link
            href="/triage"
            className="mt-2 inline-block text-xs font-medium text-[var(--cedar)] underline"
          >
            {ar ? "انظر خطوتي التالية →" : "See my next step →"}
          </Link>
        </div>
        <button
          type="button"
          onClick={simulateIndexDrop}
          className="rounded-md border border-[var(--elevated)] px-3 py-2 text-[11px] text-[var(--elevated)]"
        >
          {ar
            ? doctorAlertOptIn
              ? "محاكاة هبوط → تنبيه بموافقة"
              : "محاكاة هبوط (بدون طبيب)"
            : doctorAlertOptIn
              ? "Simulate drop → opt-in alert"
              : "Simulate drop (patient only)"}
        </button>
      </div>

      <div className="relative mt-5 h-3 overflow-hidden rounded-full bg-[var(--sand)]">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: meta.color }}
        />
        <div
          className="absolute inset-y-0 left-[60%] w-px bg-[var(--ink)]/40"
          title="Illustrative mid 60"
        />
        <div
          className="absolute inset-y-0 left-[75%] w-px bg-emerald-800/50"
          title="Illustrative higher 75"
        />
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-[var(--muted)]">
        <span>0</span>
        <span>{ar ? "توضيحي ٦٠" : "Illustrative 60"}</span>
        <span>{ar ? "توضيحي ٧٥" : "Illustrative 75"}</span>
        <span>100</span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {(Object.keys(MVI_BANDS) as (keyof typeof MVI_BANDS)[]).map((k) => (
          <div
            key={k}
            className="flex items-center gap-2 rounded-lg bg-[var(--sand)]/60 px-3 py-2 text-xs"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: MVI_BANDS[k].color }}
            />
            <span className="text-[var(--ink)]">
              {MVI_BANDS[k].min}–{MVI_BANDS[k].max}:{" "}
              {ar ? MVI_BANDS[k].labelAr : MVI_BANDS[k].label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-[var(--cedar)] p-4 text-[var(--mist)]">
        <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wide text-[var(--brass)]">
          <span>{ar ? "الطبيب المعيَّن" : "Assigned doctor"}</span>
          <SimulatedBadge ar={ar} />
        </div>
        <div className="mt-1 font-display text-xl">
          {ar ? assignedDoctor.nameAr : assignedDoctor.name}
        </div>
        <p className="text-xs text-[var(--mist)]/75">
          {ar ? assignedDoctor.clinicAr : assignedDoctor.clinic} ·{" "}
          {ar ? assignedDoctor.responseSlaAr : assignedDoctor.responseSla}
        </p>
        <p className="mt-2 text-xs">
          {ar
            ? `تنبيهات مفتوحة: ${doctorAlerts.filter((a) => !a.acknowledged).length} · موافقة التنبيه: ${doctorAlertOptIn ? "نعم" : "لا"}`
            : `Open alerts: ${doctorAlerts.filter((a) => !a.acknowledged).length} · Alert opt-in: ${doctorAlertOptIn ? "ON" : "OFF"}`}
        </p>
      </div>
    </div>
  );
}
