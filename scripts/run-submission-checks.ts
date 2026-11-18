/**
 * Offline checks for live environment helpers and the referral allowlist.
 * Run: npm run test:submission
 */
import { coarseCoords, heatIndexC, usAqiFromPm25 } from "../src/lib/env-live";
import { glucoseToMgDl, testosteroneToNgDl } from "../src/lib/lab-units";
import { evaluateRisk } from "../src/lib/risk-engine";
import { baseIv } from "../src/lib/triage-safety";
import {
  buildReferralPacket,
  sanitizeReferralPacket,
  type ReferralKind,
} from "../src/lib/referral-packet";
import type { RiskAssessment, TriageTier } from "../src/lib/types";

let passed = 0;
let failed = 0;
function check(name: string, ok: boolean, detail?: string) {
  if (ok) {
    passed++;
    console.log(`PASS  ${name}`);
  } else {
    failed++;
    console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

// --- Environment helpers ---
{
  const hi = heatIndexC(35, 60);
  check("heat index 35°C / 60% RH is in the hot-humid band (44–46.5°C)", hi >= 44 && hi <= 46.5, `got ${hi}`);
  const mild = heatIndexC(20, 40);
  check("heat index stays near air temp when mild (19–21°C)", mild >= 19 && mild <= 21, `got ${mild}`);
  check("AQI from PM2.5 = 0 is 0", usAqiFromPm25(0) === 0);
  check("AQI from PM2.5 = 35.4 is 100 (top of Moderate)", usAqiFromPm25(35.4) === 100);
  const mid = usAqiFromPm25(12);
  check("AQI from PM2.5 = 12 is ~56 (Moderate)", mid >= 55 && mid <= 58, `got ${mid}`);
  check("AQI is capped at 500", usAqiFromPm25(9999) === 500);
  const c = coarseCoords(24.453912, 54.377301);
  check("coordinates coarsened to 2 decimals", !!c && c.lat === 24.45 && c.lon === 54.38, JSON.stringify(c));
  check("invalid latitude rejected", coarseCoords(95, 10) === null);
  check("non-numeric coordinates rejected", coarseCoords(Number.NaN, 10) === null);
}

// --- Referral allowlist ---
function fakeAssessment(tier: TriageTier, signals: { id: string; severity: string; source: string }[] = []) {
  return {
    overallScore: 50,
    signals: signals.map((s) => ({
      id: s.id,
      title: s.id,
      titleAr: s.id,
      domain: "environmental",
      severity: s.severity,
      source: s.source,
      drivers: [],
      modifiable: true,
      screeningOnly: true,
    })),
    modules: [],
    triage: {
      tier,
      label: tier,
      labelAr: tier,
      rationale: "",
      rationaleAr: "",
      requiresHumanReview: tier === "andrology_urology" || tier === "fertility_services",
      redFlags: [],
      boundaryNote: "",
    },
    fairnessTags: [],
    generatedAt: new Date().toISOString(),
    disclaimer: "",
  } as unknown as RiskAssessment;
}

{
  const urgent = buildReferralPacket({ assessment: fakeAssessment("urgent"), kind: "teleconsult" });
  check("urgent tier never builds a referral", !urgent.ok && urgent.error === "urgent_care_now");

  const selfCare = buildReferralPacket({ assessment: fakeAssessment("self_care"), kind: "primary_care" });
  check("self-care tier builds no referral", !selfCare.ok && selfCare.error === "no_referral_needed");

  const specialistWrong = buildReferralPacket({
    assessment: fakeAssessment("primary_care", [{ id: "metabolic-bmi", severity: "watch", source: "wearable" }]),
    kind: "specialist_review",
  });
  check(
    "specialist review requires specialist-level tier",
    !specialistWrong.ok && specialistWrong.error === "specialist_not_indicated",
  );

  const built = buildReferralPacket({
    assessment: fakeAssessment("primary_care", [
      { id: "heat-spermatogenesis-stress", severity: "watch", source: "environment" },
      { id: "info-only", severity: "info", source: "environment" },
    ]),
    kind: "primary_care",
  });
  check("primary-care packet builds with reason codes", built.ok);
  if (built.ok) {
    const p = built.packet;
    check(
      "packet keeps only non-info signal ids",
      p.reasonCodes.length === 1 && p.reasonCodes[0] === "heat-spermatogenesis-stress",
      JSON.stringify(p.reasonCodes),
    );
    check("packet records the consent category used", p.consentCategoriesUsed.includes("environment"));
    check("packet carries explicit opt-in and demo flag", p.userOptIn === true && p.demo === true);
  }

  const kinds: ReferralKind[] = ["primary_care", "teleconsult"];
  for (const kind of kinds) {
    const r = buildReferralPacket({
      assessment: fakeAssessment("andrology_urology", [{ id: "semen-cue", severity: "elevated", source: "at_home_device" }]),
      kind,
    });
    check(`${kind} packet builds for an andrology pathway`, r.ok);
  }
}

{
  const good = {
    version: "1",
    kind: "teleconsult",
    tier: "primary_care",
    reasonCodes: ["heat-spermatogenesis-stress"],
    consentCategoriesUsed: ["environment"],
    humanReviewRequired: false,
    userOptIn: true,
    demo: true,
    createdAt: new Date().toISOString(),
  };
  check("valid packet passes sanitizer", sanitizeReferralPacket(good).ok);
  check(
    "packet with a name field is rejected",
    !sanitizeReferralPacket({ ...good, name: "Omar Ali" }).ok,
  );
  check(
    "packet with chat text is rejected",
    !sanitizeReferralPacket({ ...good, chatText: "I feel bad" }).ok,
  );
  check(
    "packet without opt-in is rejected",
    !sanitizeReferralPacket({ ...good, userOptIn: false }).ok,
  );
  check(
    "urgent packet is rejected by the mock endpoint",
    !sanitizeReferralPacket({ ...good, tier: "urgent" }).ok,
  );
  check(
    "reason code containing a name is rejected",
    !sanitizeReferralPacket({ ...good, reasonCodes: ["Omar Ali"] }).ok,
  );
  check(
    "reason code with uppercase is rejected",
    !sanitizeReferralPacket({ ...good, reasonCodes: ["Heat-Stress"] }).ok,
  );
  check("non-object body is rejected", !sanitizeReferralPacket("hello").ok);
}

// --- Self-entered lab values ---
{
  const t = (raw: string, unit: "ng/dL" | "nmol/L") => testosteroneToNgDl(raw, unit);
  const g = (raw: string, unit: "mg/dL" | "mmol/L") => glucoseToMgDl(raw, unit);

  const t104 = t("10.4", "nmol/L");
  check("10.4 nmol/L converts to 300 ng/dL", t104.ok && t104.value === 300, JSON.stringify(t104));
  const t540 = t("540", "ng/dL");
  check("540 ng/dL is kept as 540", t540.ok && t540.value === 540);
  const g61 = g("6.1", "mmol/L");
  check("6.1 mmol/L converts to 110 mg/dL", g61.ok && g61.value === 110, JSON.stringify(g61));
  const g55 = g("5.5", "mmol/L");
  check("5.5 mmol/L converts to 99 mg/dL", g55.ok && g55.value === 99, JSON.stringify(g55));
  const gComma = g("5,5", "mmol/L");
  check("decimal comma is accepted", gComma.ok && gComma.value === 99);
  check("empty lab entry is flagged empty", !t("", "ng/dL").ok && (t("", "ng/dL") as { error: string }).error === "empty");
  check("text lab entry is rejected", !t("abc", "ng/dL").ok);
  check("negative lab entry is rejected", !g("-90", "mg/dL").ok);
  check("testosterone of 0 is out of range", !t("0", "ng/dL").ok);
  check("testosterone of 5000 ng/dL is out of range", !t("5000", "ng/dL").ok);
  check("glucose 5000 mg/dL is out of range", !g("5000", "mg/dL").ok);
  check("540 typed as nmol/L is caught as implausible", !t("540", "nmol/L").ok);

  const consentsOn = { wearable: true, at_home_device: false, clinical_lab: true, environment: true, self_report: true, family_mode: false };
  const consentsOff = { ...consentsOn, clinical_lab: false };

  const lowT = evaluateRisk(baseIv({ testosteroneNgDl: 280 }), consentsOn);
  const lowTSignal = lowT.signals.find((s) => s.id === "hormone-screen");
  check("low entered testosterone raises the hormone cue", !!lowTSignal);
  check("hormone cue is tied to clinical/lab consent", lowTSignal?.source === "clinical_lab", String(lowTSignal?.source));
  check("low testosterone reaches the specialist-review gate with human review", lowT.triage.tier === "andrology_urology" && lowT.triage.requiresHumanReview);
  const ignored = evaluateRisk(baseIv({ testosteroneNgDl: 280 }), consentsOff);
  check("entered testosterone is ignored without lab consent", !ignored.signals.some((s) => s.id === "hormone-screen"));
  check("glucose 120 mg/dL raises a watch cue", evaluateRisk(baseIv({ glucoseMgDl: 120 }), consentsOn).signals.some((s) => s.id === "glucose-watch"));
  check("glucose 105 mg/dL does not raise a cue (flags from 110)", !evaluateRisk(baseIv({ glucoseMgDl: 105 }), consentsOn).signals.some((s) => s.id === "glucose-watch"));
  check("glucose entered without lab consent is ignored", !evaluateRisk(baseIv({ glucoseMgDl: 200 }), consentsOff).signals.some((s) => s.id === "glucose-watch"));
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
