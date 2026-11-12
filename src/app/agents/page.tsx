"use client";

import { SimulatedBadge } from "@/components/SimulatedBadge";
import type { AgentCycleResult } from "@/lib/agents/types";
import { useSeedShield } from "@/lib/store";
import Link from "next/link";
import { useState } from "react";

const AGENTS = [
  { id: "setup", en: "Setup", ar: "إعداد", job: "Limits & topics", jobAr: "الحدود والمواضيع" },
  { id: "radar", en: "Radar", ar: "رادار", job: "World research", jobAr: "أبحاث العالم" },
  { id: "ingest", en: "Ingest", ar: "استقبال", job: "Live + documents", jobAr: "حي + مستندات" },
  { id: "monitor", en: "Monitor", ar: "مراقب", job: "Your limits", jobAr: "حدودك" },
  { id: "investigate", en: "Investigate", ar: "تحليل", job: "Connect evidence", jobAr: "ربط الأدلة" },
  { id: "notify", en: "Notify", ar: "تنبيه", job: "You + doctor", jobAr: "أنت والطبيب" },
  { id: "care", en: "Care", ar: "رعاية", job: "Book & bridge", jobAr: "حجز وجسر" },
] as const;

export default function AgentsPage() {
  const { locale, variables, consents, assessment, sendChat } = useSeedShield();
  const ar = locale === "ar";
  const [cycle, setCycle] = useState<AgentCycleResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [book, setBook] = useState(true);

  async function runCycle() {
    setLoading(true);
    try {
      const res = await fetch("/api/agents/cycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variables,
          consents,
          locale,
          googleSearchEnabled: true,
          requestBooking: book,
          bookingKind:
            assessment.triage.tier === "urgent"
              ? "primary"
              : assessment.triage.tier === "andrology_urology" ||
                  assessment.triage.tier === "fertility_services"
                ? "specialty"
                : "teleconsult",
          memberId: "member-demo",
          documents: [
            {
              id: "note-1",
              title: "Short lifestyle note",
              kind: "note",
              text: "Member reports long desk hours and afternoon outdoor heat walks in Abu Dhabi.",
            },
          ],
        }),
      });
      const data = (await res.json()) as AgentCycleResult;
      setCycle(data);
      if (data.notify?.alertsDelivered > 0) {
        sendChat(
          ar
            ? "وصلت تنبيهات من نظام المراقبة. ما خطوتي؟"
            : "I got watch alerts from the agent system. What should I do next?",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-4xl text-[var(--cedar)]">
            {ar ? "منصة الوكلاء" : "Agent platform"}
          </h1>
          <SimulatedBadge ar={ar} />
        </div>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {ar
            ? "٧ وكلاء متصلون: استقبال → تحليل → تنبيه → حجز. يعمل على Cloud Run مع Firestore وBigQuery عند التفعيل."
            : "7 linked agents: ingest → analyze → notify → book. Runs on Cloud Run with Firestore + BigQuery when enabled."}
        </p>
        <p className="mt-2 text-sm text-[var(--cedar)]">
          {ar ? "خطوتك:" : "Your step:"}{" "}
          <strong>{ar ? assessment.triage.labelAr : assessment.triage.label}</strong>
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {AGENTS.map((a) => (
          <div key={a.id} className="rounded-xl border border-[var(--line)] bg-[var(--mist)] p-3">
            <div className="text-sm font-medium text-[var(--cedar)]">
              {ar ? a.ar : a.en}
            </div>
            <p className="mt-1 text-[11px] text-[var(--muted)]">{ar ? a.jobAr : a.job}</p>
          </div>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={book}
          onChange={(e) => setBook(e.target.checked)}
          className="size-4"
        />
        {ar ? "احجز استشارة في هذه الدورة (محاكاة)" : "Book a consult in this cycle (simulated)"}
      </label>

      <button
        type="button"
        onClick={runCycle}
        disabled={loading}
        className="rounded-md bg-[var(--cedar)] px-5 py-3 text-sm text-[var(--mist)] disabled:opacity-60"
      >
        {loading ? "…" : ar ? "تشغيل الدورة الكاملة" : "Run full agent cycle"}
      </button>

      {cycle && (
        <div className="space-y-4">
          <p className="text-xs text-[var(--muted)]">
            {cycle.cycleId} · persist: {cycle.persisted.mode}
            {cycle.persisted.firestore ? " · Firestore" : ""}
            {cycle.persisted.bigQuery ? " · BigQuery" : ""}
            {cycle.investigate.geminiUsed ? " · Gemini" : ""}
            {cycle.radar.searchUsed ? " · Search" : ""}
          </p>

          {cycle.care.booking && (
            <section className="rounded-2xl border border-[var(--cedar)]/30 bg-[var(--mist)] p-5">
              <h2 className="font-display text-xl text-[var(--cedar)]">
                {ar ? "حجز الاستشارة" : "Consultation booking"}
              </h2>
              <p className="mt-2 text-sm">
                {ar ? cycle.care.booking.slotLabelAr : cycle.care.booking.slotLabel}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {cycle.care.booking.kind} · {cycle.care.booking.status}
              </p>
              <Link href="/chat" className="mt-3 inline-block text-sm text-[var(--cedar)] underline">
                {ar ? "افتح محادثة الطبيب" : "Open doctor chat"}
              </Link>
            </section>
          )}

          {cycle.investigate.alerts[0] && (
            <section className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-5">
              <h2 className="font-display text-xl text-[var(--cedar)]">
                {ar ? "تنبيه" : "Alert"}
              </h2>
              <p className="mt-2 text-sm text-[var(--ink)]/85">
                {ar
                  ? cycle.investigate.alerts[0].bodyAr
                  : cycle.investigate.alerts[0].body}
              </p>
            </section>
          )}

          <details className="rounded-xl border border-[var(--line)] p-4 text-sm">
            <summary className="cursor-pointer text-[var(--cedar)]">
              {ar ? "أثر الوكلاء" : "Agent trail"}
            </summary>
            <ol className="mt-3 list-decimal space-y-2 ps-5 text-xs text-[var(--muted)]">
              {[
                ...cycle.ingest.findings.slice(0, 1),
                ...cycle.monitor.findings.slice(0, 1),
                ...cycle.investigate.findings.slice(0, 1),
                ...cycle.notify.findings.slice(0, 1),
                ...cycle.care.findings.slice(0, 1),
              ].map((f) => (
                <li key={f.id}>
                  <strong className="text-[var(--ink)]">{f.agent}</strong>:{" "}
                  {ar ? f.titleAr : f.title}
                </li>
              ))}
            </ol>
          </details>

          <Link href="/triage" className="text-sm text-[var(--cedar)] underline">
            {ar ? "خطوتي التالية" : "My next step"}
          </Link>
        </div>
      )}
    </div>
  );
}
