"use client";

import { ScenarioGrid } from "@/components/ScenarioGrid";
import { AssessmentView } from "@/components/AssessmentView";
import { useSeedShield } from "@/lib/store";

export default function ScenariosPage() {
  const { locale, scenarioId, variables } = useSeedShield();
  const ar = locale === "ar";

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header>
        <h1 className="font-display text-4xl text-[var(--cedar)]">
          {ar ? "مختبر السيناريوهات" : "Scenario lab"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          {ar
            ? "كل سيناريو يغيّر المناخ والعمل والغذاء والسياق الاجتماعي — فيعيد تشكيل وظائف التطبيق تلقائيًا."
            : "Each scenario mutates climate, work, food, and social context — and the app’s functions reconfigure automatically."}
        </p>
      </header>

      <ScenarioGrid />

      <div className="grid gap-3 rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-4 sm:grid-cols-4">
        <Stat label={ar ? "السيناريو" : "Scenario"} value={scenarioId} />
        <Stat label={ar ? "مؤشر الحرارة" : "Heat index"} value={`${variables.heatIndexC}°C`} />
        <Stat label="AQI" value={String(variables.aqi)} />
        <Stat
          label={ar ? "ورديات ليلية" : "Night shifts"}
          value={String(variables.nightShiftsPerWeek)}
        />
      </div>

      <AssessmentView />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-[var(--muted)]">{label}</div>
      <div className="mt-1 font-display text-xl text-[var(--cedar)]">{value}</div>
    </div>
  );
}
