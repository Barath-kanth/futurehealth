"use client";

import { SCENARIOS } from "@/lib/scenarios";
import { useSeedShield } from "@/lib/store";
import clsx from "clsx";

export function ScenarioGrid() {
  const { scenarioId, setScenario, locale } = useSeedShield();
  const ar = locale === "ar";

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {SCENARIOS.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => setScenario(s.id)}
          className={clsx(
            "rounded-xl border p-4 text-start transition",
            scenarioId === s.id
              ? "border-[var(--cedar)] bg-[var(--cedar)] text-[var(--mist)]"
              : "border-[var(--line)] bg-[var(--mist)] hover:border-[var(--brass)]",
          )}
        >
          <div className="font-medium">{ar ? s.nameAr : s.name}</div>
          <p
            className={clsx(
              "mt-2 text-xs leading-relaxed",
              scenarioId === s.id ? "text-[var(--mist)]/85" : "text-[var(--muted)]",
            )}
          >
            {ar ? s.descriptionAr : s.description}
          </p>
        </button>
      ))}
    </div>
  );
}
