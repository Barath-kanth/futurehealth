import { runTriageSafetyTests } from "@/lib/triage-safety";
import { NextResponse } from "next/server";

export async function GET() {
  const report = runTriageSafetyTests();
  return NextResponse.json(report);
}
