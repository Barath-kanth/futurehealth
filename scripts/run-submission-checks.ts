/**
 * Offline checks for live environment helpers and the referral allowlist.
 * Run: npm run test:submission
 */
import { coarseCoords, heatBand, heatIndexC, personalHeatExposure, usAqiFromPm25 } from "../src/lib/env-live";
import {
  CALENDAR_FILENAME,
  CLINICIAN_CHECK_LINKS,
  NEUTRAL_DESCRIPTION,
  NEUTRAL_FOLLOW_UP_TITLE,
  NEUTRAL_VISIT_TITLE,
  SUMMARY_FILENAME,
  buildClinicianSummary,
  buildIcs,
  isLocalDateTime,
  randomHex,
  videoRoomUrl,
} from "../src/lib/care-journey";
import { glucoseToMgDl, testosteroneToNgDl } from "../src/lib/lab-units";
import { evaluateRisk } from "../src/lib/risk-engine";
import { isSafeChatReply } from "../src/lib/chat-guard";
import { safetyReply } from "../src/lib/vitality-analyst";
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
    !sanitizeReferralPacket({ ...good, name: "Tariq Ali" }).ok,
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
    !sanitizeReferralPacket({ ...good, reasonCodes: ["Tariq Ali"] }).ok,
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
  const repeatSignal = lowT.signals.find((s) => s.id === "hormone-repeat");
  check("one low testosterone reading raises a 'repeat test' cue", !!repeatSignal);
  check("repeat cue is tied to clinical/lab consent", repeatSignal?.source === "clinical_lab", String(repeatSignal?.source));
  check("one low reading goes to primary care, not the specialist gate", lowT.triage.tier === "primary_care", lowT.triage.tier);
  check("one low reading does not raise the confirmed hormone cue", !lowT.signals.some((s) => s.id === "hormone-screen"));

  const confirmed = evaluateRisk(baseIv({ testosteroneNgDl: 280, testosteroneRepeatNgDl: 260 }), consentsOn);
  const confirmedSignal = confirmed.signals.find((s) => s.id === "hormone-screen");
  check("two low readings raise the confirmed hormone cue", !!confirmedSignal);
  check("confirmed cue is tied to clinical/lab consent", confirmedSignal?.source === "clinical_lab", String(confirmedSignal?.source));
  check("confirmed low testosterone reaches the specialist gate with human review", confirmed.triage.tier === "andrology_urology" && confirmed.triage.requiresHumanReview);

  const recovered = evaluateRisk(baseIv({ testosteroneNgDl: 280, testosteroneRepeatNgDl: 480 }), consentsOn);
  check("normal repeat clears the hormone cue", !recovered.signals.some((s) => s.id.startsWith("hormone-")));

  const repeatIgnored = evaluateRisk(baseIv({ testosteroneNgDl: 280, testosteroneRepeatNgDl: 260 }), consentsOff);
  check("repeat testosterone is ignored without lab consent", !repeatIgnored.signals.some((s) => s.id.startsWith("hormone-")) && repeatIgnored.triage.tier !== "andrology_urology");
  const ignored = evaluateRisk(baseIv({ testosteroneNgDl: 280 }), consentsOff);
  check("entered testosterone is ignored without lab consent", !ignored.signals.some((s) => s.id.startsWith("hormone-")));
  check("glucose 120 mg/dL raises a watch cue", evaluateRisk(baseIv({ glucoseMgDl: 120 }), consentsOn).signals.some((s) => s.id === "glucose-watch"));
  check("glucose 105 mg/dL does not raise a cue (flags from 110)", !evaluateRisk(baseIv({ glucoseMgDl: 105 }), consentsOn).signals.some((s) => s.id === "glucose-watch"));
  check("glucose entered without lab consent is ignored", !evaluateRisk(baseIv({ glucoseMgDl: 200 }), consentsOff).signals.some((s) => s.id === "glucose-watch"));
}

