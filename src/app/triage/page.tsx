"use client";

import { CareAccessPanel } from "@/components/CareAccessPanel";
import { SimulatedBadge } from "@/components/SimulatedBadge";
import { TriageBadge } from "@/components/SeverityBadge";
import { CONSENT_LABELS, consentForSource } from "@/lib/signal-consent";
import { useSeedShield } from "@/lib/store";
import type { TriageTier } from "@/lib/types";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const PATH_COPY: Record<
  TriageTier,
  { en: string; ar: string; detail: string; detailAr: string }
> = {
  insufficient_info: {
    en: "Need a bit more information",
    ar: "نحتاج معلومات أكثر قليلًا",
    detail: "Add a device or a short check-in before we suggest a path.",
    detailAr: "أضف جهازًا أو متابعة قصيرة قبل اقتراح المسار.",
  },
  self_care: {
    en: "Self-care at home",
    ar: "رعاية ذاتية في المنزل",
    detail: "Focus on heat, sleep, water, and air. No clinic visit needed now.",
    detailAr: "ركّز على الحرارة والنوم والماء والهواء. لا زيارة عيادة الآن.",
  },
  primary_care: {
    en: "See a primary doctor",
    ar: "راجع طبيبًا أوليًا",
    detail: "A general doctor can review your signals privately.",
    detailAr: "طبيب عام يمكنه مراجعة إشاراتك بخصوصية.",
  },
  andrology_urology: {
    en: "Men’s reproductive specialist",
    ar: "أخصائي صحة الرجل التناسلية",
    detail: "A specialist reviews after a doctor looks first — not an app diagnosis.",
    detailAr: "يراجع أخصائي بعد نظر الطبيب أولًا — ليس تشخيص تطبيق.",
  },
  fertility_services: {
    en: "Fertility clinic (doctor must approve)",
    ar: "عيادة خصوبة (بموافقة الطبيب)",
    detail: "We never send you there automatically.",
    detailAr: "لا نرسلك تلقائيًا أبدًا.",
  },
  urgent: {
    en: "Get care now",
    ar: "اطلب الرعاية الآن",
    detail: "Warning signs need urgent medical care — do not wait on the app.",
    detailAr: "علامات تحذير تحتاج رعاية عاجلة — لا تنتظر التطبيق.",
  },
};

