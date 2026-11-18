/**
 * Run SeedShield's real triage engine on REAL measurements (NHANES 2015-2016, men 18-54).
 * Reports implementation concordance with published reference thresholds, safety
 * invariants, and the tier distribution. NOT a clinical accuracy study: NHANES has
 * no semen or infertility outcome labels.
 *
 * Prepare data: python3 scripts/nhanes/prepare.py
 * Run:          npm run validate:nhanes   (writes docs/validation/NHANES_2015-2016.md)
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { evaluateRisk } from "../src/lib/risk-engine";
import { baseIv } from "../src/lib/triage-safety";
import type { ConsentCategory, TriageTier } from "../src/lib/types";

const ROOT = join(__dirname, "..");
const CSV = join(ROOT, "data", "nhanes", "men_18_54_2015_2016.csv");
const OUT = join(ROOT, "docs", "validation", "NHANES_2015-2016.md");

const ALL_ON: Record<ConsentCategory, boolean> = {
  wearable: true,
  at_home_device: true,
  clinical_lab: true,
  environment: true,
  self_report: true,
  family_mode: false,
};

type Row = {
  seqn: number;
  age: number;
  weight?: number;
  bmi?: number;
  waist?: number;
  glucose?: number;
  testosterone?: number;
  /** Not in NHANES. Only set for the clearly labelled simulated repeat-test pathway check. */
  testosteroneRepeat?: number;
  sleep?: number;
};

