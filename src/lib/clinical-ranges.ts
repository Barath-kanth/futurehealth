/** Screening reference bands for personal file — always compare to YOUR lab report. */

export const HORMONE_RANGES = [
  {
    id: "total_t_us",
    biomarker: "Total Testosterone (US)",
    biomarkerAr: "التستوستيرون الكلي (أمريكي)",
    unit: "ng/dL",
    acceptable: "300 – 1,000",
    lowBelow: 300,
    notes: "Peaks early adulthood; declines ~1%/year after 30. Draw 7–10 AM.",
    notesAr: "يبلغ الذروة في الشباب؛ ينخفض ~١٪ سنويًا بعد ٣٠. السحب ٧–١٠ صباحًا.",
  },
  {
    id: "total_t_intl",
    biomarker: "Total Testosterone (International)",
    biomarkerAr: "التستوستيرون الكلي (دولي)",
    unit: "nmol/L",
    acceptable: "8.7 – 29",
    lowBelow: 8,
    notes: "Many clinicians see 15–29 nmol/L as stronger functional range.",
    notesAr: "كثير من الأطباء يعتبرون ١٥–٢٩ النطاق الوظيفي الأقوى.",
  },
  {
    id: "free_t_us",
    biomarker: "Free Testosterone (US)",
    biomarkerAr: "التستوستيرون الحر (أمريكي)",
    unit: "pg/mL",
    acceptable: "50 – 210",
    lowBelow: 50,
    notes: "Active unbound hormone available to tissues.",
    notesAr: "الهرمون النشط غير المرتبط المتاح للأنسجة.",
  },
  {
    id: "free_t_intl",
    biomarker: "Free Testosterone (International)",
    biomarkerAr: "التستوستيرون الحر (دولي)",
    unit: "nmol/L",
    acceptable: "0.225 – 0.72",
    lowBelow: 0.225,
    notes: "Often paired with SHBG.",
    notesAr: "غالبًا مع الجلوبيولين الرابط للهرمونات الجنسية (SHBG).",
  },
] as const;

export const QUESTIONNAIRE_RANGES = [
  {
    id: "iief5",
    name: "IIEF-5 (Erectile function)",
    nameAr: "IIEF-5 (الوظيفة الانتصابية)",
    scale: "5 – 25",
    normal: "22 – 25",
    watchBelow: 22,
    notes: "Reference symptom scale — not a blood test; not a SeedShield diagnosis.",
    notesAr: "مقياس أعراض معتمد — ليس فحص دم.",
  },
  {
    id: "ams",
    name: "AMS (Aging Males' Symptoms)",
    nameAr: "AMS (أعراض الرجال مع التقدم)",
    scale: "17 – 85",
    normal: "17 – 26",
    watchBelow: 27,
    notes: "Psychological, physical, sexual symptoms. Lower is better.",
    notesAr: "أعراض نفسية وجسدية وجنسية. الأقل أفضل.",
  },
  {
    id: "ipss",
    name: "IPSS (Prostate / urinary)",
    nameAr: "IPSS (البروستاتا / البول)",
    scale: "0 – 35",
    normal: "0 – 7",
    watchBelow: 8,
    notes: "Mild/normal urinary range 0–7.",
    notesAr: "نطاق بولي خفيف/طبيعي ٠–٧.",
  },
] as const;

export const METABOLIC_RANGES = [
  {
    id: "bp",
    name: "Blood pressure",
    nameAr: "ضغط الدم",
    acceptable: "< 120/80 mmHg",
    notes: "Optimal adult target for circulation.",
    notesAr: "الهدف الأمثل للبالغين للدورة الدموية.",
  },
  {
    id: "glucose",
    name: "Fasting blood glucose",
    nameAr: "جلوكوز الصيام",
    acceptable: "70 – 99 mg/dL (3.9 – 5.5 mmol/L)",
    notes: "Metabolic energy & recovery.",
    notesAr: "طاقة التمثيل الغذائي والتعافي.",
  },
  {
    id: "vitd",
    name: "Vitamin D",
    nameAr: "فيتامين د",
    acceptable: "30 – 50 ng/mL (75 – 125 nmol/L)",
    notes: "Immune, mood, circulation support.",
    notesAr: "دعم المناعة والمزاج والدورة.",
  },
  {
    id: "tsh",
    name: "TSH (thyroid)",
    nameAr: "TSH (الغدة الدرقية)",
    acceptable: "0.4 – 4.0 mIU/L",
    notes: "Metabolic energy; avoid chronic fatigue miss.",
    notesAr: "طاقة التمثيل؛ تجنب تفويت التعب المزمن.",
  },
] as const;

