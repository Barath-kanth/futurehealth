import { evaluateRisk } from "./risk-engine";
import { defaultExtras } from "./auto-ingest";
import type {
  CareLoopStage,
  CompetitionMetrics,
  IndependentVariables,
  RiskAssessment,
  TriageTier,
} from "./types";

export type SyntheticMan = {
  id: string;
  ageBand: "18–24" | "25–34" | "35–44" | "45–54";
  residency: "UAE national" | "Resident expat";
  marital: "married" | "single" | "prefer_not_to_say";
  shiftWorker: boolean;
  fastingObservant: boolean;
  assessment: RiskAssessment;
  /** Closed-loop care pathway (synthetic timing). */
  careStage: CareLoopStage;
  hoursToAssessment: number;
  hoursToReferralComplete: number | null;
};

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, items: T[]): T {
  return items[Math.floor(rng() * items.length)]!;
}

function synthVariables(rng: () => number): IndependentVariables {
  const extras = defaultExtras();
  const shift = rng() < 0.22;
  const heat = 32 + rng() * 12;
  const aqi = 40 + rng() * 120;
  const sleep = 4.5 + rng() * 4.5;
  const bmi = 21 + rng() * 14;
  const smoking = rng() < 0.28 ? rng() * 80 : rng() * 20;
  const alcohol = rng() < 0.35 ? rng() * 14 : rng() * 3;

  const withLabs = rng() < 0.35;
  const withSemen = rng() < 0.22;
  const infectious = rng() < 0.08;
  const varicocele = rng() < 0.1;
  const trt = rng() < 0.04;
  const crypto = rng() < 0.03;
  const orchitis = rng() < 0.04;
  const trauma = rng() < 0.05;

  return {
    ...extras,
    heatIndexC: heat,
    humidityPct: 40 + rng() * 45,
    aqi,
    uvIndex: 4 + Math.floor(rng() * 7),
    outdoorHeatHours: rng() * 4,
    noiseDbAvg: 45 + rng() * 35,
    shiftWork: shift,
    sedentaryHours: 4 + rng() * 10,
    occupationalStress: 20 + rng() * 70,
    nightShiftsPerWeek: shift ? Math.floor(rng() * 4) : 0,
    screenHours: 3 + rng() * 10,
    hydrationLiters: 1 + rng() * 3,
    ultraProcessedScore: 20 + rng() * 70,
    caffeineMg: 50 + rng() * 350,
    fastingWindow: rng() < 0.25,
    plasticFoodContactScore: 20 + rng() * 60,
    socialPressureIndex: 20 + rng() * 70,
    familyModeEnabled: false,
    moneyStress: 15 + rng() * 70,
    businessStress: 10 + rng() * 70,
    financialSecurity: 20 + rng() * 70,
    educationLoad: 10 + rng() * 60,
    peaceIndex: 20 + rng() * 70,
    mediaIntensity: 20 + rng() * 70,
    smokingLoad: smoking,
    alcoholUnitsWeek: alcohol,
    recreationalDrugFlag: rng() < 0.05,
    iief5Score: withLabs ? Math.floor(10 + rng() * 15) : undefined,
    amsScore: withLabs ? Math.floor(15 + rng() * 40) : undefined,
    ipssScore: withLabs ? Math.floor(rng() * 20) : undefined,
    systolicBp: 105 + Math.floor(rng() * 40),
    diastolicBp: 65 + Math.floor(rng() * 25),
    vitaminDNgMl: 12 + rng() * 40,
    tshMiuL: 0.5 + rng() * 4,
    sleepHours: sleep,
    sleepRegularity: 40 + rng() * 55,
    hrvTrend: -25 + rng() * 35,
    restingHr: 55 + Math.floor(rng() * 35),
    activityMinutes: 20 + rng() * 200,
    bodyTempAnomaly: -0.2 + rng() * 1.2,
    sleepApneaRisk: rng() * 70,
    weightKg: 60 + rng() * 45,
    waistCm: 75 + rng() * 35,
    bmi,
    visceralFatScore: 15 + rng() * 60,
    semenConcentration: withSemen ? 5 + rng() * 80 : undefined,
    motilityPct: withSemen ? 10 + rng() * 70 : undefined,
    morphologyPct: withSemen ? 1 + rng() * 14 : undefined,
    sdfPct: withSemen && rng() < 0.5 ? 10 + rng() * 40 : undefined,
    testosteroneNgDl: withLabs ? 180 + rng() * 700 : undefined,
    exogenousAndrogenFlag: trt,
    glucoseMgDl: withLabs ? 80 + rng() * 80 : undefined,
    stiRiskFlag: infectious && rng() < 0.5,
    infectiousHistoryFlag: infectious,
    orchitisMumpsFlag: orchitis,
    cryptorchidismFlag: crypto,
    testicularTraumaFlag: trauma,
    varicoceleFlag: varicocele,
    geneticRiskFlag: rng() < 0.02,
    subclinicalInflammationFlag: rng() < 0.08,
    medsFertilityImpact: rng() < 0.06,
    genomicConsentPending: rng() < 0.15,
    genomicMarkerAvailable: rng() < 0.03,
    acuteTesticularPainFlag: rng() < 0.015,
  };
}

