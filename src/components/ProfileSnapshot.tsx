"use client";

import { useSeedShield } from "@/lib/store";
import { ME } from "@/lib/me-profile";
import Link from "next/link";

export function ProfileSnapshot() {
  const { variables, locale, findings, pairedDeviceIds, assignedDoctor, assessment } =
    useSeedShield();
  const ar = locale === "ar";

  const cells = [
    { label: ar ? "المدينة" : "City", value: ME.city },
    { label: ar ? "العمر" : "Age", value: String(ME.age) },
    { label: "BMI", value: String(variables.bmi ?? "—") },
    { label: ar ? "الوزن" : "Weight", value: variables.weightKg ? `${variables.weightKg} kg` : "—" },
    { label: "AQI", value: String(Math.round(variables.aqi)) },
    { label: ar ? "الحرارة" : "Heat", value: `${variables.heatIndexC}°C` },
    { label: ar ? "النوم" : "Sleep", value: `${variables.sleepHours}h` },
    { label: "HRV", value: String(variables.hrvTrend) },
    { label: ar ? "ضغط المال" : "Money stress", value: String(variables.moneyStress) },
    { label: ar ? "السلام" : "Peace", value: String(variables.peaceIndex) },
    { label: ar ? "الشاشة" : "Screen", value: `${variables.screenHours}h` },
    { label: ar ? "أجهزة" : "Devices", value: String(pairedDeviceIds.length) },
  ];

  return (
    <div className="rounded-2xl border border-[var(--cedar)]/20 bg-[var(--cedar)] p-5 text-[var(--mist)]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--brass)]">
            {ar ? "عرض · عمر ٣٤ · ١٨+" : "Demo · Omar 34 · 18+"}
          </p>
          <h2 className="mt-1 font-display text-3xl">
            {ar ? ME.nameAr : ME.name}
          </h2>
          <p className="mt-1 text-sm text-[var(--mist)]/75">
            {ar ? ME.summaryAr : ME.summary}
          </p>
          <p className="mt-2 text-xs text-[var(--brass)]">
            {ar ? "الطبيب المعيَّن: " : "Assigned doctor: "}
            {ar ? assignedDoctor.nameAr : assignedDoctor.name}
          </p>
        </div>
        <div className="text-end max-w-[14rem]">
          <div className="text-[10px] uppercase tracking-wide text-[var(--brass)]">
            {ar ? "خطوتك (ليست الدرجة)" : "Your step (not the score)"}
          </div>
          <div className="font-display text-2xl leading-tight">
            {ar ? assessment.triage.labelAr : assessment.triage.label}
          </div>
          <div className="text-xs text-[var(--mist)]/70">
            {findings.length} {ar ? "إشارات" : "cues"}
          </div>
          <Link href="/triage" className="mt-2 inline-block text-xs text-[var(--brass)] underline">
            {ar ? "فتح خطوتي" : "Open next step"}
          </Link>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {cells.map((c) => (
          <div key={c.label} className="rounded-lg bg-[var(--mist)]/10 px-2 py-2">
            <div className="text-[9px] uppercase tracking-wide text-[var(--mist)]/55">
              {c.label}
            </div>
            <div className="truncate text-sm font-medium">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
