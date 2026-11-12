"use client";

import { useSeedShield } from "@/lib/store";
import clsx from "clsx";
import Link from "next/link";

export function PersonalFindings() {
  const { findings, locale } = useSeedShield();
  const ar = locale === "ar";

  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-display text-2xl text-[var(--cedar)]">
          {ar ? "ما يظهر في ملفك الآن" : "What’s on your file right now"}
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {ar
            ? "من بياناتك أنت فقط — الساعة، الحاسوب، البيئة، المال، الأدوية، الجهاز — بلا محاضرات نظرية."
            : "From your data only — watch, PC, environment, money, meds, device — no textbook lectures."}
        </p>
      </div>

      {findings.length === 0 && (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--mist)] p-4 text-sm text-[var(--muted)]">
          {ar
            ? "لا إشارات شخصية مرتفعة — المراقبة الصامتة مستمرة."
            : "No elevated personal cues — silent monitoring continues."}
        </div>
      )}

      {findings.map((f) => (
        <article
          key={f.id}
          className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg text-[var(--cedar)]">
              {ar ? f.titleAr : f.title}
            </h3>
            <Badge tone={f.severity}>{f.severity}</Badge>
            <Badge>{f.control}</Badge>
            <Badge>{f.source}</Badge>
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
            <Link
              href="/chat"
              className="text-xs font-medium text-[var(--brass-deep)] underline"
            >
              {ar ? "اسأل عن ملفي" : "Ask about my file"}
            </Link>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {f.relatedBody.map((b) => (
              <span key={b} className="text-[10px] text-[var(--muted)]">
                #{b}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
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