/**
 * Assign closed-loop stage from triage + RNG.
 *
 * Audit fix (fairness v1 → v2): v1 treated every `requiresHumanReview` as
 * "referral completed", which inflated completion and hid drop-off for shift
 * workers. v2 models invited → assessed → referred → completed with explicit
 * attrition and times-to-event so median hours and completion are honest demos.
 */
function assignCareLoop(
  assessment: RiskAssessment,
  rng: () => number,
): Pick<
  SyntheticMan,
  "careStage" | "hoursToAssessment" | "hoursToReferralComplete"
> {
  // ~4% invited but not yet assessed (show open funnel)
  if (rng() < 0.04) {
    return {
      careStage: "invited",
      hoursToAssessment: 0,
      hoursToReferralComplete: null,
    };
  }

  const hoursToAssessment = Math.round(6 + rng() * 72);
  const needsReferral = assessment.triage.requiresHumanReview;

  if (!needsReferral) {
    return {
      careStage: "assessed",
      hoursToAssessment,
      hoursToReferralComplete: null,
    };
  }

  // Referred after assessment; ~22% drop before referral placed
  if (rng() < 0.22) {
    return {
      careStage: "assessed",
      hoursToAssessment,
      hoursToReferralComplete: null,
    };
  }

  // Of referred, ~71% complete (challenge-style demo rate)
  if (rng() < 0.71) {
    const extra = Math.round(12 + rng() * 96);
    return {
      careStage: "referral_completed",
      hoursToAssessment,
      hoursToReferralComplete: hoursToAssessment + extra,
    };
  }

  return {
    careStage: "referred",
    hoursToAssessment,
    hoursToReferralComplete: null,
  };
}

/** Deterministic synthetic cohort for fairness / funnel demos (~500). Built by SeedShield authors — not real PHI. */
export function buildSyntheticPopulation(n = 500, seed = 42): SyntheticMan[] {
  const rng = mulberry32(seed);
  const ageBands: SyntheticMan["ageBand"][] = [
    "18–24",
    "25–34",
    "35–44",
    "45–54",
  ];
  const men: SyntheticMan[] = [];
  for (let i = 0; i < n; i++) {
    const variables = synthVariables(rng);
    const assessment = evaluateRisk(variables);
    const loop = assignCareLoop(assessment, rng);
    men.push({
      id: `syn-${i + 1}`,
      ageBand: pick(rng, ageBands),
      residency: rng() < 0.35 ? "UAE national" : "Resident expat",
      marital: pick(rng, ["married", "single", "prefer_not_to_say"]),
      shiftWorker: variables.shiftWork,
      fastingObservant: variables.fastingWindow,
      assessment,
      ...loop,
    });
  }
  return men;
}

export function funnelFromPopulation(men: SyntheticMan[]) {
  const tiers: TriageTier[] = [
    "insufficient_info",
    "self_care",
    "primary_care",
    "andrology_urology",
    "fertility_services",
    "urgent",
  ];
  const counts = Object.fromEntries(tiers.map((t) => [t, 0])) as Record<
    TriageTier,
    number
  >;
  for (const m of men) counts[m.assessment.triage.tier]++;
  return tiers.map((tier) => ({
    tier,
    count: counts[tier],
    pct: Math.round((counts[tier] / men.length) * 1000) / 10,
  }));
}

export function careLoopFromPopulation(men: SyntheticMan[]) {
  const stages: CareLoopStage[] = [
    "invited",
    "assessed",
    "referred",
    "referral_completed",
  ];
  const counts = Object.fromEntries(stages.map((s) => [s, 0])) as Record<
    CareLoopStage,
    number
  >;
  for (const m of men) counts[m.careStage]++;
  return {
    invited: men.length,
    assessed: men.filter((m) => m.careStage !== "invited").length,
    referred: men.filter((m) =>
      ["referred", "referral_completed"].includes(m.careStage),
    ).length,
    referralCompleted: counts.referral_completed,
    byStage: stages.map((stage) => ({
      stage,
      count: counts[stage],
      pct: Math.round((counts[stage] / men.length) * 1000) / 10,
    })),
  };
}

function median(nums: number[]) {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : Math.round((s[mid - 1]! + s[mid]!) / 2);
}

