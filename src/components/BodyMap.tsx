"use client";

import { useSeedShield } from "@/lib/store";
import type { BodyRegionId } from "@/lib/vitality-analyst";
import clsx from "clsx";
import { useState } from "react";

const LAYOUT: { id: BodyRegionId; top: string; left: string }[] = [
  { id: "brain", top: "6%", left: "50%" },
  { id: "heart", top: "28%", left: "46%" },
  { id: "lungs", top: "28%", left: "58%" },
  { id: "liver_metabolic", top: "42%", left: "42%" },
  { id: "hormones", top: "42%", left: "60%" },
  { id: "reproductive", top: "62%", left: "50%" },
  { id: "muscles", top: "72%", left: "32%" },
  { id: "sleep_recovery", top: "18%", left: "78%" },
];

export function BodyMap() {
  const { bodyRegions, locale } = useSeedShield();
  const ar = locale === "ar";
  const [active, setActive] = useState<BodyRegionId>("reproductive");
  const selected = bodyRegions.find((r) => r.id === active) ?? bodyRegions[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="relative mx-auto aspect-[3/5] w-full max-w-sm rounded-[2.5rem] border border-[var(--line)] bg-gradient-to-b from-[#dfe8e2] to-[#c5d4cb] p-4">
        <div className="absolute inset-x-16 top-6 h-[12%] rounded-full bg-[var(--cedar)]/15" />
        <div className="absolute inset-x-20 top-[18%] h-[38%] rounded-[40%] bg-[var(--cedar)]/10" />
        <div className="absolute inset-x-24 top-[55%] h-[28%] rounded-[30%] bg-[var(--cedar)]/10" />
        <p className="absolute left-3 top-3 text-[10px] uppercase tracking-wide text-[var(--muted)]">
          {ar ? "خريطتك الشخصية" : "Your personal map"}
        </p>
        {LAYOUT.map((spot) => {
          const region = bodyRegions.find((r) => r.id === spot.id);
          if (!region) return null;
          return (
            <button
              key={spot.id}
              type="button"
              onClick={() => setActive(spot.id)}
              style={{ top: spot.top, left: spot.left }}
              className={clsx(
                "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 px-2 py-1 text-[10px] font-semibold shadow-sm transition",
                region.status === "strong" && "border-emerald-700 bg-emerald-50 text-emerald-900",
                region.status === "watch" && "border-[var(--watch)] bg-[var(--watch-soft)] text-[var(--watch)]",
                region.status === "strain" && "border-[var(--urgent)] bg-[var(--urgent-soft)] text-[var(--urgent)]",
                active === spot.id && "ring-2 ring-[var(--brass)] scale-110",
              )}
            >
              {region.score}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-2xl text-[var(--cedar)]">
              {ar ? selected.labelAr : selected.label}
            </h3>
            <StatusChip status={selected.status} ar={ar} />
            <span className="font-display text-2xl text-[var(--brass-deep)]">
              {selected.score}
            </span>
          </div>
          <p className="mt-3 text-sm text-[var(--ink)]/85">
            {ar ? selected.whatToDoAr : selected.whatToDo}
          </p>
          <div className="mt-3 flex flex-wrap gap-1">
            {selected.drivers.map((d) => (
              <span
                key={d}
                className="rounded bg-[var(--sand)] px-2 py-0.5 font-mono text-[10px] text-[var(--muted)]"
              >
                {d}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {bodyRegions.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setActive(r.id)}
              className={clsx(
                "rounded-xl border px-3 py-2 text-start",
                active === r.id
                  ? "border-[var(--cedar)] bg-[var(--cedar)] text-[var(--mist)]"
                  : "border-[var(--line)] bg-[var(--mist)]",
              )}
            >
              <div className="text-sm font-medium">
                {ar ? r.labelAr : r.label}
              </div>
              <div className="text-xs opacity-80">
                {r.score}/100 · {r.status}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusChip({
  status,
  ar,
}: {
  status: "strong" | "watch" | "strain";
  ar: boolean;
}) {
  const label =
    status === "strong"
      ? ar
        ? "قوي"
        : "strong"
      : status === "watch"
        ? ar
          ? "مراقبة"
          : "watch"
        : ar
          ? "إجهاد"
          : "strain";
  return (
    <span className="rounded-full bg-[var(--sand)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--muted)]">
      {label}
    </span>
  );
}
