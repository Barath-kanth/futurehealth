import { NextResponse } from "next/server";
import { sanitizeReferralPacket } from "@/lib/referral-packet";

const DESTINATIONS = {
  primary_care: "mock-primary-care-network",
  teleconsult: "mock-teleconsultation-portal",
  specialist_review: "mock-verified-specialist-queue",
} as const;

/**
 * Closed-loop handoff demo. Validates the minimum-necessary packet and returns
 * a receipt. Nothing is stored, logged, or forwarded to a real provider.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ status: "rejected", error: "invalid_json" }, { status: 400 });
  }

  const checked = sanitizeReferralPacket(body);
  if (!checked.ok) {
    return NextResponse.json({ status: "rejected", error: checked.error }, { status: 400 });
  }

  return NextResponse.json(
    {
      status: "received_mock",
      receiptId: `mock-${crypto.randomUUID()}`,
      destination: DESTINATIONS[checked.packet.kind],
      stored: false,
      forwarded: false,
      note: "Mock endpoint for the challenge demo. No real provider receives this request.",
    },
    { status: 202 },
  );
}
