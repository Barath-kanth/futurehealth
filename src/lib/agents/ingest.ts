import type { IndependentVariables } from "../types";
import type { AgentFinding, SetupConfig } from "./types";

export type IngestDocument = {
  id: string;
  title: string;
  kind: "lab_pdf" | "note" | "consent_form";
  text: string;
};

/**
 * Ingest agent — realtime streams + optional documents.
 * Creatively folds social pressure, work stress, media load, env into one intake.
 */
export function runIngestAgent(
  iv: IndependentVariables,
  config: SetupConfig,
  documents: IngestDocument[] = [],
): { findings: AgentFinding[]; documentsProcessed: number; streamsRead: number } {
  const findings: AgentFinding[] = [];
  let streamsRead = 0;

  const streamBits = [
    `heat=${iv.heatIndexC}°C`,
    `aqi=${iv.aqi}`,
    `sleep=${iv.sleepHours}h`,
    `stress=${iv.occupationalStress}`,
    `social=${iv.socialPressureIndex}`,
    `media=${iv.mediaIntensity}`,
    `shift=${iv.shiftWork}`,
  ];
  streamsRead = streamBits.length;

  findings.push({
    id: `ingest-live-${Date.now()}`,
    agent: "ingest",
    title: "Live streams read",
    titleAr: "قراءة التيارات الحية",
    summary: `Realtime intake for ${config.memberId}: ${streamBits.join(" · ")}`,
    summaryAr: `استقبال حي لـ ${config.memberId}: ${streamBits.join(" · ")}`,
    severity: "info",
    evidence: streamBits,
    sources: [
      { label: "Watch / phone / env", kind: "stream" },
      { label: "Social & work context", kind: "social" },
    ],
    relatedProducts: ["Monitor", "Quiet watch"],
    at: new Date().toISOString(),
    simulated: false,
  });

  // Creative social × environment fusion cue
  if (iv.socialPressureIndex >= config.socialPressureAlert && iv.aqi >= 80) {
    findings.push({
      id: `ingest-social-env-${Date.now()}`,
      agent: "ingest",
      title: "Social pressure × air quality load",
      titleAr: "ضغط اجتماعي × حمل الهواء",
      summary:
        "High privacy/social pressure combined with elevated AQI — keep sharing private; prefer indoor recovery windows.",
      summaryAr:
        "ضغط اجتماعي/خصوصية مرتفع مع هواء مرتفع — أبقِ المشاركة خاصة؛ فضّل نوافذ تعافٍ داخلية.",
      severity: "watch",
      evidence: [
        `socialPressureIndex=${iv.socialPressureIndex}`,
        `aqi=${iv.aqi}`,
      ],
      sources: [
        { label: "Social context", kind: "social" },
        { label: "Environment feed", kind: "stream" },
      ],
      relatedProducts: ["Privacy vault", "Reminders"],
      at: new Date().toISOString(),
      simulated: false,
    });
  }

  if (iv.moneyStress >= 65 || iv.businessStress >= 65) {
    findings.push({
      id: `ingest-money-${Date.now()}`,
      agent: "ingest",
      title: "Money / business stress on file",
      titleAr: "ضغط مال/عمل في الملف",
      summary:
        "Financial stress can drag sleep and recovery — Ingest passes this to Monitor (not a diagnosis).",
      summaryAr:
        "ضغط المال قد يسحب النوم والتعافي — يمرَّر للمراقب (ليس تشخيصًا).",
      severity: "watch",
      evidence: [
        `moneyStress=${iv.moneyStress}`,
        `businessStress=${iv.businessStress}`,
      ],
      sources: [{ label: "Life context stream", kind: "social" }],
      relatedProducts: ["Do now", "AI guide"],
      at: new Date().toISOString(),
      simulated: false,
    });
  }

  for (const doc of documents) {
    findings.push({
      id: `ingest-doc-${doc.id}`,
      agent: "ingest",
      title: `Document: ${doc.title}`,
      titleAr: `مستند: ${doc.title}`,
      summary: doc.text.slice(0, 220),
      summaryAr: doc.text.slice(0, 220),
      severity: "info",
      evidence: [`kind=${doc.kind}`, `chars=${doc.text.length}`],
      sources: [{ label: doc.title, kind: "document" }],
      relatedProducts: ["Investigate"],
      at: new Date().toISOString(),
      simulated: true,
    });
  }

  return {
    findings,
    documentsProcessed: documents.length,
    streamsRead,
  };
}
