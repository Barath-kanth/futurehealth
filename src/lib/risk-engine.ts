import { applyConsents } from "./consent-filter";
import type {
  AdaptiveModule,
  ConsentCategory,
  IndependentVariables,
  RiskAssessment,
  RiskSignal,
  TriageRecommendation,
  TriageTier,
} from "./types";

const DISCLAIMER =
  "Screening signals only — not a diagnosis. Specialist referral requires human clinical review. SeedShield never issues a diagnosis.";

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function pushSignal(
  signals: RiskSignal[],
  signal: Omit<RiskSignal, "screeningOnly"> & { screeningOnly?: true },
) {
  signals.push({ ...signal, screeningOnly: true });
}

/** Core adaptive risk engine: IVs → explainable signals + UI modules + triage. */
export function evaluateRisk(
  iv: IndependentVariables,
  consents?: Record<ConsentCategory, boolean>,
): RiskAssessment {
  const gated = consents ? applyConsents(iv, consents) : iv;
  return evaluateRiskUngated(gated);
}

/** Internal evaluation after consent filtering (or raw IVs in tests). */
function evaluateRiskUngated(iv: IndependentVariables): RiskAssessment {
  const signals: RiskSignal[] = [];

  // --- Environmental ---
  if (iv.heatIndexC >= 38 || iv.outdoorHeatHours >= 3) {
    pushSignal(signals, {
      id: "heat-spermatogenesis-stress",
      title: "Heat exposure load",
      titleAr: "حمل التعرض للحرارة",
      domain: "environmental",
      severity: iv.heatIndexC >= 42 || iv.outdoorHeatHours >= 5 ? "elevated" : "watch",
      confidence: "high",
      source: "environment",
      explanation:
        "Elevated ambient heat and outdoor hours can stress thermoregulation relevant to vitality. This is a screening cue for cooling, hydration, and schedule adjustment — not a clinical diagnosis.",
      explanationAr:
        "ارتفاع الحرارة وساعات العمل في الخارج قد يضغط على تنظيم حرارة الجسم المرتبط بالحيوية. إشارة فحص للتبريد والترطيب وتعديل الجدول — وليست تشخيصًا.",
      drivers: [
        `heatIndex=${iv.heatIndexC}°C`,
        `outdoorHeatHours=${iv.outdoorHeatHours}`,
      ],
      modifiable: true,
      weight: iv.heatIndexC >= 42 ? 18 : 12,
    });
  }

  if (iv.aqi >= 100) {
    pushSignal(signals, {
      id: "air-quality-oxidative",
      title: "Air quality oxidative load",
      titleAr: "حمل الأكسدة من جودة الهواء",
      domain: "environmental",
      severity: iv.aqi >= 150 ? "elevated" : "watch",
      confidence: "medium",
      source: "environment",
      explanation:
        "Sustained poor air quality is linked in literature to oxidative stress pathways. Screening suggests reducing peak outdoor exposure and tracking recovery markers.",
      explanationAr:
        "سوء جودة الهواء المستمر يرتبط بمسارات الإجهاد التأكسدي. يُقترح تقليل التعرض في الذروة ومتابعة مؤشرات التعافي.",
      drivers: [`aqi=${iv.aqi}`, `uv=${iv.uvIndex}`],
      modifiable: true,
      weight: iv.aqi >= 150 ? 14 : 8,
    });
  }

  // --- Occupational ---
  if (iv.shiftWork || iv.nightShiftsPerWeek >= 2) {
    pushSignal(signals, {
      id: "circadian-disruption",
      title: "Circadian disruption pattern",
      titleAr: "نمط اضطراب الإيقاع اليومي",
      domain: "occupational",
      severity: iv.nightShiftsPerWeek >= 3 ? "elevated" : "watch",
      confidence: "high",
      source: "work_context",
      explanation:
        "Shift and night work often degrade sleep regularity and recovery capacity. Adaptive companion surfaces recovery protocols and primary-care escalation if persistent.",
      explanationAr:
        "العمل بنظام الورديات والليل غالبًا ما يضعف انتظام النوم وقدرة التعافي. يفعّل الرفيق بروتوكولات التعافي وتصعيد الرعاية الأولية عند الاستمرار.",
      drivers: [
        `shiftWork=${iv.shiftWork}`,
        `nightShifts=${iv.nightShiftsPerWeek}`,
        `sleepRegularity=${iv.sleepRegularity}`,
      ],
      modifiable: true,
      weight: 14 + iv.nightShiftsPerWeek * 2,
    });
  }

  if (iv.sedentaryHours >= 9 || iv.activityMinutes < 90) {
    pushSignal(signals, {
      id: "sedentary-metabolic",
      title: "Sedentary metabolic watch",
      titleAr: "مراقبة التمثيل الغذائي لقلة الحركة",
      domain: "metabolic",
      severity: iv.sedentaryHours >= 11 ? "elevated" : "watch",
      confidence: "medium",
      source: "wearable",
      explanation:
        "High sedentary time with low activity is a modifiable metabolic signal. Companion prioritizes movement micro-breaks and metabolic panel navigation.",
      explanationAr:
        "كثرة الجلوس وقلة النشاط إشارة استقلابية قابلة للتعديل. يُعطى الأولوية لاستراحات الحركة وتوجيه فحوصات التمثيل الغذائي.",
      drivers: [
        `sedentaryHours=${iv.sedentaryHours}`,
        `activityMinutes=${iv.activityMinutes}`,
      ],
      modifiable: true,
      weight: 10,
    });
  }

  if (iv.occupationalStress >= 70) {
    pushSignal(signals, {
      id: "occupational-stress",
      title: "Occupational stress load",
      titleAr: "حمل الإجهاد المهني",
      domain: "lifestyle",
      severity: iv.occupationalStress >= 85 ? "elevated" : "watch",
      confidence: "medium",
      source: "work_context",
      explanation:
        "High sustained work stress correlates with autonomic and recovery strain (HRV/sleep). Screening only — routes to self-care or primary care as needed.",
      explanationAr:
        "الإجهاد المهني المستمر يرتبط بإجهاد الجهاز العصبي الذاتي والتعافي. فحص فقط — يوجّه للرعاية الذاتية أو الأولية حسب الحاجة.",
      drivers: [`stress=${iv.occupationalStress}`, `hrvTrend=${iv.hrvTrend}`],
      modifiable: true,
      weight: 9,
    });
  }

  // --- Nutrition / fasting ---
  if (iv.hydrationLiters < 2.2 || (iv.heatIndexC >= 36 && iv.hydrationLiters < 3)) {
    pushSignal(signals, {
      id: "hydration-deficit",
      title: "Hydration gap under load",
      titleAr: "فجوة الترطيب تحت الحمل",
      domain: "lifestyle",
      severity: "watch",
      confidence: "high",
      source: "nutrition",
      explanation:
        "Hydration relative to heat and activity appears below protective range. Adaptive UI elevates hydration coaching without any fertility framing.",
      explanationAr:
        "الترطيب مقارنة بالحرارة والنشاط يبدو دون النطاق الواقي. تُفعَّل إرشادات الترطيب دون أي تأطير للخصوبة.",
      drivers: [
        `hydration=${iv.hydrationLiters}L`,
        `heatIndex=${iv.heatIndexC}`,
      ],
      modifiable: true,
      weight: 8,
    });
  }

  if (iv.ultraProcessedScore >= 65) {
    pushSignal(signals, {
      id: "nutrition-quality",
      title: "Nutrition quality signal",
      titleAr: "إشارة جودة التغذية",
      domain: "lifestyle",
      severity: "watch",
      confidence: "low",
      source: "nutrition",
      explanation:
        "Diet pattern leans ultra-processed. Low-confidence self/context signal — companion offers food-environment nudges and optional clinician discussion.",
      explanationAr:
        "نمط الغذاء يميل للمعالج بإفراط. ثقة منخفضة — يقدّم الرفيق تنبيهات بيئة الطعام ومناقشة اختيارية مع الطبيب.",
      drivers: [`ultraProcessed=${iv.ultraProcessedScore}`, `caffeine=${iv.caffeineMg}`],
      modifiable: true,
      weight: 6,
    });
  }

  if (iv.fastingWindow) {
    pushSignal(signals, {
      id: "fasting-timing-adapt",
      title: "Fasting-window adaptation active",
      titleAr: "تكيّف نافذة الصيام مفعّل",
      domain: "lifestyle",
      severity: "info",
      confidence: "high",
      source: "nutrition",
      explanation:
        "Fasting window detected. Companion retimes hydration, sleep, and recovery prompts to respect religious practice — zero assumptions about family timing.",
      explanationAr:
        "تم رصد نافذة صيام. يُعاد توقيت تنبيهات الترطيب والنوم والتعافي احترامًا للممارسة الدينية — بلا افتراضات عن توقيت الأسرة.",
      drivers: ["fastingWindow=true"],
      modifiable: true,
      weight: 2,
    });
  }

  // --- Wearable recovery ---
  if (iv.sleepHours < 6 || iv.sleepRegularity < 55) {
    pushSignal(signals, {
      id: "sleep-recovery",
      title: "Sleep recovery shortfall",
      titleAr: "قصور تعافي النوم",
      domain: "recovery",
      severity: iv.sleepHours < 5 ? "elevated" : "watch",
      confidence: "high",
      source: "wearable",
      explanation:
        "Passive sleep metrics show insufficient duration or irregularity. Primary trusted input — not self-report.",
      explanationAr:
        "مقاييس النوم السلبية تُظهر قصور المدة أو الانتظام. مدخل موثوق أساسي — وليس تقريرًا ذاتيًا.",
      drivers: [
        `sleepHours=${iv.sleepHours}`,
        `regularity=${iv.sleepRegularity}`,
      ],
      modifiable: true,
      weight: 12,
    });
  }

  if (iv.hrvTrend <= -8 || iv.restingHr >= 82) {
    pushSignal(signals, {
      id: "autonomic-strain",
      title: "Autonomic strain trend",
      titleAr: "اتجاه إجهاد الجهاز الذاتي",
      domain: "recovery",
      severity: iv.hrvTrend <= -15 ? "elevated" : "watch",
      confidence: "medium",
      source: "wearable",
      explanation:
        "HRV decline and/or elevated resting heart rate suggest recovery debt. Screening cue for load management.",
      explanationAr:
        "انخفاض تقلب معدل القلب و/أو ارتفاع النبض أثناء الراحة يشيران إلى دين تعافٍ. إشارة فحص لإدارة الحمل.",
      drivers: [`hrvTrend=${iv.hrvTrend}`, `restingHr=${iv.restingHr}`],
      modifiable: true,
      weight: 11,
    });
  }

  if (Math.abs(iv.bodyTempAnomaly) >= 0.4) {
    pushSignal(signals, {
      id: "thermal-anomaly",
      title: "Body temperature trend anomaly",
      titleAr: "شذوذ اتجاه حرارة الجسم",
      domain: "recovery",
      severity: Math.abs(iv.bodyTempAnomaly) >= 0.7 ? "elevated" : "watch",
      confidence: "medium",
      source: "wearable",
      explanation:
        "Wearable temperature trend anomaly may reflect illness, heat load, or recovery stress. Escalate if accompanied by red flags.",
      explanationAr:
        "شذوذ اتجاه الحرارة من الجهاز القابل للارتداء قد يعكس مرضًا أو حمل حرارة أو إجهاد تعافٍ. يُصعَّد عند وجود علامات حمراء.",
      drivers: [`tempAnomaly=${iv.bodyTempAnomaly}°C`],
      modifiable: true,
      weight: 9,
    });
  }

  // --- Metabolic / labs (when consented) ---
  if (iv.bmi !== undefined && iv.bmi >= 30) {
    pushSignal(signals, {
      id: "metabolic-bmi",
      title: "Metabolic body-composition watch",
      titleAr: "مراقبة تكوين الجسم الاستقلابي",
      domain: "metabolic",
      severity: iv.bmi >= 35 ? "elevated" : "watch",
      confidence: "high",
      source: "clinical_lab",
      explanation:
        "Elevated BMI is a modifiable metabolic screening factor with relevance to vitality pathways. Not a diagnosis.",
      explanationAr:
        "ارتفاع مؤشر كتلة الجسم عامل فحص استقلابي قابل للتعديل وذو صلة بمسارات الحيوية. ليس تشخيصًا.",
      drivers: [`bmi=${iv.bmi}`],
      modifiable: true,
      weight: 12,
    });
  }

  if (iv.glucoseMgDl !== undefined && iv.glucoseMgDl >= 110) {
    pushSignal(signals, {
      id: "glucose-watch",
      title: "Glucose screening watch",
      titleAr: "مراقبة فحص الجلوكوز",
      domain: "metabolic",
      severity: iv.glucoseMgDl >= 126 ? "elevated" : "watch",
      confidence: "high",
      source: "clinical_lab",
      explanation:
        "Category-level lab pull indicates glucose above preferred screening range. Primary care pathway suggested; human review before specialty referral.",
      explanationAr:
        "سحب مخبري على مستوى الفئة يشير إلى جلوكوز أعلى من نطاق الفحص المفضل. يُقترح مسار الرعاية الأولية مع مراجعة بشرية قبل الإحالة التخصصية.",
      drivers: [`glucose=${iv.glucoseMgDl}`],
      modifiable: true,
      weight: 13,
    });
  }

  if (iv.testosteroneNgDl !== undefined && iv.testosteroneNgDl < 300) {
    pushSignal(signals, {
      id: "hormone-screen",
      title: "Hormone panel screening cue",
      titleAr: "إشارة فحص لوحة الهرمونات",
      domain: "metabolic",
      severity: "elevated",
      confidence: "high",
      source: "clinical_lab",
      explanation:
        "At-home / lab hormone value is below common screening thresholds. Routes to andrology/urology after human clinical review — screening cue only.",
      explanationAr:
        "قيمة الهرمون من الجهاز المنزلي/المختبر دون عتبات الفحص الشائعة. يُوجَّه لأندروولوجيا/مسالك بعد مراجعة سريرية بشرية — دون تشخيص آلي.",
      drivers: [`testosterone=${iv.testosteroneNgDl}`],
      modifiable: true,
      weight: 16,
    });
  }

  // --- Semen parameters (device) ---
  if (
    iv.semenConcentration !== undefined &&
    (iv.semenConcentration < 15 ||
      (iv.motilityPct !== undefined && iv.motilityPct < 40) ||
      (iv.morphologyPct !== undefined && iv.morphologyPct < 4))
  ) {
    pushSignal(signals, {
      id: "semen-parameter-screen",
      title: "Semen parameter screening cue",
      titleAr: "إشارة فحص معاملات السائل المنوي",
      domain: "semen",
      severity: "elevated",
      confidence: "high",
      source: "at_home_device",
      explanation:
        "At-home device auto-upload (simulated in prototype) shows parameters outside common WHO-aligned screening ranges. This is NOT a diagnosis. Human review required before fertility-service routing.",
      explanationAr:
        "رفع تلقائي من جهاز منزلي معتمد يُظهر معاملات خارج نطاقات الفحص الشائعة المتوافقة مع منظمة الصحة. هذا ليس تشخيصًا. المراجعة البشرية مطلوبة قبل توجيه خدمات الخصوبة.",
      drivers: [
        `conc=${iv.semenConcentration}`,
        `motility=${iv.motilityPct ?? "n/a"}`,
        `morph=${iv.morphologyPct ?? "n/a"}`,
      ],
      modifiable: true,
      weight: 20,
    });
  }

  if (iv.acuteTesticularPainFlag) {
    pushSignal(signals, {
      id: "acute-testicular-pain",
      title: "Sudden testicular pain (urgent)",
      titleAr: "ألم خصوي مفاجئ (عاجل)",
      domain: "anatomical",
      severity: "urgent",
      confidence: "high",
      source: "self_report",
      explanation:
        "PLACEHOLDER intake cue. Sudden testicular pain can be torsion or other emergency. App cannot diagnose — seek urgent care now.",
      explanationAr:
        "إشارة استقبال مؤقتة. الألم الخصوي المفاجئ قد يكون التواءً أو طارئًا آخر. التطبيق لا يشخص — اطلب رعاية عاجلة الآن.",
      drivers: ["acuteTesticularPainFlag=true"],
      modifiable: false,
      weight: 40,
    });
  }

  if (iv.stiRiskFlag) {
    pushSignal(signals, {
      id: "infectious-screen",
      title: "Infectious risk screening flag (placeholder)",
      titleAr: "علم فحص المخاطر المعدية (عنصر نائب)",
      domain: "infectious",
      severity: "elevated",
      confidence: "medium",
      source: "clinical_lab",
      explanation:
        "PLACEHOLDER consented category signal — suggests infectious workup may be appropriate after clinician review. Not a diagnosis.",
      explanationAr:
        "إشارة فئة بموافقة (عنصر نائب) — قد تشير إلى تقييم معدٍ بعد مراجعة الطبيب. ليس تشخيصًا.",
      drivers: ["stiRiskFlag=true"],
      modifiable: true,
      weight: 15,
    });
  }

  if (iv.infectiousHistoryFlag) {
    pushSignal(signals, {
      id: "infectious-history",
      title: "Infectious history (consented)",
      titleAr: "تاريخ معدٍ (بموافقة)",
      domain: "infectious",
      severity: "watch",
      confidence: "medium",
      source: "self_report",
      explanation:
        "You recorded prior infection context on your vault. Screening cue only — clinician decides any testing.",
      explanationAr:
        "سجّلت سياق إصابة سابقة في خزنتك. إشارة فحص فقط — الطبيب يقرر أي فحوص.",
      drivers: ["infectiousHistoryFlag=true"],
      modifiable: false,
      weight: 11,
    });
  }

  if (iv.orchitisMumpsFlag) {
    pushSignal(signals, {
      id: "anatomical-orchitis",
      title: "Orchitis / mumps history cue",
      titleAr: "إشارة تاريخ التهاب خصية / نكاف",
      domain: "anatomical",
      severity: "elevated",
      confidence: "medium",
      source: "self_report",
      explanation:
        "Historical anatomical risk on file. Human review — not an app diagnosis of infertility.",
      explanationAr:
        "خطر تشريحي تاريخي في الملف. مراجعة بشرية — ليس تشخيص عقم من التطبيق.",
      drivers: ["orchitisMumpsFlag=true"],
      modifiable: false,
      weight: 13,
    });
  }

  if (iv.cryptorchidismFlag) {
    pushSignal(signals, {
      id: "anatomical-cryptorchidism",
      title: "Cryptorchidism history cue",
      titleAr: "إشارة تاريخ خصية غير نازلة",
      domain: "anatomical",
      severity: "elevated",
      confidence: "high",
      source: "clinical_lab",
      explanation:
        "Undescended testis history is a known reproductive screening factor. Specialty path after clinician review.",
      explanationAr:
        "تاريخ الخصية غير النازلة عامل فحص تناسلي معروف. مسار تخصصي بعد مراجعة الطبيب.",
      drivers: ["cryptorchidismFlag=true"],
      modifiable: false,
      weight: 14,
    });
  }

  if (iv.testicularTraumaFlag) {
    pushSignal(signals, {
      id: "anatomical-trauma",
      title: "Testicular trauma history cue",
      titleAr: "إشارة تاريخ رضّ خصوي",
      domain: "anatomical",
      severity: "watch",
      confidence: "medium",
      source: "self_report",
      explanation:
        "Trauma history on vault — screening context for andrology if other cues appear.",
      explanationAr:
        "تاريخ رضّ في الخزنة — سياق فحص للأندروولوجيا إن ظهرت إشارات أخرى.",
      drivers: ["testicularTraumaFlag=true"],
      modifiable: false,
      weight: 10,
    });
  }

  if (iv.genomicMarkerAvailable) {
    pushSignal(signals, {
      id: "genomic-readiness",
      title: "PLACEHOLDER · consented genomic markers",
      titleAr: "عنصر نائب · علامات جينومية بموافقة",
      domain: "anatomical",
      severity: "info",
      confidence: "low",
      source: "clinical_lab",
      explanation:
        "PLACEHOLDER integration point for Abu Dhabi genomic-enabled care — not real sequenced data in this prototype. Specialist interpretation required.",
      explanationAr:
        "نقطة تكامل نائبة للرعاية الجينومية في أبوظبي — ليست بيانات تسلسل حقيقية في هذا النموذج. تفسير أخصائي مطلوب.",
      drivers: ["genomicMarkerAvailable=true"],
      modifiable: false,
      weight: 8,
    });
  } else if (iv.genomicConsentPending) {
    pushSignal(signals, {
      id: "genomic-consent-pending",
      title: "PLACEHOLDER · genomic consent pending",
      titleAr: "عنصر نائب · موافقة جينومية معلّقة",
      domain: "anatomical",
      severity: "info",
      confidence: "low",
      source: "clinical_lab",
      explanation:
        "PLACEHOLDER only. Nothing genomic is stored or shared until a future consented pathway exists.",
      explanationAr:
        "عنصر نائب فقط. لا يُخزَّن أو يُشارك شيء جينومي حتى يوجد مسار موافقة مستقبلي.",
      drivers: ["genomicConsentPending=true"],
      modifiable: true,
      weight: 2,
    });
  }

  if (iv.varicoceleFlag) {
    pushSignal(signals, {
      id: "anatomical-screen",
      title: "Anatomical screening cue",
      titleAr: "إشارة فحص تشريحية",
      domain: "anatomical",
      severity: "elevated",
      confidence: "medium",
      source: "clinical_lab",
      explanation:
        "On your clinical vault: varicocele screening flag (often silent). Confirm with human clinician — not an app diagnosis.",
      explanationAr:
        "في خزنتك السريرية: علم فحص دوالي (غالبًا صامت). أكّد مع طبيب بشري — ليس تشخيص تطبيق.",
      drivers: ["varicoceleFlag=true"],
      modifiable: false,
      weight: 14,
    });
  }

  if (iv.sdfPct !== undefined && iv.sdfPct >= 25) {
    pushSignal(signals, {
      id: "sdf-screen",
      title: "Sperm DNA fragmentation cue",
      titleAr: "إشارة تفكك الحمض النووي للحيوان المنوي",
      domain: "semen",
      severity: "elevated",
      confidence: "high",
      source: "at_home_device",
      explanation:
        "Your device file shows elevated SDF. Count/movement alone can miss this — human review required.",
      explanationAr:
        "ملف جهازك يُظهر SDF مرتفعًا. العدّ/الحركة وحدهما قد يفوتان هذا — مراجعة بشرية مطلوبة.",
      drivers: [`sdf=${iv.sdfPct}%`],
      modifiable: true,
      weight: 18,
    });
  }

  if (iv.exogenousAndrogenFlag) {
    pushSignal(signals, {
      id: "androgen-meds",
      title: "Exogenous androgen / TRT context",
      titleAr: "سياق أندروجين خارجي / TRT",
      domain: "metabolic",
      severity: "elevated",
      confidence: "high",
      source: "pharmacy_meds",
      explanation:
        "Pharmacy stream flagged TRT/exogenous androgens (can suppress sperm). SeedShield never advises starting or stopping any medication — discuss only with your clinician.",
      explanationAr:
        "تيار الصيدلية علّم TRT/أندروجينات خارجية (قد تثبّط الحيوانات المنوية). SeedShield لا ينصح ببدء أو إيقاف أي دواء — ناقش مع طبيبك فقط.",
      drivers: ["exogenousAndrogenFlag=true"],
      modifiable: true,
      weight: 17,
    });
  }

  if (iv.geneticRiskFlag) {
    pushSignal(signals, {
      id: "genetic-screen",
      title: "Genetic screening cue",
      titleAr: "إشارة فحص جيني",
      domain: "anatomical",
      severity: "elevated",
      confidence: "low",
      source: "clinical_lab",
      explanation:
        "Vault category flag only — chromosomal issues need specialist interpretation.",
      explanationAr:
        "علم فئة في الخزنة فقط — المسائل الكروموسومية تحتاج تفسير أخصائي.",
      drivers: ["geneticRiskFlag=true"],
      modifiable: false,
      weight: 16,
    });
  }

  if (iv.subclinicalInflammationFlag) {
    pushSignal(signals, {
      id: "inflam-screen",
      title: "Subclinical inflammation cue",
      titleAr: "إشارة التهاب تحت سريري",
      domain: "infectious",
      severity: "elevated",
      confidence: "medium",
      source: "clinical_lab",
      explanation:
        "Silent inflammation context on your vault — private clinical follow-up.",
      explanationAr:
        "سياق التهاب صامت في خزنتك — متابعة سريرية خاصة.",
      drivers: ["subclinicalInflammationFlag=true"],
      modifiable: true,
      weight: 12,
    });
  }

  if (iv.medsFertilityImpact) {
    pushSignal(signals, {
      id: "meds-impact",
      title: "Everyday medication context",
      titleAr: "سياق أدوية يومية",
      domain: "lifestyle",
      severity: "watch",
      confidence: "medium",
      source: "pharmacy_meds",
      explanation:
        "Your meds list may affect motility/ejaculation — discuss with prescriber, don’t stop solo.",
      explanationAr:
        "قائمة أدويتك قد تؤثر على الحركة/القذف — ناقش مع الواصف ولا توقف وحدك.",
      drivers: ["medsFertilityImpact=true"],
      modifiable: true,
      weight: 8,
    });
  }

  // Social privacy pressure — affects modules, not medicalization
  if (iv.socialPressureIndex >= 60) {
    pushSignal(signals, {
      id: "privacy-sensitivity",
      title: "High privacy-sensitivity context",
      titleAr: "سياق حساسية خصوصية مرتفع",
      domain: "lifestyle",
      severity: "info",
      confidence: "medium",
      source: "social_context",
      explanation:
        "Elevated social/privacy pressure detected. UI tightens vault defaults, softens language, and disables family sharing unless explicitly opted in.",
      explanationAr:
        "رُصد ضغط اجتماعي/خصوصية مرتفع. تُشدَّد إعدادات الخزنة، وتُلطَّف اللغة، ويُعطَّل مشاركة العائلة ما لم يُفعَّل صراحة.",
      drivers: [`socialPressure=${iv.socialPressureIndex}`],
      modifiable: false,
      weight: 1,
    });
  }

  const overallScore = clamp(
    signals.reduce((sum, s) => sum + s.weight, 0),
  );

  const modules = buildAdaptiveModules(iv, signals);
  const triage = buildTriage(signals, iv);

  return {
    overallScore,
    signals: signals.sort((a, b) => b.weight - a.weight),
    modules,
    triage,
    fairnessTags: deriveFairnessTags(iv),
    generatedAt: new Date().toISOString(),
    disclaimer: DISCLAIMER,
  };
}