export default function TriagePage() {
  const {
    locale,
    assessment,
    doctorAlertOptIn,
    setDoctorAlertOptIn,
    assignedDoctor,
    variables,
    consents,
    vitalityIndex,
    watchLive,
    recompute,
    simulateSuddenPain,
    simulateThinData,
    resetDemoData,
  } = useSeedShield();
  const ar = locale === "ar";
  const t = assessment.triage;
  const [tick, setTick] = useState(0);

  // Keep page feeling live while Watch streams update the store
  useEffect(() => {
    if (!watchLive) return;
    const id = setInterval(() => {
      recompute();
      setTick((n) => n + 1);
    }, 5000);
    return () => clearInterval(id);
  }, [watchLive, recompute]);

  const activePath = PATH_COPY[t.tier];

  const usedSignals = useMemo(() => {
    return assessment.signals.slice(0, 10).map((s) => {
      const cat = consentForSource(s.source);
      return {
        id: s.id,
        title: ar ? s.titleAr : s.title,
        severity: s.severity,
        consent: CONSENT_LABELS[cat],
        agreed: consents[cat],
        drivers: s.drivers.slice(0, 2),
      };
    });
  }, [assessment.signals, consents, ar]);

  const liveMeters = useMemo(
    () => [
      consents.environment
        ? { label: ar ? "حرارة" : "Heat", value: `${variables.heatIndexC}°C` }
        : null,
      consents.environment
        ? { label: "AQI", value: String(variables.aqi) }
        : null,
      consents.wearable
        ? { label: ar ? "نوم" : "Sleep", value: `${variables.sleepHours}h` }
        : null,
      consents.wearable || consents.self_report
        ? {
            label: ar ? "إجهاد العمل" : "Work stress",
            value: String(Math.round(variables.occupationalStress)),
          }
        : null,
    ].filter(Boolean) as { label: string; value: string }[],
    [ar, consents, variables],
  );

  const evaluatedAt = assessment.generatedAt
    ? new Date(assessment.generatedAt).toLocaleTimeString()
    : "—";

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <header>
        <h1 className="font-display text-4xl text-[var(--cedar)]">
          {ar ? "خطوتي التالية" : "My next step"}
        </h1>
        <p className="mt-2 text-sm text-[var(--cedar)]">
          {ar
            ? "نستخدم فقط الإشارات التي وافقت على مشاركتها."
            : "We only use signals you agreed to share."}
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {ar
            ? `شخصية العرض: عمر، ٣٤ · محدّث ${evaluatedAt} · مؤشر ${vitalityIndex}`
            : `Demo persona: Omar, 34 · updated ${evaluatedAt} · index ${vitalityIndex}`}
          {watchLive ? (ar ? " · مراقبة حية" : " · live watch") : null}
          <span className="sr-only">{tick}</span>
        </p>
        <Link href="/vault" className="mt-2 inline-block text-xs text-[var(--cedar)] underline">
          {ar ? "راجع الموافقات" : "Review consents"}
        </Link>
      </header>

      {liveMeters.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {liveMeters.map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-[var(--line)] bg-[var(--mist)] px-3 py-3"
            >
              <div className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                {m.label}
              </div>
              <div className="mt-1 font-display text-xl text-[var(--cedar)]">
                {m.value}
              </div>
            </div>
          ))}
        </div>
      )}

      <section className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--mist)] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold text-[var(--cedar)]">
            {ar ? "محاكاة للعرض (حكام)" : "Demo simulations (judges)"}
          </h2>
          <SimulatedBadge ar={ar} />
        </div>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {ar
            ? "جرّب مسارين للسلامة، ثم أعد عمر."
            : "Try two safety paths, then restore Omar."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => simulateSuddenPain()}
            className="rounded-md bg-[var(--urgent)] px-3 py-2 text-xs font-medium text-[var(--mist)]"
          >
            {ar ? "محاكاة ألم مفاجئ" : "Simulate sudden pain"}
          </button>
          <button
            type="button"
            onClick={() => simulateThinData()}
            className="rounded-md border border-[var(--line)] bg-[var(--sand)] px-3 py-2 text-xs font-medium text-[var(--cedar)]"
          >
            {ar ? "محاكاة بيانات قليلة" : "Simulate thin data"}
          </button>
          <button
            type="button"
            onClick={() => resetDemoData()}
            className="rounded-md border border-[var(--line)] px-3 py-2 text-xs text-[var(--muted)]"
          >
            {ar ? "إعادة عمر" : "Restore Omar"}
          </button>
        </div>
      </section>

      <div className="rounded-2xl border border-[var(--cedar)] bg-[var(--cedar)] p-6 text-[var(--mist)]">
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--brass)]">
          <span>{ar ? "خطوتك الآن (حية)" : "Your step now (live)"}</span>
          <TriageBadge tier={t.tier} />
        </div>
        <div className="mt-3 font-display text-3xl leading-tight">
          {ar ? activePath.ar : activePath.en}
        </div>
        <p className="mt-3 text-sm text-[var(--mist)]/85">
          {ar ? t.rationaleAr : t.rationale}
        </p>
        <p className="mt-2 text-sm text-[var(--mist)]/75">
          {ar ? activePath.detailAr : activePath.detail}
        </p>
        {t.requiresHumanReview && (
          <p className="mt-4 rounded-lg bg-[var(--mist)]/10 px-3 py-2 text-xs">
            {ar
              ? "مراجعة بشرية مطلوبة — لا إحالة تخصصية تلقائية."
              : "Human review required — no automatic specialty referral."}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Link
            href="/agents"
            className="rounded-md bg-[var(--mist)]/15 px-3 py-2 hover:bg-[var(--mist)]/25"
          >
            {ar ? "المراقبة" : "Quiet watch"} →
          </Link>
          <Link
            href="/actions"
            className="rounded-md bg-[var(--mist)]/15 px-3 py-2 hover:bg-[var(--mist)]/25"
          >
            {ar ? "افعل الآن" : "Do now"} →
          </Link>
          <Link
            href="/chat"
            className="rounded-md bg-[var(--mist)]/15 px-3 py-2 hover:bg-[var(--mist)]/25"
          >
            {ar ? "الطبيب" : "Doctor"} →
          </Link>
        </div>
      </div>

      {t.redFlags.length > 0 && (
        <section className="rounded-xl border border-[var(--urgent)]/30 bg-[var(--urgent-soft)] p-4">
          <h2 className="text-sm font-semibold text-[var(--urgent)]">
            {ar ? "علامات تحتاج انتباهًا" : "Signals that need attention"}
          </h2>
          <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-[var(--urgent)]">
            {t.redFlags.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-5">
        <h2 className="font-display text-xl text-[var(--cedar)]">
          {ar ? "ما استُخدم في هذه الخطوة" : "What this step used"}
        </h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {ar
            ? `${usedSignals.length} إشارة من المحرك الآن — كل واحدة مربوطة بموافقة.`
            : `${usedSignals.length} live engine signals — each tied to a consent.`}
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          {usedSignals.length === 0 && (
            <li className="text-[var(--muted)]">
              {ar ? "لا إشارات نشطة بعد." : "No active signals yet."}
            </li>
          )}
          {usedSignals.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--line)]/60 pb-2"
            >
              <span>
                {s.title}
                {s.drivers[0] ? (
                  <span className="ms-2 text-xs text-[var(--muted)]">
                    ({s.drivers.join(", ")})
                  </span>
                ) : null}
              </span>
              <span
                className={
                  s.agreed
                    ? "text-xs text-[var(--cedar)]"
                    : "text-xs text-[var(--urgent)]"
                }
              >
                {ar ? s.consent.ar : s.consent.en}
                {" · "}
                {s.agreed ? (ar ? "موافق" : "agreed") : ar ? "غير موافق" : "not agreed"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <CareAccessPanel />

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-5 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-xl text-[var(--cedar)]">
            {ar ? "تنبيه الطبيب" : "Doctor alert"}
          </h2>
          <SimulatedBadge ar={ar} />
        </div>
        <p className="text-sm text-[var(--muted)]">
          {ar
            ? `${assignedDoctor.nameAr} محاكاة. لا مشاركة دون موافقتك.`
            : `${assignedDoctor.name} is simulated. Nothing shared without your opt-in.`}
        </p>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={doctorAlertOptIn}
            onChange={(e) => setDoctorAlertOptIn(e.target.checked)}
            className="size-4"
          />
          {ar
            ? "وافق على تنبيه الطبيب إذا هبط المؤشر التوضيحي دون ٦٠"
            : "Opt in to notify the doctor if illustrative MVI drops below 60"}
        </label>
      </section>

      <p className="text-xs text-[var(--muted)]">
        {t.boundaryNote}{" "}
        <Link href="/analytics" className="underline text-[var(--cedar)]">
          {ar ? "أدوات المراجعين" : "Reviewer tools"}
        </Link>
      </p>
    </div>
  );
}