function num(v: string | undefined): number | undefined {
  if (v === undefined || v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function readRows(): Row[] {
  const [head, ...lines] = readFileSync(CSV, "utf8").trim().split("\n");
  const cols = head.split(",");
  const idx = (name: string) => cols.indexOf(name);
  return lines.map((line) => {
    const f = line.split(",");
    return {
      seqn: Number(f[idx("seqn")]),
      age: Number(f[idx("age")]),
      weight: num(f[idx("weight_kg")]),
      bmi: num(f[idx("bmi")]),
      waist: num(f[idx("waist_cm")]),
      glucose: num(f[idx("glucose_mgdl")]),
      testosterone: num(f[idx("testosterone_ngdl")]),
      sleep: num(f[idx("sleep_hours")]),
    };
  });
}

const TIER_ORDER: TriageTier[] = [
  "insufficient_info",
  "self_care",
  "primary_care",
  "andrology_urology",
  "fertility_services",
  "urgent",
];
const rank = (t: TriageTier) => TIER_ORDER.indexOf(t);

const pct = (n: number, d: number) => (d === 0 ? "n/a" : `${((100 * n) / d).toFixed(1)}%`);

type Evaluated = { row: Row; tier: TriageTier; signalIds: string[]; humanReview: boolean };

function evaluate(row: Row): Evaluated {
  const iv = baseIv({
    // Unmeasured values are removed, not invented.
    weightKg: row.weight,
    bmi: row.bmi,
    waistCm: row.waist,
    visceralFatScore: undefined,
    glucoseMgDl: row.glucose,
    testosteroneNgDl: row.testosterone,
    testosteroneRepeatNgDl: row.testosteroneRepeat,
    ...(row.sleep !== undefined ? { sleepHours: row.sleep } : {}),
  });
  const a = evaluateRisk(iv, ALL_ON);
  return {
    row,
    tier: a.triage.tier,
    signalIds: a.signals.map((s) => s.id),
    humanReview: a.triage.requiresHumanReview,
  };
}

function concordance(
  subset: Evaluated[],
  flagged: (e: Evaluated) => boolean,
  reference: (e: Evaluated) => boolean,
) {
  let tp = 0,
    fp = 0,
    fn = 0,
    tn = 0;
  for (const e of subset) {
    const f = flagged(e);
    const r = reference(e);
    if (f && r) tp++;
    else if (f && !r) fp++;
    else if (!f && r) fn++;
    else tn++;
  }
  return { n: subset.length, tp, fp, fn, tn };
}

function concRow(label: string, c: ReturnType<typeof concordance>) {
  const sens = pct(c.tp, c.tp + c.fn);
  const spec = pct(c.tn, c.tn + c.fp);
  const agree = pct(c.tp + c.tn, c.n);
  return `| ${label} | ${c.n} | ${c.tp} | ${c.fp} | ${c.fn} | ${c.tn} | ${sens} | ${spec} | ${agree} |`;
}

const rows = readRows();
const ev = rows.map(evaluate);

const withBmi = ev.filter((e) => e.row.bmi !== undefined);
const withGlu = ev.filter((e) => e.row.glucose !== undefined);
const withT = ev.filter((e) => e.row.testosterone !== undefined);

// --- Concordance with published reference thresholds ---
const bmiC = concordance(withBmi, (e) => e.signalIds.includes("metabolic-bmi"), (e) => (e.row.bmi as number) >= 30);
const gluWho = concordance(withGlu, (e) => e.signalIds.includes("glucose-watch"), (e) => (e.row.glucose as number) >= 110);
const gluAda = concordance(withGlu, (e) => e.signalIds.includes("glucose-watch"), (e) => (e.row.glucose as number) >= 100);
const gluDm = concordance(withGlu, (e) => e.signalIds.includes("glucose-watch"), (e) => (e.row.glucose as number) >= 126);
const tC = concordance(withT, (e) => e.signalIds.includes("hormone-repeat"), (e) => (e.row.testosterone as number) < 300);

// --- Safety / consistency invariants on real people ---
const counts: Record<TriageTier, number> = {
  insufficient_info: 0,
  self_care: 0,
  primary_care: 0,
  andrology_urology: 0,
  fertility_services: 0,
  urgent: 0,
};
for (const e of ev) counts[e.tier]++;

const metabolicHigh = ev.filter(
  (e) => (e.row.bmi !== undefined && e.row.bmi >= 30) || (e.row.glucose !== undefined && e.row.glucose >= 110),
);
const lowT = ev.filter((e) => e.row.testosterone !== undefined && e.row.testosterone < 300);
const lowTConfirmed = lowT.map((e) => evaluate({ ...e.row, testosteroneRepeat: e.row.testosterone }));
const lowTRecovered = lowT.map((e) => evaluate({ ...e.row, testosteroneRepeat: 450 }));
const specialty = [...ev, ...lowTConfirmed].filter((e) => e.tier === "andrology_urology" || e.tier === "fertility_services");

const invariants: { name: string; violations: number; of: number }[] = [
  { name: "No urgent tier without a red flag (NHANES has no pain/red-flag field)", violations: counts.urgent, of: ev.length },
  { name: "No fertility-services tier without semen data (none in NHANES)", violations: counts.fertility_services, of: ev.length },
  {
    name: "BMI ≥ 30 or glucose ≥ 110 mg/dL never routed to self-care or 'need more information'",
    violations: metabolicHigh.filter((e) => rank(e.tier) < rank("primary_care")).length,
    of: metabolicHigh.length,
  },
  {
    name: "A single total testosterone < 300 ng/dL is never routed to self-care or 'need more information'",
    violations: lowT.filter((e) => rank(e.tier) < rank("primary_care")).length,
    of: lowT.length,
  },
  {
    name: "A single total testosterone < 300 ng/dL never opens the specialist gate on its own (no other cue in NHANES)",
    violations: lowT.filter((e) => rank(e.tier) >= rank("andrology_urology")).length,
    of: lowT.length,
  },
  {
    name: "Pathway check (simulated repeat = first value): a confirmed low testosterone always reaches the specialist gate",
    violations: lowTConfirmed.filter((e) => rank(e.tier) < rank("andrology_urology")).length,
    of: lowTConfirmed.length,
  },
  {
    name: "Pathway check (simulated normal repeat of 450 ng/dL): an unconfirmed low value raises no hormone cue",
    violations: lowTRecovered.filter((e) => e.signalIds.includes("hormone-screen") || e.signalIds.includes("hormone-repeat")).length,
    of: lowTRecovered.length,
  },
  {
    name: "Every specialty-tier result requires human review (real results plus the simulated confirmed-repeat pathway)",
    violations: specialty.filter((e) => !e.humanReview).length,
    of: specialty.length,
  },
  {
    name: "Every result is a valid tier (no engine errors on real values)",
    violations: ev.filter((e) => !TIER_ORDER.includes(e.tier)).length,
    of: ev.length,
  },
];

// --- Tier mix by BMI band ---
const bands: { label: string; test: (b: number) => boolean }[] = [
  { label: "BMI < 25", test: (b) => b < 25 },
  { label: "BMI 25–29.9", test: (b) => b >= 25 && b < 30 },
  { label: "BMI ≥ 30", test: (b) => b >= 30 },
];

const ltTbl = (rowsIn: Evaluated[]) =>
  TIER_ORDER.map((t) => `${rowsIn.filter((e) => e.tier === t).length}`).join(" | ");

const lowTPrev = pct(lowT.length, withT.length);
const lowTSpecialty = lowT.filter((e) => e.tier === "andrology_urology" || e.tier === "fertility_services").length;
const lowTPrimary = lowT.filter((e) => e.tier === "primary_care").length;
const lowTOtherTier = lowT.length - lowTSpecialty - lowTPrimary;
const specialtyShare = pct(counts.andrology_urology, ev.length);

const failedInvariants = invariants.filter((i) => i.violations > 0);

const md = `# SeedShield rules on real measurements: NHANES 2015–2016

> Generated by \`npm run validate:nhanes\`. Do not edit by hand.
> **Scope:** implementation and safety checks of the triage rules on real people's measurements.
> **Not** a clinical accuracy study: NHANES has no semen, fertility, or diagnosis labels, so no sensitivity or specificity for infertility is claimed.

## Data

- **Source:** US CDC, National Health and Nutrition Examination Survey (NHANES), 2015–2016 cycle. Public-domain US government data.
- **Files:** DEMO_I, BMX_I, GLU_I, TST_I, SLQ_I (https://wwwn.cdc.gov/Nchs/Nhanes/continuousnhanes/default.aspx?BeginYear=2015).
- **Sample:** ${ev.length} men aged 18–54. BMI measured for ${withBmi.length}; fasting glucose for ${withGlu.length} (fasting subsample only); total testosterone for ${withT.length}.
- **Unmeasured values are left empty, not invented.** Lifestyle and environment inputs (heat, stress, shift work) are not in NHANES and are held at neutral defaults, so this exercises the metabolic and hormone rules only.
- **Unweighted.** This is a sample, not a nationally representative estimate.

## 1. Concordance with published reference thresholds

Does the engine's flag agree with the reference definition on real values? Reference definitions: BMI ≥ 30 (WHO obesity); fasting glucose ≥ 110 mg/dL (WHO impaired fasting glucose), ≥ 100 (ADA), ≥ 126 (diabetes range; a single value is not diagnostic); total testosterone < 300 ng/dL (common low-testosterone screening threshold).

| Reference definition | n | Flag + ref + | Flag + ref − | Flag − ref + | Flag − ref − | Sensitivity | Specificity | Agreement |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
${concRow("BMI ≥ 30 vs metabolic-bmi flag", bmiC)}
${concRow("Glucose ≥ 110 (WHO) vs glucose flag", gluWho)}
${concRow("Glucose ≥ 100 (ADA) vs glucose flag", gluAda)}
${concRow("Glucose ≥ 126 (diabetes range) vs glucose flag", gluDm)}
${concRow("Testosterone < 300 vs 'repeat advised' flag (first reading)", tC)}

How to read this: the BMI and first-reading testosterone flags use the same thresholds as their reference, so agreement near 100% confirms correct units, edge cases, and missing-value handling on real data. It does **not** show clinical accuracy. The glucose flag fires at ≥ 110 (WHO), so it deliberately misses the ADA 100–109 band; the ADA row quantifies that choice.

## 2. Safety and consistency invariants

| Invariant | Violations | Out of |
| --- | --- | --- |
${invariants.map((i) => `| ${i.name} | ${i.violations} | ${i.of} |`).join("\n")}

${failedInvariants.length === 0 ? "All invariants hold on this sample." : `**${failedInvariants.length} invariant(s) violated. See rows above.**`}

## 3. Pathway mix on real men

| Pathway | Men | Share |
| --- | --- | --- |
${TIER_ORDER.map((t) => `| ${t} | ${counts[t]} | ${pct(counts[t], ev.length)} |`).join("\n")}

By BMI band (columns: ${TIER_ORDER.join(" | ")}):

| Band | Men | ${TIER_ORDER.join(" | ")} |
| --- | --- | ${TIER_ORDER.map(() => "---").join(" | ")} |
${bands
  .map((b) => {
    const s = withBmi.filter((e) => b.test(e.row.bmi as number));
    return `| ${b.label} | ${s.length} | ${ltTbl(s)} |`;
  })
  .join("\n")}

## 4. Findings to act on

- **Testosterone rule refined after the first run.** The first version of this report showed that a single total testosterone below 300 ng/dL sent 353 of 1,726 men (20.5%) straight to the andrology/urology gate. The AUA testosterone-deficiency guideline (2018) advises confirming a low total testosterone with a second early-morning measurement before acting, and NHANES blood draws happen in morning, afternoon, and evening sessions, so many of those low values may be timing effects. The rule now sends a single low reading to primary care with a repeat early-morning test, and opens the specialist gate only when a repeat is also low, or when another cue (semen or anatomical) is present. On this sample, ${lowT.length} of ${withT.length} men with a measured value (${lowTPrev}) are below 300 ng/dL: ${lowTPrimary} are now routed to primary care, ${lowTSpecialty} reach the specialist gate on that value alone, and ${lowTOtherTier} land elsewhere. The confirmed and normal-repeat paths are checked above with a simulated repeat value, because NHANES has no repeat measurement. The 300 ng/dL threshold and the "confirmed" definition still need clinician sign-off.
- **Glucose band.** The Ranges page now states that the engine flags from 110 mg/dL (WHO) and that ADA uses 100, so values of 100–109 are not flagged by design. The ADA row in section 1 shows how many men that choice leaves unflagged.
- **What this cannot show.** Semen rules, heat and shift effects, the self-report path, and referral completion are not covered by this dataset.

## 5. Limits

- US sample, 2015–2016; not Gulf-specific.
- Testosterone was measured by NHANES at varying times of day; the rule assumes a morning draw.
- Fasting glucose covers only the fasting subsample (n = ${withGlu.length}).
- A rule that agrees with its own reference threshold is a correctness check, not evidence of clinical benefit.

## Reproduce

\`\`\`
mkdir -p data/nhanes/raw && cd data/nhanes/raw
for f in DEMO_I BMX_I GLU_I TST_I SLQ_I; do curl -O https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2015/DataFiles/$f.xpt; done
cd ../../.. && python3 scripts/nhanes/prepare.py && npm run validate:nhanes
\`\`\`
`;

mkdirSync(join(ROOT, "docs", "validation"), { recursive: true });
writeFileSync(OUT, md);

console.log(`men: ${ev.length} (BMI ${withBmi.length}, glucose ${withGlu.length}, testosterone ${withT.length})`);
console.log("tiers:", counts);
console.log("BMI concordance:", bmiC);
console.log("glucose vs WHO110:", gluWho, "vs ADA100:", gluAda, "vs 126:", gluDm);
console.log("testosterone:", tC);
for (const i of invariants) console.log(`${i.violations === 0 ? "PASS" : "FAIL"}  ${i.name} (${i.violations}/${i.of})`);
console.log(`wrote ${OUT}`);
process.exit(failedInvariants.length ? 1 : 0);
