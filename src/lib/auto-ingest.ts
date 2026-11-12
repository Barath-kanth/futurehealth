import type {
  DataStreamId,
  DataStreamStatus,
  IndependentVariables,
  Persona,
} from "./types";

const STREAM_META: Record<
  DataStreamId,
  Omit<DataStreamStatus, "connected" | "lastSync" | "freshness">
> = {
  apple_watch: {
    id: "apple_watch",
    label: "Watch · sleep / HRV / temp",
    labelAr: "الساعة · نوم / HRV / حرارة",
    fields: ["sleepHours", "hrvTrend", "restingHr", "bodyTempAnomaly", "sleepApneaRisk", "activityMinutes"],
  },
  phone_sensors: {
    id: "phone_sensors",
    label: "Phone · noise / media / movement",
    labelAr: "الهاتف · ضوضاء / وسائط / حركة",
    fields: ["noiseDbAvg", "mediaIntensity", "activityMinutes"],
  },
  work_pc: {
    id: "work_pc",
    label: "Work PC · sitting / screen / calendar",
    labelAr: "حاسوب العمل · جلوس / شاشة / تقويم",
    fields: ["sedentaryHours", "screenHours", "nightShiftsPerWeek", "occupationalStress"],
  },
  abu_dhabi_env: {
    id: "abu_dhabi_env",
    label: "Abu Dhabi environment feed",
    labelAr: "تغذية بيئة أبوظبي",
    fields: ["heatIndexC", "aqi", "humidityPct", "uvIndex"],
  },
  nutrition_log: {
    id: "nutrition_log",
    label: "Food & water auto-log",
    labelAr: "سجل الطعام والماء",
    fields: ["hydrationLiters", "ultraProcessedScore", "caffeineMg", "plasticFoodContactScore"],
  },
  monthly_bmi: {
    id: "monthly_bmi",
    label: "Monthly body check (BMI / waist)",
    labelAr: "فحص جسم شهري (BMI / خصر)",
    fields: ["weightKg", "bmi", "waistCm", "visceralFatScore"],
  },
  pharmacy_meds: {
    id: "pharmacy_meds",
    label: "Pharmacy / medication context",
    labelAr: "سياق الصيدلية / الأدوية",
    fields: ["medsFertilityImpact", "exogenousAndrogenFlag"],
  },
  home_device: {
    id: "home_device",
    label: "At-home vitality device",
    labelAr: "جهاز الحيوية المنزلي",
    fields: ["semenConcentration", "motilityPct", "morphologyPct", "sdfPct", "testosteroneNgDl"],
  },
  clinical_vault: {
    id: "clinical_vault",
    label: "Clinical vault (category pulls)",
    labelAr: "الخزنة السريرية",
    fields: [
      "glucoseMgDl",
      "varicoceleFlag",
      "geneticRiskFlag",
      "subclinicalInflammationFlag",
      "stiRiskFlag",
      "otherChronicDiseaseFlag",
    ],
  },
  life_context: {
    id: "life_context",
    label: "Life context · money / peace / load",
    labelAr: "سياق الحياة · مال / سلام / حمل",
    fields: [
      "moneyStress",
      "businessStress",
      "financialSecurity",
      "educationLoad",
      "peaceIndex",
      "socialPressureIndex",
    ],
  },
  alcohol_tac: {
    id: "alcohol_tac",
    label: "BACtrack Skyn-class TAC band",
    labelAr: "سوار TAC فئة BACtrack Skyn",
    fields: ["tacMgDl", "alcoholUnitsWeek"],
  },
  alcohol_breath: {
    id: "alcohol_breath",
    label: "Phone breathalyzer dongle",
    labelAr: "جهاز تحليل نفس للهاتف",
    fields: ["breathBacPct", "alcoholUnitsWeek"],
  },
  alcohol_voice_ai: {
    id: "alcohol_voice_ai",
    label: "Voice + motor impairment AI",
    labelAr: "ذكاء صوت وحركة للإعاقة",
    fields: ["voiceImpairmentScore", "motorImpairmentScore"],
  },
  smoke_co: {
    id: "smoke_co",
    label: "iCOquit / Smokerlyzer CO",
    labelAr: "أول أكسيد الكربون iCOquit / Smokerlyzer",
    fields: ["breathCoPpm", "smokingLoad"],
  },
  smoke_gesture: {
    id: "smoke_gesture",
    label: "Watch smoke-gesture AI",
    labelAr: "ذكاء إيماءة التدخين من الساعة",
    fields: ["smokeGestureEventsDay", "smokingLoad"],
  },
  lung_spirometry: {
    id: "lung_spirometry",
    label: "NuvoAir-class spirometer + SpO₂",
    labelAr: "مقياس تنفس فئة NuvoAir + SpO₂",
    fields: ["spirometryFev1Pct", "spo2Pct", "coughRiskScore", "chestMotionRate"],
  },
};

