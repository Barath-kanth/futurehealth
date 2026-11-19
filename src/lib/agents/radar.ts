import { curatedResearch, searchWorldwideResearch } from "./search";
import type { AgentFinding, SetupConfig } from "./types";

/** Radar agent — monitors world research / events relevant to male vitality screening. */
export async function runRadarAgent(config: SetupConfig): Promise<{
  findings: AgentFinding[];
  searchUsed: boolean;
  provider: string;
}> {
  // Live grounding bills per search (Vertex AI "Grounding with Google Search").
  // Off by default; the curated stubs are labelled as such in the UI.
  const { hits, searchUsed, provider } = config.googleSearchEnabled
    ? await searchWorldwideResearch(config.researchTopics)
    : curatedResearch(config.researchTopics);

  const findings: AgentFinding[] = hits.map((h, i) => ({
    id: `radar-${Date.now()}-${i}`,
    agent: "radar" as const,
    title: h.title,
    titleAr: h.title,
    summary: h.snippet,
    summaryAr: h.snippet,
    severity: "info" as const,
    evidence: [`query=${h.query}`, h.url ? `url=${h.url}` : "url=n/a"],
    sources: [
      {
        label: h.simulated ? "Curated public stub" : "Google Search / grounding",
        url: h.url,
        kind: "search" as const,
      },
    ],
    relatedProducts: ["Investigate", "Safe Triage context"],
    at: new Date().toISOString(),
    simulated: h.simulated,
  }));

  if (!findings.length) {
    findings.push({
      id: `radar-empty-${Date.now()}`,
      agent: "radar",
      title: "No new research hits this cycle",
      titleAr: "لا نتائج بحث جديدة في هذه الدورة",
      summary: "Radar completed; enable Google Search or check topics in Setup.",
      summaryAr: "أكمل الرادار؛ فعّل بحث Google أو راجع المواضيع في الإعداد.",
      severity: "info",
      evidence: [`topics=${config.researchTopics.length}`],
      sources: [{ label: "Radar", kind: "search" }],
      relatedProducts: ["Setup"],
      at: new Date().toISOString(),
      simulated: true,
    });
  }

  return { findings, searchUsed, provider };
}
