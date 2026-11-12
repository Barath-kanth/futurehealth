import { evaluateRisk } from "../risk-engine";
import { computeVitalityIndex } from "../vitality-analyst";
import type { ConsentCategory, IndependentVariables, Locale } from "../types";
import { runCareAgent } from "./care";
import { runIngestAgent, type IngestDocument } from "./ingest";
import { runInvestigateAgent } from "./investigate";
import { runMonitorAgent } from "./monitor";
import { persistCycle } from "./persist";
import { runNotifyAgent } from "./notify";
import { runRadarAgent } from "./radar";
import { runSetupAgent } from "./setup";
import type { AgentCycleResult, SetupConfig } from "./types";

/**
 * Full interconnected agent flow (budget GCP):
 *
 * Setup → Radar (Search) → Ingest (streams/docs/social/env)
 *      → Monitor → Investigate (Gemini) → Notify → Care (book/doctor)
 *
 * Persist → Firestore + BigQuery (or memory fallback)
 * Runtime → Cloud Run (`seedshield-agents`) or Next `/api/agents/cycle`
 * Schedule → Cloud Scheduler POST every 6h
 */
export async function runAgentCycle(opts: {
  variables: IndependentVariables;
  consents?: Record<ConsentCategory, boolean>;
  setupOverrides?: Partial<SetupConfig>;
  locale?: Locale;
  documents?: IngestDocument[];
  requestBooking?: boolean;
  bookingKind?: "primary" | "teleconsult" | "specialty";
  memberId?: string;
}): Promise<AgentCycleResult> {
  const startedAt = new Date().toISOString();
  const setup = runSetupAgent({
    ...opts.setupOverrides,
    memberId: opts.memberId ?? opts.setupOverrides?.memberId ?? "member-demo",
  });

  const radar = await runRadarAgent(setup.config);
  const ingest = runIngestAgent(
    opts.variables,
    setup.config,
    opts.documents ?? [],
  );
  const monitor = runMonitorAgent(opts.variables, setup.config);

  // Fold ingest social/env watches into monitor severity surface
  const monitorMerged = {
    ...monitor,
    findings: [...ingest.findings.filter((f) => f.severity !== "info"), ...monitor.findings],
  };

  const assessment = evaluateRisk(opts.variables, opts.consents);
  const vitalityIndex = computeVitalityIndex(opts.variables).index;

  const investigate = await runInvestigateAgent({
    radar: radar.findings,
    monitor: monitorMerged.findings,
    assessment,
    vitalityIndex,
    config: setup.config,
    locale: opts.locale,
  });

  const notify = runNotifyAgent(investigate.alerts, opts.locale ?? "en");

  const care = runCareAgent({
    triageTier: assessment.triage.tier,
    requestBooking: opts.requestBooking,
    bookingKind: opts.bookingKind,
    locale: opts.locale,
  });

  const draft: AgentCycleResult = {
    cycleId: `cycle-${Date.now()}`,
    startedAt,
    finishedAt: new Date().toISOString(),
    architectureNote:
      "Setup→Radar→Ingest→Monitor→Investigate→Notify→Care | Cloud Run + Firestore + BigQuery + Scheduler + Search + Gemini",
    persisted: { firestore: false, bigQuery: false, mode: "memory" },
    setup: { config: setup.config, findings: setup.findings },
    radar: {
      findings: radar.findings,
      searchUsed: radar.searchUsed,
      provider: radar.provider,
    },
    ingest: {
      findings: ingest.findings,
      documentsProcessed: ingest.documentsProcessed,
      streamsRead: ingest.streamsRead,
    },
    monitor: {
      findings: monitor.findings,
      thresholdsChecked: monitor.thresholdsChecked,
    },
    investigate: {
      findings: investigate.findings,
      alerts: investigate.alerts,
      geminiUsed: investigate.geminiUsed,
      triageTier: assessment.triage.tier,
    },
    notify: {
      findings: notify.findings,
      alertsDelivered: notify.alertsDelivered,
    },
    care: {
      findings: care.findings,
      booking: care.booking,
    },
  };

  const persisted = await persistCycle(draft, setup.config.memberId);
  return { ...draft, persisted };
}
