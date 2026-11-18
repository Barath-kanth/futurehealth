/** Small shared Arabic labels for chips and status words that were left in English. */

const LEVEL: Record<string, string> = { info: "معلومة", watch: "مراقبة", urgent: "عاجل" };
const TIME: Record<string, string> = {
  Now: "الآن",
  "Just now": "الآن",
  "Live env": "بيئة حية",
  Today: "اليوم",
};
const RELIABILITY: Record<string, string> = { high: "موثوقية عالية", medium: "موثوقية متوسطة", low: "موثوقية منخفضة" };
const IMPACT: Record<string, string> = { high: "أثر كبير", medium: "أثر متوسط", low: "أثر صغير" };
const EFFORT: Record<string, string> = { easy: "سهل", moderate: "متوسط الجهد", clinical: "مع طبيب" };
const FRESHNESS: Record<string, string> = { live: "مباشر", today: "اليوم", monthly: "شهري", stale: "قديم", this_week: "هذا الأسبوع" };

export const levelWord = (v: string, ar: boolean) => (ar ? (LEVEL[v] ?? v) : v);
export const timeWord = (v: string, ar: boolean) => (ar ? (TIME[v] ?? v) : v);
export const reliabilityWord = (v: string, ar: boolean) => (ar ? (RELIABILITY[v] ?? v) : `${v} reliability`);
export const impactWord = (v: string, ar: boolean) => (ar ? (IMPACT[v] ?? v) : `${v} impact`);
export const effortWord = (v: string, ar: boolean) => (ar ? (EFFORT[v] ?? v) : v);
export const freshnessWord = (v: string, ar: boolean) => (ar ? (FRESHNESS[v] ?? v) : v);

export const DISCLAIMER_AR =
  "إشارات فحص فقط — ليست تشخيصًا. الإحالة التخصصية تتطلب مراجعة سريرية بشرية. لا يصدر SeedShield تشخيصًا أبدًا.";
export const DISCLAIMER_EN =
  "Screening signals only — not a diagnosis. Specialist referral requires human clinical review. SeedShield never issues a diagnosis.";

export const CHAT_GREETING_PREFIX = "Hi — I’m SeedShield’s AI screening guide";
export const CHAT_GREETING_EN =
  "Hi — I’m SeedShield’s AI screening guide, not a clinician. My answers come from Gemini inside fixed safety rules and use only the data you consent to. Screening ≠ diagnosis. Open Safe Triage for your pathway.";
export const chatGreetingAr = () =>
  `مرحبًا — أنا مرشد SeedShield الذكي للفحص، ولست طبيبًا. تأتي إجاباتي من Gemini ضمن قواعد أمان ثابتة وتعتمد فقط على البيانات التي توافق عليها. الفحص ليس تشخيصًا. افتح «خطوتي» لترى مسارك.`;
