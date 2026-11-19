import { geminiEnabled, vertexInit, vertexFastModelName } from "../gcp/adc";
/**
 * Google Search / research retrieval for Radar.
 * Prefers Vertex Gemini + Google Search grounding when credentials exist.
 * Falls back to curated public research stubs labeled simulated.
 */

export type SearchHit = {
  title: string;
  snippet: string;
  url?: string;
  query: string;
  simulated: boolean;
};

const CURATED: Record<string, SearchHit[]> = {
  heat: [
    {
      title: "WHO laboratory manual for the examination of human semen (6th ed.) — thermal context",
      snippet:
        "Semen analysis standards; elevated scrotal temperature is discussed in reproductive health literature as a reversible contributor to parameter stress.",
      url: "https://www.who.int/publications/i/item/9789240030787",
      query: "male reproductive heat WHO",
      simulated: true,
    },
  ],
  sdf: [
    {
      title: "Sperm DNA fragmentation — clinical discussion (ASRM / andrology literature)",
      snippet:
        "SDF testing may be considered in selected evaluation pathways; interpretation requires clinician judgment — not consumer self-diagnosis.",
      url: "https://www.asrm.org/",
      query: "sperm DNA fragmentation clinical guidance",
      simulated: true,
    },
  ],
  aqi: [
    {
      title: "Air pollution and reproductive health — emerging evidence reviews",
      snippet:
        "Reviews associate particulate exposure with oxidative stress pathways relevant to male reproductive biomarkers; causal claims remain research-grade.",
      query: "air quality male reproductive health",
      simulated: true,
    },
  ],
  aua: [
    {
      title: "AUA / ASRM male infertility Diagnosis and Treatment guideline (2020/2021)",
      snippet:
        "Evaluation includes reproductive history, semen analysis, and selective endocrine/imaging workup — clinician-directed, not app-diagnosed.",
      url: "https://www.auanet.org/guidelines-and-quality/guidelines/male-infertility",
      query: "AUA male infertility evaluation",
      simulated: true,
    },
  ],
};

function pickCurated(topics: string[]): SearchHit[] {
  const hits: SearchHit[] = [];
  for (const t of topics) {
    const key = t.toLowerCase();
    if (key.includes("heat") || key.includes("who")) hits.push(...(CURATED.heat ?? []));
    if (key.includes("dna") || key.includes("fragment")) hits.push(...(CURATED.sdf ?? []));
    if (key.includes("air") || key.includes("abu dhabi")) hits.push(...(CURATED.aqi ?? []));
    if (key.includes("aua") || key.includes("infertility")) hits.push(...(CURATED.aua ?? []));
  }
  const seen = new Set<string>();
  return hits.filter((h) => {
    if (seen.has(h.title)) return false;
    seen.add(h.title);
    return true;
  });
}

/** No-cost path: curated, clearly labelled public-source stubs (no Google Search calls). */
export function curatedResearch(topics: string[]): {
  hits: SearchHit[];
  provider: string;
  searchUsed: boolean;
} {
  return {
    hits: pickCurated(topics),
    provider: "curated-public-stubs",
    searchUsed: false,
  };
}

/** Live Google Search via Gemini grounding when Vertex is configured. */
export async function searchWorldwideResearch(topics: string[]): Promise<{
  hits: SearchHit[];
  provider: string;
  searchUsed: boolean;
}> {
  const project = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
  const modelName = vertexFastModelName();

  if (project && geminiEnabled()) {
    try {
      const { VertexAI } = await import("@google-cloud/vertexai");
      const vertex = new VertexAI(vertexInit(project));
      const model = vertex.getGenerativeModel({
        model: modelName,
        tools: [{ googleSearch: {} } as never],
        generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
      });

      const query = topics.slice(0, 3).join("; ");
      const prompt = `Search recent public medical/scientific sources about: ${query}.
Return 3 short findings for a male reproductive HEALTH SCREENING early-warning system (not diagnosis).
Format as JSON array: [{"title":"...","snippet":"...","url":"..."}]
No treatment prescriptions. No infertility diagnosis claims.`;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const raw =
        result.response.candidates?.[0]?.content?.parts
          ?.map((p) => ("text" in p ? p.text : ""))
          .join("\n")
          .trim() || "";

      const parsed = parseHits(raw, query);
      if (parsed.length) {
        return {
          hits: parsed,
          provider: `vertex-ai+google-search:${modelName}`,
          searchUsed: true,
        };
      }
    } catch (err) {
      console.warn("Google Search grounding unavailable", err);
    }
  }

  return {
    hits: pickCurated(topics),
    provider: "curated-public-stubs",
    searchUsed: false,
  };
}

function parseHits(raw: string, query: string): SearchHit[] {
  try {
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");
    if (start < 0 || end < 0) return [];
    const arr = JSON.parse(cleaned.slice(start, end + 1)) as {
      title?: string;
      snippet?: string;
      url?: string;
    }[];
    return arr
      .filter((x) => x.title && x.snippet)
      .slice(0, 4)
      .map((x) => ({
        title: String(x.title),
        snippet: String(x.snippet),
        url: x.url ? String(x.url) : undefined,
        query,
        simulated: false,
      }));
  } catch {
    return [];
  }
}