// --- Chat: fixed safety rules run first; model replies must pass the output guard ---
{
  const iv = baseIv({});
  check("chat safety: self-harm message gets the fixed crisis reply", /urgent help/.test(safetyReply("I want to kill myself", iv, "en") ?? ""));
  check("chat safety: sudden testicular pain gets the fixed urgent-care reply", /urgent care/i.test(safetyReply("I have sudden testicular pain", iv, "en") ?? ""));
  check("chat safety: stopping medication gets the fixed refusal", /never advise/i.test(safetyReply("Should I stop my testosterone?", iv, "en") ?? ""));
  check("chat safety: 'is this a fertility diagnosis' gets the fixed answer", /not a fertility diagnosis/i.test(safetyReply("is this about fertility diagnosis?", iv, "en") ?? ""));
  check("chat safety: Arabic crisis message is caught", safetyReply("أفكر في الانتحار", iv, "ar") !== null);
  check("chat safety: an ordinary question is left for the model (null)", safetyReply("How can I sleep better?", iv, "en") === null);

  check("chat guard: accepts a calm lifestyle answer", isSafeChatReply("Heat and short sleep can add strain. Try earlier wind-down and fewer hours outdoors at midday. This is screening, not a diagnosis."));
  check("chat guard: rejects 'you have low testosterone'", !isSafeChatReply("You have low testosterone and should act on it."));
  check("chat guard: rejects a dose", !isSafeChatReply("Take 50 mg daily for a month."));
  check("chat guard: rejects advice to start testosterone", !isSafeChatReply("You could start taking testosterone to fix this."));
  check("chat guard: rejects pregnancy-chance claims", !isSafeChatReply("Your pregnancy chance is high."));
  check("chat guard: rejects an Arabic diagnosis", !isSafeChatReply("أنت عقيم حسب النتائج"));
  check("chat guard: rejects empty and over-long replies", !isSafeChatReply("   ") && !isSafeChatReply("a".repeat(2000)));
}

// --- Semen screening cut-offs follow WHO 6th edition (2021): 16 M/mL, 42% total motility, 4% normal forms ---
{
  const all = { wearable: true, at_home_device: true, clinical_lab: true, environment: true, self_report: true, family_mode: false };
  const flagged = (patch: Parameters<typeof baseIv>[0]) =>
    evaluateRisk(baseIv(patch), all).signals.some((s) => s.id === "semen-parameter-screen");
  check("semen: concentration 15.9 M/mL is flagged (below 16)", flagged({ semenConcentration: 15.9, motilityPct: 60, morphologyPct: 6 }));
  check("semen: concentration 16 M/mL is not flagged", !flagged({ semenConcentration: 16, motilityPct: 60, morphologyPct: 6 }));
  check("semen: total motility 41% is flagged (below 42)", flagged({ semenConcentration: 40, motilityPct: 41, morphologyPct: 6 }));
  check("semen: total motility 42% is not flagged", !flagged({ semenConcentration: 40, motilityPct: 42, morphologyPct: 6 }));
  check("semen: normal forms 3% is flagged, 4% is not", flagged({ semenConcentration: 40, motilityPct: 60, morphologyPct: 3 }) && !flagged({ semenConcentration: 40, motilityPct: 60, morphologyPct: 4 }));
}

// --- Personal heat exposure estimate (NWS heat-index bands) ---
{
  check("heat band: 26°C is below caution", heatBand(26) === "below_caution");
  check("heat band: 28°C is caution (80°F+)", heatBand(28) === "caution");
  check("heat band: 33°C is extreme caution (90°F+)", heatBand(33) === "extreme_caution");
  check("heat band: 40°C is danger (103°F+)", heatBand(40) === "danger");
  check("heat band: 52°C is extreme danger (125°F+)", heatBand(52) === "extreme_danger");
  const e = personalHeatExposure(38, 2.5);
  check("38°C heat index with 2.5 h outdoors = 2.5 h in extreme caution", e.band === "extreme_caution" && e.hoursInBand === 2.5);
  check("below caution counts no exposure hours", personalHeatExposure(22, 4).hoursInBand === 0);
}

// --- Clinician checks point only to official regulator hosts ---
{
  const hosts = Object.values(CLINICIAN_CHECK_LINKS).map((u) => new URL(u));
  check("clinician-check links are https and on official DHA / DOH hosts", hosts.every((h) => h.protocol === "https:" && /(^|\.)(dha|doh)\.gov\.ae$/.test(h.hostname)), hosts.map((h) => h.hostname).join(","));
}

