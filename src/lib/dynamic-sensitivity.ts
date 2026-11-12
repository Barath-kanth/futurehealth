import { evaluateRisk, mergeVariables } from "./risk-engine";
import { computeVitalityIndex } from "./vitality-analyst";
import type { IndependentVariables, TriageTier } from "./types";

export type SensitivityLever = {
  id: string;
  label: string;
  labelAr: string;
  /** Patch applied to simulate a realistic improvement. */
  improve: Partial<IndependentVariables>;
  /** Patch applied to simulate worsening. */
  worsen: Partial<IndependentVariables>;
};

/** Controllable / semi-controllable levers for dynamic inclusion. */
export const SENSITIVITY_LEVERS: SensitivityLever[] = [
  {
    id: "heat",
    label: "Heat exposure",
    labelAr: "التعرض للحرارة",
    improve: { outdoorHeatHours: -1.5, heatIndexC: -3 },
    worsen: { outdoorHeatHours: 2, heatIndexC: 5 },
  },
  {
    id: "sleep",
    label: "Sleep recovery",
    labelAr: "تعافي النوم",
    improve: { sleepHours: 1.2, sleepRegularity: 12 },
    worsen: { sleepHours: -1.5, sleepRegularity: -15 },
  },
  {
    id: "aqi",
    label: "Air quality timing",
    labelAr: "توقيت جودة الهواء",
    improve: { aqi: -40, outdoorHeatHours: -0.5 },
    worsen: { aqi: 50 },
  },
  {
    id: "stress",
    label: "Work stress load",
    labelAr: "حمل إجهاد العمل",
    improve: { occupationalStress: -20, sedentaryHours: -1.5 },
    worsen: { occupationalStress: 20, nightShiftsPerWeek: 2 },
  },
  {
    id: "hydration_food",
    label: "Hydration & ultra-processed load",
    labelAr: "الترطيب والغذاء فائق المعالجة",
    improve: { hydrationLiters: 0.8, ultraProcessedScore: -20 },
    worsen: { hydrationLiters: -0.8, ultraProcessedScore: 20 },
  },
  {
    id: "smoking",
    label: "Smoking / vape load",
    labelAr: "حمل التدخين/الفيب",
    improve: { smokingLoad: -25 },
    worsen: { smokingLoad: 25 },
  },
  {
    id: "alcohol",
    label: "Alcohol week load",
    labelAr: "حمل الكحول الأسبوعي",
    improve: { alcoholUnitsWeek: -4 },
    worsen: { alcoholUnitsWeek: 6 },
  },
];

export type LeverDelta = {
  id: string;
  label: string;
  labelAr: string;
  direction: "improve" | "worsen";
  indexBefore: number;
  indexAfter: number;
  indexDelta: number;
  triageBefore: TriageTier;
  triageAfter: TriageTier;
  triageChanged: boolean;
};

