import { hasGcpCredentials } from "./adc";
import type { Locale, RiskAssessment } from "../types";

/**
 * Explainability layer — REWORD ONLY.
 * Canonical content always comes from `localExplain` (rule-engine fields).
 * Gemini may paraphrase that text; it must not invent medical claims.
 * On API failure mid-demo, callers always receive the same local content.
 */
export async function explainAssessment(opts: {
  assessment: RiskAssessment;
  personaName?: string;
  locale?: Locale;
  /** Force local path (demo “API failed” switch). */
  forceLocal?: boolean;
}): Promise<{
  narrative: string;
  provider: "vertex-ai" | "local-fallback";
  model: string;
  canonical: string;
  paraphrased: boolean;
}> {
  const locale = opts.locale ?? "en";
  const canonical = localExplain(opts.assessment, opts.personaName, locale);
  const project = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
  const modelName = process.env.VERTEX_MODEL || "gemini-2.0-flash-001";

  if (
    !opts.forceLocal &&
    project &&
    hasGcpCredentials()
  ) {
    try {
      const { VertexAI } = await import("@google-cloud/vertexai");
      const vertex = new VertexAI({ project, location });
      const model = vertex.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.2, maxOutputTokens: 512 },
      });

      const prompt = buildRewordPrompt(canonical, locale);
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const raw =
        result.response.candidates?.[0]?.content?.parts
          ?.map((p) => ("text" in p ? p.text : ""))
          .join("\n")
          .trim() || "";

      const safe = sanitizeReword(raw, canonical);
      return {
        narrative: safe,
        provider: "vertex-ai",
        model: modelName,
        canonical,
        paraphrased: safe !== canonical,
      };
    } catch (err) {
      console.warn("Vertex AI unavailable, using local fallback", err);
    }
  }

  return {
    narrative: canonical,
    provider: "local-fallback",
    model: "seedshield-explain-v1",
    canonical,
    paraphrased: false,
  };
}

function buildRewordPrompt(canonical: string, locale: Locale) {
  return `You are a STRICT rewriter for SeedShield.
TASK: Paraphrase the CANONICAL text below for clarity in ${locale === "ar" ? "Arabic" : "English"}.
HARD RULES:
- Use ONLY facts present in CANONICAL. Do not add diagnoses, drugs, doses, prognosis, or new medical claims.
- Do not invent red flags, lab values, or pathways that are not listed.
- Keep the exact triage next-step wording intent.
- Keep the screening≠diagnosis disclaimer.
- If you cannot stay within these rules, output the CANONICAL text unchanged.

CANONICAL:
"""
${canonical}
"""`;
}

/** Reject rewrites that introduce forbidden claim patterns; fall back to canonical. */
export function sanitizeReword(raw: string, canonical: string): string {
  if (!raw || raw.length < 40) return canonical;
  const lower = raw.toLowerCase();
  const banned = [
    "you have infertility",
    "you are infertile",
    "diagnosed with",
    "diagnosis of",
    "start testosterone",
    "stop trt",
    "stop your medication",
    "prescribe",
    "you need ivf",
    "cancer",
    "أنت عقيم",
    "تشخيصك",
    "ابدأ التستوستيرون",
    "أوقف الدواء",
  ];
  if (banned.some((b) => lower.includes(b))) return canonical;
  // Require key triage/disclaimer anchors from canonical when possible
  const mustHints = ["screening", "diagnosis", "فحص", "تشخيص"];
  const hasDisclaimer = mustHints.some((h) => lower.includes(h));
  if (!hasDisclaimer && /screening|diagnosis|فحص|تشخيص/i.test(canonical)) {
    return `${raw.trim()}\n\n${canonical.split("\n\n").pop()}`;
  }
  return raw.trim();
}

/** Deterministic narrative built only from rule-engine assessment fields. */
export function localExplain(
  assessment: RiskAssessment,
  personaName: string | undefined,
  locale: Locale,
): string {
  const top = assessment.signals.slice(0, 5);
  const mods = assessment.modules.slice(0, 3);
  const flags = assessment.triage.redFlags.slice(0, 5);

  if (locale === "ar") {
    return [
      `ملخص من محرك القواعد لـ ${personaName ?? "المستخدم"}: حمل الفحص ${assessment.overallScore}/100 · المسار «${assessment.triage.labelAr}».`,
      top.length
        ? `إشارات المحرك فقط: ${top.map((s) => `${s.titleAr} [${s.severity}/${s.confidence}]`).join("؛ ")}.`
        : "لا إشارات مرتفعة من المحرك حاليًا.",
      flags.length ? `علامات حمراء من القواعد: ${flags.join("؛ ")}.` : "",
      mods.length
        ? `وحدات مفعّلة من القواعد: ${mods.map((m) => m.titleAr).join("، ")}.`
        : "",
      assessment.triage.requiresHumanReview
        ? "بوابة مراجعة بشرية: مطلوبة قبل أي إحالة تخصصية."
        : "لا إحالة تخصصية مطلوبة من القواعد الحالية.",
      "هذا إعادة صياغة لمخرجات المحرك فقط — لا ادعاءات طبية جديدة.",
      assessment.disclaimer,
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  return [
    `Rule-engine summary for ${personaName ?? "you"}: screening load ${assessment.overallScore}/100 · next step «${assessment.triage.label}».`,
    top.length
      ? `Engine signals only: ${top.map((s) => `${s.title} [${s.severity}/${s.confidence}; ${s.source}]`).join("; ")}.`
      : "No elevated engine signals right now.",
    flags.length ? `Rule red flags: ${flags.join("; ")}.` : "",
    mods.length
      ? `Rule-activated modules: ${mods.map((m) => m.title).join(", ")}.`
      : "",
    assessment.triage.requiresHumanReview
      ? "Human review gate: REQUIRED before any specialty referral."
      : "No specialty referral required by current rules.",
    "This text only rewords rule-engine outputs — no new medical claims.",
    assessment.disclaimer,
  ]
    .filter(Boolean)
    .join("\n\n");
}
