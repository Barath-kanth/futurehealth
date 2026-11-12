import { NextResponse } from "next/server";
import { evaluateRisk } from "@/lib/risk-engine";
import type { IndependentVariables } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { variables: IndependentVariables };
    if (!body?.variables) {
      return NextResponse.json({ error: "variables required" }, { status: 400 });
    }
    const assessment = evaluateRisk(body.variables);
    return NextResponse.json({ assessment });
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}
