import { NextResponse } from "next/server";
import { doctorReply, safetyReply } from "@/lib/vitality-analyst";
import type { ConsentCategory, IndependentVariables, Locale } from "@/lib/types";
import { applyConsents } from "@/lib/consent-filter";
import { evaluateRisk } from "@/lib/risk-engine";
import { chatWithGemini, type ChatTurn } from "@/lib/gcp/gemini-chat";

/**
 * Screening guide chat.
 * 1) Fixed safety rules answer crisis, sudden pain, medicine and "diagnosis" questions first.
 * 2) Gemini answers everything else from the consent-filtered screening file.
 * 3) If Gemini is unavailable or its reply fails the output guard, the rule-based reply is used.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      message: string;
      variables: IndependentVariables;
      index: number;
      locale?: Locale;
      consents?: Record<ConsentCategory, boolean>;
      history?: ChatTurn[];
    };
    if (!body?.message || !body?.variables) {
      return NextResponse.json({ error: "message and variables required" }, { status: 400 });
    }

    const locale = body.locale ?? "en";
    const message = String(body.message).slice(0, 1000);

    const safe = safetyReply(message, body.variables, locale);
    if (safe) return NextResponse.json({ reply: safe, provider: "rules-safety" });

    const variables = body.consents ? applyConsents(body.variables, body.consents) : body.variables;
    const assessment = evaluateRisk(variables, body.consents);

    const gemini = await chatWithGemini({
      message,
      assessment,
      variables,
      locale,
      history: Array.isArray(body.history) ? body.history : undefined,
    });
    if (gemini) {
      return NextResponse.json({ reply: gemini.text, provider: "vertex-ai", model: gemini.model });
    }

    return NextResponse.json({
      reply: doctorReply(message, variables, body.index, locale),
      provider: "rules",
    });
  } catch {
    return NextResponse.json({ error: "chat failed" }, { status: 500 });
  }
}
