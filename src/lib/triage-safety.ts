import { isAgeEligible } from "./consent-filter";
import { evaluateRisk } from "./risk-engine";
import { defaultExtras } from "./auto-ingest";
import type { ConsentCategory, IndependentVariables, TriageTier } from "./types";

const ALL_ON: Record<ConsentCategory, boolean> = {
  wearable: true,
  at_home_device: true,
  clinical_lab: true,
  environment: true,
  self_report: true,
  family_mode: false,
};

/** Minimal baseline IVs for controlled safety cases. */
export function baseIv(patch: Partial<IndependentVariables> = {}): IndependentVariables {
  const extras = defaultExtras();
  return {
    ...extras,
    heatIndexC: 28,
    humidityPct: 40,
    aqi: 50,
    uvIndex: 4,
    outdoorHeatHours: 0.5,
    noiseDbAvg: 45,
    shiftWork: false,
    sedentaryHours: 6,
    occupationalStress: 30,
    nightShiftsPerWeek: 0,
    screenHours: 6,
    hydrationLiters: 2,
    ultraProcessedScore: 40,
    caffeineMg: 100,
    fastingWindow: false,
    plasticFoodContactScore: 30,
    socialPressureIndex: 30,
    familyModeEnabled: false,
    moneyStress: 30,
    businessStress: 20,
    financialSecurity: 60,
    educationLoad: 20,
    peaceIndex: 60,
    mediaIntensity: 30,
    smokingLoad: 0,
    alcoholUnitsWeek: 0,
    recreationalDrugFlag: false,
    sleepHours: 7,
    sleepRegularity: 70,
    hrvTrend: 0,
    restingHr: 65,
    activityMinutes: 120,
    bodyTempAnomaly: 0,
    sleepApneaRisk: 10,
    weightKg: 75,
    waistCm: 82,
    bmi: 24,
    visceralFatScore: 20,
    ...patch,
  };
}

export type SafetyCase = {
  id: string;
  title: string;
  variables: IndependentVariables;
  consents?: Record<ConsentCategory, boolean>;
  expect: TriageTier | "AGE_BLOCKED" | "AGE_OK" | "CONSENT_IGNORED";
  note: string;
  /** Extra assertion for non-tier cases */
  assert?: (ctx: {
    tier: TriageTier;
    redFlags: string[];
    signalIds: string[];
  }) => boolean;
};

/**
 * Fixed safety cases for the triage engine (~18).
 * Judges: `npm run test:triage` or `/api/triage-safety`.
 */
