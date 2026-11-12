/**
 * Personal Male Vitality Index (MVI) bands.
 * ILLUSTRATIVE ONLY — not clinically validated cut-points.
 * Prefer explained signals + triage over the single score.
 */
export const MVI_BANDS = {
  strong: {
    min: 75,
    max: 100,
    label: "Illustrative · higher",
    labelAr: "توضيحي · أعلى",
    color: "#1f6b4a",
  },
  acceptable: {
    min: 60,
    max: 74,
    label: "Illustrative · mid",
    labelAr: "توضيحي · وسط",
    color: "#8a6a1f",
  },
  low: {
    min: 45,
    max: 59,
    label: "Illustrative · lower",
    labelAr: "توضيحي · أدنى",
    color: "#8b3a2a",
  },
  critical: {
    min: 0,
    max: 44,
    label: "Illustrative · lowest",
    labelAr: "توضيحي · الأدنى",
    color: "#7a1f2b",
  },
} as const;

export type MviBandKey = keyof typeof MVI_BANDS;

export function bandForIndex(index: number): MviBandKey {
  if (index >= 75) return "strong";
  if (index >= 60) return "acceptable";
  if (index >= 45) return "low";
  return "critical";
}

/** Doctor notify only when user opted in AND index crosses illustrative mid band. */
export function shouldAlertDoctor(
  index: number,
  previous: number | undefined,
  doctorAlertOptIn: boolean,
) {
  if (!doctorAlertOptIn) return false;
  const band = bandForIndex(index);
  const crossedDown =
    previous !== undefined && previous >= 60 && index < 60;
  return band === "low" || band === "critical" || crossedDown;
}

export function shouldAlertPatient(index: number) {
  return index < 75;
}

export const INDEX_EXPLAIN = {
  en: "This score is a simple guide for the demo — not a medical proof. Trust your next-step suggestion more than the number. Doctor alerts only if you turn them on.",
  ar: "هذه الدرجة دليل بسيط للعرض — ليست إثباتًا طبيًا. ثق باقتراح خطوتك أكثر من الرقم. تنبيه الطبيب فقط إن فعّلته.",
};
