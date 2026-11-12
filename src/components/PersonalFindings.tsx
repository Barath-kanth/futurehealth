"use client";

import { useSeedShield } from "@/lib/store";
import clsx from "clsx";
import Link from "next/link";
import { useMemo } from "react";

const REPRO_CATS = new Set([
  "hidden_clinical",
  "physio",
]);

function isReproductive(f: {
  category: string;
  relatedBody: string[];
  id: string;
}) {
  if (f.relatedBody.some((b) => /reproductive|hormones/.test(b))) return true;
  if (REPRO_CATS.has(f.category) && /hormone|semen|sdf|varico|iief|trt|crypt|testic|pain|heat|aqi|sleep/.test(f.id + f.category))
    return true;
  if (/pf-(heat|aqi|sleep|semen|sdf|varico|iief|trt|crypto|pain|hormone|edc)/.test(f.id))
    return true;
  return f.relatedBody.includes("reproductive") || f.relatedBody.includes("hormones");
}

export function PersonalFindings() {
  const { findings, locale } = useSeedShield();
  const ar = locale === "ar";

  const { primary, wellness } = useMemo(() => {
    const primary = findings.filter(isReproductive);
    const wellness = findings.filter((f) => !isReproductive(f));
    // Prefer heat/AQI/sleep/clinical first even if classifier misses
    const boost = findings.filter((f) =>
      /heat|aqi|sleep|semen|sdf|varico|hormone|testic|pain|crypt|trt|iief|edc|plastic/i.test(
        f.id + f.title,
      ),
    );
    const primaryIds = new Set([...primary, ...boost].map((f) => f.id));
    return {
      primary: findings.filter((f) => primaryIds.has(f.id)),
      wellness: findings.filter((f) => !primaryIds.has(f.id)),
    };
  }, [findings]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-[var(--cedar)]">
          {ar ? "إشارات مرتبطة بالصحة الإنجابية" : "Reproductive-relevant signals"}
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {ar
            ? "أولوية الحكم: حرارة، نوم، هرمون/جهاز محاكى، مسار الفرز."
            : "Judging focus: heat, sleep, simulated hormone/device cues, triage path."}
        </p>
        <Link href="/triage" className="mt-2 inline-block text-sm text-[var(--cedar)] underline">
          {ar ? "خطوتي التالية ←" : "My next step →"}
        </Link>
      </div>

      {primary.length === 0 && (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--mist)] p-4 text-sm text-[var(--muted)]">
          {ar
            ? "لا إشارات إنجابية مرتفعة الآن — راقب خطوتك التالية."
            : "No elevated reproductive cues right now — follow your next step."}
        </div>
      )}

      {primary.map((f) => (
        <FindingCard key={f.id} f={f} ar={ar} />
      ))}

      {wellness.length > 0 && (
        <details className="rounded-2xl border border-dashed border-[var(--line)] p-4">
          <summary className="cursor-pointer font-display text-lg text-[var(--cedar)]">
            {ar
              ? `عافية عامة (${wellness.length}) — أسفل الطية`
              : `General wellness (${wellness.length}) — below the fold`}
          </summary>
          <p className="mt-2 text-xs text-[var(--muted)]">
            {ar
              ? "مال، عضلات، وسائط… ثانوية لتحدي الصحة الإنجابية."
              : "Money, muscles, media… secondary to the reproductive-health challenge."}
          </p>
          <div className="mt-4 space-y-3">
            {wellness.map((f) => (
              <FindingCard key={f.id} f={f} ar={ar} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function FindingCard({
  f,
  ar,
}: {
  f: {
    id: string;
    title: string;
    titleAr: string;
    aboutYou: string;
    aboutYouAr: string;
    whatItMeansForYou: string;
    whatItMeansForYouAr: string;
    nextStep: string;
    nextStepAr: string;
    severity: string;
    control: string;
    source: string;
    relatedBody: string[];
  };
  ar: boolean;
}) {
  return (
    <article className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-display text-lg text-[var(--cedar)]">
          {ar ? f.titleAr : f.title}
        </h3>
        <Badge tone={f.severity}>{f.severity}</Badge>
      </div>
      <p className="mt-2 text-sm text-[var(--ink)]">
        {ar ? f.aboutYouAr : f.aboutYou}
      </p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {ar ? f.whatItMeansForYouAr : f.whatItMeansForYou}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-lg bg-[var(--sand)] px-3 py-2 text-xs font-medium text-[var(--cedar)]">
          → {ar ? f.nextStepAr : f.nextStep}
        </span>
        <Link href="/chat" className="text-xs font-medium text-[var(--brass-deep)] underline">
          {ar ? "اسأل الطبيب" : "Ask doctor"}
        </Link>
      </div>
    </article>
  );
}

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return (
    <span
      className={clsx(
        "rounded px-2 py-0.5 text-[10px] uppercase tracking-wide",
        tone === "elevated" || tone === "urgent"
          ? "bg-[var(--elevated-soft)] text-[var(--elevated)]"
          : tone === "watch"
            ? "bg-[var(--watch-soft)] text-[var(--watch)]"
            : "bg-[var(--sand)] text-[var(--muted)]",
      )}
    >
      {children}
    </span>
  );
}
