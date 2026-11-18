import type { IndependentVariables, Locale } from "./types";

export type FactorControl = "controllable" | "uncontrollable" | "semi";
export type BodyRegionId =
  | "brain"
  | "heart"
  | "lungs"
  | "liver_metabolic"
  | "hormones"
  | "reproductive"
  | "muscles"
  | "sleep_recovery";

export type JobTypeId =
  | "desk_knowledge"
  | "warehouse_shift"
  | "outdoor_construction"
  | "driver_gig"
  | "healthcare_shift"
  | "executive_high_stress";

export interface FactorDef {
  id: string;
  key?: keyof IndependentVariables;
  label: string;
  labelAr: string;
  control: FactorControl;
  category: "work" | "environment" | "physio" | "psycho" | "lifestyle" | "anatomy";
  unit?: string;
  /** How strongly this factor moves the vitality index (negative = harmful when high) */
  impactWeight: number;
  tip: string;
  tipAr: string;
}

export interface BodyRegion {
  id: BodyRegionId;
  label: string;
  labelAr: string;
  score: number;
  status: "strong" | "watch" | "strain";
  drivers: string[];
  whatToDo: string;
  whatToDoAr: string;
}

export interface ActionItem {
  id: string;
  title: string;
  titleAr: string;
  why: string;
  whyAr: string;
  steps: string[];
  stepsAr: string[];
  effort: "easy" | "moderate" | "clinical";
  impact: "high" | "medium" | "low";
  dueLabel: string;
  dueLabelAr: string;
  bodyRegion: BodyRegionId;
}

export interface IndexPoint {
  day: string;
  index: number;
  controllableDrag: number;
  uncontrollableDrag: number;
  workDrag: number;
  psychoDrag: number;
}

export interface JobProfile {
  id: JobTypeId;
  label: string;
  labelAr: string;
  blurb: string;
  blurbAr: string;
  patch: Partial<IndependentVariables>;
  heavyImpactNote: string;
  heavyImpactNoteAr: string;
}

export const JOB_TYPES: JobProfile[] = [
  {
    id: "desk_knowledge",
    label: "Desk / knowledge work",
    labelAr: "عمل مكتبي / معرفي",
    blurb: "Long sitting, screen stress, irregular meals.",
    blurbAr: "جلوس طويل، ضغط الشاشات، وجبات غير منتظمة.",
    heavyImpactNote: "Sedentary metabolic load is your main workplace drag.",
    heavyImpactNoteAr: "حمل الجلوس الاستقلابي هو أكبر سحب مهني لديك.",
    patch: {
      sedentaryHours: 11,
      activityMinutes: 45,
      occupationalStress: 62,
      shiftWork: false,
      nightShiftsPerWeek: 0,
      outdoorHeatHours: 0.4,
    },
  },
  {
    id: "warehouse_shift",
    label: "Warehouse / night shift",
    labelAr: "مستودع / وردية ليلية",
    blurb: "Circadian disruption + heat bays + physical load.",
    blurbAr: "اضطراب إيقاع + حرارة الأرصفة + حمل بدني.",
    heavyImpactNote: "Night shifts and heat exposure dominate your index moves.",
    heavyImpactNoteAr: "الورديات الليلية والحرارة تسيطران على حركة مؤشرك.",
    patch: {
      shiftWork: true,
      nightShiftsPerWeek: 4,
      outdoorHeatHours: 4,
      sleepHours: 5.1,
      sleepRegularity: 40,
      occupationalStress: 78,
      sedentaryHours: 4,
      activityMinutes: 160,
      hrvTrend: -14,
    },
  },
  {
    id: "outdoor_construction",
    label: "Outdoor / construction",
    labelAr: "خارجي / إنشاءات",
    blurb: "Heat, dust, UV, dehydration risk.",
    blurbAr: "حرارة وغبار وأشعة وتجفاف.",
    heavyImpactNote: "Uncontrollable heat + AQI heavily price into your vitality index.",
    heavyImpactNoteAr: "الحرارة ومؤشر الهواء غير القابلين للتحكم ينعكسان بقوة على مؤشرك.",
    patch: {
      outdoorHeatHours: 6,
      heatIndexC: 44,
      aqi: 140,
      uvIndex: 11,
      hydrationLiters: 1.7,
      sedentaryHours: 2,
      activityMinutes: 220,
      bodyTempAnomaly: 0.35,
      occupationalStress: 70,
    },
  },
  {
    id: "driver_gig",
    label: "Driver / gig mobility",
    labelAr: "سائق / تنقل مرن",
    blurb: "Sitting, delayed meals, urban air, fragmented sleep.",
    blurbAr: "جلوس ووجبات متأخرة وهواء حضري ونوم مجزأ.",
    heavyImpactNote: "Sitting + air quality + meal timing move your personal curve.",
    heavyImpactNoteAr: "الجلوس وجودة الهواء وتوقيت الوجبات تحرّك منحناك الشخصي.",
    patch: {
      sedentaryHours: 9,
      aqi: 120,
      ultraProcessedScore: 74,
      sleepRegularity: 48,
      activityMinutes: 70,
      occupationalStress: 66,
      caffeineMg: 350,
    },
  },
  {
    id: "healthcare_shift",
    label: "Healthcare shift work",
    labelAr: "رعاية صحية بنظام ورديات",
    blurb: "Rotating nights, high psycho load, irregular recovery.",
    blurbAr: "ليل متناوب، حمل نفسي مرتفع، تعافٍ غير منتظم.",
    heavyImpactNote: "Psychological load + circadian debt are priced first.",
    heavyImpactNoteAr: "الحمل النفسي ودين الإيقاع يُسعَّران أولًا.",
    patch: {
      shiftWork: true,
      nightShiftsPerWeek: 3,
      occupationalStress: 86,
      sleepHours: 5.4,
      sleepRegularity: 38,
      hrvTrend: -15,
      restingHr: 82,
      socialPressureIndex: 55,
    },
  },
  {
    id: "executive_high_stress",
    label: "Executive / high stress",
    labelAr: "تنفيذي / ضغط مرتفع",
    blurb: "Chronic stress, travel, sleep debt, high caffeine.",
    blurbAr: "إجهاد مزمن وسفر ودين نوم وكافيين مرتفع.",
    heavyImpactNote: "Autonomic strain from stress is your biggest controllable lever.",
    heavyImpactNoteAr: "إجهاد الجهاز الذاتي من الضغط هو أكبر رافعة قابلة للتحكم.",
    patch: {
      occupationalStress: 90,
      sleepHours: 5.6,
      hrvTrend: -18,
      caffeineMg: 450,
      sedentaryHours: 10,
      ultraProcessedScore: 60,
      restingHr: 80,
    },
  },
];

