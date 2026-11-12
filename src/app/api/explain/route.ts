import { NextResponse } from "next/server";
import { explainAssessment, localExplain } from "@/lib/gcp/vertex";
import type { Locale, RiskAssessment } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      assessment: RiskAssessment;
      personaName?: string;
      locale?: Locale;
      /** Demo switch: simulate Vertex outage mid-pitch. */
      forceLocal?: boolean;
      simulateFail?: boolean;
    };
    if (!body?.assessment) {
      return NextResponse.json({ error: "assessment required" }, { status: 400 });
    }
    // Mid-demo API failure still returns canonical rule-engine text (200), never empty.
    if (body.simulateFail) {
      const canonical = localExplain(
        body.assessment,
        body.personaName,
        body.locale ?? "en",
      );
      return NextResponse.json({
        narrative: canonical,
        provider: "local-fallback",
        model: "seedshield-explain-v1",
        canonical,
        paraphrased: false,
        recoveredFromFailure: true,
      });
    }
    const result = await explainAssessment({
      ...body,
      forceLocal: body.forceLocal,
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "explain failed" }, { status: 500 });
  }
}
