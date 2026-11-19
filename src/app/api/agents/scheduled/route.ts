import { NextResponse } from "next/server";
import { ME } from "@/lib/me-profile";
import { runAgentCycle } from "@/lib/agents/orchestrator";

/**
 * Cloud Scheduler target: POST every 6h with header X-Agent-Secret.
 * Uses the demo member profile when no body is provided.
 */
export async function POST(req: Request) {
  const secret = process.env.AGENT_SCHEDULER_SECRET;
  if (secret) {
    const header = req.headers.get("x-agent-secret");
    if (header !== secret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  let body: {
    requestBooking?: boolean;
    memberId?: string;
  } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    body = {};
  }

  const result = await runAgentCycle({
    variables: ME.variables,
    consents: ME.consents,
    locale: "en",
    memberId: body.memberId ?? "member-scheduler",
    requestBooking: body.requestBooking ?? false,
    setupOverrides: { googleSearchEnabled: false },
  });

  return NextResponse.json({
    ok: true,
    cycleId: result.cycleId,
    triage: result.investigate.triageTier,
    alerts: result.notify.alertsDelivered,
    booking: result.care.booking?.id ?? null,
    persisted: result.persisted,
  });
}