function buildAdaptiveModules(
  iv: IndependentVariables,
  signals: RiskSignal[],
): AdaptiveModule[] {
  const modules: AdaptiveModule[] = [];

  if (iv.heatIndexC >= 36 || signals.some((s) => s.id === "heat-spermatogenesis-stress")) {
    modules.push({
      id: "mod-heat",
      title: "Heat & hydration stewardship",
      titleAr: "رعاية الحرارة والترطيب",
      reason: "Ambient heat and outdoor hours elevated — companion retargets daily protocol.",
      reasonAr: "ارتفاع الحرارة وساعات الخارج — يُعاد توجيه البروتوكول اليومي.",
      priority: 95,
      kind: "hydration_heat",
      cta: "Open cooling protocol",
      ctaAr: "افتح بروتوكول التبريد",
    });
  }

  if (iv.shiftWork || iv.nightShiftsPerWeek >= 2) {
    modules.push({
      id: "mod-shift",
      title: "Shift-work recovery mode",
      titleAr: "وضع تعافي ورديات العمل",
      reason: "Work pattern changed the recovery stack and sleep coaching cadence.",
      reasonAr: "نمط العمل غيّر حزمة التعافي وإيقاع إرشاد النوم.",
      priority: 90,
      kind: "shift_recovery",
      cta: "View recovery plan",
      ctaAr: "اعرض خطة التعافي",
    });
  }

  if (iv.aqi >= 100) {
    modules.push({
      id: "mod-aqi",
      title: "Air-quality exposure shield",
      titleAr: "درع التعرض لجودة الهواء",
      reason: "AQI crossed threshold — outdoor timing guidance activated.",
      reasonAr: "تجاوز مؤشر الهواء العتبة — تفعيل إرشاد توقيت الخارج.",
      priority: 80,
      kind: "air_quality",
      cta: "See exposure windows",
      ctaAr: "شاهد نوافذ التعرض",
    });
  }

  if (iv.fastingWindow || iv.ultraProcessedScore >= 60) {
    modules.push({
      id: "mod-food",
      title: "Nutrition timing companion",
      titleAr: "رفيق توقيت التغذية",
      reason: "Food environment / fasting window reshaped prompts and meal timing.",
      reasonAr: "بيئة الطعام / نافذة الصيام أعادت تشكيل التنبيهات وتوقيت الوجبات.",
      priority: 75,
      kind: "nutrition_timing",
      cta: "Adapt meal timing",
      ctaAr: "كيّف توقيت الوجبات",
    });
  }

  if (signals.some((s) => s.domain === "metabolic" && s.severity !== "info")) {
    modules.push({
      id: "mod-metabolic",
      title: "Metabolic watchlist",
      titleAr: "قائمة المراقبة الاستقلابية",
      reason: "Metabolic screening cues present — primary-care navigation elevated.",
      reasonAr: "إشارات فحص استقلابية موجودة — ارتفع توجيه الرعاية الأولية.",
      priority: 85,
      kind: "metabolic_watch",
      cta: "Prepare private intake",
      ctaAr: "جهّز الاستقبال الخاص",
    });
  }

  if (iv.socialPressureIndex >= 55 || !iv.familyModeEnabled) {
    modules.push({
      id: "mod-privacy",
      title: "Stewardship & privacy vault",
      titleAr: "خزنة الرعاية والخصوصية",
      reason: "Cultural privacy context tightened sharing defaults and language tone.",
      reasonAr: "سياق الخصوصية الثقافية شدّ إعدادات المشاركة ونبرة اللغة.",
      priority: 70,
      kind: "privacy_stewardship",
      cta: "Review vault controls",
      ctaAr: "راجع ضوابط الخزنة",
    });
  }

  if (
    iv.semenConcentration !== undefined ||
    iv.testosteroneNgDl !== undefined ||
    signals.some((s) => s.source === "at_home_device")
  ) {
    modules.push({
      id: "mod-device",
      title: "Device auto-upload check-in",
      titleAr: "متابعة الرفع التلقائي للجهاز",
      reason: "Device data present on file — confidence badges and source map unlocked (prototype may be simulated).",
      reasonAr: "بيانات جهاز موجودة في الملف — فُتحت شارات الثقة وخريطة المصدر (قد تكون محاكاة).",
      priority: 88,
      kind: "device_checkin",
      cta: "Open risk signal map",
      ctaAr: "افتح خريطة إشارات الخطر",
    });
  }

  if (signals.some((s) => s.severity === "urgent" || s.weight >= 20)) {
    modules.push({
      id: "mod-urgent",
      title: "Clinical boundary notice",
      titleAr: "إشعار الحدود السريرية",
      reason: "High-weight screening cue — human review gate before specialty referral.",
      reasonAr: "إشارة فحص عالية الوزن — بوابة مراجعة بشرية قبل الإحالة التخصصية.",
      priority: 100,
      kind: "urgent_red_flag",
      cta: "Request human review",
      ctaAr: "اطلب مراجعة بشرية",
    });
  }

  return modules.sort((a, b) => b.priority - a.priority);
}

