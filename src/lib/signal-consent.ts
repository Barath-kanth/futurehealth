import type { ConsentCategory, SignalSource } from "./types";

/** Map a signal source to the consent category that gates it. */
export function consentForSource(source: SignalSource): ConsentCategory {
  switch (source) {
    case "environment":
      return "environment";
    case "wearable":
    case "pc_usage":
    case "phone_media":
      return "wearable";
    case "at_home_device":
      return "at_home_device";
    case "clinical_lab":
    case "pharmacy_meds":
    case "monthly_body_check":
      return "clinical_lab";
    case "self_report":
    case "work_context":
    case "nutrition":
    case "social_context":
    case "finance_context":
    case "alcohol_sensor":
    case "smoke_sensor":
    case "lung_sensor":
    case "voice_ai":
      return "self_report";
    default:
      return "self_report";
  }
}

export const CONSENT_LABELS: Record<
  ConsentCategory,
  { en: string; ar: string }
> = {
  wearable: { en: "Wearable / phone", ar: "ساعة / هاتف" },
  at_home_device: { en: "Home device", ar: "جهاز منزلي" },
  clinical_lab: { en: "Clinical / lab", ar: "سريري / مختبر" },
  environment: { en: "Environment", ar: "البيئة" },
  self_report: { en: "Self-report", ar: "إبلاغ ذاتي" },
  family_mode: { en: "Family share", ar: "مشاركة عائلية" },
};
