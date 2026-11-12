"use client";

import { AssessmentView } from "@/components/AssessmentView";
import { PersonaPicker } from "@/components/PersonaPicker";
import { ScenarioGrid } from "@/components/ScenarioGrid";
import { VariableSliders } from "@/components/VariableSliders";
import { useSeedShield } from "@/lib/store";

export default function CompanionPage() {
  const { locale } = useSeedShield();
  const ar = locale === "ar";

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--brass-deep)]">
          {ar ? "رفيق مرحلة الحياة" : "Life-stage companion"}
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--cedar)]">
          {ar ? "الحيوية — مراقبة بموافقة" : "Vitality — consent-based watch"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          {ar
            ? "اختر شخصية، غيّر السيناريو أو حرّك المتغيرات المستقلة — ستتغير الوحدات والإشارات والفرز فورًا."
            : "Pick a persona, flip a scenario, or drag independent variables — modules, signals, and triage update instantly."}
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-[var(--cedar)]">
          {ar ? "الشخصيات" : "Personas"}
        </h2>
        <PersonaPicker />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-[var(--cedar)]">
          {ar ? "سيناريوهات البيئة والعمل" : "Environment & work scenarios"}
        </h2>
        <ScenarioGrid />
      </section>

      <VariableSliders />
      <AssessmentView />
    </div>
  );
}
