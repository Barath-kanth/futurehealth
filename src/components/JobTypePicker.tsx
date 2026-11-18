"use client";

import { getJob, inferJobType, JOB_TYPES } from "@/lib/vitality-analyst";
import { useSeedShield } from "@/lib/store";
import clsx from "clsx";
import { useEffect, useEffectEvent } from "react";

/** Live work-calendar readout — pattern is inferred from streams, not tapped. */
export function JobTypePicker() {
  const { jobTypeId, variables, syncJobTypeFromStreams, locale, watchLive } =
    useSeedShield();
  const ar = locale === "ar";
  const inferred = inferJobType(variables);
  const active = getJob(inferred);

  const sync = useEffectEvent(() => {
    syncJobTypeFromStreams();
  });

  useEffect(() => {
    sync();
  }, [variables]);

  useEffect(() => {
    if (!watchLive) return;
    const id = setInterval(() => sync(), 4000);
    return () => clearInterval(id);
  }, [watchLive]);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-[var(--cedar)]/40 bg-[var(--mist)] p-5">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--watch)]">
          {ar ? "مكتشف تلقائيًا من جداولك" : "Detected from your calendar"}
        </p>
        <h3 className="mt-2 font-display text-2xl text-[var(--cedar)]">
          {ar ? active.labelAr : active.label}
        </h3>
        <p className="mt-2 text-sm text-[var(--ink)]/85">
          {ar ? active.heavyImpactNoteAr : active.heavyImpactNote}
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">
          {ar ? active.blurbAr : active.blurb}
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          <Stat
            label={ar ? "إجهاد العمل" : "Work stress"}
            value={`${Math.round(variables.occupationalStress)}`}
          />
          <Stat
            label={ar ? "جلوس" : "Sitting"}
            value={`${variables.sedentaryHours.toFixed(1)}h`}
          />
          <Stat
            label={ar ? "حرارة خارجية" : "Outdoor heat"}
            value={`${variables.outdoorHeatHours.toFixed(1)}h`}
          />
          <Stat
            label={ar ? "ورديات ليلية" : "Night shifts"}
            value={`${variables.nightShiftsPerWeek}/wk`}
          />
        </dl>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {JOB_TYPES.map((j) => {
          const on = j.id === (jobTypeId || inferred);
          return (
            <div
              key={j.id}
              className={clsx(
                "rounded-xl border p-3 text-start",
                on
                  ? "border-[var(--cedar)] bg-[var(--cedar)] text-[var(--mist)]"
                  : "border-[var(--line)] bg-[var(--mist)]/70 opacity-55",
              )}
              aria-current={on ? "true" : undefined}
            >
              <div className="text-sm font-semibold">{ar ? j.labelAr : j.label}</div>
              <p
                className={clsx(
                  "mt-1 text-[11px] leading-snug",
                  on ? "text-[var(--mist)]/85" : "text-[var(--muted)]",
                )}
              >
                {ar ? j.blurbAr : j.blurb}
              </p>
              {on && (
                <p className="mt-2 text-[10px] uppercase tracking-wide">
                  {ar ? "نشط الآن" : "Live now"}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[var(--sand)]/50 px-2 py-2">
      <dt className="text-[var(--muted)]">{label}</dt>
      <dd className="mt-0.5 font-medium text-[var(--cedar)]">{value}</dd>
    </div>
  );
}