function groupScore(
  men: SyntheticMan[],
  pred: (m: SyntheticMan) => boolean,
): number {
  const subset = men.filter(pred);
  if (!subset.length) return 0;
  const assessed = subset.filter((m) => m.careStage !== "invited");
  const referredNeeded = subset.filter(
    (m) => m.assessment.triage.requiresHumanReview,
  );
  const completed = subset.filter((m) => m.careStage === "referral_completed");
  const assessmentRate = assessed.length / subset.length;
  const completionRate =
    referredNeeded.length === 0
      ? 1
      : completed.length / referredNeeded.length;
  return Math.round((0.5 * assessmentRate + 0.5 * completionRate) * 100) / 100;
}

export function fairnessFromPopulation(men: SyntheticMan[]) {
  return [
    { group: "Age 18–24", score: groupScore(men, (m) => m.ageBand === "18–24") },
    { group: "Age 25–34", score: groupScore(men, (m) => m.ageBand === "25–34") },
    { group: "Age 35–44", score: groupScore(men, (m) => m.ageBand === "35–44") },
    { group: "Age 45–54", score: groupScore(men, (m) => m.ageBand === "45–54") },
    {
      group: "UAE nationals",
      score: groupScore(men, (m) => m.residency === "UAE national"),
    },
    {
      group: "Resident expats",
      score: groupScore(men, (m) => m.residency === "Resident expat"),
    },
    { group: "Married", score: groupScore(men, (m) => m.marital === "married") },
    {
      group: "Prefer not to say",
      score: groupScore(men, (m) => m.marital === "prefer_not_to_say"),
    },
    { group: "Shift workers", score: groupScore(men, (m) => m.shiftWorker) },
    {
      group: "Fasting observant",
      score: groupScore(men, (m) => m.fastingObservant),
    },
  ];
}

export function metricsFromPopulation(men: SyntheticMan[]): CompetitionMetrics {
  const assessments = men.map((m) => m.assessment);
  const withModifiable = assessments.filter((a) =>
    a.signals.some((s) => s.modifiable && s.severity !== "info"),
  ).length;
  const loop = careLoopFromPopulation(men);
  const evaluatedHours = men
    .filter((m) => m.careStage !== "invited")
    .map((m) => m.hoursToAssessment);
  const completedHours = men
    .filter((m) => m.hoursToReferralComplete != null)
    .map((m) => m.hoursToReferralComplete!);

  return {
    completedAssessments: loop.assessed,
    medianHoursToEvaluation: median(
      completedHours.length ? completedHours : evaluatedHours,
    ),
    referralCompletionRate:
      loop.referred === 0
        ? 0
        : Math.round((loop.referralCompleted / loop.referred) * 100) / 100,
    trustScore: null,
    trustMethodNote:
      "Not measured in this prototype. Planned method: post-session 5-item trust Likert (privacy, clarity, respect, usefulness, would-recommend) with n≥30 Gulf users; report mean ± 95% CI by language.",
    culturalAppropriateness: null,
    culturalReviewNote:
      "Arabic + Gulf tone copy has NOT yet had external local-reader review. Pending one bilingual UAE reader pass before final submission.",
    modifiableRisksPreDiagnosisPct:
      Math.round((withModifiable / Math.max(men.length, 1)) * 100) / 100,
    fairnessByGroup: fairnessFromPopulation(men),
    careLoop: {
      invited: loop.invited,
      assessed: loop.assessed,
      referred: loop.referred,
      referralCompleted: loop.referralCompleted,
    },
  };
}

/** Clinician-side sample of open / completed pathways. */
export function clinicianQueueFromPopulation(men: SyntheticMan[], limit = 12) {
  const priority = [...men]
    .filter((m) =>
      ["referred", "referral_completed", "assessed"].includes(m.careStage),
    )
    .sort((a, b) => {
      const rank = (t: TriageTier) =>
        t === "urgent"
          ? 0
          : t === "fertility_services"
            ? 1
            : t === "andrology_urology"
              ? 2
              : 3;
      return (
        rank(a.assessment.triage.tier) - rank(b.assessment.triage.tier) ||
        a.hoursToAssessment - b.hoursToAssessment
      );
    });
  return priority.slice(0, limit).map((m) => ({
    id: m.id,
    ageBand: m.ageBand,
    residency: m.residency,
    shiftWorker: m.shiftWorker,
    triage: m.assessment.triage.tier,
    careStage: m.careStage,
    hoursToAssessment: m.hoursToAssessment,
    hoursToReferralComplete: m.hoursToReferralComplete,
    humanReview: m.assessment.triage.requiresHumanReview,
  }));
}

let _cache: SyntheticMan[] | null = null;

export function getSyntheticPopulation() {
  if (!_cache) _cache = buildSyntheticPopulation(500);
  return _cache;
}