function buildTriage(
  signals: RiskSignal[],
  iv: IndependentVariables,
): TriageRecommendation {
  /** Anchors that make an assessment "enough information" (not raw signal count). */
  const clinicalDensity =
    (iv.semenConcentration !== undefined ? 1 : 0) +
    (iv.testosteroneNgDl !== undefined ? 1 : 0) +
    (iv.bmi !== undefined ? 1 : 0) +
    (iv.sleepHours > 0 ? 1 : 0) +
    (iv.iief5Score !== undefined ? 1 : 0) +
    (iv.shiftWork || iv.occupationalStress >= 55 ? 1 : 0);

  const hasUrgent =
    iv.acuteTesticularPainFlag === true ||
    (iv.stiRiskFlag === true && Math.abs(iv.bodyTempAnomaly) >= 0.8) ||
    signals.some((s) => s.severity === "urgent");

  const hasSemenCue = signals.some((s) =>
    ["semen-parameter-screen", "sdf-screen"].includes(s.id),
  );
  const hasAnatomical = signals.some((s) =>
    [
      "anatomical-screen",
      "anatomical-cryptorchidism",
      "anatomical-trauma",
      "anatomical-orchitis",
    ].includes(s.id),
  );
  const hasHormone = signals.some((s) => s.id === "hormone-screen");
  const hasInfectious = signals.some((s) =>
    ["infectious-screen", "infectious-history"].includes(s.id),
  );
  const hasMetabolic = signals.some(
    (s) => s.domain === "metabolic" && s.severity !== "info",
  );
  const elevatedCount = signals.filter(
    (s) => s.severity === "elevated" || s.severity === "urgent",
  ).length;
  /** Elevated cues in clinical domains only (not lifestyle/recovery alone). */
  const clinicalElevatedCount = signals.filter(
    (s) =>
      (s.severity === "elevated" || s.severity === "urgent") &&
      ["metabolic", "infectious", "anatomical", "semen"].includes(s.domain),
  ).length;

  let tier: TriageTier = "self_care";

  // Audit fix: thin files with only lifestyle/recovery noise were over-triaged to primary_care.
  if (hasUrgent) {
    tier = "urgent";
  } else if (
    clinicalDensity < 2 &&
    clinicalElevatedCount === 0 &&
    !hasSemenCue &&
    !hasAnatomical &&
    !hasHormone &&
    !hasInfectious &&
    !hasMetabolic
  ) {
    tier = "insufficient_info";
  } else if (
    hasSemenCue &&
    (hasHormone || hasAnatomical) &&
    elevatedCount >= 2
  ) {
    tier = "fertility_services";
  } else if (hasSemenCue || hasAnatomical || hasHormone) {
    tier = "andrology_urology";
  } else if (hasMetabolic || hasInfectious || clinicalElevatedCount >= 1) {
    tier = "primary_care";
  } else if (clinicalDensity >= 2) {
    tier = "self_care";
  } else {
    tier = "insufficient_info";
  }

  const map: Record<
    TriageTier,
    Pick<TriageRecommendation, "label" | "labelAr" | "rationale" | "rationaleAr">
  > = {
    insufficient_info: {
      label: "Not enough information",
      labelAr: "معلومات غير كافية",
      rationale:
        "Screening signals are too sparse for a safe pathway. Attach consented streams or complete a short intake before routing.",
      rationaleAr:
        "إشارات الفحص قليلة جدًا لمسار آمن. أرفق تيارات بموافقة أو أكمل استقبالًا قصيرًا قبل التوجيه.",
    },
    self_care: {
      label: "Self-care information",
      labelAr: "معلومات الرعاية الذاتية",
      rationale:
        "Modifiable lifestyle and environmental cues only. Continue consented watch — no specialty referral.",
      rationaleAr:
        "إشارات نمط حياة وبيئة قابلة للتعديل فقط. استمر بالمراقبة الصامتة — دون إحالة تخصصية.",
    },
    primary_care: {
      label: "Primary care",
      labelAr: "الرعاية الأولية",
      rationale:
        "Metabolic, infectious, or multi-signal watchlist warrants private primary evaluation. Human review before specialty.",
      rationaleAr:
        "قائمة مراقبة استقلابية أو معدية أو متعددة الإشارات تستدعي تقييمًا أوليًا خاصًا. مراجعة بشرية قبل التخصص.",
    },
    andrology_urology: {
      label: "Andrology / Urology",
      labelAr: "الأندروولوجيا / المسالك البولية",
      rationale:
        "Semen, hormone, or anatomical screening cues suggest specialty path AFTER clinician review. Not a diagnosis.",
      rationaleAr:
        "إشارات مني أو هرمون أو تشريح تقترح مسارًا تخصصيًا بعد مراجعة الطبيب. ليس تشخيصًا.",
    },
    fertility_services: {
      label: "Fertility services (clinician-gated)",
      labelAr: "خدمات الخصوبة (بعد موافقة الطبيب)",
      rationale:
        "Multiple reproductive screening cues present. Fertility services are NEVER auto-routed — clinician must confirm appropriateness.",
      rationaleAr:
        "إشارات تناسلية متعددة موجودة. خدمات الخصوبة لا تُوجَّه آليًا أبدًا — يجب أن يؤكد الطبيب الملاءمة.",
    },
    urgent: {
      label: "Urgent assessment",
      labelAr: "تقييم عاجل",
      rationale:
        "Combined infectious and/or systemic red flags. Seek urgent care now. App does not treat emergencies.",
      rationaleAr:
        "علامات حمراء معدية و/أو جهازية مجتمعة. اطلب الرعاية العاجلة الآن. التطبيق لا يعالج الطوارئ.",
    },
  };

  const redFlags: string[] = [];
  if (iv.acuteTesticularPainFlag)
    redFlags.push("Sudden testicular pain — seek urgent care (torsion cannot be ruled out by app)");
  if (iv.stiRiskFlag) redFlags.push("Infectious / STI screening flag (consented · placeholder cue)");
  if (iv.infectiousHistoryFlag)
    redFlags.push("Self-reported infectious history on vault (placeholder cue)");
  if (iv.orchitisMumpsFlag) redFlags.push("Orchitis / mumps history flag (placeholder cue)");
  if (iv.cryptorchidismFlag) redFlags.push("Cryptorchidism / undescended testis history (placeholder cue)");
  if (iv.testicularTraumaFlag) redFlags.push("Testicular trauma history (placeholder cue)");
  if (iv.varicoceleFlag) redFlags.push("Varicocele screening cue (placeholder cue)");
  if (Math.abs(iv.bodyTempAnomaly) >= 0.7)
    redFlags.push("Significant temperature trend anomaly");
  if (iv.hrvTrend <= -15) redFlags.push("Sharp HRV decline");
  if (iv.exogenousAndrogenFlag)
    redFlags.push("TRT / exogenous androgen on file — do not start/stop meds via app");
  if (iv.sdfPct !== undefined && iv.sdfPct >= 25)
    redFlags.push("Elevated SDF screening cue");

  return {
    tier,
    ...map[tier],
    requiresHumanReview:
      tier !== "self_care" && tier !== "insufficient_info",
    redFlags,
    boundaryNote: DISCLAIMER,
  };
}

function deriveFairnessTags(iv: IndependentVariables): string[] {
  const tags: string[] = [];
  if (iv.shiftWork) tags.push("shift_workers");
  if (iv.outdoorHeatHours >= 3) tags.push("outdoor_heat_exposed");
  if (iv.fastingWindow) tags.push("fasting_observant");
  if (iv.socialPressureIndex >= 60) tags.push("high_privacy_context");
  if (iv.sedentaryHours >= 9) tags.push("sedentary_profession");
  return tags;
}

export function mergeVariables(
  base: IndependentVariables,
  patch: Partial<IndependentVariables>,
): IndependentVariables {
  return { ...base, ...patch };
}
