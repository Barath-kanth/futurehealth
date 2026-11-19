"use client";

import { ActionCards } from "@/components/ActionCards";
import { DataStreamsPanel } from "@/components/DataStreamsPanel";
import { FactorBoard } from "@/components/FactorBoard";
import { IndexBandMeter } from "@/components/IndexBandMeter";
import { JobTypePicker } from "@/components/JobTypePicker";
import { PersonalFindings } from "@/components/PersonalFindings";
import { ProfileSnapshot } from "@/components/ProfileSnapshot";
import { VitalityChart } from "@/components/VitalityChart";
import { WatchLive } from "@/components/WatchLive";
import { useSeedShield } from "@/lib/store";
import Link from "next/link";

export default function AnalystPage() {
  const { locale, showWhatIf, setShowWhatIf, autoMode, assessment, culturalTone } =
    useSeedShield();
  const ar = locale === "ar";

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--brass-deep)]">
            {ar ? "ملفك · طارق ٣٤ (عرض)" : "Your file · Tariq 34 (demo)"}
          </p>
          <h1 className="mt-2 font-display text-4xl text-[var(--cedar)] md:text-5xl">
            {ar ? "ملفي الصحي" : "My health file"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            {ar
              ? "الفرز الآمن أولًا. الدرجة التوضيحية مخفية افتراضيًا. نبرة العرض: "
              : "Safe Triage first. Demo guide score is hidden by default. Demo tone: "}
            <strong>{culturalTone}</strong>
          </p>
          <p className="mt-2 text-sm text-[var(--cedar)]">
            {ar ? "خطوتك:" : "Your step:"}{" "}
            <Link href="/triage" className="underline font-medium">
              {ar ? assessment.triage.labelAr : assessment.triage.label}
            </Link>
          </p>
          {autoMode && (
            <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-800">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              {ar ? "تحديث حي تلقائي" : "Live auto-update"}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/triage" className="rounded-md bg-[var(--cedar)] px-3 py-2 text-xs text-[var(--mist)]">
            {ar ? "خطوتي" : "Next step"}
          </Link>
          <Link href="/vault" className="rounded-md border border-[var(--cedar)] px-3 py-2 text-xs text-[var(--cedar)]">
            {ar ? "الخصوصية" : "Privacy"}
          </Link>
          <Link href="/devices" className="rounded-md border border-[var(--cedar)] px-3 py-2 text-xs text-[var(--cedar)]">
            {ar ? "الأجهزة" : "Devices"}
          </Link>
        </div>
      </header>

      <ProfileSnapshot />
      <PersonalFindings />

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-[var(--cedar)]">
          {ar ? "خطتك الآن" : "Your plan now"}
        </h2>
        <ActionCards />
      </section>

      <details className="rounded-2xl border border-dashed border-[var(--line)] p-4">
        <summary className="cursor-pointer font-display text-xl text-[var(--cedar)]">
          {ar
            ? "درجة العرض التوضيحية (مخفية افتراضيًا) + تيارات"
            : "Demo guide score (optional) + streams"}
        </summary>
        <div className="mt-4 space-y-6">
          <IndexBandMeter />
          <DataStreamsPanel />
          <WatchLive />
          <VitalityChart />
        </div>
      </details>

      <details className="rounded-2xl border border-dashed border-[var(--line)] p-4">
        <summary className="cursor-pointer font-display text-xl text-[var(--cedar)]">
          {ar ? "تقويم العمل والعافية العامة" : "Work calendar & general wellness"}
        </summary>
        <div className="mt-4 space-y-6">
          <JobTypePicker />
          <button
            type="button"
            onClick={() => setShowWhatIf(!showWhatIf)}
            className="text-sm font-medium text-[var(--cedar)]"
          >
            {showWhatIf
              ? ar
                ? "إخفاء ماذا-لو"
                : "Hide what-if"
              : ar
                ? "اختياري: ماذا-لو"
                : "Optional: what-if"}
          </button>
          {showWhatIf && <FactorBoard />}
        </div>
      </details>
    </div>
  );
}
