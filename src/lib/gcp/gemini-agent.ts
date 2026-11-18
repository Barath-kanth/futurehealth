import { hasGcpCredentials, vertexInit, vertexModelName } from "./adc";
import type {
  IndependentVariables,
  Locale,
  RiskAssessment,
} from "../types";
import type { computeSensitivityTable } from "../dynamic-sensitivity";

export type GeminiAgentResult = {
  available: boolean;
  provider: "vertex-ai" | "unavailable";
  model: string;
  /** Structured foresight — only present when Gemini ran successfully. */
  agent?: {
    headline: string;
    interactionStory: string;
    pathwayOutlook: {
      tier: string;
      probabilityNote: string;
    }[];
    rankedLevers: {
      lever: string;
      whyItMattersTogether: string;
      expectedDirection: string;
    }[];
    sevenDayStewardship: string[];
    whatNotToFear: string;
    disclaimer: string;
  };
  rawText?: string;
  reasonIfUnavailable?: string;
};

type SensitivityPayload = ReturnType<typeof computeSensitivityTable>;

/**
 * Gemini-ONLY Dynamic Vitality Agent.
 * This is the innovation layer: multi-factor interaction reasoning, soft pathway
 * outlook, and stewardship planning that deterministic rules cannot produce.
 *
 * Safety floor stays outside this function (risk-engine triage).
 * If Vertex is missing or fails → available:false (no fake local "AI").
 */
export async function runGeminiVitalityAgent(opts: {
  variables: IndependentVariables;
  assessment: RiskAssessment;
  sensitivity: SensitivityPayload;
  vitalityIndex: number;
  culturalTone: "stewardship" | "direct" | "clinical";
  locale?: Locale;
}): Promise<GeminiAgentResult> {
  const locale = opts.locale ?? "en";
  const project = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
  const modelName = vertexModelName();

  if (!project || !hasGcpCredentials()) {
    return {
      available: false,
      provider: "unavailable",
      model: modelName,
      reasonIfUnavailable:
        "Gemini Dynamic Agent requires Vertex AI credentials. Deterministic triage still works; this foresight feature is Gemini-only by design.",
    };
  }

  try {
    const { VertexAI } = await import("@google-cloud/vertexai");
    const vertex = new VertexAI(vertexInit(project));
    const model = vertex.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    });

    const prompt = buildAgentPrompt(opts, locale);
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const raw =
      result.response.candidates?.[0]?.content?.parts
        ?.map((p) => ("text" in p ? p.text : ""))
        .join("\n")
        .trim() || "";

    const parsed = parseAgentJson(raw);
    if (!parsed) {
      return {
        available: false,
        provider: "unavailable",
        model: modelName,
        rawText: raw.slice(0, 500),
        reasonIfUnavailable:
          "Gemini returned unparseable output. Deterministic triage unchanged; agent foresight withheld rather than inventing claims.",
      };
    }

    if (failsSafety(parsed)) {
      return {
        available: false,
        provider: "unavailable",
        model: modelName,
        rawText: raw.slice(0, 500),
        reasonIfUnavailable:
          "Gemini output failed safety filter (diagnosis / medication advice). Agent result withheld.",
      };
    }

    return {
      available: true,
      provider: "vertex-ai",
      model: modelName,
      agent: {
        ...parsed,
        disclaimer:
          parsed.disclaimer ||
          "Screening foresight only — not a diagnosis. Deterministic Safe Triage remains the clinical pathway source of truth.",
      },
      rawText: raw,
    };
  } catch (err) {
    console.warn("Gemini agent unavailable", err);
    return {
      available: false,
      provider: "unavailable",
      model: modelName,
      reasonIfUnavailable:
        "Vertex AI call failed. Triage rules still run locally; Gemini foresight is offline (by design — no simulated agent).",
    };
  }
}

