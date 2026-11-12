"use client";

import { JOB_TYPES } from "@/lib/vitality-analyst";
import { useSeedShield } from "@/lib/store";
import clsx from "clsx";

export function JobTypePicker() {
  const { jobTypeId, setJobType, locale } = useSeedShield();
  const ar = locale === "ar";
  const active = JOB_TYPES.find((j) => j.id === jobTypeId)!;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-[var(--brass)]/40 bg-[var(--watch-soft)]/50 p-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--watch)]">
          {ar ? "أثر نوع العمل (ثقيل)" : "Job-type impact (heavy)"}
        </p>
        <p className="mt-2 text-sm text-[var(--ink)]">
          {ar ? active.heavyImpactNoteAr : active.heavyImpactNote}
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {JOB_TYPES.map((j) => (
          <button
            key={j.id}
            type="button"
            onClick={() => setJobType(j.id)}
            className={clsx(
              "rounded-xl border p-3 text-start transition",
              jobTypeId === j.id
                ? "border-[var(--cedar)] bg-[var(--cedar)] text-[var(--mist)]"
                : "border-[var(--line)] bg-[var(--mist)] hover:border-[var(--brass)]",
            )}
          >
            <div className="text-sm font-semibold">
              {ar ? j.labelAr : j.label}
            </div>
            <p
              className={clsx(
                "mt-1 text-[11px] leading-snug",
                jobTypeId === j.id ? "text-[var(--mist)]/85" : "text-[var(--muted)]",
              )}
            >
              {ar ? j.blurbAr : j.blurb}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
