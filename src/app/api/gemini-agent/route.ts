import { NextResponse } from "next/server";
import { computeSensitivityTable } from "@/lib/dynamic-sensitivity";
import { runGeminiVitalityAgent } from "@/lib/gcp/gemini-agent";
import { evaluateRisk } from "@/lib/risk-engine";
import { computeVitalityIndex } from "@/lib/vitality-analyst";
import type { IndependentVariables, Locale } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      variables: IndependentVariables;
      locale?: Locale;
      culturalTone?: "stewardship" | "direct" | "clinical";
    };
    if (!body?.variables) {
      return NextResponse.json({ error: "variables required" }, { status: 400 });
    }

    const assessment = evaluateRisk(body.variables);
    const vitalityIndex = computeVitalityIndex(body.variables).index;
    const sensitivity = computeSensitivityTable(body.variables);

    const agent = await runGeminiVitalityAgent({
      variables: body.variables,
      assessment,
      sensitivity,
      vitalityIndex,
      culturalTone: body.culturalTone ?? "stewardship",
      locale: body.locale ?? "en",
    });

    return NextResponse.json({
      ...agent,
      // Always return deterministic grounding so UI works even when Gemini is offline
      grounding: {
        vitalityIndex,
        triage: assessment.triage,
        sensitivity,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "gemini agent failed" }, { status: 500 });
  }
}
