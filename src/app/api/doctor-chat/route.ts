import { NextResponse } from "next/server";
import { doctorReply } from "@/lib/vitality-analyst";
import type { IndependentVariables, Locale } from "@/lib/types";
import { explainAssessment } from "@/lib/gcp/vertex";
import { evaluateRisk } from "@/lib/risk-engine";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      message: string;
      variables: IndependentVariables;
      index: number;
      locale?: Locale;
      enrichWithVertex?: boolean;
    };
    if (!body?.message || !body?.variables) {
      return NextResponse.json({ error: "message and variables required" }, { status: 400 });
    }

    const locale = body.locale ?? "en";
    let reply = doctorReply(body.message, body.variables, body.index, locale);
    let provider: "rules" | "vertex-ai" | "local-fallback" = "rules";

    if (body.enrichWithVertex) {
      const assessment = evaluateRisk(body.variables);
      const explained = await explainAssessment({
        assessment,
        locale,
        personaName: "member",
      });
      reply = `${reply}\n\n——\n${explained.narrative}`;
      provider = explained.provider;
    }

    return NextResponse.json({ reply, provider });
  } catch {
    return NextResponse.json({ error: "chat failed" }, { status: 500 });
  }
}