// --- Care journey: video link, calendar reminders, clinician summary ---
{
  const consents = { wearable: true, at_home_device: false, clinical_lab: true, environment: true, self_report: true, family_mode: false };
  const consentsNoLab = { ...consents, clinical_lab: false };
  const iv = baseIv({ testosteroneNgDl: 250, glucoseMgDl: 92 });
  const assessment = evaluateRisk(iv, consents);
  const now = new Date("2026-11-18T09:00:00Z");

  // Video room
  const hexA = randomHex(12);
  const hexB = randomHex(12);
  check("random room id has 96 bits (24 hex chars)", /^[0-9a-f]{24}$/.test(hexA), hexA);
  check("two room ids differ", hexA !== hexB);
  const url = videoRoomUrl(hexA);
  check("video room is a public Jitsi Meet https link", url === `https://meet.jit.si/SeedShield-${hexA}`);
  check("video link carries no personal or health words", !/name|test|hormone|semen|fertil|urolog/i.test(url.replace("SeedShield", "")));
  let rejected = false;
  try { videoRoomUrl("abc123"); } catch { rejected = true; }
  check("a guessable short room id is refused", rejected);

  // Date validation
  check("valid local date-time is accepted", isLocalDateTime("2026-11-25T09:30"));
  check("impossible date (31 Feb) is rejected", !isLocalDateTime("2026-02-31T10:00"));
  check("garbage date is rejected", !isLocalDateTime("tomorrow"));

  // Calendar file
  const ics = buildIcs(
    [
      { uid: "v1", title: NEUTRAL_VISIT_TITLE, start: "2026-11-25T10:00", durationMin: 30, description: `${NEUTRAL_DESCRIPTION} Video link: ${url}`, url, alarms: ["-P1D", "-PT1H"], alarmText: NEUTRAL_VISIT_TITLE },
      { uid: "f1", title: NEUTRAL_FOLLOW_UP_TITLE, start: "2026-12-02T08:00", durationMin: 15, description: NEUTRAL_DESCRIPTION, alarms: ["-P1D", "PT0M"], alarmText: NEUTRAL_FOLLOW_UP_TITLE },
    ],
    now,
  );
  check("calendar file is a valid VCALENDAR with CRLF line ends", ics.startsWith("BEGIN:VCALENDAR\r\n") && ics.endsWith("END:VCALENDAR\r\n") && !/[^\r]\n/.test(ics));
  check("calendar has a visit event with the video link", ics.includes("DTSTART:20261125T100000") && ics.includes("DTEND:20261125T103000") && ics.includes(`URL:${url}`));
  check("calendar has a follow-up event on the chosen date", ics.includes("DTSTART:20261202T080000"));
  check("calendar events carry reminder alarms", (ics.match(/BEGIN:VALARM/g) ?? []).length === 4 && ics.includes("TRIGGER:-P1D") && ics.includes("TRIGGER:-PT1H") && ics.includes("TRIGGER:PT0M"));
  check("calendar text is neutral (no body system, test, or condition words)", !/testosterone|semen|sperm|hormone|fertil|androl|urolog|reproduct|infertil|diabet|glucose/i.test(ics));
  check("calendar lines are folded to 75 octets or fewer", ics.split("\r\n").every((l) => new TextEncoder().encode(l).length <= 75));
  check("calendar and summary filenames are neutral", /^health-check/.test(CALENDAR_FILENAME) && /^health-check/.test(SUMMARY_FILENAME(now)));
  let badIcs = false;
  try { buildIcs([{ uid: "x", title: "t", start: "not-a-date", durationMin: 5, alarms: [], alarmText: "t" }], now); } catch { badIcs = true; }
  check("calendar refuses an invalid date", badIcs);

  // Clinician summary
  const base = { assessment, variables: iv, consents };
  const s0 = buildClinicianSummary({ ...base, options: { includeLabs: false, includeSelfReport: false, now } });
  check("summary says it is not a diagnosis", /not a diagnosis/i.test(s0));
  check("summary lists why the result appeared", /Why this appeared/.test(s0) && /Low testosterone reading/.test(s0));
  check("summary leaves lab values out unless the person ticks them", !/250 ng\/dL|92 mg\/dL/.test(s0));
  const s1 = buildClinicianSummary({ ...base, options: { includeLabs: true, includeSelfReport: false, now } });
  check("summary includes lab values once ticked", /Total testosterone: 250 ng\/dL/.test(s1) && /Fasting glucose: 92 mg\/dL/.test(s1));
  const s2 = buildClinicianSummary({ assessment, variables: iv, consents: consentsNoLab, options: { includeLabs: true, includeSelfReport: false, now } });
  check("summary never includes lab values when lab consent is off, even if ticked", !/250 ng\/dL|92 mg\/dL/.test(s2));
  const s3 = buildClinicianSummary({ ...base, options: { includeLabs: false, includeSelfReport: true, now } });
  check("summary includes lifestyle answers only when ticked and consented", /Self-reported lifestyle/.test(s3) && !/Self-reported lifestyle/.test(s0));
  const s4 = buildClinicianSummary({ assessment, variables: iv, consents: { ...consents, self_report: false }, options: { includeLabs: false, includeSelfReport: true, now } });
  check("summary omits lifestyle answers when self-report consent is off", !/Self-reported lifestyle/.test(s4));
  check("summary carries the repeat-test question for a single low reading", /repeat early-morning test/.test(s0));
  check("summary has no name, email, phone, or coordinates", !/@|\+?\d{9,}|\blat(itude)?\b|\blon(gitude)?\b|\bname\b:/i.test(s1.replace("No name or contact details are included", "")));
  check("summary says area-level heat is not personal exposure", /area-level, not personal exposure/.test(s0));
  check("summary adds the estimated personal heat exposure when lifestyle is ticked", /Estimated outdoor heat exposure: .* h per day/.test(s3));
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
