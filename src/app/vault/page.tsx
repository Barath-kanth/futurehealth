"use client";

import { SimulatedBadge } from "@/components/SimulatedBadge";
import { useSeedShield } from "@/lib/store";
import type { ConsentCategory } from "@/lib/types";
import Link from "next/link";

const LABELS: Record<
  ConsentCategory,
  { en: string; ar: string; detail: string; detailAr: string }
> = {
  wearable: {
    en: "Wearable & phone passive data",
    ar: "بيانات سلبية من الجهاز والهاتف",
    detail: "Sleep, activity, HRV, temperature trends — on-device processing where feasible.",
    detailAr: "النوم والنشاط وHRV واتجاهات الحرارة — معالجة على الجهاز حيث أمكن.",
  },
  at_home_device: {
    en: "At-home device auto-upload",
    ar: "رفع تلقائي من جهاز منزلي",
    detail: "Simulated semen / hormone kit uploads only with explicit consent.",
    detailAr: "رفع أطقم مني/هرمون محاكاة فقط بموافقة صريحة.",
  },
  clinical_lab: {
    en: "Clinical & laboratory category pulls",
    ar: "سحوبات سريرية ومخبرية على مستوى الفئة",
    detail: "Category-level consented pulls — never wholesale chart dumps. Includes infectious/anatomical flags you provide.",
    detailAr: "سحوبات بموافقة على مستوى الفئة — دون تفريغ كامل. يشمل أعلامًا معدية/تشريحية تقدمها أنت.",
  },
  environment: {
    en: "Environment & climate signals",
    ar: "إشارات البيئة والمناخ",
    detail: "Heat index, AQI, UV from approved location-level feeds.",
    detailAr: "مؤشر الحرارة وجودة الهواء والأشعة من مصادر موقع معتمدة.",
  },
  self_report: {
    en: "Minimal self-report",
    ar: "تقرير ذاتي أدنى",
    detail: "Least-trusted input — used only where no automatic source exists.",
    detailAr: "أقل المدخلات ثقة — يُستخدم فقط حيث لا مصدر آلي.",
  },
  family_mode: {
    en: "Family Mode sharing",
    ar: "مشاركة وضع العائلة",
    detail: "Off by default. Never assumes marriage or family-building goals.",
    detailAr: "معطّل افتراضيًا. لا يفترض الزواج أو أهداف بناء أسرة.",
  },
};

