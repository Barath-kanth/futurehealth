import { vertexInit, vertexModelName } from "../gcp/adc";
import type { RiskAssessment } from "../types";
import type { AgentAlert, AgentFinding, SetupConfig } from "./types";

/**
 * Investigate agent — links Radar world signals + Monitor breaches to
 * evidence-backed alerts for the member's pathway (Amri-style impact chain).
 * Uses Gemini when available for chain narrative; otherwise deterministic join.
 */
export async function runInvestigateAgent(opts: {
  radar: AgentFinding[];
  monitor: AgentFinding[];
  assessment: RiskAssessment;
  vitalityIndex: number;
  config: SetupConfig;
  locale?: "en" | "ar";
}): Promise<{ findings: AgentFinding[]; alerts: AgentAlert[]; geminiUsed: boolean }> {
  const locale = opts.locale ?? "en";
  const monActive = opts.monitor.filter((f) => f.severity !== "info");
  const findings: AgentFinding[] = [];
  const alerts: AgentAlert[] = [];

  // Deterministic evidence chain (always)
  if (monActive.length && opts.radar.length) {
    const chainId = `inv-chain-${Date.now()}`;
    const title =
      locale === "ar"
        ? "سلسلة تأثير: حدث عالمي/بحث ↔ عتبة شخصية"
        : "Impact chain: world research ↔ personal threshold";
    const body = buildChainNarrative(opts, locale);
    findings.push({
      id: chainId,
      agent: "investigate",
      title,
      titleAr: title,
      summary: body,
      summaryAr: body,
      severity: monActive.some((m) => m.severity === "elevated") ? "elevated" : "watch",
      evidence: [
        ...monActive.flatMap((m) => m.evidence).slice(0, 4),
        ...opts.radar.flatMap((r) => r.evidence).slice(0, 3),
        `lockedTriage=${opts.assessment.triage.tier}`,
        `mvi=${opts.vitalityIndex}`,
      ],
      sources: [
        { label: "Monitor", kind: "stream" },
        { label: "Radar", kind: "search" },
        { label: "Safe Triage (locked)", kind: "rule" },
      ],
      relatedProducts: productMap(opts.assessment.triage.tier),
      at: new Date().toISOString(),
      simulated: opts.radar.some((r) => r.simulated),
    });

    alerts.push({
      id: `alert-${Date.now()}`,
      title:
        locale === "ar"
          ? "تنبيه مبكر مدعوم بالأدلة"
          : "Evidence-backed early warning",
      titleAr: "تنبيه مبكر مدعوم بالأدلة",
      body,
      bodyAr: body,
      severity: monActive.some((m) => m.severity === "elevated") ? "elevated" : "watch",
      evidenceIds: [chainId, ...monActive.map((m) => m.id)],
      triageHint: opts.assessment.triage.tier,
      audience:
        opts.assessment.triage.tier === "urgent" ||
        opts.assessment.triage.requiresHumanReview
          ? "both"
          : "patient",
      channels: ["in_app", "email_sim"],
      at: new Date().toISOString(),
    });
  } else if (monActive.length) {
    alerts.push({
      id: `alert-mon-${Date.now()}`,
      title:
        locale === "ar" ? "تجاوز حد شخصي" : "Personal limit crossed",
      titleAr: "تجاوز حد شخصي",
      body: monActive.map((m) => m.title).join("; "),
      bodyAr: monActive.map((m) => m.titleAr).join("؛ "),
      severity: "watch",
      evidenceIds: monActive.map((m) => m.id),
      triageHint: opts.assessment.triage.tier,
      audience: "patient",
      channels: ["in_app"],
      at: new Date().toISOString(),
    });
    findings.push({
      id: `inv-mon-only-${Date.now()}`,
      agent: "investigate",
      title: "Personal threshold breach without new world hit",
      titleAr: "تجاوز عتبة شخصية دون حدث عالمي جديد",
      summary:
        "Monitor flags stand alone. Locked triage remains source of truth. Screening ≠ diagnosis.",
      summaryAr:
        "علامات المراقب وحدها. الفرز المقفل يبقى المرجع. فحص ≠ تشخيص.",
      severity: "watch",
      evidence: monActive.flatMap((m) => m.evidence).slice(0, 5),
      sources: [{ label: "Monitor", kind: "stream" }],
      relatedProducts: productMap(opts.assessment.triage.tier),
      at: new Date().toISOString(),
      simulated: false,
    });
  } else {
    findings.push({
      id: `inv-quiet-${Date.now()}`,
      agent: "investigate",
      title: "No actionable early-warning chain",
      titleAr: "لا سلسلة إنذار مبكر قابلة للتنفيذ",
      summary: "Quiet cycle — continue consented watch.",
      summaryAr: "دورة هادئة — استمر بالمراقبة الصامتة.",
      severity: "info",
      evidence: [`triage=${opts.assessment.triage.tier}`],
      sources: [{ label: "Investigate", kind: "rule" }],
      relatedProducts: ["Silent monitoring"],
      at: new Date().toISOString(),
      simulated: false,
    });
  }

  // Optional Gemini enrichment of the chain (does not override triage)
  let geminiUsed = false;
  const project = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
  const hasAdc =
    Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS) ||
    Boolean(process.env.K_SERVICE) || // Cloud Run workload identity
    Boolean(process.env.FIREBASE_CONFIG);
  if (project && hasAdc && (monActive.length > 0 || opts.radar.length > 0)) {
    try {
      const enriched = await enrichWithGemini(opts, findings[0]!);
      if (enriched) {
        findings[0] = enriched;
        geminiUsed = true;
        if (alerts[0]) {
          alerts[0] = { ...alerts[0], body: enriched.summary, bodyAr: enriched.summaryAr };
        }
      }
    } catch (err) {
      console.warn("Investigate Gemini enrich failed", err);
    }
  }

  return { findings, alerts, geminiUsed };
}