export const FACTORS: FactorDef[] = [
  {
    id: "sleep",
    key: "sleepHours",
    label: "Sleep hours",
    labelAr: "ساعات النوم",
    control: "controllable",
    category: "physio",
    unit: "h",
    impactWeight: -2.8,
    tip: "Protect a fixed sleep window — biggest controllable lift for most men.",
    tipAr: "احمِ نافذة نوم ثابتة — أكبر رفع قابل للتحكم لمعظم الرجال.",
  },
  {
    id: "hydration",
    key: "hydrationLiters",
    label: "Hydration",
    labelAr: "الترطيب",
    control: "controllable",
    category: "lifestyle",
    unit: "L",
    impactWeight: 2.2,
    tip: "Raise intake on hot / outdoor job days.",
    tipAr: "زد الشرب في أيام الحر والعمل الخارجي.",
  },
  {
    id: "activity",
    key: "activityMinutes",
    label: "Movement",
    labelAr: "الحركة",
    control: "controllable",
    category: "lifestyle",
    unit: "min",
    impactWeight: 0.04,
    tip: "Break long sitting every 60–90 minutes.",
    tipAr: "اكسر الجلوس الطويل كل ٦٠–٩٠ دقيقة.",
  },
  {
    id: "stress",
    key: "occupationalStress",
    label: "Work stress",
    labelAr: "إجهاد العمل",
    control: "semi",
    category: "psycho",
    impactWeight: -0.18,
    tip: "Breathing resets + boundary on after-hours load.",
    tipAr: "تهدئة بالتنفس وحدود على حمل ما بعد الدوام.",
  },
  {
    id: "diet",
    key: "ultraProcessedScore",
    label: "Ultra-processed diet",
    labelAr: "غذاء معالج",
    control: "controllable",
    category: "lifestyle",
    impactWeight: -0.12,
    tip: "Swap one processed meal for whole food daily.",
    tipAr: "استبدل وجبة معالجة يوميًا بطعام كامل.",
  },
  {
    id: "caffeine",
    key: "caffeineMg",
    label: "Caffeine",
    labelAr: "الكافيين",
    control: "controllable",
    category: "lifestyle",
    unit: "mg",
    impactWeight: -0.02,
    tip: "Cut afternoon caffeine to protect sleep regularity.",
    tipAr: "قلّل كافيين بعد الظهر لحماية انتظام النوم.",
  },
  {
    id: "sedentary",
    key: "sedentaryHours",
    label: "Sitting hours",
    labelAr: "ساعات الجلوس",
    control: "semi",
    category: "work",
    unit: "h",
    impactWeight: -1.4,
    tip: "Job design often forces sitting — negotiate micro-breaks.",
    tipAr: "طبيعة العمل تفرض الجلوس — فاوض على استراحات قصيرة.",
  },
  {
    id: "nights",
    key: "nightShiftsPerWeek",
    label: "Night shifts",
    labelAr: "ورديات ليلية",
    control: "semi",
    category: "work",
    impactWeight: -3.5,
    tip: "Ask for clustered nights + protected recovery days.",
    tipAr: "اطلب ليالي متجمعة وأيام تعافٍ محمية.",
  },
  {
    id: "heat",
    key: "heatIndexC",
    label: "Heat index",
    labelAr: "مؤشر الحرارة",
    control: "uncontrollable",
    category: "environment",
    unit: "°C",
    impactWeight: -0.55,
    tip: "You can’t control weather — you can control exposure windows & cooling.",
    tipAr: "لا تتحكم بالطقس — تتحكم بنوافذ التعرض والتبريد.",
  },
  {
    id: "aqi",
    key: "aqi",
    label: "Air quality (AQI)",
    labelAr: "جودة الهواء",
    control: "uncontrollable",
    category: "environment",
    impactWeight: -0.06,
    tip: "Shift outdoor tasks off peak dust hours when possible.",
    tipAr: "انقل المهام الخارجية بعيدًا عن ذروة الغبار إن أمكن.",
  },
  {
    id: "outdoor_heat",
    key: "outdoorHeatHours",
    label: "Outdoor heat hours",
    labelAr: "ساعات الحر خارجًا",
    control: "semi",
    category: "work",
    unit: "h",
    impactWeight: -2.2,
    tip: "Job type often locks this — cooling breaks are your lever.",
    tipAr: "نوع العمل غالبًا يثبّت هذا — استراحات التبريد رافعتك.",
  },
  {
    id: "privacy_pressure",
    key: "socialPressureIndex",
    label: "Social / privacy pressure",
    labelAr: "ضغط اجتماعي / خصوصية",
    control: "uncontrollable",
    category: "psycho",
    impactWeight: -0.04,
    tip: "Doesn’t change biology directly — changes help-seeking. Keep vault private.",
    tipAr: "لا يغيّر البيولوجيا مباشرة — يغيّر طلب المساعدة. أبقِ الخزنة خاصة.",
  },
  {
    id: "hrv",
    key: "hrvTrend",
    label: "HRV trend (watch)",
    labelAr: "اتجاه HRV (ساعة)",
    control: "semi",
    category: "physio",
    impactWeight: 0.35,
    tip: "Live watch signal of recovery debt.",
    tipAr: "إشارة ساعة حية لدين التعافي.",
  },
  {
    id: "resting_hr",
    key: "restingHr",
    label: "Resting heart rate",
    labelAr: "نبض الراحة",
    control: "semi",
    category: "physio",
    unit: "bpm",
    impactWeight: -0.25,
    tip: "Rising RHR with stress/heat = take a recovery day.",
    tipAr: "ارتفاع نبض الراحة مع الإجهاد/الحر = خذ يوم تعافٍ.",
  },
  {
    id: "money",
    key: "moneyStress",
    label: "Money stress",
    labelAr: "ضغط المال",
    control: "semi",
    category: "psycho",
    impactWeight: -0.1,
    tip: "From your life-context feed — pairs with sleep & peace.",
    tipAr: "من تغذية سياق حياتك — يقترن بالنوم والسلام.",
  },
  {
    id: "peace",
    key: "peaceIndex",
    label: "Peace index",
    labelAr: "مؤشر السلام",
    control: "controllable",
    category: "psycho",
    impactWeight: 0.12,
    tip: "Higher peace lifts recovery on your personal curve.",
    tipAr: "سلام أعلى يرفع التعافي على منحناك الشخصي.",
  },
  {
    id: "screen",
    key: "screenHours",
    label: "Screen hours (PC/phone)",
    labelAr: "ساعات الشاشة",
    control: "controllable",
    category: "lifestyle",
    unit: "h",
    impactWeight: -0.8,
    tip: "Auto from work PC + phone — wind-down before sleep.",
    tipAr: "تلقائي من حاسوب العمل والهاتف — تهدئة قبل النوم.",
  },
  {
    id: "noise",
    key: "noiseDbAvg",
    label: "Noise (dB)",
    labelAr: "الضوضاء",
    control: "uncontrollable",
    category: "environment",
    unit: "dB",
    impactWeight: -0.08,
    tip: "Phone mic average for your day.",
    tipAr: "متوسط ميكروفون هاتفك ليومك.",
  },
  {
    id: "plastic",
    key: "plasticFoodContactScore",
    label: "Plastic / EDC food contact",
    labelAr: "ملامسة بلاستيك / EDC",
    control: "controllable",
    category: "lifestyle",
    impactWeight: -0.1,
    tip: "From nutrition log — containers & packaging.",
    tipAr: "من سجل التغذية — الأوعية والتغليف.",
  },
  {
    id: "apnea",
    key: "sleepApneaRisk",
    label: "Sleep apnea risk proxy",
    labelAr: "مؤشر انقطاع النفس",
    control: "semi",
    category: "physio",
    impactWeight: -0.12,
    tip: "Watch-derived snore/O2 proxy on your file.",
    tipAr: "وكيل شخير/أكسجين من الساعة في ملفك.",
  },
];

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