export default function VaultPage() {
  const {
    locale,
    consents,
    toggleConsent,
    assessment,
    variables,
    doctorAlertOptIn,
    setDoctorAlertOptIn,
    culturalTone,
    setCulturalTone,
    patchVariables,
    assignedDoctor,
  } = useSeedShield();
  const ar = locale === "ar";
  const lockedFamily =
    variables.socialPressureIndex >= 70 && !consents.family_mode;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <header>
        <h1 className="font-display text-4xl text-[var(--cedar)]">
          {ar ? "خزنة الخصوصية" : "Privacy vault"}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {ar
            ? "خزنة بيانات إنجاب منفصلة · موافقة دقيقة · مشاركة يتحكم بها المستخدم · عمق ثقافي أبعد من اللغة."
            : "Separate reproductive vault · granular consent · user-controlled sharing · cultural depth beyond language."}
        </p>
      </header>

      {lockedFamily && (
        <div className="rounded-xl border border-[var(--watch)]/30 bg-[var(--watch-soft)] px-4 py-3 text-sm text-[var(--watch)]">
          {ar
            ? "ضغط خصوصية اجتماعي مرتفع — وضع العائلة يبقى مغلقًا ما لم تُفعّله صراحة."
            : "High social privacy pressure — Family Mode stays locked unless you explicitly enable it."}
        </div>
      )}

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-5 space-y-3">
        <h2 className="font-display text-xl text-[var(--cedar)]">
          {ar ? "نبرة خليجية (أبعد من الترجمة)" : "Gulf tone (beyond translation)"}
        </h2>
        <p className="text-xs text-[var(--muted)]">
          {ar
            ? "رعاية ومسؤولية شخصية — دون افتراض قرارات عائلية أو ضغط إنجاب."
            : "Stewardship and personal responsibility — no family-choice or fertility-pressure assumptions."}
        </p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "stewardship" as const, en: "Stewardship", ar: "رعاية" },
              { id: "direct" as const, en: "Direct", ar: "مباشر" },
              { id: "clinical" as const, en: "Clinical", ar: "سريري" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setCulturalTone(t.id)}
              className={
                culturalTone === t.id
                  ? "rounded-md bg-[var(--cedar)] px-3 py-1.5 text-xs text-[var(--mist)]"
                  : "rounded-md border border-[var(--line)] px-3 py-1.5 text-xs"
              }
            >
              {ar ? t.ar : t.en}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-5 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-xl text-[var(--cedar)]">
            {ar ? "تنبيه الطبيب — موافقة لحظية" : "Doctor alert — moment opt-in"}
          </h2>
          <SimulatedBadge ar={ar} />
        </div>
        <p className="text-sm text-[var(--muted)]">
          {ar
            ? `${assignedDoctor.nameAr} محاكاة. لا مشاركة تلقائية لبيانات صحية دون موافقتك.`
            : `${assignedDoctor.name} is simulated. No automatic health-data share without your approval.`}
        </p>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={doctorAlertOptIn}
            onChange={(e) => setDoctorAlertOptIn(e.target.checked)}
            className="size-4"
          />
          {ar
            ? "أوافق على إشعار الطبيب المحاكى عند هبوط المؤشر التوضيحي"
            : "I approve notifying the simulated clinician when illustrative MVI drops"}
        </label>
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--sand)]/40 p-5 space-y-3">
        <h2 className="font-display text-xl text-[var(--cedar)]">
          {ar ? "جاهزية جينومية (عنصر نائب)" : "Genomic readiness (placeholder)"}
        </h2>
        <p className="text-xs text-[var(--muted)]">
          {ar
            ? "محاذاة مع اتجاه أبوظبي للرعاية الجينومية — لا علامات دون موافقة."
            : "Aligned with Abu Dhabi’s genomic-enabled care direction — no markers without consent."}
        </p>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={!!variables.genomicConsentPending || !!variables.genomicMarkerAvailable}
            onChange={(e) =>
              patchVariables({
                genomicConsentPending: e.target.checked,
                genomicMarkerAvailable: false,
              })
            }
            className="size-4"
          />
          {ar
            ? "أريد مسار موافقة لعلامات خطر جينومية عند التوفر"
            : "I want a consent pathway for genomic risk markers when available"}
        </label>
        {variables.genomicConsentPending && (
          <button
            type="button"
            onClick={() =>
              patchVariables({
                genomicMarkerAvailable: true,
                genomicConsentPending: false,
              })
            }
            className="rounded-md border border-[var(--cedar)] px-3 py-1.5 text-xs text-[var(--cedar)]"
          >
            {ar
              ? "محاكاة علامة متاحة (عرض)"
              : "Simulate marker available (demo)"}
          </button>
        )}
      </section>

      <div className="space-y-3">
        {(Object.keys(LABELS) as ConsentCategory[]).map((key) => {
          const meta = LABELS[key];
          const on = consents[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleConsent(key)}
              className="flex w-full items-start justify-between gap-4 rounded-xl border border-[var(--line)] bg-[var(--mist)] p-4 text-start"
            >
              <div>
                <div className="font-medium text-[var(--cedar)]">
                  {ar ? meta.ar : meta.en}
                </div>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {ar ? meta.detailAr : meta.detail}
                </p>
              </div>
              <span
                className={
                  on
                    ? "rounded-full bg-[var(--cedar)] px-3 py-1 text-xs text-[var(--mist)]"
                    : "rounded-full border border-[var(--line)] px-3 py-1 text-xs text-[var(--muted)]"
                }
              >
                {on ? (ar ? "مفعّل" : "On") : ar ? "متوقف" : "Off"}
              </span>
            </button>
          );
        })}
      </div>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--sand)]/50 p-5 text-sm">
        <h2 className="font-display text-xl text-[var(--cedar)]">
          {ar ? "تعهدات الاستخدام" : "Use commitments"}
        </h2>
        <ul className="mt-3 list-disc space-y-2 ps-5 text-[var(--ink)]/80">
          <li>
            {ar
              ? "لا استخدام ثانوي، لا تأمين، لا توظيف."
              : "No secondary use, no insurance, no employment."}
          </li>
          <li>
            {ar
              ? "الإشارات المخفية تستخدم فقط بيانات قدّمتها ووافقت عليها."
              : "Hidden cues use only data you provided and consented to."}
          </li>
          <li>
            {ar
              ? `الوضع الحالي للفرز: ${assessment.triage.labelAr}`
              : `Current triage posture: ${assessment.triage.label}`}
          </li>
        </ul>
        <Link
          href="/triage"
          className="mt-4 inline-flex text-sm text-[var(--cedar)] underline"
        >
          {ar ? "فتح الفرز الآمن" : "Open Safe Triage"}
        </Link>
      </section>
    </div>
  );
}
