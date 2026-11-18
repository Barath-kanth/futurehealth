import { NextResponse } from "next/server";
import { runAgentCycle } from "@/lib/agents/orchestrator";
import type { ConsentCategory, IndependentVariables, Locale } from "@/lib/types";

/**
 * Local / Next entrypoint. In production, Cloud Scheduler hits Cloud Run
 * which uses the same orchestrator. Optional: proxy to AGENT_PLATFORM_URL.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;
const hits = new Map<string, number[]>();

/** Per-client cap so a stuck browser tab cannot flood Gemini, Firestore or BigQuery. */
function tooMany(req: Request): boolean {
  const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0]!.trim();
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 2000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  }
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(req: Request) {
  if (tooMany(req)) {
    return NextResponse.json(
      { error: "too many watch cycles — try again in a minute" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }
  try {
    const body = (await req.json()) as {
      variables: IndependentVariables;
      consents?: Record<ConsentCategory, boolean>;
      locale?: Locale;
      googleSearchEnabled?: boolean;
      requestBooking?: boolean;
      bookingKind?: "primary" | "teleconsult" | "specialty";
      memberId?: string;
      documents?: { id: string; title: string; kind: "lab_pdf" | "note" | "consent_form"; text: string }[];
    };
    if (!body?.variables) {
      return NextResponse.json({ error: "variables required" }, { status: 400 });
    }

    const remote = process.env.AGENT_PLATFORM_URL;
    if (remote) {
      const res = await fetch(`${remote.replace(/\/$/, "")}/api/agents/cycle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.AGENT_PLATFORM_TOKEN || ""}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    const result = await runAgentCycle({
      variables: body.variables,
      consents: body.consents,
      locale: body.locale,
      documents: body.documents,
      requestBooking: body.requestBooking,
      bookingKind: body.bookingKind,
      memberId: body.memberId,
      setupOverrides:
        body.googleSearchEnabled === undefined
          ? undefined
          : { googleSearchEnabled: body.googleSearchEnabled },
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "agent cycle failed" }, { status: 500 });
  }
}
