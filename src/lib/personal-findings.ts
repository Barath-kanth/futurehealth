import type { IndependentVariables, PersonalFinding, Persona } from "./types";

/**
 * Builds personal findings from THIS man's live profile only.
 * No textbook lectures — each card says what showed up in his data and what to do.
 */
export function buildPersonalFindings(
  persona: Persona,
  iv: IndependentVariables,
): PersonalFinding[] {
  const findings: PersonalFinding[] = [];
  const nameEn = persona.id === "me" ? "You" : persona.name.split("·")[0].trim();
  const nameAr = persona.id === "me" ? "أنت" : persona.nameAr.split("·")[0].trim();

  // --- Physio / watch ---
  if (iv.sleepApneaRisk >= 55 || (iv.sleepHours < 6 && iv.sleepRegularity < 50)) {
    findings.push({
      id: "pf-sleep-apnea",
      title: "Your sleep recovery looks strained",
      titleAr: "تعافي نومك يبدو مجهدًا",
      aboutYou: `${nameEn}, your watch shows sleep ${iv.sleepHours}h, regularity ${iv.sleepRegularity}, apnea-risk proxy ${iv.sleepApneaRisk}/100.`,
      aboutYouAr: `${nameAr}، ساعتك تُظهر نومًا ${iv.sleepHours}س، انتظام ${iv.sleepRegularity}، ومؤشر انقطاع نفس ${iv.sleepApneaRisk}/100.`,
      whatItMeansForYou:
        "In your profile this pairs with lower HRV and higher daytime load — a personal recovery drag, not a lecture.",
      whatItMeansForYouAr:
        "في ملفك يقترن بانخفاض HRV وارتفاع حمل النهار — سحب تعافٍ شخصي وليس محاضرة.",
      nextStep: "Protect a fixed sleep window tonight; ask doctor chat if snoring + fatigue continue 2 weeks.",
      nextStepAr: "احمِ نافذة نوم ثابتة الليلة؛ اسأل محادثة الطبيب إذا استمر الشخير والتعب أسبوعين.",
      severity: iv.sleepApneaRisk >= 70 ? "elevated" : "watch",
      confidence: "medium",
      source: "wearable",
      control: "controllable",
      category: "physio",
      relatedBody: ["sleep_recovery", "hormones", "reproductive"],
    });
  }

  if (iv.hrvTrend <= -8 || iv.restingHr >= 80) {
    findings.push({
      id: "pf-autonomic",
      title: "Live watch: recovery debt on your curve",
      titleAr: "الساعة الحية: دين تعافٍ على منحناك",
      aboutYou: `HRV trend ${iv.hrvTrend}, resting HR ${iv.restingHr} — updating from your connected watch.`,
      aboutYouAr: `اتجاه HRV ${iv.hrvTrend}، نبض الراحة ${iv.restingHr} — يتحدّث من ساعتك المتصلة.`,
      whatItMeansForYou:
        "Your vitality index is pricing this as physio drag right now.",
      whatItMeansForYouAr: "مؤشر حيويتك يسعّر هذا كسحب فسيولوجي الآن.",
      nextStep: "Take a lighter load block today; hydrate; re-check watch tonight.",
      nextStepAr: "خفّف الحمل اليوم؛ ترطيب؛ أعد فحص الساعة الليلة.",
      severity: "watch",
      confidence: "high",
      source: "wearable",
      control: "semi",
      category: "physio",
      relatedBody: ["heart", "sleep_recovery"],
    });
  }

  // --- Psycho / life context ---
  const psychoLoad =
    iv.occupationalStress * 0.35 +
    iv.moneyStress * 0.25 +
    iv.businessStress * 0.2 +
    (100 - iv.peaceIndex) * 0.2;

  if (psychoLoad >= 55) {
    findings.push({
      id: "pf-stress-stack",
      title: "Your stress stack is elevated",
      titleAr: "حزمة إجهادك مرتفعة",
      aboutYou: `Work stress ${iv.occupationalStress}, money stress ${iv.moneyStress}, business ${iv.businessStress}, peace ${iv.peaceIndex}/100.`,
      aboutYouAr: `إجهاد العمل ${iv.occupationalStress}، المال ${iv.moneyStress}، العمل التجاري ${iv.businessStress}، السلام ${iv.peaceIndex}/100.`,
      whatItMeansForYou:
        "These are from your life-context feed — months of this quietly pull recovery and reproductive-region scores in your map.",
      whatItMeansForYouAr:
        "من تغذية سياق حياتك — أشهر من هذا تسحب بهدوء درجات التعافي والمنطقة التناسلية في خريطتك.",
      nextStep: "Pick one lever today: money-plan 15 min, or a 3-min reset twice. Open Actions.",
      nextStepAr: "اختر رافعة اليوم: ١٥ دقيقة لخطة المال أو تهدئة ٣ دقائق مرتين. افتح الإجراءات.",
      severity: psychoLoad >= 70 ? "elevated" : "watch",
      confidence: "medium",
      source: "finance_context",
      control: "semi",
      category: "psycho",
      relatedBody: ["brain", "hormones", "reproductive"],
    });
  }

  if (iv.financialSecurity < 40 || iv.moneyStress >= 65) {
    findings.push({
      id: "pf-money",
      title: "Money pressure showing in your profile",
      titleAr: "ضغط المال يظهر في ملفك",
      aboutYou: `Financial security ${iv.financialSecurity}/100 · money stress ${iv.moneyStress}.`,
      aboutYouAr: `الأمان المالي ${iv.financialSecurity}/100 · ضغط المال ${iv.moneyStress}.`,
      whatItMeansForYou:
        "Not a judgment — your peace index and sleep usually move with this in your own history.",
      whatItMeansForYouAr:
        "ليس حكمًا — مؤشر السلام والنوم لديك يتحركان عادة مع هذا في تاريخك.",
      nextStep: "The AI guide can help prioritize calm routines while you handle finances privately.",
      nextStepAr: "المرشد الذكي يساعد على أولوية الهدوء بينما تعالج المال بخصوصية.",
      severity: "watch",
      confidence: "low",
      source: "finance_context",
      control: "semi",
      category: "life_context",
      relatedBody: ["brain", "sleep_recovery"],
    });
  }

  // --- Environment / toxins / media ---
  if (iv.aqi >= 100 || iv.plasticFoodContactScore >= 60) {
    findings.push({
      id: "pf-edc-air",
      title: "Environment load is elevated (illustrative)",
      titleAr: "حمل بيئي مرتفع (توضيحي)",
      aboutYou: `Abu Dhabi AQI ${iv.aqi}, plastic/food-contact score ${iv.plasticFoodContactScore} (demo scale), noise ${iv.noiseDbAvg} dB.`,
      aboutYouAr: `مؤشر هواء أبوظبي ${iv.aqi}، درجة ملامسة البلاستيك/الطعام ${iv.plasticFoodContactScore} (مقياس عرض)، ضوضاء ${iv.noiseDbAvg} ديسيل.`,
      whatItMeansForYou:
        "Illustrative cue only — air and food-contact factors can be associated with oxidative stress in literature; this is not a measured fertility effect.",
      whatItMeansForYouAr:
        "إشارة توضيحية فقط — الهواء وملامسة الطعام قد يرتبطان بإجهاد تأكسدي في الأدبيات؛ ليست تأثيرًا مقاسًا على الخصوبة.",
      nextStep: "Shift outdoor tasks off peak dust; swap one plastic food container this week.",
      nextStepAr: "انقل المهام الخارجية بعيدًا عن ذروة الغبار؛ استبدل وعاء بلاستيك واحد هذا الأسبوع.",
      severity: iv.aqi >= 150 ? "elevated" : "watch",
      confidence: "low",
      source: "environment",
      control: "semi",
      category: "lifestyle_env",
      relatedBody: ["lungs", "reproductive", "hormones"],
    });
  }

  if (iv.mediaIntensity >= 65 || iv.screenHours >= 10) {
    findings.push({
      id: "pf-media",
      title: "Screen & media load from your devices",
      titleAr: "حمل الشاشة والوسائط من أجهزتك",
      aboutYou: `PC/phone show screen ${iv.screenHours}h and media intensity ${iv.mediaIntensity}/100.`,
      aboutYouAr: `الحاسوب/الهاتف يُظهران شاشة ${iv.screenHours}س وكثافة وسائط ${iv.mediaIntensity}/100.`,
      whatItMeansForYou:
        "In your profile this usually lands with later sleep and higher stress — already visible on your watch.",
      whatItMeansForYouAr:
        "في ملفك غالبًا يرتبط بنوم متأخر وإجهاد أعلى — ظاهر أصلًا على ساعتك.",
      nextStep: "Set a device wind-down 60 min before your sleep anchor.",
      nextStepAr: "اضبط تهدئة أجهزة قبل ساعة من مرساة نومك.",
      severity: "info",
      confidence: "medium",
      source: "pc_usage",
      control: "controllable",
      category: "lifestyle_env",
      relatedBody: ["brain", "sleep_recovery"],
    });
  }

  if (iv.noiseDbAvg >= 70) {
    findings.push({
      id: "pf-noise",
      title: "Noise exposure in your day",
      titleAr: "تعرضك للضوضاء اليوم",
      aboutYou: `Phone mic average ${iv.noiseDbAvg} dB during your logged hours.`,
      aboutYouAr: `متوسط ميكروفون الهاتف ${iv.noiseDbAvg} ديسيل خلال ساعاتك المسجّلة.`,
      whatItMeansForYou: "High noise days correlate with your stress and sleep dips.",
      whatItMeansForYouAr: "أيام الضوضاء العالية ترتبط بهبوط إجهادك ونومك.",
      nextStep: "Use quieter breaks; ear protection on loud work bays if available.",
      nextStepAr: "استراحات أهدأ؛ حماية أذن في الأرصفة الصاخبة إن توفرت.",
      severity: "watch",
      confidence: "low",
      source: "phone_media",
      control: "semi",
      category: "lifestyle_env",
      relatedBody: ["brain", "sleep_recovery"],
    });
  }

  // --- Metabolic / monthly BMI ---
  if (
    (iv.bmi !== undefined && iv.bmi >= 30) ||
    (iv.visceralFatScore !== undefined && iv.visceralFatScore >= 55) ||
    (iv.glucoseMgDl !== undefined && iv.glucoseMgDl >= 110)
  ) {
    findings.push({
      id: "pf-metabolic",
      title: "Monthly body check flagged metabolic watch",
      titleAr: "الفحص الشهري أشار لمراقبة استقلابية",
      aboutYou: `BMI ${iv.bmi ?? "—"}, waist ${iv.waistCm ?? "—"} cm, visceral ${iv.visceralFatScore ?? "—"}, glucose ${iv.glucoseMgDl ?? "—"}.`,
      aboutYouAr: `BMI ${iv.bmi ?? "—"}، خصر ${iv.waistCm ?? "—"} سم، دهون حشوية ${iv.visceralFatScore ?? "—"}، جلوكوز ${iv.glucoseMgDl ?? "—"}.`,
      whatItMeansForYou:
        "From your monthly check-in / vault — this is your body file, not a generic warning.",
      whatItMeansForYouAr:
        "من فحصك الشهري/الخزنة — هذا ملف جسمك وليس تحذيرًا عامًا.",
      nextStep: "Walk after two meals daily; primary-care path if glucose stays high.",
      nextStepAr: "امشِ بعد وجبتين يوميًا؛ مسار رعاية أولية إذا بقي الجلوكوز مرتفعًا.",
      severity: "elevated",
      confidence: "high",
      source: "monthly_body_check",
      control: "controllable",
      category: "hidden_clinical",
      relatedBody: ["liver_metabolic", "hormones", "reproductive"],
    });
  }

  // --- Hidden clinical (only if HIS data has flags / device values) ---
  if (iv.sdfPct !== undefined && iv.sdfPct >= 25) {
    findings.push({
      id: "pf-sdf",
      title: "Your device file: DNA fragmentation cue",
      titleAr: "ملف جهازك: إشارة تفكك الحمض النووي",
      aboutYou: `${nameEn}, consented device upload shows SDF ${iv.sdfPct}% with concentration ${iv.semenConcentration ?? "n/a"}.`,
      aboutYouAr: `${nameAr}، رفع الجهاز بموافقة يُظهر SDF ${iv.sdfPct}% مع تركيز ${iv.semenConcentration ?? "غ/م"}.`,
      whatItMeansForYou:
        "Standard count/movement can look ‘fine’ while this cue still needs human review — screening only.",
      whatItMeansForYouAr:
        "العدّ والحركة القياسيان قد يبدوان «طبيعيين» بينما هذه الإشارة ما زالت تحتاج مراجعة بشرية — فحص فقط.",
      nextStep: "Request human clinical review before any specialty label.",
      nextStepAr: "اطلب مراجعة سريرية بشرية قبل أي تصنيف تخصصي.",
      severity: "elevated",
      confidence: "high",
      source: "at_home_device",
      control: "semi",
      category: "hidden_clinical",
      relatedBody: ["reproductive"],
    });
  }

  if (iv.varicoceleFlag) {
    findings.push({
      id: "pf-varicocele",
      title: "Anatomical cue on your clinical vault",
      titleAr: "إشارة تشريحية في خزنتك السريرية",
      aboutYou: "Your consented vault includes a varicocele screening flag (often silent / no pain).",
      aboutYouAr: "خزنتك بموافقة تتضمن علم فحص دوالي (غالبًا صامت / بلا ألم).",
      whatItMeansForYou:
        "Tied to your heat/work profile it can matter for testicular cooling — confirm with clinician.",
      whatItMeansForYouAr:
        "مرتبط بملف حرارتك/عملك وقد يهم تبريد الخصية — أكّد مع الطبيب.",
      nextStep: "Andrology path after human review — not an app diagnosis.",
      nextStepAr: "مسار أندروولوجيا بعد مراجعة بشرية — ليس تشخيص تطبيق.",
      severity: "elevated",
      confidence: "medium",
      source: "clinical_lab",
      control: "uncontrollable",
      category: "hidden_clinical",
      relatedBody: ["reproductive"],
    });
  }

  if (iv.exogenousAndrogenFlag) {
    findings.push({
      id: "pf-trt",
      title: "Medication context: exogenous androgens",
      titleAr: "سياق دوائي: أندروجينات خارجية",
      aboutYou: "Pharmacy/meds stream marked TRT or anabolic androgen exposure on your profile.",
      aboutYouAr: "تيار الأدوية علّم تعرضًا لـ TRT أو أندروجينات بنائية في ملفك.",
      whatItMeansForYou:
        "You may feel energetic while natural production signals are suppressed — private clinician talk needed.",
      whatItMeansForYouAr:
        "قد تشعر بنشاط بينما إشارات الإنتاج الطبيعي مثبّطة — يلزم حديث طبيب خاص.",
      nextStep: "Do not stop meds alone — use doctor chat to prepare a human review.",
      nextStepAr: "لا توقف الدواء وحدك — استخدم محادثة الطبيب لتجهيز مراجعة بشرية.",
      severity: "elevated",
      confidence: "high",
      source: "pharmacy_meds",
      control: "semi",
      category: "hidden_clinical",
      relatedBody: ["hormones", "reproductive"],
    });
  }

  if (iv.geneticRiskFlag) {
    findings.push({
      id: "pf-genetic",
      title: "Genetic screening cue in your vault",
      titleAr: "إشارة فحص جيني في خزنتك",
      aboutYou: "Category-level vault flag for possible chromosomal / Y-microdeletion workup relevance.",
      aboutYouAr: "علم خزنة على مستوى الفئة لاحتمال صلة بفحص كروموسومي / حذف Y دقيق.",
      whatItMeansForYou: "No outward symptoms required — only a clinician can interpret your case.",
      whatItMeansForYouAr: "لا يلزم أعراض ظاهرة — الطبيب وحده يفسّر حالتك.",
      nextStep: "Human genetics/andrology review — SeedShield never diagnoses this.",
      nextStepAr: "مراجعة وراثة/أندروولوجيا بشرية — SeedShield لا يشخص هذا.",
      severity: "elevated",
      confidence: "low",
      source: "clinical_lab",
      control: "uncontrollable",
      category: "hidden_clinical",
      relatedBody: ["reproductive", "hormones"],
    });
  }

  if (iv.subclinicalInflammationFlag || iv.stiRiskFlag) {
    findings.push({
      id: "pf-inflam",
      title: "Silent infection / inflammation cue",
      titleAr: "إشارة التهاب / عدوى صامتة",
      aboutYou: "Your clinical category pull marked subclinical inflammation or STI-risk context.",
      aboutYouAr: "سحبك السريري على مستوى الفئة علّم التهابًا تحت سريري أو سياق خطر STI.",
      whatItMeansForYou: "Can be quiet in daily life while still on your personal risk map.",
      whatItMeansForYouAr: "قد يكون هادئًا يوميًا بينما يبقى على خريطة خطرِك الشخصية.",
      nextStep: "Private primary/andrology intake with human oversight.",
      nextStepAr: "استقبال خاص أولي/أندروولوجيا بإشراف بشري.",
      severity: "elevated",
      confidence: "medium",
      source: "clinical_lab",
      control: "semi",
      category: "hidden_clinical",
      relatedBody: ["reproductive"],
    });
  }

  if (iv.medsFertilityImpact) {
    findings.push({
      id: "pf-meds",
      title: "Everyday meds on your pharmacy stream",
      titleAr: "أدوية يومية على تيار صيدليتك",
      aboutYou:
        "Your meds context includes drugs that can subtly affect motility/ejaculation (e.g. certain BP, mood, hair-loss, pain meds).",
      aboutYouAr:
        "سياق أدويتك يتضمن عقاقير قد تؤثر بلطف على الحركة/القذف (مثل بعض ضغط الدم والمزاج والشعر والألم).",
      whatItMeansForYou: "Personal to your prescription list — never stop without a clinician.",
      whatItMeansForYouAr: "خاص بقائمة وصفتك — لا توقف دون طبيب.",
      nextStep: "Ask the AI guide to prep questions for your prescriber.",
      nextStepAr: "اطلب من المرشد الذكي تجهيز أسئلة لواصف الدواء.",
      severity: "watch",
      confidence: "medium",
      source: "pharmacy_meds",
      control: "semi",
      category: "hidden_clinical",
      relatedBody: ["reproductive", "hormones"],
    });
  }

  if (iv.otherChronicDiseaseFlag) {
    findings.push({
      id: "pf-chronic",
      title: "Other chronic condition on file",
      titleAr: "حالة مزمنة أخرى في الملف",
      aboutYou: "Your vault notes another chronic disease that can interact with vitality pathways.",
      aboutYouAr: "خزنتك تذكر مرضًا مزمنًا آخر قد يتفاعل مع مسارات الحيوية.",
      whatItMeansForYou: "Kept on your map so triage stays whole-person, not single-organ.",
      whatItMeansForYouAr: "يُبقى على خريطتك ليبقى الفرز لكامل الشخص لا لعضو واحد.",
      nextStep: "Bring this to primary care alongside vitality screening.",
      nextStepAr: "أحضر هذا للرعاية الأولية مع فحص الحيوية.",
      severity: "watch",
      confidence: "medium",
      source: "clinical_lab",
      control: "semi",
      category: "hidden_clinical",
      relatedBody: ["liver_metabolic", "heart"],
    });
  }

  if ((iv.breathBacPct ?? 0) >= 0.02 || (iv.tacMgDl ?? 0) >= 0.02) {
    findings.push({
      id: "pf-alcohol-hw",
      title: "Alcohol sensor reading on your file",
      titleAr: "قراءة مستشعر كحول في ملفك",
      aboutYou: `Hardware feed: TAC ${iv.tacMgDl ?? "—"} · breath BAC ${iv.breathBacPct ?? "—"}% (BACtrack Skyn / dongle class).`,
      aboutYouAr: `تغذية عتاد: TAC ${iv.tacMgDl ?? "—"} · BAC نفس ${iv.breathBacPct ?? "—"}٪ (فئة BACtrack Skyn / دونغل).`,
      whatItMeansForYou:
        "Screening only — not a roadside legal test. Recovery & hormone pathways on your map take the hit.",
      whatItMeansForYouAr:
        "فحص فقط — ليس اختبارًا قانونيًا على الطريق. مسارات التعافي والهرمون على خريطتك تتأثر.",
      nextStep: "Hydrate, protect sleep tonight; share with assigned doctor if BAC keeps rising.",
      nextStepAr: "ترطيب وحماية نوم الليلة؛ شارك طبيبك إن استمر ارتفاع BAC.",
      severity: (iv.breathBacPct ?? 0) >= 0.05 ? "elevated" : "watch",
      confidence: "high",
      source: "alcohol_sensor",
      control: "controllable",
      category: "lifestyle_env",
      relatedBody: ["liver_metabolic", "sleep_recovery", "hormones"],
    });
  }

  if ((iv.voiceImpairmentScore ?? 0) >= 40 || (iv.motorImpairmentScore ?? 0) >= 40) {
    findings.push({
      id: "pf-alcohol-ai",
      title: "Voice / motor AI flags impairment",
      titleAr: "ذكاء الصوت/الحركة يعلّم إعاقة",
      aboutYou: `Voice score ${iv.voiceImpairmentScore ?? "—"} · motor ${iv.motorImpairmentScore ?? "—"} (on-device speech + typing/gait).`,
      aboutYouAr: `درجة الصوت ${iv.voiceImpairmentScore ?? "—"} · الحركة ${iv.motorImpairmentScore ?? "—"} (كلام على الجهاز + كتابة/مشية).`,
      whatItMeansForYou: "Phone ML screening — pair with breathalyzer for higher confidence.",
      whatItMeansForYouAr: "فحص تعلم آلة على الهاتف — اربطه بجهاز النفس لثقة أعلى.",
      nextStep: "Attach breath dongle for a same-evening confirmation blow.",
      nextStepAr: "أرفق دونغل النفس لتأكيد بنفس المساء.",
      severity: "watch",
      confidence: "medium",
      source: "voice_ai",
      control: "semi",
      category: "lifestyle_env",
      relatedBody: ["brain", "sleep_recovery"],
    });
  }

  if ((iv.breathCoPpm ?? 0) >= 6 || (iv.smokeGestureEventsDay ?? 0) >= 5) {
    findings.push({
      id: "pf-smoke-hw",
      title: "Smoke exposure from real sensors",
      titleAr: "تعرض دخان من مستشعرات حقيقية",
      aboutYou: `CO ${iv.breathCoPpm ?? "—"} ppm (iCOquit-class) · watch gestures ${iv.smokeGestureEventsDay ?? "—"}/day.`,
      aboutYouAr: `CO ${iv.breathCoPpm ?? "—"} جزء/مليون (فئة iCOquit) · إيماءات الساعة ${iv.smokeGestureEventsDay ?? "—"}/يوم.`,
      whatItMeansForYou: "Objective inhalation + gesture log — smokingLoad updated on your file.",
      whatItMeansForYouAr: "استنشاق موضوعي + سجل إيماءات — حُدّث حمل التدخين في ملفك.",
      nextStep: "Open quit nudge plan; re-blow CO in 48h after cutting sessions.",
      nextStepAr: "افتح خطة تنبيه الإقلاع؛ أعد نفخ CO خلال ٤٨ ساعة بعد تقليل الجلسات.",
      severity: (iv.breathCoPpm ?? 0) >= 10 ? "elevated" : "watch",
      confidence: "high",
      source: "smoke_sensor",
      control: "controllable",
      category: "lifestyle_env",
      relatedBody: ["lungs", "heart", "reproductive"],
    });
  }

  if (
    (iv.spo2Pct !== undefined && iv.spo2Pct < 95) ||
    (iv.spirometryFev1Pct !== undefined && iv.spirometryFev1Pct < 80) ||
    (iv.coughRiskScore ?? 0) >= 40
  ) {
    findings.push({
      id: "pf-lung-hw",
      title: "Lung kit reading needs watch",
      titleAr: "قراءة طقم الرئة تحتاج مراقبة",
      aboutYou: `SpO₂ ${iv.spo2Pct ?? "—"}% · FEV1 ${iv.spirometryFev1Pct ?? "—"}% pred · cough AI ${iv.coughRiskScore ?? "—"}.`,
      aboutYouAr: `SpO₂ ${iv.spo2Pct ?? "—"}٪ · FEV1 ${iv.spirometryFev1Pct ?? "—"}٪ متوقع · ذكاء سعال ${iv.coughRiskScore ?? "—"}.`,
      whatItMeansForYou:
        "NuvoAir-class / ox / mic screens — not a COPD diagnosis. Primary care if SpO₂ stays low.",
      whatItMeansForYouAr:
        "شاشات فئة NuvoAir / أكسجة / ميكروفون — ليست تشخيص COPD. رعاية أولية إن بقي SpO₂ منخفضًا.",
      nextStep: "Repeat spirometry morning + evening; alert assigned doctor if SpO₂ < 94.",
      nextStepAr: "كرر مقياس التنفس صباحًا ومساءً؛ نبّه طبيبك إن SpO₂ < ٩٤.",
      severity: (iv.spo2Pct ?? 100) < 94 ? "elevated" : "watch",
      confidence: "high",
      source: "lung_sensor",
      control: "semi",
      category: "physio",
      relatedBody: ["lungs", "heart"],
    });
  }

  if ((iv.smokingLoad ?? 0) >= 25) {
    findings.push({
      id: "pf-smoke",
      title: "Tobacco / vape load on your file",
      titleAr: "حمل التبغ/الفيب في ملفك",
      aboutYou: `Smoking/vape load score ${iv.smokingLoad}/100 from your life-context feed.`,
      aboutYouAr: `درجة حمل التبغ/الفيب ${iv.smokingLoad}/100 من تغذية سياق حياتك.`,
      whatItMeansForYou:
        "Can be associated with vascular and recovery load on your demo guide score — private, non-judgmental; not shared without opt-in.",
      whatItMeansForYouAr:
        "قد يرتبط بحمل وعائي وتعافٍ على درجة العرض — خاص ودون حكم؛ لا مشاركة دون موافقة.",
      nextStep: "Cut one daily session this week; ask doctor chat for a taper plan.",
      nextStepAr: "اخفض جلسة يومية هذا الأسبوع؛ اسأل محادثة الطبيب لخطة تدرّج.",
      severity: iv.smokingLoad >= 50 ? "elevated" : "watch",
      confidence: "medium",
      source: "social_context",
      control: "controllable",
      category: "lifestyle_env",
      relatedBody: ["lungs", "heart", "reproductive"],
    });
  }

  if ((iv.alcoholUnitsWeek ?? 0) >= 14) {
    findings.push({
      id: "pf-alcohol",
      title: "Alcohol week load is elevated",
      titleAr: "حمل الكحول الأسبوعي مرتفع",
      aboutYou: `About ${iv.alcoholUnitsWeek} units/week on your profile.`,
      aboutYouAr: `حوالي ${iv.alcoholUnitsWeek} وحدة/أسبوع في ملفك.`,
      whatItMeansForYou:
        "Heavy weeks usually pull sleep, hormones, and liver-metabolic scores on your map.",
      whatItMeansForYouAr:
        "الأسابيع الثقيلة عادة تسحب النوم والهرمونات ودرجات الكبد الاستقلابي على خريطتك.",
      nextStep: "Set a 2 dry evenings this week; re-check index after.",
      nextStepAr: "حدّد أمسيتين جافتين هذا الأسبوع؛ أعد فحص المؤشر بعد ذلك.",
      severity: "watch",
      confidence: "medium",
      source: "nutrition",
      control: "controllable",
      category: "lifestyle_env",
      relatedBody: ["liver_metabolic", "hormones", "sleep_recovery"],
    });
  }

  if (iv.recreationalDrugFlag) {
    findings.push({
      id: "pf-drugs",
      title: "Substance flag stays private until you opt in",
      titleAr: "علم مواد يبقى خاصًا حتى توافق",
      aboutYou:
        "Your private file marked recreational / non-prescribed substance context. Not for insurance or employment.",
      aboutYouAr:
        "ملفك الخاص علّم سياق مواد ترفيهية / غير موصوفة. ليس للتأمين أو العمل.",
      whatItMeansForYou:
        "Never shared with a doctor unless you opt in (Vault / Quiet watch). No in-app judgment.",
      whatItMeansForYouAr:
        "لا يُشارك مع طبيب إلا بموافقتك (الخزنة / المراقبة). بلا حكم داخل التطبيق.",
      nextStep: "Use doctor chat only when ready; do not stop prescribed meds alone.",
      nextStepAr: "استخدم محادثة الطبيب عند الجاهزية فقط؛ لا توقف أدوية موصوفة وحدك.",
      severity: "elevated",
      confidence: "low",
      source: "self_report",
      control: "semi",
      category: "lifestyle_env",
      relatedBody: ["brain", "hormones", "reproductive"],
    });
  }

  if (iv.iief5Score !== undefined && iv.iief5Score < 22) {
    findings.push({
      id: "pf-iief",
      title: "IIEF-5 on your file needs attention",
      titleAr: "IIEF-5 في ملفك يحتاج انتباهًا",
      aboutYou: `Your IIEF-5 score is ${iv.iief5Score} (normal band 22–25).`,
      aboutYouAr: `درجة IIEF-5 لديك ${iv.iief5Score} (النطاق الطبيعي ٢٢–٢٥).`,
      whatItMeansForYou: "Symptom scale only — routes to private clinician talk, not a label.",
      whatItMeansForYouAr: "مقياس أعراض فقط — يوجّه لحديث طبيب خاص وليس لتسمية.",
      nextStep: "Open ranges page + doctor bridge when ready.",
      nextStepAr: "افتح صفحة النطاقات وجسر الطبيب عند الجاهزية.",
      severity: "watch",
      confidence: "medium",
      source: "self_report",
      control: "semi",
      category: "physio",
      relatedBody: ["reproductive", "heart"],
    });
  }

  if (iv.vitaminDNgMl !== undefined && iv.vitaminDNgMl < 30) {
    findings.push({
      id: "pf-vitd",
      title: "Vitamin D below preferred band",
      titleAr: "فيتامين د دون النطاق المفضل",
      aboutYou: `Vitamin D ${iv.vitaminDNgMl} ng/mL (preferred 30–50).`,
      aboutYouAr: `فيتامين د ${iv.vitaminDNgMl} نغ/مل (المفضل ٣٠–٥٠).`,
      whatItMeansForYou: "From your lab/home kit — supports mood, immune, circulation on your map.",
      whatItMeansForYouAr: "من مختبرك/طقمك — يدعم المزاج والمناعة والدورة على خريطتك.",
      nextStep: "Morning kit re-check + clinician advice before supplements.",
      nextStepAr: "إعادة فحص بالطقم الصباحي + نصيحة طبيب قبل المكملات.",
      severity: "watch",
      confidence: "high",
      source: "clinical_lab",
      control: "controllable",
      category: "physio",
      relatedBody: ["hormones", "muscles"],
    });
  }

  // Work heat always personal
  if (iv.outdoorHeatHours >= 3 || (iv.shiftWork && iv.heatIndexC >= 38)) {
    findings.push({
      id: "pf-job-heat",
      title: "Your job + today’s heat are priced in",
      titleAr: "عملك وحرارة اليوم مسعّران",
      aboutYou: `${persona.occupation}: outdoor heat ${iv.outdoorHeatHours}h, heat index ${iv.heatIndexC}°C, nights/week ${iv.nightShiftsPerWeek}.`,
      aboutYouAr: `${persona.occupation}: حر خارجي ${iv.outdoorHeatHours}س، مؤشر حرارة ${iv.heatIndexC}°، ليالٍ/أسبوع ${iv.nightShiftsPerWeek}.`,
      whatItMeansForYou: "Auto from work calendar + Abu Dhabi env — your index moved with this.",
      whatItMeansForYouAr: "تلقائي من تقويم العمل وبيئة أبوظبي — مؤشرك تحرك مع هذا.",
      nextStep: "Run your cooling protocol on shift; hydrate from your water log target.",
      nextStepAr: "شغّل بروتوكول التبريد في الوردية؛ ترطيب حسب هدف سجل الماء.",
      severity: "elevated",
      confidence: "high",
      source: "work_context",
      control: "semi",
      category: "work",
      relatedBody: ["reproductive", "sleep_recovery"],
    });
  }

  return findings.sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
}

function severityRank(s: PersonalFinding["severity"]) {
  return { info: 1, watch: 2, elevated: 3, urgent: 4 }[s];
}