export const HOME_FINGERPRICK_STEPS = [
  {
    en: "Follow the validated kit’s timing (often morning) — demo only.",
    ar: "اتبع توقيت الطقم المعتمد (غالبًا صباحًا) — للعرض فقط.",
  },
  {
    en: "Follow kit fasting rules if listed — demo flow, not medical advice.",
    ar: "اتبع قواعد الصيام في الطقم إن وُجدت — تدفق عرض وليس نصيحة طبية.",
  },
  {
    en: "Skip strenuous workouts if the kit asks — hormones can vary with hard training.",
    ar: "تجنّب التمارين الشاقة إن طلب الطقم ذلك — الهرمونات قد تتغير مع التدريب القاسي.",
  },
  {
    en: "Hydrate; warm hands 2 minutes to improve finger circulation.",
    ar: "ترطيب؛ دفّئ اليدين دقيقتين لتحسين الدورة في الأصابع.",
  },
  {
    en: "Clean flat workspace: lancets, wipes, tube, bandages — read all steps first.",
    ar: "سطح نظيف: إبر، مناديل، أنبوب، ضمادات — اقرأ كل الخطوات أولًا.",
  },
  {
    en: "Label, seal in biohazard bag, ship same day — heat/delay degrades blood.",
    ar: "سمِّ، أغلق في كيس خطر بيولوجي، أرسل في نفس اليوم — الحرارة/التأخير يفسدان العينة.",
  },
] as const;

export const HOME_SEMEN_ZERO_RISK_STEPS = [
  {
    en: "Order unmarked packaging to a private address — zero clinic waiting room.",
    ar: "اطلب عبوة بلا علامات لعنوان خاص — بلا انتظار في العيادة.",
  },
  {
    en: "Abstain only as kit instructs (usually 2–5 days) — don’t invent extra rules.",
    ar: "امتناع فقط حسب تعليمات الطقم (عادة ٢–٥ أيام) — لا تخترع قواعد إضافية.",
  },
  {
    en: "Wash hands; use only the sterile cup provided — never household containers.",
    ar: "اغسل اليدين؛ استخدم الكأس المعقم فقط — لا أواني منزلية.",
  },
  {
    en: "Collect in a private room; keep sample at body-ish temp; start timer in app.",
    ar: "اجمع في غرفة خاصة؛ حافظ على حرارة قريبة من الجسم؛ ابدأ المؤقت في التطبيق.",
  },
  {
    en: "Scan QR → encrypted upload (count, motility, morphology, SDF) to YOUR vault only.",
    ar: "امسح QR → رفع مشفّر (عدد، حركة، شكل، SDF) إلى خزنتك فقط.",
  },
  {
    en: "Opt-in to share with assigned doctor; otherwise results stay private. Screening ≠ diagnosis.",
    ar: "شارك مع طبيبك المعيَّن باختيارك؛ وإلا تبقى النتائج خاصة. فحص ≠ تشخيص.",
  },
] as const;

export const LIFESTYLE_SUBSTANCE_NOTES = {
  smoke: {
    en: "Tobacco / vape load raises oxidative stress and vascular drag on your map.",
    ar: "حمل التبغ/الفيب يرفع الإجهاد التأكسدي والسحب الوعائي على خريطتك.",
  },
  alcohol: {
    en: "Heavy alcohol weeks pull hormones, sleep, and liver-metabolic scores.",
    ar: "أسابيع الكحول الثقيل تسحب الهرمونات والنوم ودرجات الكبد الاستقلابي.",
  },
  drugs: {
    en: "Recreational / non-prescribed substances are flagged for clinician review — never judged in-app.",
    ar: "المواد الترفيهية/غير الموصوفة تُعلَّم لمراجعة الطبيب — دون حكم داخل التطبيق.",
  },
};