/** Personal Male Vitality Index — screening score, not a diagnosis. */
export function computeVitalityIndex(iv: IndependentVariables): {
  index: number;
  controllableDrag: number;
  uncontrollableDrag: number;
  workDrag: number;
  psychoDrag: number;
  physioDrag: number;
  deltaVsBaseline: number;
} {
  let score = 78;
  let controllableDrag = 0;
  let uncontrollableDrag = 0;
  let workDrag = 0;
  let psychoDrag = 0;
  let physioDrag = 0;

  const apply = (
    control: FactorControl,
    category: FactorDef["category"],
    delta: number,
  ) => {
    score += delta;
    const drag = delta < 0 ? -delta : 0;
    if (control === "controllable") controllableDrag += drag;
    if (control === "uncontrollable") uncontrollableDrag += drag;
    if (control === "semi") {
      controllableDrag += drag * 0.45;
      uncontrollableDrag += drag * 0.55;
    }
    if (category === "work") workDrag += drag;
    if (category === "psycho") psychoDrag += drag;
    if (category === "physio") physioDrag += drag;
  };

  // Controllable / semi physio-lifestyle
  apply("controllable", "physio", (iv.sleepHours - 7.2) * 3.2);
  apply("controllable", "lifestyle", (iv.hydrationLiters - 2.5) * 4);
  apply("controllable", "lifestyle", (iv.activityMinutes - 150) * 0.035);
  apply("controllable", "lifestyle", (55 - iv.ultraProcessedScore) * 0.1);
  apply("controllable", "lifestyle", (200 - iv.caffeineMg) * 0.015);
  apply("semi", "psycho", (50 - iv.occupationalStress) * 0.16);
  apply("semi", "work", (7 - iv.sedentaryHours) * 1.3);
  apply("semi", "work", -iv.nightShiftsPerWeek * 3.2);
  if (iv.shiftWork) apply("semi", "work", -6);

  // Uncontrollable environment
  apply("uncontrollable", "environment", (34 - iv.heatIndexC) * 0.55);
  apply("uncontrollable", "environment", (70 - iv.aqi) * 0.05);
  apply("semi", "work", (1.5 - iv.outdoorHeatHours) * 2.1);
  apply("uncontrollable", "psycho", (40 - iv.socialPressureIndex) * 0.03);

  // Watch / physio live
  apply("semi", "physio", iv.hrvTrend * 0.4);
  apply("semi", "physio", (70 - iv.restingHr) * 0.22);
  apply("semi", "physio", (iv.sleepRegularity - 70) * 0.08);
  apply("semi", "physio", -Math.abs(iv.bodyTempAnomaly) * 8);
  apply("semi", "physio", -(iv.sleepApneaRisk ?? 0) * 0.08);
  apply("semi", "lifestyle", -(iv.screenHours ?? 8) * 0.35);
  apply("uncontrollable", "environment", -(iv.noiseDbAvg ?? 55) * 0.04);
  apply("controllable", "lifestyle", -(iv.plasticFoodContactScore ?? 40) * 0.05);
  apply("controllable", "lifestyle", -(iv.mediaIntensity ?? 40) * 0.04);
  apply("semi", "psycho", -(iv.moneyStress ?? 0) * 0.06);
  apply("semi", "psycho", -(iv.businessStress ?? 0) * 0.05);
  apply("controllable", "psycho", ((iv.financialSecurity ?? 50) - 50) * 0.04);
  apply("semi", "psycho", -(iv.educationLoad ?? 0) * 0.03);
  apply("controllable", "psycho", ((iv.peaceIndex ?? 50) - 50) * 0.08);
  apply("controllable", "lifestyle", -(iv.smokingLoad ?? 0) * 0.12);
  apply("controllable", "lifestyle", -Math.max(0, (iv.alcoholUnitsWeek ?? 0) - 7) * 0.9);
  if (iv.recreationalDrugFlag) apply("semi", "lifestyle", -8);
  if (iv.tacMgDl !== undefined && iv.tacMgDl >= 0.02)
    apply("semi", "lifestyle", -iv.tacMgDl * 120);
  if (iv.breathBacPct !== undefined && iv.breathBacPct >= 0.02)
    apply("semi", "lifestyle", -iv.breathBacPct * 150);
  if ((iv.voiceImpairmentScore ?? 0) >= 40)
    apply("semi", "lifestyle", -(iv.voiceImpairmentScore! - 30) * 0.15);
  if ((iv.motorImpairmentScore ?? 0) >= 40)
    apply("semi", "lifestyle", -(iv.motorImpairmentScore! - 30) * 0.12);
  if ((iv.breathCoPpm ?? 0) >= 6)
    apply("controllable", "lifestyle", -(iv.breathCoPpm! - 4) * 0.8);
  if ((iv.smokeGestureEventsDay ?? 0) >= 5)
    apply("controllable", "lifestyle", -iv.smokeGestureEventsDay! * 0.7);
  if ((iv.spo2Pct ?? 100) < 95) apply("semi", "physio", -(95 - iv.spo2Pct!) * 1.2);
  if ((iv.spirometryFev1Pct ?? 100) < 80)
    apply("semi", "physio", -(80 - iv.spirometryFev1Pct!) * 0.25);
  if ((iv.coughRiskScore ?? 0) >= 40)
    apply("semi", "physio", -(iv.coughRiskScore! - 30) * 0.12);

  if (iv.iief5Score !== undefined && iv.iief5Score < 22)
    apply("semi", "physio", (iv.iief5Score - 22) * 0.8);
  if (iv.amsScore !== undefined && iv.amsScore > 26)
    apply("semi", "physio", -(iv.amsScore - 26) * 0.25);
  if (iv.ipssScore !== undefined && iv.ipssScore > 7)
    apply("semi", "physio", -(iv.ipssScore - 7) * 0.4);
  if (iv.vitaminDNgMl !== undefined && iv.vitaminDNgMl < 30)
    apply("controllable", "physio", (iv.vitaminDNgMl - 30) * 0.25);
  if (iv.systolicBp !== undefined && iv.systolicBp >= 130)
    apply("semi", "physio", -(iv.systolicBp - 120) * 0.15);
  if (iv.freeTestosteronePgMl !== undefined && iv.freeTestosteronePgMl < 50)
    apply("semi", "physio", -10);

  if (iv.fastingWindow) apply("controllable", "lifestyle", -1.5);

  // Device / anatomy / hidden clinical (only when present on HIS profile)
  if (iv.bmi !== undefined) apply("semi", "physio", (24.5 - iv.bmi) * 0.7);
  if (iv.visceralFatScore !== undefined)
    apply("semi", "physio", -iv.visceralFatScore * 0.06);
  if (iv.glucoseMgDl !== undefined)
    apply("semi", "physio", (100 - iv.glucoseMgDl) * 0.12);
  if (iv.testosteroneNgDl !== undefined)
    apply("semi", "physio", (iv.testosteroneNgDl - 450) * 0.02);
  if (iv.semenConcentration !== undefined)
    apply("semi", "physio", (iv.semenConcentration - 20) * 0.35);
  if (iv.motilityPct !== undefined)
    apply("semi", "physio", (iv.motilityPct - 42) * 0.15);
  if (iv.sdfPct !== undefined) apply("semi", "physio", -iv.sdfPct * 0.25);
  if (iv.varicoceleFlag) apply("uncontrollable", "physio", -8);
  if (iv.exogenousAndrogenFlag) apply("semi", "physio", -12);
  if (iv.geneticRiskFlag) apply("uncontrollable", "physio", -10);
  if (iv.subclinicalInflammationFlag) apply("semi", "physio", -7);
  if (iv.medsFertilityImpact) apply("semi", "physio", -5);
  if (iv.stiRiskFlag) apply("semi", "physio", -10);
  if (iv.otherChronicDiseaseFlag) apply("semi", "physio", -4);

  const index = clamp(Math.round(score * 10) / 10);
  return {
    index,
    controllableDrag: Math.round(controllableDrag * 10) / 10,
    uncontrollableDrag: Math.round(uncontrollableDrag * 10) / 10,
    workDrag: Math.round(workDrag * 10) / 10,
    psychoDrag: Math.round(psychoDrag * 10) / 10,
    physioDrag: Math.round(physioDrag * 10) / 10,
    deltaVsBaseline: Math.round((index - 78) * 10) / 10,
  };
}

