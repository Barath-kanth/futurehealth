"use client";

import { useSeedShield } from "@/lib/store";
import { ConfidenceBadge, SeverityBadge, TriageBadge } from "./SeverityBadge";
import { PERSONAS } from "@/lib/personas";
import { useState } from "react";

export function AssessmentView() {
  const {
    assessment,
    locale,
    personaId,
    explanation,
    explanationProvider,
    setExplanation,
  } = useSeedShield();
  const ar = locale === "ar";
  const persona = PERSONAS.find((p) => p.id === personaId);
  const [loading, setLoading] = useState(false);

  async function runExplain(opts?: { simulateFail?: boolean }) {
    setLoading(true);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessment,
          personaName: ar ? persona?.nameAr : persona?.name,
          locale,
          simulateFail: opts?.simulateFail,
        }),
      });
      const data = await res.json();
      const provider = data.recoveredFromFailure
        ? `${data.provider} (recovered)`
        : data.provider;
      setExplanation(data.narrative, provider);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              {ar ? "حمل الفحص" : "Screening load"}
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-5xl text-[var(--cedar)]">
                {assessment.overallScore}
              </span>
              <span className="text-sm text-[var(--muted)]">/ 100</span>
            </div>
          </div>
          <TriageBadge tier={assessment.triage.tier} />
        </div>
        <p className="mt-3 text-sm text-[var(--ink)]/80">
          {ar ? assessment.triage.rationaleAr : assessment.triage.rationale}
        </p>
        {assessment.triage.requiresHumanReview && (
          <p className="mt-2 rounded-lg bg-[var(--watch-soft)] px-3 py-2 text-xs text-[var(--watch)]">
            {ar
              ? "مطلوب مراجعة سريرية بشرية قبل أي إحالة تخصصية."
              : "Human clinical review required before any specialty referral."}
          </p>
        )}
      </div>

      <section>
        <h3 className="font-display text-xl text-[var(--cedar)]">
          {ar ? "الوحدات التكيفية" : "Adaptive modules"}
        </h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {ar
            ? "تتغير واجهة الرفيق تلقائيًا حسب البيئة والعمل والغذاء والسياق الاجتماعي."
            : "Companion UI auto-reshapes from climate, work, food, and social context."}
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {assessment.modules.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border border-[var(--line)] bg-[var(--sand)]/50 p-4"
            >
              <div className="text-sm font-semibold text-[var(--cedar)]">
                {ar ? m.titleAr : m.title}
              </div>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {ar ? m.reasonAr : m.reason}
              </p>
              <div className="mt-3 text-xs font-medium text-[var(--brass-deep)]">
                {ar ? m.ctaAr : m.cta} →
              </div>
            </div>
          ))}
          {assessment.modules.length === 0 && (
            <p className="text-sm text-[var(--muted)]">
              {ar ? "لا وحدات إضافية مفعّلة." : "No extra modules activated."}
            </p>
          )}
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-xl text-[var(--cedar)]">
            {ar ? "خريطة إشارات الخطر" : "Risk signal map"}
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => runExplain()}
              disabled={loading}
              className="rounded-md bg-[var(--cedar)] px-3 py-2 text-xs font-medium text-[var(--mist)] disabled:opacity-60"
            >
              {loading
                ? ar
                  ? "جارٍ التوليد…"
                  : "Generating…"
                : ar
                  ? "شرح (إعادة صياغة فقط)"
                  : "Explain (reword only)"}
            </button>
            <button
              type="button"
              onClick={() => runExplain({ simulateFail: true })}
              disabled={loading}
              className="rounded-md border border-[var(--line)] px-3 py-2 text-xs text-[var(--muted)] disabled:opacity-60"
            >
              {ar ? "محاكاة فشل API" : "Simulate API fail"}
            </button>
          </div>
        </div>
        <div className="mt-3 space-y-3">
          {assessment.signals.map((s) => (
            <article
              key={s.id}
              className="rounded-xl border border-[var(--line)] bg-[var(--mist)] p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-medium text-[var(--ink)]">
                  {ar ? s.titleAr : s.title}
                </h4>
                <SeverityBadge severity={s.severity} />
                <ConfidenceBadge confidence={s.confidence} />
                <span className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                  {s.source} · {s.domain}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]/80">
                {ar ? s.explanationAr : s.explanation}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {s.drivers.map((d) => (
                  <span
                    key={d}
                    className="rounded bg-[var(--sand)] px-2 py-0.5 font-mono text-[10px] text-[var(--muted)]"
                  >
                    {d}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[10px] uppercase tracking-wide text-[var(--brass-deep)]">
                {s.screeningOnly
                  ? ar
                    ? "فحص ≠ تشخيص"
                    : "Screening ≠ diagnosis"
                  : ""}
                {s.modifiable
                  ? ar
                    ? " · قابل للتعديل"
                    : " · Modifiable"
                  : ""}
              </p>
            </article>
          ))}
        </div>
      </section>

      {explanation && (
        <section className="rounded-2xl border border-[var(--brass)]/40 bg-[var(--sand)]/40 p-5">
          <div className="text-xs uppercase tracking-[0.15em] text-[var(--muted)]">
            {ar ? "السرد التوضيحي" : "Explainable narrative"} · {explanationProvider}
          </div>
          <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-[var(--ink)]">
            {explanation}
          </pre>
        </section>
      )}
    </div>
  );
}