function buildAgentPrompt(
  opts: {
    variables: IndependentVariables;
    assessment: RiskAssessment;
    sensitivity: SensitivityPayload;
    vitalityIndex: number;
    culturalTone: "stewardship" | "direct" | "clinical";
  },
  locale: Locale,
) {
  const lockedTriage = opts.assessment.triage.tier;
  const signals = opts.assessment.signals.slice(0, 8).map((s) => ({
    id: s.id,
    title: s.title,
    severity: s.severity,
    domain: s.domain,
    drivers: s.drivers,
  }));

  const payload = {
    lockedDeterministicTriage: lockedTriage,
    lockedTriageLabel: opts.assessment.triage.label,
    vitalityIndex: opts.vitalityIndex,
    culturalTone: opts.culturalTone,
    topSignals: signals,
    redFlags: opts.assessment.triage.redFlags,
    sensitivity: {
      baselineIndex: opts.sensitivity.baselineIndex,
      baselineTriage: opts.sensitivity.baselineTriage,
      topImprove: opts.sensitivity.topImprove,
      interactionGap: opts.sensitivity.interactionGap,
      sampleDeltas: opts.sensitivity.deltas.filter((d) => d.direction === "improve").slice(0, 7),
    },
    contextSnapshot: {
      heatIndexC: opts.variables.heatIndexC,
      aqi: opts.variables.aqi,
      sleepHours: opts.variables.sleepHours,
      occupationalStress: opts.variables.occupationalStress,
      shiftWork: opts.variables.shiftWork,
      smokingLoad: opts.variables.smokingLoad,
      alcoholUnitsWeek: opts.variables.alcoholUnitsWeek,
      bmi: opts.variables.bmi,
      hydrationLiters: opts.variables.hydrationLiters,
    },
  };

  return `You are SeedShield's Gemini Dynamic Vitality Agent for Gulf male reproductive HEALTH SCREENING (not fertility coaching, not diagnosis).

LANGUAGE: write all string fields in ${locale === "ar" ? "formal Arabic" : "clear English"}.
TONE: ${opts.culturalTone} (stewardship = responsibility without family-pressure; direct = short; clinical = precise boundaries).

YOUR JOB (innovation rules cannot do):
1) Explain MULTI-FACTOR INTERACTIONS using the sensitivity numbers (e.g. heat×sleep synergy).
2) Give a SOFT pathway outlook — probabilistic language about how the NEXT STEP might shift IF conditions persist or improve — WITHOUT contradicting lockedDeterministicTriage as today's binding pathway.
3) Rank levers by how they MATTER TOGETHER (interactions), not only single-factor deltas.
4) Produce a practical 7-day stewardship plan (no drugs, no start/stop medication).
5) Reduce anxiety: say what NOT to over-interpret.

HARD SAFETY:
- NEVER diagnose infertility, name disease, prescribe, or advise starting/stopping medication (including TRT).
- NEVER invent lab values or red flags not in the JSON.
- NEVER claim fertility outcomes or pregnancy chances.
- ALWAYS keep screening ≠ diagnosis.
- lockedDeterministicTriage is FIXED for today — you may discuss outlook, not override it.

INPUT JSON:
${JSON.stringify(payload)}

Return ONLY valid JSON matching:
{
  "headline": "string",
  "interactionStory": "string (2-4 sentences on factor interactions)",
  "pathwayOutlook": [
    { "tier": "self_care|primary_care|andrology_urology|fertility_services|urgent|insufficient_info", "probabilityNote": "string soft probability / condition" }
  ],
  "rankedLevers": [
    { "lever": "string", "whyItMattersTogether": "string", "expectedDirection": "string" }
  ],
  "sevenDayStewardship": ["day1...", "day2...", "...up to 7"],
  "whatNotToFear": "string",
  "disclaimer": "string screening≠diagnosis"
}`;
}

type AgentBody = NonNullable<GeminiAgentResult["agent"]>;

function parseAgentJson(raw: string): AgentBody | null {
  try {
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const data = JSON.parse(cleaned) as Partial<AgentBody>;
    if (!data.headline || !data.interactionStory || !Array.isArray(data.rankedLevers)) {
      return null;
    }
    return {
      headline: String(data.headline),
      interactionStory: String(data.interactionStory),
      pathwayOutlook: Array.isArray(data.pathwayOutlook)
        ? data.pathwayOutlook.map((p) => ({
            tier: String(p.tier ?? ""),
            probabilityNote: String(p.probabilityNote ?? ""),
          }))
        : [],
      rankedLevers: data.rankedLevers.map((r) => ({
        lever: String(r.lever ?? ""),
        whyItMattersTogether: String(r.whyItMattersTogether ?? ""),
        expectedDirection: String(r.expectedDirection ?? ""),
      })),
      sevenDayStewardship: Array.isArray(data.sevenDayStewardship)
        ? data.sevenDayStewardship.map(String)
        : [],
      whatNotToFear: String(data.whatNotToFear ?? ""),
      disclaimer: String(data.disclaimer ?? ""),
    };
  } catch {
    return null;
  }
}

function failsSafety(agent: AgentBody): boolean {
  const blob = JSON.stringify(agent).toLowerCase();
  const banned = [
    "you are infertile",
    "you have infertility",
    "diagnosed with",
    "prescribe",
    "start testosterone",
    "stop trt",
    "stop your medication",
    "you need ivf",
    "pregnancy chance",
    "أنت عقيم",
    "تشخيصك",
    "أوقف الدواء",
    "ابدأ التستوستيرون",
  ];
  return banned.some((b) => blob.includes(b));
}
