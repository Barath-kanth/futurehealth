import type { ConsentCategory, IndependentVariables } from "./types";

/**
 * Strip / neutralize fields the user has not consented to.
 * Non-consented red flags must NOT influence triage.
 */
export function applyConsents(
  iv: IndependentVariables,
  consents: Record<ConsentCategory, boolean>,
): IndependentVariables {
  const next: IndependentVariables = { ...iv };

  if (!consents.environment) {
    next.heatIndexC = 28;
    next.humidityPct = 40;
    next.aqi = 50;
    next.uvIndex = 4;
    next.outdoorHeatHours = 0.5;
    next.noiseDbAvg = 45;
  }

  if (!consents.wearable) {
    next.sleepHours = 7;
    next.sleepRegularity = 70;
    next.hrvTrend = 0;
    next.restingHr = 65;
    next.activityMinutes = 120;
    next.bodyTempAnomaly = 0;
    next.sleepApneaRisk = 10;
  }

  if (!consents.at_home_device) {
    next.semenConcentration = undefined;
    next.motilityPct = undefined;
    next.morphologyPct = undefined;
    next.sdfPct = undefined;
  }

  if (!consents.clinical_lab) {
    next.testosteroneNgDl = undefined;
    next.freeTestosteronePgMl = undefined;
    next.glucoseMgDl = undefined;
    next.stiRiskFlag = undefined;
    next.varicoceleFlag = undefined;
    next.geneticRiskFlag = undefined;
    next.subclinicalInflammationFlag = undefined;
    next.infectiousHistoryFlag = undefined;
    next.orchitisMumpsFlag = undefined;
    next.cryptorchidismFlag = undefined;
    next.testicularTraumaFlag = undefined;
    next.genomicConsentPending = undefined;
    next.genomicMarkerAvailable = undefined;
    next.exogenousAndrogenFlag = undefined;
    next.medsFertilityImpact = undefined;
  }

  if (!consents.self_report) {
    next.iief5Score = undefined;
    next.amsScore = undefined;
    next.ipssScore = undefined;
    next.acuteTesticularPainFlag = undefined;
    next.smokingLoad = 0;
    next.alcoholUnitsWeek = 0;
    next.recreationalDrugFlag = false;
  }

  if (!consents.family_mode) {
    next.familyModeEnabled = false;
  }

  return next;
}

/** Age gate helper — SeedShield individual tracking starts at 18. */
export function isAgeEligible(birthYear: number, nowYear = new Date().getFullYear()) {
  return nowYear - birthYear >= 18;
}
