"use client";

import { CareAccessPanel } from "@/components/CareAccessPanel";
import { SimulatedBadge } from "@/components/SimulatedBadge";
import { TriageBadge } from "@/components/SeverityBadge";
import { useSeedShield } from "@/lib/store";
import type { TriageTier } from "@/lib/types";
import Link from "next/link";
import { useState } from "react";

const PATHS: {
  tier: TriageTier;
  en: string;
  ar: string;
  detail: string;
  detailAr: string;
}[] = [
  {
    tier: "insufficient_info",
    en: "Need a bit more information",
    ar: "نحتاج معلومات أكثر قليلًا",
    detail: "Add a device or a short check-in before we suggest a path.",
    detailAr: "أضف جهازًا أو متابعة قصيرة قبل اقتراح المسار.",
  },
  {
    tier: "self_care",
    en: "Self-care at home",
    ar: "رعاية ذاتية في المنزل",
    detail: "Focus on heat, sleep, water, and air. No clinic visit needed now.",
    detailAr: "ركّز على الحرارة والنوم والماء والهواء. لا زيارة عيادة الآن.",
  },
  {
    tier: "primary_care",
    en: "See a primary doctor",
    ar: "راجع طبيبًا أوليًا",
    detail: "A general doctor can review your signals privately.",
    detailAr: "طبيب عام يمكنه مراجعة إشاراتك بخصوصية.",
  },
  {
    tier: "andrology_urology",
    en: "Men’s reproductive specialist",
    ar: "أخصائي صحة الرجل التناسلية",
    detail: "A specialist reviews after a doctor looks at your file — not an app diagnosis.",
    detailAr: "يراجع أخصائي بعد نظر الطبيب في ملفك — ليس تشخيص تطبيق.",
  },
  {
    tier: "fertility_services",
    en: "Fertility clinic (doctor must approve)",
    ar: "عيادة خصوبة (بموافقة الطبيب)",
    detail: "We never send you there automatically.",
    detailAr: "لا نرسلك تلقائيًا أبدًا.",
  },
  {
    tier: "urgent",
    en: "Get care now",
    ar: "اطلب الرعاية الآن",
    detail: "Warning signs need urgent medical care — do not wait on the app.",
    detailAr: "علامات تحذير تحتاج رعاية عاجلة — لا تنتظر التطبيق.",
  },
];

