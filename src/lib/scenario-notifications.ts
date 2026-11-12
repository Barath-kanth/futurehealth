import type { IndependentVariables } from "./types";
import type { BodyRegion } from "./vitality-analyst";

export type ScenarioNotice = {
  id: string;
  scenario: string;
  scenarioAr: string;
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
  /** Clear do-this-now instruction */
  doNow: string;
  doNowAr: string;
  level: "info" | "watch" | "urgent";
  time: string;
  category:
    | "heat"
    | "air"
    | "water"
    | "food"
    | "sleep"
    | "work"
    | "smoke"
    | "alcohol"
    | "movement"
    | "pending"
    | "index";
  actionId?: string;
  href?: string;
};

/**
 * Production-style scenario reminders from LIVE independent variables.
 * Each notice = what happened + what you should do now.
 */
export function buildScenarioNotifications(
  iv: IndependentVariables,
  index: number,
  regions: BodyRegion[],
  pendingActionCount: number,
): ScenarioNotice[] {
  const out: ScenarioNotice[] = [];

  if (pendingActionCount > 0) {
    out.push({
      id: "sc-pending",
      scenario: "Pending actions",
      scenarioAr: "إجراءات معلّقة",
      title: `${pendingActionCount} pending action${pendingActionCount > 1 ? "s" : ""}`,
      titleAr: `${pendingActionCount} إجراء معلّق`,
      body: "Your plan still has open steps tied to today’s file.",
      bodyAr: "خطتك ما زالت فيها خطوات مفتوحة مرتبطة بملف اليوم.",
      doNow: "Open Actions and complete the top item (or mark Done).",
      doNowAr: "افتح الإجراءات وأنجز أول بند (أو علّمه تم).",
      level: pendingActionCount >= 3 ? "watch" : "info",
      time: "Now",
      category: "pending",
      href: "/actions",
    });
  }

  if (iv.heatIndexC >= 38 || iv.outdoorHeatHours >= 2.5) {
    out.push({
      id: "sc-heat",
      scenario: "High heat",
      scenarioAr: "حرارة مرتفعة",
      title: `Heat index ${iv.heatIndexC}°C · ${iv.outdoorHeatHours}h outdoors`,
      titleAr: `مؤشر حرارة ${iv.heatIndexC}° · ${iv.outdoorHeatHours}س خارجًا`,
      body: "Abu Dhabi heat is pricing into recovery and reproductive regions.",
      bodyAr: "حرارة أبوظبي تُسعَّر في التعافي والمناطق التناسلية.",
      doNow:
        "Reduce outdoor block now: 20-min shade/cool every 2h + loose clothing + no laptop on lap.",
      doNowAr:
        "قلّل الخارج الآن: ظل/تبريد ٢٠ د كل ساعتين + ملابس مريحة + لا حاسوب على الحضن.",
      level: iv.heatIndexC >= 42 ? "urgent" : "watch",
      time: "Live env",
      category: "heat",
      actionId: "heat-protocol",
      href: "/actions",
    });
  }

  if (iv.aqi >= 100) {
    out.push({
      id: "sc-air",
      scenario: "Air quality",
      scenarioAr: "جودة الهواء",
      title: `AQI ${Math.round(iv.aqi)} — adjust outdoor air`,
      titleAr: `مؤشر هواء ${Math.round(iv.aqi)} — عدّل هواء الخارج`,
      body: "Dust/pollution load is elevated on your env stream.",
      bodyAr: "حمل الغبار/التلوث مرتفع على تيار بيئتك.",
      doNow:
        iv.aqi >= 150
          ? "Stay indoors for cardio; postpone outdoor runs; close windows peak hours."
          : "Shift outdoor tasks off peak dust window; prefer indoor movement today.",
      doNowAr:
        iv.aqi >= 150
          ? "ابقَ داخلًا للتمارين؛ أجّل الجري الخارجي؛ أغلق النوافذ في الذروة."
          : "انقل المهام الخارجية بعيدًا عن ذروة الغبار؛ فضّل الحركة الداخلية اليوم.",
      level: iv.aqi >= 150 ? "urgent" : "watch",
      time: "Live env",
      category: "air",
      href: "/body",
    });
  }

  const waterTarget =
    iv.heatIndexC >= 36 || iv.outdoorHeatHours >= 2 ? 3.0 : 2.5;
  if (iv.hydrationLiters < waterTarget) {
    out.push({
      id: "sc-water",
      scenario: "Hydration gap",
      scenarioAr: "فجوة ترطيب",
      title: `Water ${iv.hydrationLiters}L · target ≥ ${waterTarget}L`,
      titleAr: `ماء ${iv.hydrationLiters}ل · الهدف ≥ ${waterTarget}ل`,
      body: "Hydration log is below protective range for today’s heat/load.",
      bodyAr: "سجل الترطيب دون النطاق الواقي لحرارة/حمل اليوم.",
      doNow: `Drink 250–300 ml now; set next sip alarm in 45 min. Aim ${waterTarget}L by evening.`,
      doNowAr: `اشرب ٢٥٠–٣٠٠ مل الآن؛ منبّه رشفة بعد ٤٥ د. هدف ${waterTarget}ل مساءً.`,
      level: iv.hydrationLiters < waterTarget - 0.8 ? "urgent" : "watch",
      time: "Nutrition log",
      category: "water",
      href: "/actions",
    });
  }

  if (iv.ultraProcessedScore >= 60 || iv.caffeineMg >= 300) {
    out.push({
      id: "sc-food",
      scenario: "Food / caffeine",
      scenarioAr: "طعام / كافيين",
      title:
        iv.caffeineMg >= 300
          ? `Caffeine ${iv.caffeineMg} mg — cut afternoon`
          : `Ultra-processed score ${iv.ultraProcessedScore}`,
      titleAr:
        iv.caffeineMg >= 300
          ? `كافيين ${iv.caffeineMg} مغ — قلّل بعد الظهر`
          : `درجة غذاء معالج ${iv.ultraProcessedScore}`,
      body: "Food environment on your log is pulling sleep and metabolic watch.",
      bodyAr: "بيئة الطعام في سجلك تسحب النوم والمراقبة الاستقلابية.",
      doNow:
        iv.caffeineMg >= 300
          ? "No caffeine after 2pm; swap next coffee for water or herbal."
          : "Swap one ultra-processed meal today for whole food + protein.",
      doNowAr:
        iv.caffeineMg >= 300
          ? "لا كافيين بعد ٢ ظهرًا؛ استبدل القهوة التالية بماء أو أعشاب."
          : "استبدل وجبة معالجة اليوم بطعام كامل وبروتين.",
      level: "watch",
      time: "Nutrition log",
      category: "food",
      href: "/actions",
    });
  }

  if (iv.sleepHours < 6.5 || iv.sleepRegularity < 55 || iv.hrvTrend <= -10) {
    out.push({
      id: "sc-sleep",
      scenario: "Sleep / recovery",
      scenarioAr: "نوم / تعافٍ",
      title: `Sleep ${iv.sleepHours}h · HRV ${iv.hrvTrend}`,
      titleAr: `نوم ${iv.sleepHours}س · HRV ${iv.hrvTrend}`,
      body: "Watch stream shows recovery debt on your personal curve.",
      bodyAr: "تيار الساعة يُظهر دين تعافٍ على منحناك الشخصي.",
      doNow:
        "Protect a fixed lights-out in 60 min; wind down screens; lighter load until HRV recovers.",
      doNowAr:
        "احمِ إطفاء أنوار ثابت خلال ٦٠ د؛ هدّئ الشاشات؛ حمل أخف حتى يتعافى HRV.",
      level: iv.sleepHours < 5.5 || iv.hrvTrend <= -15 ? "urgent" : "watch",
      time: "Watch live",
      category: "sleep",
      href: "/analyst",
    });
  }

  if (iv.sedentaryHours >= 9 || iv.activityMinutes < 80) {
    out.push({
      id: "sc-move",
      scenario: "Movement",
      scenarioAr: "حركة",
      title: `Sitting ${iv.sedentaryHours}h · activity ${iv.activityMinutes} min`,
      titleAr: `جلوس ${iv.sedentaryHours}س · نشاط ${iv.activityMinutes} د`,
      body: "PC/watch show low movement for metabolic vitality.",
      bodyAr: "الحاسوب/الساعة يُظهران حركة منخفضة للحيوية الاستقلابية.",
      doNow: "Stand and walk 10–15 minutes now; set hourly micro-break for the rest of day.",
      doNowAr: "قف وامشِ ١٠–١٥ دقيقة الآن؛ استراحة قصيرة كل ساعة لبقية اليوم.",
      level: "watch",
      time: "PC + watch",
      category: "movement",
      href: "/body",
    });
  }

  if (iv.shiftWork || iv.nightShiftsPerWeek >= 2 || iv.occupationalStress >= 75) {
    out.push({
      id: "sc-work",
      scenario: "Work load",
      scenarioAr: "حمل العمل",
      title: iv.shiftWork
        ? `Night shifts ${iv.nightShiftsPerWeek}/week`
        : `Work stress ${iv.occupationalStress}/100`,
      titleAr: iv.shiftWork
        ? `ورديات ليلية ${iv.nightShiftsPerWeek}/أسبوع`
        : `إجهاد عمل ${iv.occupationalStress}/100`,
      body: "Job calendar is dragging circadian / stress pathways.",
      bodyAr: "تقويم العمل يسحب مسارات الإيقاع/الإجهاد.",
      doNow:
        "Schedule one protected recovery block after this shift; 3-min breathing reset now.",
      doNowAr:
        "جدول كتلة تعافٍ محمية بعد هذه الوردية؛ تهدئة تنفس ٣ د الآن.",
      level: iv.occupationalStress >= 85 ? "urgent" : "watch",
      time: "Work PC",
      category: "work",
      href: "/actions",
    });
  }

  if (
    (iv.smokingLoad ?? 0) >= 30 ||
    (iv.breathCoPpm ?? 0) >= 6 ||
    (iv.smokeGestureEventsDay ?? 0) >= 5
  ) {
    out.push({
      id: "sc-smoke",
      scenario: "Smoke exposure",
      scenarioAr: "تعرض دخان",
      title:
        iv.breathCoPpm !== undefined
          ? `CO ${iv.breathCoPpm} ppm — cut next session`
          : `Smoke load ${iv.smokingLoad}`,
      titleAr:
        iv.breathCoPpm !== undefined
          ? `CO ${iv.breathCoPpm} جزء/م — أخّر الجلسة التالية`
          : `حمل تدخين ${iv.smokingLoad}`,
      body: "Sensor/file shows active smoke exposure affecting lungs & oxidative load.",
      bodyAr: "المستشعر/الملف يُظهر تعرض دخان نشط يؤثر على الرئتين والحمل التأكسدي.",
      doNow: "Skip the next cigarette/vape; drink water; re-check CO in 48h if kit attached.",
      doNowAr: "تخطَّ السيجارة/الفيب التالي؛ اشرب ماء؛ أعد فحص CO خلال ٤٨س إن وُجد الطقم.",
      level: (iv.breathCoPpm ?? 0) >= 10 ? "urgent" : "watch",
      time: "Smoke sensors",
      category: "smoke",
      href: "/devices",
    });
  }

  if (
    (iv.alcoholUnitsWeek ?? 0) >= 10 ||
    (iv.breathBacPct ?? 0) >= 0.02 ||
    (iv.tacMgDl ?? 0) >= 0.02
  ) {
    out.push({
      id: "sc-alcohol",
      scenario: "Alcohol load",
      scenarioAr: "حمل كحول",
      title:
        iv.breathBacPct !== undefined
          ? `Breath BAC ${iv.breathBacPct}% — recovery mode`
          : `Alcohol ~${iv.alcoholUnitsWeek} units/week`,
      titleAr:
        iv.breathBacPct !== undefined
          ? `BAC نفس ${iv.breathBacPct}٪ — وضع تعافٍ`
          : `كحول ~${iv.alcoholUnitsWeek} وحدة/أسبوع`,
      body: "Alcohol hardware/log is active — hormones & sleep take the drag.",
      bodyAr: "عتاد/سجل الكحول نشط — الهرمونات والنوم يتأثران.",
      doNow: "No more drinks tonight; 500 ml water; earlier sleep; dry day tomorrow.",
      doNowAr: "لا مشروبات إضافية الليلة؛ ٥٠٠ مل ماء؛ نوم أبكر؛ يوم جاف غدًا.",
      level: (iv.breathBacPct ?? 0) >= 0.05 ? "urgent" : "watch",
      time: "Alcohol sensors",
      category: "alcohol",
      href: "/devices",
    });
  }

  if (index < 75) {
    out.push({
      id: "sc-index",
      scenario: "Index band",
      scenarioAr: "نطاق المؤشر",
      title:
        index < 60
          ? `MVI ${index} below acceptable — doctor alert path`
          : `MVI ${index} in watch band`,
      titleAr:
        index < 60
          ? `المؤشر ${index} دون المقبول — مسار تنبيه الطبيب`
          : `المؤشر ${index} في نطاق المراقبة`,
      body: "Personal Male Vitality Index moved with today’s independent variables.",
      bodyAr: "مؤشر الحيوية الشخصي تحرك مع المتغيرات المستقلة اليوم.",
      doNow:
        index < 60
          ? "Open Control room · confirm doctor alert · finish top pending action."
          : "Knock out heat/water/sleep reminders to climb back toward 75+.",
      doNowAr:
        index < 60
          ? "افتح غرفة التحكم · أكّد تنبيه الطبيب · أنجز أعلى إجراء معلّق."
          : "أنجز تذكيرات الحرارة/الماء/النوم للعودة نحو ٧٥+.",
      level: index < 60 ? "urgent" : "info",
      time: "Index",
      category: "index",
      href: index < 60 ? "/analytics" : "/actions",
    });
  }

  const strained = regions.filter((r) => r.status === "strain");
  for (const r of strained.slice(0, 2)) {
    out.push({
      id: `sc-body-${r.id}`,
      scenario: "Body map strain",
      scenarioAr: "إجهاد خريطة الجسم",
      title: `${r.label} · ${r.score}/100`,
      titleAr: `${r.labelAr} · ${r.score}/100`,
      body: "This region is strained on your live personal map.",
      bodyAr: "هذه المنطقة مجهدة على خريطتك الشخصية الحية.",
      doNow: r.whatToDo,
      doNowAr: r.whatToDoAr,
      level: "urgent",
      time: "Body map",
      category: "pending",
      href: "/body",
    });
  }

  return out;
}