function clampPatch(
  base: IndependentVariables,
  patch: Partial<IndependentVariables>,
): Partial<IndependentVariables> {
  const next: Partial<IndependentVariables> = { ...patch };
  if (patch.sleepHours !== undefined) {
    next.sleepHours = Math.max(3, Math.min(10, base.sleepHours + patch.sleepHours));
  }
  if (patch.heatIndexC !== undefined) {
    next.heatIndexC = base.heatIndexC + patch.heatIndexC;
  }
  if (patch.outdoorHeatHours !== undefined) {
    next.outdoorHeatHours = Math.max(
      0,
      base.outdoorHeatHours + (patch.outdoorHeatHours as number),
    );
  }
  if (patch.aqi !== undefined) {
    next.aqi = Math.max(10, Math.min(300, base.aqi + (patch.aqi as number)));
  }
  if (patch.occupationalStress !== undefined) {
    next.occupationalStress = Math.max(
      0,
      Math.min(100, base.occupationalStress + (patch.occupationalStress as number)),
    );
  }
  if (patch.sedentaryHours !== undefined) {
    next.sedentaryHours = Math.max(
      2,
      Math.min(14, base.sedentaryHours + (patch.sedentaryHours as number)),
    );
  }
  if (patch.sleepRegularity !== undefined) {
    next.sleepRegularity = Math.max(
      0,
      Math.min(100, base.sleepRegularity + (patch.sleepRegularity as number)),
    );
  }
  if (patch.hydrationLiters !== undefined) {
    next.hydrationLiters = Math.max(
      0.5,
      Math.min(5, base.hydrationLiters + (patch.hydrationLiters as number)),
    );
  }
  if (patch.ultraProcessedScore !== undefined) {
    next.ultraProcessedScore = Math.max(
      0,
      Math.min(100, base.ultraProcessedScore + (patch.ultraProcessedScore as number)),
    );
  }
  if (patch.smokingLoad !== undefined) {
    next.smokingLoad = Math.max(
      0,
      Math.min(100, base.smokingLoad + (patch.smokingLoad as number)),
    );
  }
  if (patch.alcoholUnitsWeek !== undefined) {
    next.alcoholUnitsWeek = Math.max(
      0,
      Math.min(30, base.alcoholUnitsWeek + (patch.alcoholUnitsWeek as number)),
    );
  }
  if (patch.nightShiftsPerWeek !== undefined) {
    next.nightShiftsPerWeek = Math.max(
      0,
      Math.min(7, base.nightShiftsPerWeek + (patch.nightShiftsPerWeek as number)),
    );
  }
  return next;
}

function runOnce(iv: IndependentVariables) {
  const index = computeVitalityIndex(iv).index;
  const triage = evaluateRisk(iv).triage.tier;
  return { index, triage };
}

/**
 * Deterministic dynamic inclusion: recompute index + triage when each lever moves.
 * Grounds the Gemini agent — numbers stay rule-based; Gemini reasons about interactions.
 */
export function computeSensitivityTable(base: IndependentVariables): {
  baselineIndex: number;
  baselineTriage: TriageTier;
  deltas: LeverDelta[];
  /** Top improve levers by absolute index lift. */
  topImprove: LeverDelta[];
  /** Pairwise: heat×sleep improve together vs separately (interaction gap). */
  interactionGap: {
    heatAlone: number;
    sleepAlone: number;
    combined: number;
    synergy: number;
  };
} {
  const before = runOnce(base);
  const deltas: LeverDelta[] = [];

  for (const lever of SENSITIVITY_LEVERS) {
    for (const direction of ["improve", "worsen"] as const) {
      const raw = direction === "improve" ? lever.improve : lever.worsen;
      const patched = mergeVariables(base, clampPatch(base, raw));
      const after = runOnce(patched);
      deltas.push({
        id: `${lever.id}:${direction}`,
        label: lever.label,
        labelAr: lever.labelAr,
        direction,
        indexBefore: before.index,
        indexAfter: after.index,
        indexDelta: Math.round((after.index - before.index) * 10) / 10,
        triageBefore: before.triage,
        triageAfter: after.triage,
        triageChanged: after.triage !== before.triage,
      });
    }
  }

  const heat = SENSITIVITY_LEVERS.find((l) => l.id === "heat")!;
  const sleep = SENSITIVITY_LEVERS.find((l) => l.id === "sleep")!;
  const heatAlone =
    runOnce(mergeVariables(base, clampPatch(base, heat.improve))).index - before.index;
  const sleepAlone =
    runOnce(mergeVariables(base, clampPatch(base, sleep.improve))).index - before.index;
  const combined =
    runOnce(
      mergeVariables(
        base,
        clampPatch(base, { ...heat.improve, ...sleep.improve }),
      ),
    ).index - before.index;

  const topImprove = deltas
    .filter((d) => d.direction === "improve")
    .sort((a, b) => b.indexDelta - a.indexDelta)
    .slice(0, 5);

  return {
    baselineIndex: before.index,
    baselineTriage: before.triage,
    deltas,
    topImprove,
    interactionGap: {
      heatAlone: Math.round(heatAlone * 10) / 10,
      sleepAlone: Math.round(sleepAlone * 10) / 10,
      combined: Math.round(combined * 10) / 10,
      synergy: Math.round((combined - (heatAlone + sleepAlone)) * 10) / 10,
    },
  };
}