export default function TriagePage() {
  const {
    locale,
    assessment,
    doctorAlertOptIn,
    setDoctorAlertOptIn,
    assignedDoctor,
    patchVariables,
  } = useSeedShield();
  const ar = locale === "ar";
  const t = assessment.triage;
  const [override, setOverride] = useState<TriageTier | null>(null);
  const [overrideNote, setOverrideNote] = useState("");

  const activeTier = override ?? t.tier;

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <header>
        <h1 className="font-display text-4xl text-[var(--cedar)]">
          {ar ? "خطوتي التالية" : "My next step"}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {ar
            ? "اقتراح بسيط وآمن. فحص أولي — ليس تشخيصًا."
            : "A simple, safe suggestion. Early check — not a diagnosis."}
        </p>
      </header>

      <div className="rounded-2xl border border-[var(--cedar)] bg-[var(--cedar)] p-6 text-[var(--mist)]">
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--brass)]">
          <span>{ar ? "الخطوة التالية الموصى بها" : "Recommended next step"}</span>
          {override && <SimulatedBadge label="Human override" labelAr="تجاوز بشري" ar={ar} />}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="font-display text-3xl">
            {ar
              ? PATHS.find((p) => p.tier === activeTier)?.ar ?? t.labelAr
              : PATHS.find((p) => p.tier === activeTier)?.en ?? t.label}
          </span>
          <TriageBadge tier={activeTier} />
        </div>
        <p className="mt-3 text-sm text-[var(--mist)]/85">
          {override
            ? ar
              ? `تجاوز سريري مسجّل: ${overrideNote || "بدون ملاحظة"}`
              : `Clinician override logged: ${overrideNote || "no note"}`
            : ar
              ? t.rationaleAr
              : t.rationale}
        </p>
        {t.requiresHumanReview && !override && (
          <p className="mt-4 rounded-lg bg-[var(--mist)]/10 px-3 py-2 text-xs">
            {ar
              ? "بوابة مراجعة بشرية: مفعّلة — لا إحالة تخصصية تلقائية."
              : "Human review gate: ACTIVE — no automatic specialty referral."}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Link
            href="/reminders"
            className="rounded-md bg-[var(--mist)]/15 px-3 py-2 hover:bg-[var(--mist)]/25"
          >
            {ar ? "ماذا أفعل الآن" : "What to do now"} →
          </Link>
          <Link
            href="/chat"
            className="rounded-md bg-[var(--mist)]/15 px-3 py-2 hover:bg-[var(--mist)]/25"
          >
            {ar ? "محادثة (محاكاة)" : "Chat (simulated)"} →
          </Link>
          <Link
            href="/analytics"
            className="rounded-md bg-[var(--mist)]/15 px-3 py-2 hover:bg-[var(--mist)]/25"
          >
            {ar ? "مقاييس المجموعة" : "Cohort metrics"} →
          </Link>
        </div>
      </div>

      {t.redFlags.length > 0 && (
        <section className="rounded-xl border border-[var(--urgent)]/30 bg-[var(--urgent-soft)] p-4">
          <h2 className="text-sm font-semibold text-[var(--urgent)]">
            {ar ? "علامات حمراء (من بياناتك بموافقة)" : "Red flags (from your consented data)"}
          </h2>
          <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-[var(--urgent)]">
            {t.redFlags.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-[var(--cedar)]">
          {ar ? "مسارات الفرز الستة (قابلة للتدقيق)" : "Six auditable triage paths"}
        </h2>
        {PATHS.map((p) => {
          const active = p.tier === activeTier;
          return (
            <div
              key={p.tier}
              className={
                active
                  ? "rounded-xl border-2 border-[var(--cedar)] bg-[var(--mist)] p-4"
                  : "rounded-xl border border-[var(--line)] bg-[var(--mist)]/60 p-4 opacity-70"
              }
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-medium text-[var(--cedar)]">
                  {ar ? p.ar : p.en}
                </div>
                {active && (
                  <span className="text-[10px] uppercase tracking-wide text-[var(--brass-deep)]">
                    {ar ? "نشط لملفك" : "Active for your file"}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {ar ? p.detailAr : p.detail}
              </p>
            </div>
          );
        })}
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-5 space-y-3">
        <h2 className="font-display text-xl text-[var(--cedar)]">
          {ar ? "تجاوز بشري (عرض)" : "Human override (demo)"}
        </h2>
        <p className="text-xs text-[var(--muted)]">
          {ar
            ? "في الإنتاج يسجّل الطبيب التجاوز مع السبب. هنا يمكنك تجربة المسار."
            : "In production a clinician logs override + reason. Here you can try the pathway."}
        </p>
        <div className="flex flex-wrap gap-2">
          {PATHS.map((p) => (
            <button
              key={p.tier}
              type="button"
              onClick={() => setOverride(p.tier)}
              className="rounded-md border border-[var(--line)] px-3 py-1.5 text-xs hover:bg-[var(--sand)]"
            >
              {ar ? p.ar : p.en}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setOverride(null);
              setOverrideNote("");
            }}
            className="rounded-md bg-[var(--cedar)] px-3 py-1.5 text-xs text-[var(--mist)]"
          >
            {ar ? "إعادة لمحرك القواعد" : "Reset to rules engine"}
          </button>
        </div>
        {override && (
          <input
            value={overrideNote}
            onChange={(e) => setOverrideNote(e.target.value)}
            placeholder={ar ? "سبب التجاوز…" : "Override reason…"}
            className="w-full rounded-md border border-[var(--line)] bg-[var(--sand)]/40 px-3 py-2 text-sm"
          />
        )}
      </section>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => patchVariables({ acuteTesticularPainFlag: true })}
          className="rounded-md border border-[var(--urgent)] px-3 py-1.5 text-xs text-[var(--urgent)]"
        >
          {ar ? "محاكاة ألم خصوي مفاجئ → عاجل" : "Simulate sudden testicular pain → urgent"}
        </button>
        <button
          type="button"
          onClick={() =>
            patchVariables({
              acuteTesticularPainFlag: false,
              sleepHours: 0,
              bmi: undefined,
              semenConcentration: undefined,
              testosteroneNgDl: undefined,
              iief5Score: undefined,
            })
          }
          className="rounded-md border border-[var(--line)] px-3 py-1.5 text-xs text-[var(--muted)]"
        >
          {ar ? "محاكاة بيانات رقيقة" : "Simulate thin data"}
        </button>
      </div>

      <CareAccessPanel />

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--sand)]/40 p-5 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-xl text-[var(--cedar)]">
            {ar ? "مشاركة التنبيه مع الطبيب" : "Doctor alert sharing"}
          </h2>
          <SimulatedBadge ar={ar} />
        </div>
        <p className="text-sm text-[var(--muted)]">
          {ar
            ? `${assignedDoctor.nameAr} محاكاة. لا تُرسل بيانات صحية للطبيب دون موافقتك في هذه اللحظة.`
            : `${assignedDoctor.name} is simulated. Health data is not sent to a clinician unless you opt in for this moment.`}
        </p>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={doctorAlertOptIn}
            onChange={(e) => setDoctorAlertOptIn(e.target.checked)}
            className="size-4"
          />
          {ar
            ? "أوافق على تنبيه الطبيب المحاكى إذا هبط المؤشر التوضيحي دون ٦٠"
            : "I opt in to notify the simulated clinician if illustrative MVI drops below 60"}
        </label>
      </section>

      <section className="rounded-xl border border-[var(--line)] bg-[var(--mist)] p-4 text-xs text-[var(--muted)] space-y-2">
        <p>
          <strong className="text-[var(--cedar)]">
            {ar ? "حدود سريرية:" : "Clinical boundaries:"}
          </strong>{" "}
          {t.boundaryNote}
        </p>
        <p>
          {ar
            ? "الجاهزية الجينومية: عنصر نائب بموافقة في الخزنة — لا علامات دون موافقة صريحة."
            : "Genomic readiness: consented placeholder in Vault — no markers without explicit opt-in."}
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/analyst"
          className="inline-flex rounded-md border border-[var(--cedar)] px-4 py-2 text-sm text-[var(--cedar)]"
        >
          {ar ? "ملفي" : "My file"}
        </Link>
        <Link
          href="/vault"
          className="inline-flex rounded-md bg-[var(--cedar)] px-4 py-2 text-sm text-[var(--mist)]"
        >
          {ar ? "الخزنة والموافقات" : "Vault & consents"}
        </Link>
      </div>
    </div>
  );
}
