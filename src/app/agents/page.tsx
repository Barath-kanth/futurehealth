"use client";

import { SimulatedBadge } from "@/components/SimulatedBadge";
import type { AgentCycleResult } from "@/lib/agents/types";
import { useSeedShield } from "@/lib/store";
import Link from "next/link";
import { useEffect, useEffectEvent, useState } from "react";

type Outcome =
  | { kind: "loading" }
  | { kind: "quiet"; detail: string }
  | { kind: "changed"; detail: string; why: string }
  | { kind: "error"; detail: string };

/**
 * Quiet watch — consented monitoring. Never books/contacts doctor without opt-in.
 */
export default function WatchPage() {
  const {
    locale,
    variables,
    consents,
    assessment,
    doctorAlertOptIn,
    sendChat,
    notifications,
  } = useSeedShield();
  const ar = locale === "ar";
  const [cycle, setCycle] = useState<AgentCycleResult | null>(null);
  // First paint already has a real result (not stuck on “Reviewing…”)
  const [outcome, setOutcome] = useState<Outcome>(() => {
    const watches = assessment.signals.filter(
      (s) => s.severity === "watch" || s.severity === "elevated" || s.severity === "urgent",
    );
    if (watches.length === 0) {
      return {
        kind: "quiet",
        detail: ar
          ? "لا تغيير اليوم — المراقبة مستمرة على الإشارات الموافق عليها."
          : "No changes today — watching continues on consented signals.",
      };
    }
    return {
      kind: "changed",
      detail: ar
        ? `إشارة واحدة على الأقل تحتاج انتباهك (${watches.length}).`
        : `At least one signal needs attention (${watches.length}).`,
      why: ar ? watches[0]!.titleAr : watches[0]!.title,
    };
  });
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [allowBook, setAllowBook] = useState(false);
  const [allowDoctorNotify, setAllowDoctorNotify] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const reminderUnread = notifications.filter((n) => !n.done && !n.read).length;

  const finishFromAssessment = (reason: string) => {
    const watches = assessment.signals.filter(
      (s) => s.severity === "watch" || s.severity === "elevated" || s.severity === "urgent",
    );
    if (watches.length === 0) {
      setOutcome({
        kind: "quiet",
        detail: ar
          ? "لا تغيير اليوم — المراقبة مستمرة على الإشارات الموافق عليها."
          : "No changes today — watching continues on consented signals.",
      });
    } else {
      setOutcome({
        kind: "changed",
        detail: ar
          ? `إشارة واحدة على الأقل تحتاج انتباهك (${watches.length}).`
          : `At least one signal needs attention (${watches.length}).`,
        why: ar
          ? `${watches[0]!.titleAr} · ${reason}`
          : `${watches[0]!.title} · ${reason}`,
      });
    }
  };

  const runWatchCycle = useEffectEvent(async (reason: "auto" | "refresh") => {
    setRefreshing(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch("/api/agents/cycle", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variables,
          consents,
          locale,
          googleSearchEnabled: true,
          requestBooking: allowBook,
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
              title: "Lifestyle note",
              kind: "note",
              text: "Long desk hours and outdoor heat walks in Abu Dhabi.",
            },
          ],
        }),
      });
      if (!res.ok) throw new Error("cycle failed");
      const data = (await res.json()) as AgentCycleResult;
      if (!allowBook) data.care = { ...data.care, booking: null };
      if (!allowDoctorNotify && !doctorAlertOptIn) {
        data.investigate = {
          ...data.investigate,
          alerts: data.investigate.alerts.filter((a) => a.audience === "patient"),
        };
      }
      setCycle(data);
      setLastRun(new Date().toISOString());
      const monitors = data.monitor.findings.filter((f) => f.severity !== "info");
      if (monitors.length === 0 && data.investigate.alerts.length === 0) {
        setOutcome({
          kind: "quiet",
          detail: ar
            ? "لا تغيير اليوم — لا تجاوزات جديدة على حدودك."
            : "No changes today — no new limit breaches on your file.",
        });
      } else {
        setOutcome({
          kind: "changed",
          detail: ar
            ? `${monitors.length || 1} إشارة تغيّرت.`
            : `${monitors.length || 1} signal change${monitors.length === 1 ? "" : "s"}.`,
          why: ar
            ? (monitors[0]?.titleAr || data.investigate.alerts[0]?.titleAr || "مراقبة")
            : (monitors[0]?.title || data.investigate.alerts[0]?.title || "Watch"),
        });
      }
      if (
        reason === "auto" &&
        data.investigate.alerts.length > 0 &&
        (allowDoctorNotify || doctorAlertOptIn)
      ) {
        sendChat(
          ar
            ? "وصلت تنبيهات من المراقبة. ما خطوتي؟"
            : "I got watch alerts. What should I do next?",
        );
      }
    } catch {
      finishFromAssessment(
        ar ? "عرض محلي بعد مهلة الشبكة" : "local view after network timeout",
      );
      setLastRun(new Date().toISOString());
    } finally {
      clearTimeout(timer);
      setRefreshing(false);
    }
  });

  useEffect(() => {
    void runWatchCycle("auto");
  }, [runWatchCycle]);

  const alert = cycle?.investigate.alerts[0];
  const booking = allowBook ? cycle?.care.booking : null;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-4xl text-[var(--cedar)]">
            {ar ? "مراقبة هادئة" : "Quiet watch"}
          </h1>
          <SimulatedBadge ar={ar} />
        </div>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {ar
            ? "مراقبة بموافقتك فقط. لا طبيب ولا حجز دون موافقتك الصريحة أدناه."
            : "Consent-based monitoring only. No doctor contact or booking without your opt-in below."}
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">
          {ar
            ? `شخصية العرض: عمر، ٣٤ · تذكيرات الجرس: ${reminderUnread} · الفرز لا يتغيّر بالمراقبة`
            : `Demo persona: Omar, 34 · Bell reminders: ${reminderUnread} · Watch cannot override triage`}
        </p>
        <p className="mt-2 text-sm text-[var(--cedar)]">
          {ar ? "خطوتك:" : "Your step:"}{" "}
          <strong>{ar ? assessment.triage.labelAr : assessment.triage.label}</strong>
        </p>
      </header>

      <section className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-5">
        <h2 className="font-display text-lg text-[var(--cedar)]">
          {ar ? "موافقتك مطلوبة" : "Your opt-in required"}
        </h2>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={allowDoctorNotify}
            onChange={(e) => setAllowDoctorNotify(e.target.checked)}
            className="mt-1 size-4"
          />
          <span>
            {ar
              ? "اسمح بتنبيه الطبيب المحاكى في هذه الجلسة."
              : "Allow a simulated doctor alert this session."}
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={allowBook}
            onChange={(e) => setAllowBook(e.target.checked)}
            className="mt-1 size-4"
          />
          <span>
            {ar
              ? "اسمح بحجز استشارة محاكاة في هذه الدورة."
              : "Allow a simulated consult booking this cycle."}
          </span>
        </label>
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-5">
        <h2 className="font-display text-xl text-[var(--cedar)]">
          {ar ? "نتيجة المراقبة" : "Watch result"}
        </h2>
        {refreshing && (
          <p className="mt-1 text-xs text-[var(--muted)]">
            {ar ? "تحديث في الخلفية…" : "Refreshing in background…"}
          </p>
        )}
        {outcome.kind === "quiet" && (
          <p className="mt-2 text-sm text-[var(--ink)]">{outcome.detail}</p>
        )}
        {outcome.kind === "changed" && (
          <div className="mt-2 space-y-1 text-sm">
            <p className="text-[var(--ink)]">{outcome.detail}</p>
            <p className="text-[var(--muted)]">
              {ar ? "لماذا:" : "Why:"} {outcome.why}
            </p>
          </div>
        )}
        {outcome.kind === "error" && (
          <p className="mt-2 text-sm text-red-700">{outcome.detail}</p>
        )}
        <p className="mt-2 text-xs text-[var(--muted)]">
          {lastRun
            ? ar
              ? `آخر فحص: ${new Date(lastRun).toLocaleString()}`
              : `Last check: ${new Date(lastRun).toLocaleString()}`
            : ar
              ? "نتيجة أولية من ملف عمر"
              : "Initial result from Omar’s file"}
        </p>
        <button
          type="button"
          onClick={() => void runWatchCycle("refresh")}
          disabled={refreshing}
          className="mt-4 text-sm text-[var(--cedar)] underline disabled:opacity-50"
        >
          {ar ? "حدّث الآن" : "Refresh now"}
        </button>
      </section>

      {booking && (
        <section className="rounded-2xl border border-[var(--cedar)]/30 bg-[var(--mist)] p-5">
          <h2 className="font-display text-xl text-[var(--cedar)]">
            {ar ? "استشارة (بموافقتك)" : "Consult (you opted in)"}
          </h2>
          <p className="mt-2 text-sm">
            {ar ? booking.slotLabelAr : booking.slotLabel}
          </p>
          <Link href="/chat" className="mt-3 inline-block text-sm text-[var(--cedar)] underline">
            {ar ? "افتح محادثة الطبيب" : "Open doctor chat"}
          </Link>
        </section>
      )}

      {alert && (
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-5">
          <h2 className="font-display text-xl text-[var(--cedar)]">
            {ar ? "تنبيه لك" : "Alert for you"}
          </h2>
          <p className="mt-2 text-sm">{ar ? alert.bodyAr : alert.body}</p>
        </section>
      )}

      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/triage" className="text-[var(--cedar)] underline">
          {ar ? "خطوتي التالية" : "My next step"}
        </Link>
        <Link href="/vault" className="text-[var(--cedar)] underline">
          {ar ? "الخصوصية" : "Privacy"}
        </Link>
      </div>
    </div>
  );
}