export function buildStreamStatuses(persona: Persona): DataStreamStatus[] {
  const now = Date.now();
  return (Object.keys(STREAM_META) as DataStreamId[]).map((id, i) => {
    const connected = persona.connectedStreams.includes(id);
    const freshness: DataStreamStatus["freshness"] = !connected
      ? "stale"
      : id === "apple_watch" || id === "phone_sensors" || id === "abu_dhabi_env"
        ? "live"
        : id === "monthly_bmi"
          ? "monthly"
          : id === "work_pc" || id === "nutrition_log"
            ? "today"
            : "this_week";
    return {
      ...STREAM_META[id],
      connected,
      freshness,
      lastSync: connected
        ? new Date(now - i * 90_000).toISOString()
        : "—",
    };
  });
}

/** Simulate a live auto pull from connected sources into the personal profile. */
export function autoIngestTick(
  variables: IndependentVariables,
  streams: DataStreamStatus[],
): Partial<IndependentVariables> {
  const on = (id: DataStreamId) => streams.find((s) => s.id === id)?.connected;
  const patch: Partial<IndependentVariables> = {};
  const jitter = (n: number, span: number) =>
    Math.round((n + (Math.random() - 0.5) * span) * 10) / 10;

  if (on("apple_watch")) {
    patch.hrvTrend = jitter(variables.hrvTrend, 1.1);
    patch.restingHr = Math.round(jitter(variables.restingHr, 1.4));
    patch.bodyTempAnomaly = jitter(variables.bodyTempAnomaly, 0.04);
    patch.sleepRegularity = clamp(jitter(variables.sleepRegularity, 1.2), 0, 100);
    patch.sleepApneaRisk = clamp(
      jitter(variables.sleepApneaRisk ?? 20, 2),
      0,
      100,
    );
  }
  if (on("phone_sensors")) {
    patch.noiseDbAvg = clamp(jitter(variables.noiseDbAvg ?? 55, 3), 30, 95);
    patch.mediaIntensity = clamp(
      jitter(variables.mediaIntensity ?? 40, 4),
      0,
      100,
    );
  }
  if (on("abu_dhabi_env")) {
    patch.heatIndexC = jitter(variables.heatIndexC, 0.6);
    patch.aqi = Math.round(jitter(variables.aqi, 4));
    patch.humidityPct = clamp(jitter(variables.humidityPct, 2), 10, 95);
  }
  if (on("work_pc")) {
    patch.screenHours = clamp(jitter(variables.screenHours ?? 8, 0.3), 1, 16);
    patch.sedentaryHours = clamp(
      jitter(variables.sedentaryHours, 0.2),
      1,
      14,
    );
  }
  if (on("nutrition_log")) {
    patch.hydrationLiters = clamp(
      jitter(variables.hydrationLiters, 0.08),
      0.5,
      5,
    );
  }
  if (on("alcohol_tac") && variables.tacMgDl !== undefined) {
    patch.tacMgDl = clamp(jitter(variables.tacMgDl, 0.002), 0, 0.15);
  }
  if (on("smoke_gesture") && variables.smokeGestureEventsDay !== undefined) {
    patch.smokeGestureEventsDay = Math.max(
      0,
      Math.round(jitter(variables.smokeGestureEventsDay, 1)),
    );
  }
  if (on("lung_spirometry") && variables.spo2Pct !== undefined) {
    patch.spo2Pct = clamp(jitter(variables.spo2Pct, 0.4), 88, 100);
  }
  return patch;
}

/** Monthly body check auto-update (BMI / waist / visceral). */
export function runMonthlyBodyCheck(
  variables: IndependentVariables,
): Partial<IndependentVariables> {
  const weight = variables.weightKg ?? estimateWeight(variables.bmi);
  const delta = (Math.random() - 0.45) * 0.8;
  const nextWeight = Math.round((weight + delta) * 10) / 10;
  const heightM = 1.75;
  const bmi = Math.round((nextWeight / (heightM * heightM)) * 10) / 10;
  const waist = Math.round(((variables.waistCm ?? 90) + delta * 0.4) * 10) / 10;
  const visceral = clamp(
    Math.round((bmi - 22) * 4 + (waist - 85) * 1.2),
    0,
    100,
  );
  return {
    weightKg: nextWeight,
    bmi,
    waistCm: waist,
    visceralFatScore: visceral,
  };
}

function estimateWeight(bmi?: number) {
  const b = bmi ?? 26;
  return Math.round(b * 1.75 * 1.75 * 10) / 10;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function defaultExtras(): Pick<
  IndependentVariables,
  | "noiseDbAvg"
  | "screenHours"
  | "plasticFoodContactScore"
  | "moneyStress"
  | "businessStress"
  | "financialSecurity"
  | "educationLoad"
  | "peaceIndex"
  | "mediaIntensity"
  | "sleepApneaRisk"
> {
  return {
    noiseDbAvg: 58,
    screenHours: 8,
    plasticFoodContactScore: 45,
    moneyStress: 40,
    businessStress: 35,
    financialSecurity: 55,
    educationLoad: 20,
    peaceIndex: 55,
    mediaIntensity: 45,
    sleepApneaRisk: 25,
  };
}
