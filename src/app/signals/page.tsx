"use client";

import { AssessmentView } from "@/components/AssessmentView";
import { useSeedShield } from "@/lib/store";

export default function SignalsPage() {
  const { locale, assessment } = useSeedShield();
  const ar = locale === "ar";

  const bySource = assessment.signals.reduce<Record<string, number>>((acc, s) => {
    acc[s.source] = (acc[s.source] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header>
        <h1 className="font-display text-4xl text-[var(--cedar)]">
          {ar ? "خريطة إشارات الخطر" : "Risk signal map"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          {ar
            ? "كل إشارة تعرض المصدر والثقة، وتفرّق صراحة بين الفحص والتشخيص."
            : "Every finding shows source and confidence, and repeatedly distinguishes screening from diagnosis."}
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {Object.entries(bySource).map(([source, count]) => (
          <span
            key={source}
            className="rounded-full border border-[var(--line)] bg-[var(--mist)] px-3 py-1 text-xs text-[var(--cedar)]"
          >
            {source}: {count}
          </span>
        ))}
      </div>

      <AssessmentView />
    </div>
  );
}