/** Simulate a 30-day personal index series like a stock chart. */
export function buildIndexSeries(iv: IndependentVariables): IndexPoint[] {
  const base = computeVitalityIndex(iv);
  const points: IndexPoint[] = [];
  for (let d = 29; d >= 0; d--) {
    const wave = Math.sin(d / 3.2) * 1.8 + Math.cos(d / 5.1) * 1.1;
    const heatSpike = iv.heatIndexC > 40 && d % 7 === 2 ? -4.5 : 0;
    const shiftDip = iv.shiftWork && d % 5 === 0 ? -3.2 : 0;
    const recovery = iv.sleepHours >= 7 && d % 6 === 1 ? 2.4 : 0;
    const noise = ((d * 17) % 7) - 3;
    const index = clamp(
      base.index + wave + heatSpike + shiftDip + recovery + noise * 0.35,
    );
    points.push({
      day: `D-${d === 0 ? "0" : d}`,
      index: Math.round(index * 10) / 10,
      controllableDrag: base.controllableDrag,
      uncontrollableDrag: base.uncontrollableDrag,
      workDrag: base.workDrag,
      psychoDrag: base.psychoDrag,
    });
  }
  points[points.length - 1].day = "Today";
  return points;
}

export function scoreBodyRegions(iv: IndependentVariables): BodyRegion[] {
  const mk = (
    id: BodyRegionId,
    label: string,
    labelAr: string,
    raw: number,
    drivers: string[],
    whatToDo: string,
    whatToDoAr: string,
  ): BodyRegion => {
    const score = clamp(Math.round(raw));
    const status = score >= 75 ? "strong" : score >= 55 ? "watch" : "strain";
    return { id, label, labelAr, score, status, drivers, whatToDo, whatToDoAr };
  };

  return [
    mk(
      "brain",
      "Brain & stress circuits",
      "الدماغ ودوائر الإجهاد",
      88 - iv.occupationalStress * 0.35 - (iv.sleepHours < 6 ? 12 : 0),
      [`stress=${iv.occupationalStress}`, `sleep=${iv.sleepHours}h`],
      "10-minute wind-down before sleep; park work chat after a cutoff.",
      "تهدئة ١٠ دقائق قبل النوم؛ أوقف دردشة العمل بعد حد زمني.",
    ),
    mk(
      "heart",
      "Heart & autonomic",
      "القلب والجهاز الذاتي",
      90 + iv.hrvTrend * 1.2 - (iv.restingHr - 68) * 0.8,
      [`HRV trend=${iv.hrvTrend}`, `RHR=${iv.restingHr}`],
      "If HRV falls 3 days, schedule a lighter day and hydrate.",
      "إذا انخفض HRV ٣ أيام، خفّف الحمل وزد الترطيب.",
    ),
    mk(
      "lungs",
      "Lungs & air exposure",
      "الرئتان والتعرض للهواء",
      92 -
        (iv.aqi - 50) * 0.22 -
        iv.outdoorHeatHours * 1.5 -
        (iv.smokingLoad ?? 0) * 0.15 -
        Math.max(0, (iv.breathCoPpm ?? 0) - 4) * 1.5 -
        Math.max(0, 95 - (iv.spo2Pct ?? 95)) * 2 -
        Math.max(0, 80 - (iv.spirometryFev1Pct ?? 80)) * 0.3,
      [
        `AQI=${iv.aqi}`,
        `CO=${iv.breathCoPpm ?? "n/a"}`,
        `SpO2=${iv.spo2Pct ?? "n/a"}`,
        `FEV1=${iv.spirometryFev1Pct ?? "n/a"}`,
      ],
      "Attach iCOquit / NuvoAir if smoke or breath feel off; shift outdoor tasks off peak dust.",
      "أرفق iCOquit / NuvoAir إذا شعرت بضيق؛ انقل المهام الخارجية بعيدًا عن ذروة الغبار.",
    ),
    mk(
      "liver_metabolic",
      "Metabolic system",
      "الجهاز الاستقلابي",
      85 -
        (iv.bmi !== undefined ? Math.max(0, iv.bmi - 25) * 2.2 : iv.sedentaryHours * 1.5) -
        (iv.glucoseMgDl !== undefined ? Math.max(0, iv.glucoseMgDl - 100) * 0.4 : 0) -
        iv.ultraProcessedScore * 0.12,
      [
        `BMI=${iv.bmi ?? "n/a"}`,
        `glucose=${iv.glucoseMgDl ?? "n/a"}`,
        `UPF=${iv.ultraProcessedScore}`,
      ],
      "Walk after meals; cut one ultra-processed lunch this week.",
      "امشِ بعد الوجبات؛ احذف غداءً معالجًا واحدًا هذا الأسبوع.",
    ),
    mk(
      "hormones",
      "Hormonal axis",
      "المحور الهرموني",
      80 +
        (iv.testosteroneNgDl !== undefined
          ? (iv.testosteroneNgDl - 400) * 0.05
          : iv.sleepHours * 2 - iv.occupationalStress * 0.15) -
        iv.nightShiftsPerWeek * 3,
      [
        `T=${iv.testosteroneNgDl ?? "wearable proxy"}`,
        `nights=${iv.nightShiftsPerWeek}`,
      ],
      "Protect sleep + strength training 2x/week before any hormone worry.",
      "احمِ النوم وتمارين القوة مرتين أسبوعيًا قبل أي قلق هرموني.",
    ),
    mk(
      "reproductive",
      "Reproductive vitality",
      "حيوية الجهاز التناسلي",
      82 -
        Math.max(0, iv.heatIndexC - 36) * 1.1 -
        iv.outdoorHeatHours * 2.2 -
        (iv.semenConcentration !== undefined
          ? Math.max(0, 15 - iv.semenConcentration) * 2.5
          : 0) -
        (iv.varicoceleFlag ? 12 : 0) -
        (iv.stiRiskFlag ? 15 : 0),
      [
        `heat=${iv.heatIndexC}`,
        `conc=${iv.semenConcentration ?? "not linked"}`,
        `varicocele=${iv.varicoceleFlag ? "flag" : "no"}`,
      ],
      "Cooling breaks, loose clothing at work, and private device check-in if consented.",
      "استراحات تبريد وملابس مريحة في العمل ومتابعة جهاز خاصة عند الموافقة.",
    ),
    mk(
      "muscles",
      "Muscles & movement",
      "العضلات والحركة",
      70 + iv.activityMinutes * 0.08 - iv.sedentaryHours * 2.5,
      [`activity=${iv.activityMinutes}m`, `sit=${iv.sedentaryHours}h`],
      "Add two 15-minute walks on desk days.",
      "أضف مشيين ١٥ دقيقة في أيام المكتب.",
    ),
    mk(
      "sleep_recovery",
      "Sleep & recovery",
      "النوم والتعافي",
      50 + iv.sleepHours * 6 + iv.sleepRegularity * 0.25 - iv.nightShiftsPerWeek * 4,
      [`sleep=${iv.sleepHours}`, `regularity=${iv.sleepRegularity}`],
      "Same wake time ±30 min even after shifts when possible.",
      "نفس وقت الاستيقاظ ±٣٠ دقيقة حتى بعد الورديات إن أمكن.",
    ),
  ];
}

