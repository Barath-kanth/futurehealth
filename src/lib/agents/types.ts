import type { TriageTier } from "../types";

/** Six interconnected SeedShield agents (Amri-style EWS + care loop). */
export type AgentId =
  | "setup"
  | "radar"
  | "ingest"
  | "monitor"
  | "investigate"
  | "notify"
  | "care";

export type AgentFinding = {
  id: string;
  agent: AgentId;
  title: string;
  titleAr: string;
  summary: string;
  summaryAr: string;
  severity: "info" | "watch" | "elevated" | "urgent";
  evidence: string[];
  sources: {
    label: string;
    url?: string;
    kind: "search" | "stream" | "rule" | "config" | "document" | "social";
  }[];
  relatedProducts: string[];
  at: string;
  simulated: boolean;
};

export type AgentAlert = {
  id: string;
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
  severity: "watch" | "elevated" | "urgent";
  evidenceIds: string[];
  triageHint?: TriageTier;
  audience: "patient" | "doctor" | "both";
  channels: ("in_app" | "email_sim" | "sms_sim")[];
  at: string;
};

export type BookingRequest = {
  id: string;
  kind: "primary" | "teleconsult" | "specialty";
  status: "requested" | "confirmed_sim" | "cancelled";
  slotLabel: string;
  slotLabelAr: string;
  triageAtBooking: TriageTier;
  at: string;
};

export type AgentCycleResult = {
  cycleId: string;
  startedAt: string;
  finishedAt: string;
  architectureNote: string;
  persisted: { firestore: boolean; bigQuery: boolean; mode: "gcp" | "memory" };
  setup: { config: SetupConfig; findings: AgentFinding[] };
  radar: { findings: AgentFinding[]; searchUsed: boolean; provider: string };
  ingest: { findings: AgentFinding[]; documentsProcessed: number; streamsRead: number };
  monitor: { findings: AgentFinding[]; thresholdsChecked: number };
  investigate: {
    findings: AgentFinding[];
    alerts: AgentAlert[];
    geminiUsed: boolean;
    triageTier: TriageTier;
  };
  notify: { findings: AgentFinding[]; alertsDelivered: number };
  care: { findings: AgentFinding[]; booking: BookingRequest | null };
};

export type SetupConfig = {
  institutionName: string;
  heatAlertC: number;
  aqiAlert: number;
  sleepFloorHours: number;
  socialPressureAlert: number;
  researchTopics: string[];
  googleSearchEnabled: boolean;
  schedulerCron: string;
  bigQueryDataset: string;
  cloudRunService: string;
  firestoreCollection: string;
  memberId: string;
};

export type PersistedEvent = {
  cycleId: string;
  type: "finding" | "alert" | "booking" | "cycle";
  agent?: AgentId;
  payload: Record<string, unknown>;
  at: string;
  memberId: string;
};
