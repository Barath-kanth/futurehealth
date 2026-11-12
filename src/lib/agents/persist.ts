import type { AgentCycleResult, PersistedEvent } from "./types";

/**
 * Persistence: Firestore (findings/alerts/bookings) + BigQuery (analytics).
 * Falls back to in-memory when GCP libs/creds are missing — same API.
 */

type MemoryStore = {
  events: PersistedEvent[];
  cycles: AgentCycleResult[];
};

const memory: MemoryStore = { events: [], cycles: [] };

function gcpReady() {
  return Boolean(
    (process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT) &&
      (process.env.GOOGLE_APPLICATION_CREDENTIALS ||
        process.env.FIREBASE_CONFIG ||
        process.env.K_SERVICE), // Cloud Run default creds
  );
}

export async function persistCycle(
  result: AgentCycleResult,
  memberId: string,
): Promise<{ firestore: boolean; bigQuery: boolean; mode: "gcp" | "memory" }> {
  const events: PersistedEvent[] = [
    {
      cycleId: result.cycleId,
      type: "cycle",
      payload: {
        triage: result.investigate.triageTier,
        alerts: result.notify.alertsDelivered,
        booking: result.care.booking?.id ?? null,
      },
      at: result.finishedAt,
      memberId,
    },
  ];

  for (const f of [
    ...result.setup.findings,
    ...result.radar.findings,
    ...result.ingest.findings,
    ...result.monitor.findings,
    ...result.investigate.findings,
    ...result.notify.findings,
    ...result.care.findings,
  ]) {
    events.push({
      cycleId: result.cycleId,
      type: "finding",
      agent: f.agent,
      payload: f as unknown as Record<string, unknown>,
      at: f.at,
      memberId,
    });
  }

  for (const a of result.investigate.alerts) {
    events.push({
      cycleId: result.cycleId,
      type: "alert",
      agent: "notify",
      payload: a as unknown as Record<string, unknown>,
      at: a.at,
      memberId,
    });
  }

  if (result.care.booking) {
    events.push({
      cycleId: result.cycleId,
      type: "booking",
      agent: "care",
      payload: result.care.booking as unknown as Record<string, unknown>,
      at: result.care.booking.at,
      memberId,
    });
  }

  if (!gcpReady() || process.env.AGENT_PERSIST === "memory") {
    memory.events.push(...events);
    memory.cycles.unshift(result);
    memory.cycles = memory.cycles.slice(0, 20);
    memory.events = memory.events.slice(-500);
    return { firestore: false, bigQuery: false, mode: "memory" };
  }

  let firestore = false;
  let bigQuery = false;

  try {
    firestore = await writeFirestore(events, result);
  } catch (err) {
    console.warn("Firestore persist failed", err);
  }

  try {
    bigQuery = await writeBigQuery(events);
  } catch (err) {
    console.warn("BigQuery persist failed", err);
  }

  if (!firestore && !bigQuery) {
    memory.events.push(...events);
    memory.cycles.unshift(result);
    return { firestore: false, bigQuery: false, mode: "memory" };
  }

  return {
    firestore,
    bigQuery,
    mode: "gcp",
  };
}

export function getMemoryCycles() {
  return memory.cycles;
}

export function getMemoryEvents(limit = 50) {
  return memory.events.slice(-limit).reverse();
}

async function writeFirestore(events: PersistedEvent[], cycle: AgentCycleResult) {
  const { Firestore } = await import("@google-cloud/firestore");
  const db = new Firestore({
    projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT,
    ignoreUndefinedProperties: true,
  });
  const batch = db.batch();
  const root = db.collection(process.env.FIRESTORE_COLLECTION || "seedshield");

  const cycleRef = root.doc("cycles").collection("items").doc(cycle.cycleId);
  batch.set(cycleRef, {
    ...cycle,
    savedAt: new Date().toISOString(),
  });

  for (const ev of events) {
    const ref = root.doc("events").collection("items").doc();
    batch.set(ref, ev);
  }

  if (cycle.care.booking) {
    const bref = root
      .doc("bookings")
      .collection("items")
      .doc(cycle.care.booking.id);
    batch.set(bref, cycle.care.booking);
  }

  await batch.commit();
  return true;
}

async function writeBigQuery(events: PersistedEvent[]) {
  const { BigQuery } = await import("@google-cloud/bigquery");
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
  const datasetId = process.env.BQ_DATASET || "seedshield_events";
  const tableId = process.env.BQ_TABLE || "agent_events";
  const bq = new BigQuery({ projectId });

  const dataset = bq.dataset(datasetId);
  const [dsExists] = await dataset.exists();
  if (!dsExists) {
    await bq.createDataset(datasetId, { location: process.env.BQ_LOCATION || "US" });
  }

  const table = dataset.table(tableId);
  const [tableExists] = await table.exists();
  if (!tableExists) {
    await dataset.createTable(tableId, {
      schema: {
        fields: [
          { name: "cycle_id", type: "STRING" },
          { name: "event_type", type: "STRING" },
          { name: "agent", type: "STRING" },
          { name: "member_id", type: "STRING" },
          { name: "payload_json", type: "STRING" },
          { name: "event_at", type: "TIMESTAMP" },
          { name: "ingested_at", type: "TIMESTAMP" },
        ],
      },
    });
  }

  const rows = events.map((e) => ({
    cycle_id: e.cycleId,
    event_type: e.type,
    agent: e.agent ?? null,
    member_id: e.memberId,
    payload_json: JSON.stringify(e.payload),
    event_at: e.at,
    ingested_at: new Date().toISOString(),
  }));

  await table.insert(rows, { ignoreUnknownValues: true, skipInvalidRows: true });
  return true;
}