export function buildActions(
  iv: IndependentVariables,
  regions: BodyRegion[],
): ActionItem[] {
  const actions: ActionItem[] = [];
  const strained = regions.filter((r) => r.status !== "strong");

  for (const r of strained) {
    actions.push({
      id: `region-${r.id}`,
      title: r.label,
      titleAr: r.labelAr,
      why: `Personal body map shows ${r.status} (${r.score}/100).`,
      whyAr: `خريطة الجسم تظهر حالة ${r.status === "watch" ? "مراقبة" : "إجهاد"} (${r.score}/100).`,
      steps: [r.whatToDo, "Log how you feel tonight in companion."],
      stepsAr: [r.whatToDoAr, "سجّل شعورك الليلة في الرفيق."],
      effort: r.id === "reproductive" || r.id === "hormones" ? "clinical" : "easy",
      impact: r.status === "strain" ? "high" : "medium",
      dueLabel: r.status === "strain" ? "Today" : "This week",
      dueLabelAr: r.status === "strain" ? "اليوم" : "هذا الأسبوع",
      bodyRegion: r.id,
    });
  }

  if (iv.nightShiftsPerWeek >= 2) {
    actions.unshift({
      id: "job-shift",
      title: "Negotiate recovery after night blocks",
      titleAr: "فاوض على تعافٍ بعد كتل الليل",
      why: "Job type is heavily pricing circadian debt into your index.",
      whyAr: "نوع العمل يسعّر دين الإيقاع بقوة في مؤشرك.",
      steps: [
        "Ask for two protected sleep mornings after night runs.",
        "Dark-room + eye mask kit ready before next block.",
        "Chat with clinician if fatigue + HRV drop persist 2 weeks.",
      ],
      stepsAr: [
        "اطلب صباحي نوم محميين بعد الليالي.",
        "جهّز غرفة مظلمة وقناع عين قبل الكتلة التالية.",
        "تحدث مع الطبيب إذا استمر التعب وانخفاض HRV أسبوعين.",
      ],
      effort: "moderate",
      impact: "high",
      dueLabel: "This roster",
      dueLabelAr: "هذا الجدول",
      bodyRegion: "sleep_recovery",
    });
  }

  if (iv.heatIndexC >= 40 || iv.outdoorHeatHours >= 3) {
    actions.unshift({
      id: "heat-protocol",
      title: "Activate workplace cooling protocol",
      titleAr: "فعّل بروتوكول تبريد مكان العمل",
      why: "Uncontrollable heat is dragging reproductive & recovery regions.",
      whyAr: "الحرارة غير القابلة للتحكم تسحب مناطق الحيوية والتعافي.",
      steps: [
        "20-minute shade/cool break every 2 outdoor hours.",
        "Electrolyte drink when sweat is heavy.",
        "Avoid laptop-on-lap heat traps at home.",
      ],
      stepsAr: [
        "استراحة ظل/تبريد ٢٠ دقيقة كل ساعتي عمل خارجي.",
        "مشروب أملاح عند التعرق الشديد.",
        "تجنب حرارة الحاسوب على الحضن في المنزل.",
      ],
      effort: "easy",
      impact: "high",
      dueLabel: "Today",
      dueLabelAr: "اليوم",
      bodyRegion: "reproductive",
    });
  }

  return actions.slice(0, 8);
}