export const TRIAGE_SAFETY_CASES: SafetyCase[] = [
  {
    id: "urgent-pain",
    title: "Sudden testicular pain → urgent",
    variables: baseIv({ acuteTesticularPainFlag: true }),
    expect: "urgent",
    note: "EAU / emergency teaching: acute scrotum needs urgent care.",
  },
  {
    id: "thin-data",
    title: "Thin data → not enough information",
    variables: baseIv({
      sleepHours: 0,
      bmi: undefined,
      waistCm: undefined,
      weightKg: undefined,
      visceralFatScore: undefined,
      occupationalStress: 20,
      shiftWork: false,
      aqi: 40,
      heatIndexC: 25,
      smokingLoad: 0,
      alcoholUnitsWeek: 0,
      ultraProcessedScore: 20,
      sedentaryHours: 4,
      screenHours: 3,
      hrvTrend: 0,
      bodyTempAnomaly: 0,
      sleepApneaRisk: 0,
    }),
    expect: "insufficient_info",
    note: "Sparse streams must not invent a specialty path.",
  },
  {
    id: "self-care-heat",
    title: "Mild heat / lifestyle only → self-care",
    variables: baseIv({
      heatIndexC: 36,
      outdoorHeatHours: 2,
      hydrationLiters: 1.4,
      sleepHours: 6.5,
    }),
    expect: "self_care",
    note: "Modifiable environment cues without clinical flags.",
  },
  {
    id: "primary-metabolic",
    title: "Metabolic watch → primary care",
    variables: baseIv({
      bmi: 33,
      waistCm: 108,
      glucoseMgDl: 126,
      visceralFatScore: 70,
    }),
    expect: "primary_care",
    note: "Metabolic screening before specialty.",
  },
  {
    id: "andrology-semen",
    title: "Abnormal semen screen → andrology/urology",
    variables: baseIv({
      semenConcentration: 8,
      motilityPct: 25,
      morphologyPct: 2,
    }),
    expect: "andrology_urology",
    note: "WHO-aligned semen parameter cue + human-review gate.",
  },
  {
    id: "fertility-gated",
    title: "Semen + hormone + anatomical → fertility (gated)",
    variables: baseIv({
      semenConcentration: 6,
      motilityPct: 20,
      morphologyPct: 2,
      sdfPct: 32,
      testosteroneNgDl: 220,
      varicoceleFlag: true,
    }),
    expect: "fertility_services",
    note: "Never auto-book fertility — clinician gate required.",
  },
  {
    id: "infectious-primary",
    title: "Infectious placeholder cue → primary (not urgent alone)",
    variables: baseIv({
      infectiousHistoryFlag: true,
      stiRiskFlag: true,
      bodyTempAnomaly: 0.1,
    }),
    expect: "primary_care",
    note: "Infectious history alone is not an emergency.",
  },
  {
    id: "urgent-infectious-systemic",
    title: "Infectious + systemic feverish cue → urgent",
    variables: baseIv({
      stiRiskFlag: true,
      bodyTempAnomaly: 0.9,
    }),
    expect: "urgent",
    note: "Combined red flags escalate.",
  },
  {
    id: "under-18-blocked",
    title: "Under-18 birth year → age gate blocks",
    variables: baseIv(),
    expect: "AGE_BLOCKED",
    note: "UAE adult tracking starts at 18; AgeGate enforces.",
    assert: () => !isAgeEligible(new Date().getFullYear() - 16),
  },
  {
    id: "age-18-ok",
    title: "Age 18+ eligible",
    variables: baseIv(),
    expect: "AGE_OK",
    note: "Positive control for age helper.",
    assert: () => isAgeEligible(new Date().getFullYear() - 28),
  },
  {
    id: "no-consent-clinical-ignored",
    title: "Clinical red flag without clinical_lab consent → ignored",
    variables: baseIv({
      stiRiskFlag: true,
      varicoceleFlag: true,
      testosteroneNgDl: 180,
      infectiousHistoryFlag: true,
    }),
    consents: { ...ALL_ON, clinical_lab: false },
    expect: "CONSENT_IGNORED",
    note: "Non-consented vault flags must not drive specialty paths.",
    assert: ({ tier, signalIds }) =>
      tier !== "andrology_urology" &&
      tier !== "fertility_services" &&
      tier !== "urgent" &&
      !signalIds.includes("infectious-screen") &&
      !signalIds.includes("anatomical-screen") &&
      !signalIds.includes("hormone-screen"),
  },
  {
    id: "no-consent-device-ignored",
    title: "Semen values without at_home_device consent → ignored",
    variables: baseIv({
      semenConcentration: 5,
      motilityPct: 15,
      morphologyPct: 1,
      sdfPct: 40,
    }),
    consents: { ...ALL_ON, at_home_device: false },
    expect: "CONSENT_IGNORED",
    note: "Device upload requires explicit consent.",
    assert: ({ tier, signalIds }) =>
      tier !== "andrology_urology" &&
      tier !== "fertility_services" &&
      !signalIds.includes("semen-parameter-screen") &&
      !signalIds.includes("sdf-screen"),
  },
  {
    id: "no-consent-env-ignored",
    title: "Extreme heat without environment consent → not used",
    variables: baseIv({
      heatIndexC: 46,
      outdoorHeatHours: 6,
      aqi: 220,
    }),
    consents: { ...ALL_ON, environment: false },
    expect: "CONSENT_IGNORED",
    note: "Environment streams require consent.",
    assert: ({ signalIds }) =>
      !signalIds.includes("heat-spermatogenesis-stress") &&
      !signalIds.includes("air-quality-oxidative"),
  },
  {
    id: "conflict-normal-semen-high-sdf",
    title: "Conflicting: concentration OK but SDF high → andrology",
    variables: baseIv({
      semenConcentration: 40,
      motilityPct: 55,
      morphologyPct: 6,
      sdfPct: 35,
    }),
    expect: "andrology_urology",
    note: "SDF can be abnormal when count looks fine — specialty after review.",
  },
  {
    id: "conflict-trt-flag",
    title: "TRT / exogenous androgen flag → primary/specialty watch",
    variables: baseIv({
      exogenousAndrogenFlag: true,
      testosteroneNgDl: 900,
      bmi: 27,
    }),
    expect: "primary_care",
    note: "App never advises start/stop meds; flag routes for clinician discussion.",
  },
  {
    id: "cryptorchidism-history",
    title: "Cryptorchidism history placeholder → andrology",
    variables: baseIv({ cryptorchidismFlag: true }),
    expect: "andrology_urology",
    note: "Anatomical history cue after human review.",
  },
  {
    id: "self-care-good-profile",
    title: "Healthy dense profile → self-care",
    variables: baseIv({
      sleepHours: 7.5,
      bmi: 23,
      heatIndexC: 30,
      aqi: 55,
      occupationalStress: 35,
      hydrationLiters: 2.5,
    }),
    expect: "self_care",
    note: "Enough information, no elevated clinical domain.",
  },
  {
    id: "urgent-pain-beats-self-care",
    title: "Pain flag wins even if labs look fine",
    variables: baseIv({
      acuteTesticularPainFlag: true,
      semenConcentration: 50,
      testosteroneNgDl: 500,
      bmi: 22,
    }),
    expect: "urgent",
    note: "Red-flag hierarchy: urgent overrides reassuring labs.",
  },
];

export function runTriageSafetyTests() {
  const results = TRIAGE_SAFETY_CASES.map((c) => {
    if (c.expect === "AGE_BLOCKED" || c.expect === "AGE_OK") {
      const pass = c.assert ? c.assert({ tier: "self_care", redFlags: [], signalIds: [] }) : false;
      return {
        id: c.id,
        title: c.title,
        expect: c.expect,
        actual: pass ? c.expect : "AGE_FAIL",
        pass,
        note: c.note,
        redFlags: [] as string[],
        requiresHumanReview: false,
      };
    }

    const assessment = evaluateRisk(c.variables, c.consents ?? ALL_ON);
    const tier = assessment.triage.tier;
    const signalIds = assessment.signals.map((s) => s.id);
    const ctx = {
      tier,
      redFlags: assessment.triage.redFlags,
      signalIds,
    };

    let pass: boolean;
    let actual: string = tier;
    if (c.expect === "CONSENT_IGNORED") {
      pass = c.assert ? c.assert(ctx) : false;
      actual = pass ? "CONSENT_IGNORED" : tier;
    } else {
      pass = tier === c.expect && (c.assert ? c.assert(ctx) : true);
    }

    return {
      id: c.id,
      title: c.title,
      expect: c.expect,
      actual,
      pass,
      note: c.note,
      redFlags: assessment.triage.redFlags,
      requiresHumanReview: assessment.triage.requiresHumanReview,
    };
  });
  const passed = results.filter((r) => r.pass).length;
  return {
    passed,
    total: results.length,
    allPass: passed === results.length,
    results,
  };
}
