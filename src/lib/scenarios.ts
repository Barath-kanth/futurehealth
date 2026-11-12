import type { ScenarioPreset } from "./types";

/** Environmental / social / work scenarios that reshape the entire companion. */
export const SCENARIOS: ScenarioPreset[] = [
  {
    id: "baseline",
    name: "Baseline Abu Dhabi day",
    nameAr: "يوم أبوظبي الأساسي",
    description: "Typical spring conditions — companion in balanced monitoring mode.",
    descriptionAr: "ظروف ربيع معتادة — الرفيق في وضع مراقبة متوازن.",
    patch: {
      heatIndexC: 33,
      humidityPct: 45,
      aqi: 70,
      uvIndex: 7,
      outdoorHeatHours: 1,
      fastingWindow: false,
    },
  },
  {
    id: "gulf-heatwave",
    name: "Gulf heatwave",
    nameAr: "موجة حر خليجية",
    description:
      "Extreme heat + humidity. Auto-activates cooling protocol, hydration modules, outdoor timing limits.",
    descriptionAr:
      "حرارة ورطوبة قصوى. يفعّل بروتوكول التبريد والترطيب وحدود توقيت الخارج تلقائيًا.",
    patch: {
      heatIndexC: 46,
      humidityPct: 75,
      outdoorHeatHours: 5.5,
      hydrationLiters: 1.6,
      bodyTempAnomaly: 0.45,
      aqi: 110,
      uvIndex: 11,
    },
  },
  {
    id: "dust-aqi",
    name: "Dust & high AQI",
    nameAr: "غبار ومؤشر هواء مرتفع",
    description:
      "Sand/dust event. Oxidative-load watch + indoor activity bias + air-quality shield module.",
    descriptionAr:
      "حدث غبار/رمال. مراقبة حمل الأكسدة وتحيّز نشاط داخلي ووحدة درع جودة الهواء.",
    patch: {
      aqi: 168,
      uvIndex: 6,
      outdoorHeatHours: 0.8,
      activityMinutes: 40,
    },
  },
  {
    id: "ramadan-fasting",
    name: "Ramadan fasting window",
    nameAr: "نافذة صيام رمضان",
    description:
      "Religious fasting observance. Retimes prompts; stewardship framing; no fertility assumptions.",
    descriptionAr:
      "مراعاة الصيام الديني. إعادة توقيت التنبيهات؛ تأطير الرعاية؛ بلا افتراضات خصوبة.",
    patch: {
      fastingWindow: true,
      hydrationLiters: 1.5,
      sleepHours: 5.8,
      sleepRegularity: 50,
      caffeineMg: 80,
      ultraProcessedScore: 55,
      socialPressureIndex: 50,
    },
  },
  {
    id: "peak-shift-week",
    name: "Peak shift-work week",
    nameAr: "أسبوع ذروة الورديات",
    description:
      "Four night shifts. Circadian disruption dominates adaptive stack and triage weight.",
    descriptionAr:
      "أربع ورديات ليلية. اضطراب الإيقاع يسيطر على الحزمة التكيفية ووزن الفرز.",
    patch: {
      shiftWork: true,
      nightShiftsPerWeek: 4,
      sleepHours: 4.8,
      sleepRegularity: 35,
      hrvTrend: -16,
      restingHr: 84,
      occupationalStress: 88,
      caffeineMg: 420,
    },
  },
  {
    id: "office-sedentary",
    name: "Deep sedentary office",
    nameAr: "مكتب عميق قليل الحركة",
    description:
      "11h seated, low activity, ultra-processed lunch culture → metabolic watchlist rises.",
    descriptionAr:
      "١١ ساعة جلوس ونشاط منخفض وثقافة غداء معالج → ترتفع قائمة المراقبة الاستقلابية.",
    patch: {
      sedentaryHours: 11.5,
      activityMinutes: 35,
      ultraProcessedScore: 78,
      glucoseMgDl: 122,
      bmi: 32,
      occupationalStress: 60,
    },
  },
  {
    id: "high-stigma",
    name: "High social privacy pressure",
    nameAr: "ضغط خصوصية اجتماعية مرتفع",
    description:
      "UI softens language, locks Family Mode off, emphasizes vault and on-device processing.",
    descriptionAr:
      "تلطيف اللغة، إقفال وضع العائلة، إبراز الخزنة والمعالجة على الجهاز.",
    patch: {
      socialPressureIndex: 90,
      familyModeEnabled: false,
    },
  },
  {
    id: "device-escalation",
    name: "Device + lab escalation",
    nameAr: "تصعيد جهاز ومختبر",
    description:
      "At-home semen/hormone auto-upload outside screening ranges → human-review specialty path.",
    descriptionAr:
      "رفع منوي/هرموني منزلي خارج نطاقات الفحص → مسار تخصصي بمراجعة بشرية.",
    patch: {
      semenConcentration: 9,
      motilityPct: 28,
      morphologyPct: 2.5,
      testosteroneNgDl: 270,
      varicoceleFlag: true,
    },
  },
];

export function getScenario(id: string) {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
}