export function buildNotifications(
  iv: IndependentVariables,
  index: number,
  regions: BodyRegion[],
): {
  id: string;
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
  level: "info" | "watch" | "urgent";
  time: string;
}[] {
  const notes = [];
  notes.push({
    id: "n-index",
    title: "Vitality index update",
    titleAr: "تحديث مؤشر الحيوية",
    body: `Your personal index is ${index}. Controllable levers can still move this like a portfolio rebalance.`,
    bodyAr: `مؤشرك الشخصي ${index}. الروافع القابلة للتحكم ما زالت قادرة على تحريكه كإعادة موازنة محفظة.`,
    level: index < 55 ? ("urgent" as const) : index < 70 ? ("watch" as const) : ("info" as const),
    time: "Just now",
  });

  if (iv.hrvTrend <= -10) {
    notes.push({
      id: "n-hrv",
      title: "Watch alert · HRV down",
      titleAr: "تنبيه الساعة · انخفاض HRV",
      body: "Live wearable shows recovery debt. Suggestion: lighter load today + earlier wind-down.",
      bodyAr: "الجهاز القابل للارتداء يُظهر دين تعافٍ. اقترح: حمل أخف اليوم وتهدئة أبكر.",
      level: "watch" as const,
      time: "12 min ago",
    });
  }

  if (iv.heatIndexC >= 40) {
    notes.push({
      id: "n-heat",
      title: "Environment · heatwave priced in",
      titleAr: "البيئة · موجة حر مسعّرة",
      body: "Uncontrollable heat is cutting today’s index. Open cooling actions.",
      bodyAr: "الحرارة غير القابلة للتحكم تخفض مؤشر اليوم. افتح إجراءات التبريد.",
      level: "watch" as const,
      time: "1 h ago",
    });
  }

  const strained = regions.find((r) => r.status === "strain");
  if (strained) {
    notes.push({
      id: "n-body",
      title: `${strained.label} needs attention`,
      titleAr: `${strained.labelAr} يحتاج انتباهًا`,
      body: strained.whatToDo,
      bodyAr: strained.whatToDoAr,
      level: "urgent" as const,
      time: "Today",
    });
  }

  notes.push({
    id: "n-doc",
    title: "Doctor chat available",
    titleAr: "محادثة الطبيب متاحة",
    body: "Ask about workplace impact or what your body map means — screening guidance only.",
    bodyAr: "اسأل عن أثر العمل أو معنى خريطة جسمك — إرشاد فحص فقط.",
    level: "info" as const,
    time: "Earlier",
  });

  return notes;
}