function productMap(tier: string): string[] {
  switch (tier) {
    case "urgent":
      return ["Urgent assessment", "Care access"];
    case "andrology_urology":
    case "fertility_services":
      return ["Andrology pathway", "Human review gate"];
    case "primary_care":
      return ["Primary care booking", "Teleconsult"];
    default:
      return ["Self-care", "Reminders"];
  }
}

function buildChainNarrative(
  opts: {
    radar: AgentFinding[];
    monitor: AgentFinding[];
    assessment: RiskAssessment;
    vitalityIndex: number;
  },
  locale: "en" | "ar",
): string {
  const mon = opts.monitor
    .filter((m) => m.severity !== "info")
    .map((m) => m.title)
    .join("; ");
  const rad = opts.radar
    .slice(0, 2)
    .map((r) => r.title)
    .join("; ");
  if (locale === "ar") {
    return `المراقب: ${mon || "—"}. الرادار: ${rad || "—"}. المسار المقفل اليوم: ${opts.assessment.triage.labelAr}. مؤشر توضيحي ${opts.vitalityIndex}. فحص فقط — ليس تشخيصًا.`;
  }
  return `Monitor: ${mon || "—"}. Radar: ${rad || "—"}. Locked pathway today: ${opts.assessment.triage.label}. Illustrative MVI ${opts.vitalityIndex}. Screening only — not a diagnosis.`;
}

async function enrichWithGemini(
  opts: {
    radar: AgentFinding[];
    monitor: AgentFinding[];
    assessment: RiskAssessment;
    vitalityIndex: number;
    locale?: "en" | "ar";
  },
  base: AgentFinding,
): Promise<AgentFinding | null> {
  const modelName = vertexModelName();
  const project = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT!;
  const { VertexAI } = await import("@google-cloud/vertexai");
  const vertex = new VertexAI(vertexInit(project));
  const model = vertex.getGenerativeModel({
    model: modelName,
    generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
  });

  const prompt = `You are SeedShield Investigate agent (Amri-style early warning for male reproductive HEALTH SCREENING).
Write a 3-sentence impact chain in ${opts.locale === "ar" ? "Arabic" : "English"}.
HARD: no diagnosis, no drugs, no infertility claims. Keep locked triage ${opts.assessment.triage.tier}.
Monitor: ${JSON.stringify(opts.monitor.map((m) => m.title))}
Radar: ${JSON.stringify(opts.radar.map((r) => r.title).slice(0, 3))}
MVI: ${opts.vitalityIndex}
Return plain text only.`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });
  const text =
    result.response.candidates?.[0]?.content?.parts
      ?.map((p) => ("text" in p ? p.text : ""))
      .join("\n")
      .trim() || "";
  if (!text || /infertil|diagnos|prescribe/i.test(text)) return null;
  return {
    ...base,
    summary: text,
    summaryAr: text,
    simulated: false,
  };
}
