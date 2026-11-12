import { NextResponse } from "next/server";
import {
  buildCompetitionMetrics,
  DEMO_TREND,
  SIGNAL_DOMAIN_BREAKDOWN,
} from "@/lib/metrics";
import { evaluateRisk, mergeVariables } from "@/lib/risk-engine";
import { ME } from "@/lib/me-profile";
import { SCENARIOS } from "@/lib/scenarios";
import { MVI_BANDS } from "@/lib/index-bands";

export async function GET() {
  const assessments = [
    evaluateRisk(ME.variables),
    evaluateRisk(
      mergeVariables(ME.variables, SCENARIOS.find((s) => s.id === "gulf-heatwave")!.patch),
    ),
    evaluateRisk(
      mergeVariables(ME.variables, SCENARIOS.find((s) => s.id === "peak-shift-week")!.patch),
    ),
  ];

  const metrics = buildCompetitionMetrics(assessments);

  return NextResponse.json({
    metrics,
    trend: DEMO_TREND,
    domains: SIGNAL_DOMAIN_BREAKDOWN,
    indexBands: MVI_BANDS,
    note: "Personal 18+ file control metrics — device reliability and doctor-alert pathway.",
  });
}
