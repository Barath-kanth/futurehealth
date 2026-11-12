"use client";

import { SimulatedBadge } from "@/components/SimulatedBadge";
import { INDEX_EXPLAIN, MVI_BANDS, bandForIndex } from "@/lib/index-bands";
import { useSeedShield } from "@/lib/store";
import Link from "next/link";
import { useState } from "react";

/** Score is demoted — triage is the product; bands are invented for the demo. */
export function IndexBandMeter() {
  const {
    vitalityIndex,
    locale,
    assignedDoctor,
    doctorAlerts,
    doctorAlertOptIn,
    notifications,
    simulateIndexDrop,
    assessment,
  } = useSeedShield();
  const ar = locale === "ar";
  const [open, setOpen] = useState(false);
  const band = bandForIndex(vitalityIndex);
  const meta = MVI_BANDS[band];
  const pct = Math.min(100, Math.max(0, vitalityIndex));
  const reminderUnread = notifications.filter((n) => !n.done && !n.read).length;
  const doctorOpen = doctorAlerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-[var(--cedar)] bg-[var(--cedar)] p-5 text-[var(--mist)]">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--brass)]">
          {ar ? "الأهم — خطوتك (ليست الدرجة)" : "What matters — your step (not the score)"}
        </p>
        <div className="mt-2 font-display text-3xl">
          {ar ? assessment.triage.labelAr : assessment.triage.label}
        </div>
        <p className="mt-2 text-sm text-[var(--mist)]/80">
          {ar
            ? "الفرز الآمن هو المرجع. الدرجة التوضيحية اختيارية أدناه."
            : "Safe Triage is the source of truth. The demo guide score is optional below."}
        </p>
        <Link
          href="/triage"
          className="mt-4 inline-flex rounded-md bg-[var(--mist)]/15 px-4 py-2 text-sm hover:bg-[var(--mist)]/25"
        >
          {ar ? "افتح خطوتي ←" : "Open my next step →"}
        </Link>
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
              {ar ? "درجة إرشاد للعرض" : "Demo guide score"}
            </p>
            <SimulatedBadge label="Invented bands" labelAr="نطاقات مخترعة" ar={ar} />
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-sm text-[var(--cedar)] underline"
          >
            {open
              ? ar
                ? "إخفاء الرقم"
                : "Hide number"
              : ar
                ? "إظهار الرقم التوضيحي"
                : "Show illustrative number"}
          </button>
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">
          {ar
            ? "النطاقات (٠–٤٤ / ٤٥–٥٩ / ٦٠–٧٤ / ٧٥–١٠٠) مخترعة لهذا العرض — ليست حدودًا طبية. ثق بالفرز أكثر من الرقم."
            : "Bands (0–44 / 45–59 / 60–74 / 75–100) are invented for this demo — not medical cut-offs. Trust triage more than the number."}
        </p>

        {open && (
          <div className="mt-4">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-4xl text-[var(--cedar)]">
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
            <div className="relative mt-4 h-3 overflow-hidden rounded-full bg-[var(--sand)]">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: meta.color }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-[var(--muted)]">
              <span>0</span>
              <span>{ar ? "توضيحي ٦٠" : "Demo 60"}</span>
              <span>{ar ? "توضيحي ٧٥" : "Demo 75"}</span>
              <span>100</span>
            </div>
            <button
              type="button"
              onClick={simulateIndexDrop}
              className="mt-3 rounded-md border border-[var(--elevated)] px-3 py-2 text-[11px] text-[var(--elevated)]"
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
        )}

        <div className="mt-4 grid gap-2 sm:grid-cols-2 text-xs">
          <div className="rounded-lg bg-[var(--sand)]/60 px-3 py-2">
            {ar ? "تذكيرات غير مقروءة (الجرس)" : "Unread reminders (bell)"}:{" "}
            <strong>{reminderUnread}</strong>
          </div>
          <div className="rounded-lg bg-[var(--sand)]/60 px-3 py-2">
            {ar ? "تنبيهات الطبيب (بموافقة)" : "Doctor alerts (opt-in)"}:{" "}
            <strong>{doctorOpen}</strong>
            {!doctorAlertOptIn ? (ar ? " · معطّل" : " · off") : null}
          </div>
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
            {ar ? assignedDoctor.clinicAr : assignedDoctor.clinic}
          </p>
        </div>
      </div>
    </div>
  );
}
