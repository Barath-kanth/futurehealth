/**
 * Unit conversion and plausibility checks for self-entered lab values.
 * Many Gulf labs report testosterone in nmol/L and glucose in mmol/L, while the
 * triage engine works in ng/dL and mg/dL. Values are rounded to whole numbers
 * so common cut-offs convert cleanly (10.4 nmol/L = 300 ng/dL, 6.1 mmol/L = 110 mg/dL).
 */

export type TestosteroneUnit = "ng/dL" | "nmol/L";
export type GlucoseUnit = "mg/dL" | "mmol/L";

const T_NMOL_TO_NGDL = 28.84;
const GLU_MMOL_TO_MGDL = 18.016;

/** Plausible entry ranges, in the engine's units. Outside these is almost surely a typo or wrong unit. */
export const TESTOSTERONE_RANGE_NGDL = { min: 5, max: 3000 } as const;
export const GLUCOSE_RANGE_MGDL = { min: 30, max: 800 } as const;

export type LabParse =
  | { ok: true; value: number }
  | { ok: false; error: "empty" | "not_a_number" | "out_of_range" };

export function testosteroneToNgDl(raw: string, unit: TestosteroneUnit): LabParse {
  const n = parseNumber(raw);
  if (n === "empty") return { ok: false, error: "empty" };
  if (n === "nan") return { ok: false, error: "not_a_number" };
  const ngdl = Math.round(unit === "nmol/L" ? n * T_NMOL_TO_NGDL : n);
  if (ngdl < TESTOSTERONE_RANGE_NGDL.min || ngdl > TESTOSTERONE_RANGE_NGDL.max) {
    return { ok: false, error: "out_of_range" };
  }
  return { ok: true, value: ngdl };
}

export function glucoseToMgDl(raw: string, unit: GlucoseUnit): LabParse {
  const n = parseNumber(raw);
  if (n === "empty") return { ok: false, error: "empty" };
  if (n === "nan") return { ok: false, error: "not_a_number" };
  const mgdl = Math.round(unit === "mmol/L" ? n * GLU_MMOL_TO_MGDL : n);
  if (mgdl < GLUCOSE_RANGE_MGDL.min || mgdl > GLUCOSE_RANGE_MGDL.max) {
    return { ok: false, error: "out_of_range" };
  }
  return { ok: true, value: mgdl };
}

function parseNumber(raw: string): number | "empty" | "nan" {
  const s = raw.trim().replace(",", ".");
  if (s === "") return "empty";
  if (!/^\d+(\.\d+)?$/.test(s)) return "nan";
  const n = Number(s);
  return Number.isFinite(n) ? n : "nan";
}