/**
 * Hard safety replies. These run before any model is called, never depend on the network,
 * and cannot be changed by a model: crisis, sudden testicular pain, medicine changes,
 * and "is this a fertility diagnosis". Returns null for every other message.
 */
export function safetyReply(
  message: string,
  iv: IndependentVariables,
  locale: Locale,
): string | null {
  const lower = message.toLowerCase();
  const ar = locale === "ar";

  // Safety-first: self-harm / crisis
  if (
    /suicid|kill myself|end my life|self[- ]?harm|hurt myself|انتحار|أؤذي نفسي|اقتل نفسي/.test(
      lower,
    )
  ) {
    return ar
      ? `إذا كنت في خطر أو تفكر بإيذاء نفسك، اطلب مساعدة عاجلة الآن — اتصل بالطوارئ المحلية أو خط أزمة موثوق في منطقتك. SeedShield عرض فحص فقط ولا يقدّم رعاية أزمات.`
      : `If you are in danger or thinking about harming yourself, get urgent help now — call local emergency services or a trusted crisis line in your area. SeedShield is a screening demo only and cannot provide crisis care.`;
  }

  // Red flag: sudden testicular pain → urgent care
  if (
    /sudden.*(testic|scrot|ball)|testic.*pain|خصي.*(ألم|فج)|ألم.*(خصي|فجائي)|torsion/.test(
      lower,
    ) ||
    iv.acuteTesticularPainFlag
  ) {
    return ar
      ? `ألم خصوي مفاجئ علامة حمراء. لا تنتظر التطبيق — اطلب رعاية عاجلة الآن (طوارئ/عيادة عاجلة). SeedShield فحص فقط ولا يستبعد التواء الخصية.`
      : `Sudden testicular pain is a red flag. Do not wait on the app — seek urgent care now (ER / urgent clinic). SeedShield is screening only and cannot rule out torsion.`;
  }

  // Never advise stopping / starting medication
  if (
    /stop (my |the )?(med|drug|trt|testosterone|pill)|start (trt|testosterone)|أوقف.*(دواء|تستو)|ابدأ.*(تستو|trt)|quit my med/i.test(
      lower,
    )
  ) {
    return ar
      ? `لا أنصح ببدء أو إيقاف أو تغيير أي دواء (بما في ذلك التستوستيرون). ناقش الأدوية مع طبيب مرخّص فقط. SeedShield لا يصف ولا يعدّل العلاج.`
      : `I never advise starting, stopping, or changing any medicine (including testosterone). Discuss medicines only with a licensed clinician. SeedShield does not prescribe or adjust treatment.`;
  }

  // Fertility diagnosis question
  if (
    /fertil.*diagnos|diagnos.*fertil|is this about fertility diagnosis|هل هذا تشخيص خصوب/i.test(
      lower,
    )
  ) {
    return ar
      ? `لا — هذا ليس تشخيص خصوبة. SeedShield فحص أولي فقط (فحص ≠ تشخيص). أي مسار تخصصي يحتاج مراجعة بشرية أولًا.`
      : `No — this is not a fertility diagnosis. SeedShield is an early check only (screening ≠ diagnosis). Any specialty path needs a human clinician first.`;
  }

  return null;
}

export function doctorReply(
  message: string,
  iv: IndependentVariables,
  index: number,
  locale: Locale,
): string {
  const lower = message.toLowerCase();
  const ar = locale === "ar";

  const safe = safetyReply(message, iv, locale);
  if (safe) return safe;

  if (/job|work|shift|مكتب|ورد|عمل/.test(lower)) {
    return ar
      ? `من ملفك، نمط العمل قد يرتبط بإجهاد وتعافٍ. الورديات والجلوس والحرارة عوامل شبه قابلة للتحكم: فترات راحة وتعافٍ. إن استمر الإجهاد أسبوعين، راجع طبيبًا — لا تشخيص هنا.`
      : `From your file, work patterns can be associated with stress and recovery load. Shifts, sitting, and heat are semi-controllable: breaks and recovery. If strain persists 2 weeks, see a clinician — no diagnosis here.`;
  }
  if (/heat|حر|aqi|هواء|dust|غبار/.test(lower)) {
    return ar
      ? `اليوم مؤشر الحرارة ${iv.heatIndexC}° ومؤشر الهواء ${iv.aqi} (بموافقتك). الحرارة عامل معروف في أدبيات الصحة الإنجابية كإشارة فحص — قلّل الذروة الخارجية إن أمكن.`
      : `Today heat index ${iv.heatIndexC}°C and AQI ${iv.aqi} (with your consent). Heat is a recognized screening-relevant factor in reproductive-health literature — reduce peak outdoor exposure when you can.`;
  }
  if (/sleep|نوم|hrv|تعاف/.test(lower)) {
    return ar
      ? `النوم (${iv.sleepHours}س) واتجاه HRV (${iv.hrvTrend}) من أقوى الروافع القابلة للتحكم. ثبّت موعد نوم، وخفّف الكافيين بعد الظهر.`
      : `Sleep (${iv.sleepHours}h) and HRV trend (${iv.hrvTrend}) are among your strongest controllable levers. Fix a sleep anchor and cut afternoon caffeine.`;
  }
  if (/fertil|خصوب|semen|منوي|testoster|هرمون/.test(lower)) {
    return ar
      ? `نتكلم عن فحص حيوية خاص — وليس تشخيص عقم، وليس واجب إنجاب. إشارات الجهاز التناسلي/الهرمونات إن وُجدت توجّه لمراجعة بشرية. SeedShield لا يصدر تشخيصًا.`
      : `We discuss private vitality screening — never an infertility diagnosis, never a duty to have children. Reproductive/hormone cues route to human review. SeedShield does not diagnose.`;
  }
  if (/stress|قلق|نفس|psycho|anxiety|money|مال|peace|سلام/.test(lower)) {
    return ar
      ? `من ملفك: إجهاد العمل ${iv.occupationalStress}، ضغط المال ${iv.moneyStress}. تهدئة قصيرة اليوم؛ مراجعة بشرية إن استمر أسبوعين.`
      : `From your file: work stress ${iv.occupationalStress}, money stress ${iv.moneyStress}. A short reset today; human review if it sticks 2 weeks.`;
  }
  if (/sdf|dna|varicocele|دوالي|trt|steroid|genetic|التهاب|meds|دواء|bmi|وزن/.test(lower)) {
    return ar
      ? `أتحدث فقط عما في ملفك بموافقتك. إن وُجد علم شخصي فالمسار: مراجعة بشرية — SeedShield لا يشخص ولا يغيّر دواءك.`
      : `I only discuss what’s on YOUR consented file. If a personal flag exists, path is human review — SeedShield does not diagnose or change medicines.`;
  }

  return ar
    ? `اسأل عن ملفك: العمل، الحرارة، النوم، الجسم — خطوات عملية. فحص ≠ تشخيص. الدرجة التوضيحية ${index} ليست إثباتًا طبيًا.`
    : `Ask about YOUR file: work, heat, sleep, body — practical steps. Screening ≠ diagnosis. Demo guide score ${index} is not medical proof.`;
}

/** Infer work pattern from live streams — no manual pick. */
export function inferJobType(iv: IndependentVariables): JobTypeId {
  const night = iv.nightShiftsPerWeek ?? 0;
  const heatHrs = iv.outdoorHeatHours ?? 0;
  const sedentary = iv.sedentaryHours ?? 0;
  const stress = Math.max(iv.occupationalStress ?? 0, iv.businessStress ?? 0);
  const caffeine = iv.caffeineMg ?? 0;
  const activity = iv.activityMinutes ?? 0;
  const psycho = iv.socialPressureIndex ?? 0;
  const aqi = iv.aqi ?? 0;

  const scores: Record<JobTypeId, number> = {
    outdoor_construction:
      heatHrs * 12 + (iv.heatIndexC ?? 0) * 0.4 + (iv.uvIndex ?? 0) * 3 + (aqi > 100 ? 15 : 0),
    warehouse_shift:
      (iv.shiftWork ? 40 : 0) + night * 18 + heatHrs * 4 + (activity > 120 ? 10 : 0),
    healthcare_shift:
      (iv.shiftWork ? 25 : 0) + night * 12 + stress * 0.35 + psycho * 0.2 + (iv.hrvTrend < -10 ? 12 : 0),
    executive_high_stress:
      stress * 0.55 + caffeine * 0.08 + sedentary * 2 + (iv.hrvTrend < -12 ? 15 : 0) + (iv.sleepHours < 6 ? 10 : 0),
    driver_gig:
      sedentary * 4 + (aqi > 90 ? 20 : 0) + (iv.ultraProcessedScore ?? 0) * 0.2 + (activity < 90 ? 8 : 0),
    desk_knowledge:
      sedentary * 3.5 + (activity < 80 ? 15 : 0) + (!iv.shiftWork && heatHrs < 1.5 ? 20 : 0),
  };

  let best: JobTypeId = "desk_knowledge";
  let bestScore = -Infinity;
  for (const [id, score] of Object.entries(scores) as [JobTypeId, number][]) {
    if (score > bestScore) {
      bestScore = score;
      best = id;
    }
  }
  return best;
}

export function getJob(id: JobTypeId) {
  return JOB_TYPES.find((j) => j.id === id) ?? JOB_TYPES[0];
}
