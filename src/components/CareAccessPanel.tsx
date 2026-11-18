"use client";

import { SimulatedBadge } from "@/components/SimulatedBadge";
import {
  buildReferralPacket,
  type ReferralKind,
  type ReferralPacket,
} from "@/lib/referral-packet";
import { useSeedShield } from "@/lib/store";
import Link from "next/link";
import { useState } from "react";

type Receipt = { receiptId: string; destination: string };

export function CareAccessPanel() {
  const { locale, assessment, interactionMode, setInteractionMode } = useSeedShield();
  const ar = locale === "ar";

  const [pending, setPending] = useState<ReferralKind | null>(null);
  const [optIn, setOptIn] = useState(false);
  const [sending, setSending] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tier = assessment.triage.tier;
  const isUrgent = tier === "urgent";
  const showBooking = tier !== "self_care" && tier !== "insufficient_info" && !isUrgent;
  const specialistEligible = tier === "andrology_urology" || tier === "fertility_services";

  const built = pending ? buildReferralPacket({ assessment, kind: pending }) : null;
  const packet: ReferralPacket | null = built && built.ok ? built.packet : null;

  function start(kind: ReferralKind) {
    setPending(kind);
    setOptIn(false);
    setReceipt(null);
    setError(null);
  }

  async function send() {
    if (!packet) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/referral/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(packet),
      });
      const data = (await res.json()) as {
        status: string;
        receiptId?: string;
        destination?: string;
        error?: string;
      };
      if (!res.ok || data.status !== "received_mock" || !data.receiptId || !data.destination) {
        setError(data.error ?? "send_failed");
      } else {
        setReceipt({ receiptId: data.receiptId, destination: data.destination });
        setPending(null);
      }
    } catch {
      setError("network_error");
    } finally {
      setSending(false);
    }
  }

  const tiles: { kind: ReferralKind; en: string; ar: string; sub: string; subAr: string }[] = [
    { kind: "primary_care", en: "Book primary care", ar: "حجز رعاية أولية", sub: "Simulated slots · Abu Dhabi", subAr: "فتحات محاكاة · أبوظبي" },
    { kind: "teleconsult", en: "Teleconsultation", ar: "استشارة عن بعد", sub: "Private video / voice (mock)", subAr: "فيديو/صوت خاص (محاكاة)" },
  ];
  if (specialistEligible) {
    tiles.push({
      kind: "specialist_review",
      en: "Specialist review",
      ar: "مراجعة أخصائي",
      sub: "After clinician approval (mock queue)",
      subAr: "بعد موافقة الطبيب (طابور محاكى)",
    });
  }

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-5 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-display text-xl text-[var(--cedar)]">
          {ar ? "الوصول للرعاية — خطوة منخفضة الاحتكاك" : "Care access — low-friction next step"}
        </h2>
        <SimulatedBadge ar={ar} />
      </div>
      <p className="text-xs text-[var(--muted)]">
        {ar
          ? "الحجز والاستشارة عن بعد يرسلان حزمة إحالة محدودة إلى نقطة تجريبية، بعد موافقتك."
          : "Booking and teleconsult send a minimum-necessary referral packet to a mock endpoint, after your opt-in."}
      </p>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "full" as const, en: "Full UI", ar: "واجهة كاملة" },
            { id: "text" as const, en: "Text-only", ar: "نص فقط" },
            { id: "audio" as const, en: "Audio (sim)", ar: "صوت (محاكاة)" },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setInteractionMode(m.id)}
            className={
              interactionMode === m.id
                ? "rounded-md bg-[var(--cedar)] px-3 py-1.5 text-xs text-[var(--mist)]"
                : "rounded-md border border-[var(--line)] px-3 py-1.5 text-xs"
            }
          >
            {ar ? m.ar : m.en}
          </button>
        ))}
      </div>

      {interactionMode === "audio" && (
        <p className="rounded-lg bg-[var(--watch-soft)] px-3 py-2 text-xs text-[var(--watch)]">
          {ar
            ? "وضع الصوت محاكاة — لا ميكروفون حي. استخدم النص أو الحجز."
            : "Audio mode is simulated — no live mic. Use text chat or booking."}
        </p>
      )}

      {isUrgent ? (
        <p className="rounded-lg bg-[var(--urgent-soft)] px-3 py-2 text-sm text-[var(--urgent)]">
          {ar
            ? "علامات تحذير عاجلة: اطلب رعاية طوارئ الآن. لا تُرسل إحالة عبر التطبيق."
            : "Warning signs: get urgent care now. This app does not send a referral for urgent symptoms."}
        </p>
      ) : showBooking ? (
        <div className="space-y-3">
          <div className={`grid gap-2 ${specialistEligible ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
            {tiles.map((t) => (
              <button
                key={t.kind}
                type="button"
                onClick={() => start(t.kind)}
                className="rounded-xl border border-[var(--line)] px-3 py-3 text-start text-sm hover:border-[var(--cedar)]"
              >
                <div className="font-medium text-[var(--cedar)]">{ar ? t.ar : t.en}</div>
                <div className="mt-1 text-[10px] text-[var(--muted)]">{ar ? t.subAr : t.sub}</div>
              </button>
            ))}
            <Link
              href="/chat"
              className="rounded-xl border border-[var(--line)] px-3 py-3 text-start text-sm hover:border-[var(--cedar)]"
            >
              <div className="font-medium text-[var(--cedar)]">{ar ? "محادثة نصية" : "Text-only chat"}</div>
              <div className="mt-1 text-[10px] text-[var(--muted)]">{ar ? "طبيب محاكى" : "Simulated clinician"}</div>
            </Link>
          </div>

          {pending && packet && (
            <div className="rounded-xl border border-[var(--cedar)] bg-[var(--sand)] p-4 space-y-3">
              <div className="text-sm font-medium text-[var(--cedar)]">
                {ar ? "ما سيُرسل بالضبط" : "What exactly would be sent"}
              </div>
              <pre className="max-h-48 overflow-auto rounded-lg bg-[var(--mist)] p-3 text-[11px] leading-relaxed text-[var(--ink)]">
                {JSON.stringify(packet, null, 2)}
              </pre>
              <p className="text-[11px] text-[var(--muted)]">
                {ar
                  ? "لا اسم، لا نص محادثة، لا موقع دقيق، لا قيم خام."
                  : "No name, no chat text, no exact location, no raw values."}
              </p>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={optIn}
                  onChange={(e) => setOptIn(e.target.checked)}
                  className="mt-1 size-4"
                />
                {ar
                  ? "أوافق على إرسال هذه الحزمة فقط إلى النقطة التجريبية."
                  : "I agree to send only this packet to the mock destination."}
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!optIn || sending}
                  onClick={send}
                  className="rounded-md bg-[var(--cedar)] px-3 py-2 text-xs font-medium text-[var(--mist)] disabled:opacity-50"
                >
                  {sending ? (ar ? "جارٍ الإرسال…" : "Sending…") : ar ? "أرسل (تجريبي)" : "Send (mock)"}
                </button>
                <button
                  type="button"
                  onClick={() => setPending(null)}
                  className="rounded-md border border-[var(--line)] px-3 py-2 text-xs"
                >
                  {ar ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </div>
          )}
          {pending && built && !built.ok && (
            <p className="rounded-lg bg-[var(--watch-soft)] px-3 py-2 text-xs text-[var(--watch)]">
              {built.error === "specialist_not_indicated"
                ? ar ? "مراجعة الأخصائي غير مطلوبة لهذا المسار." : "Specialist review is not indicated for this pathway."
                : ar ? "لا إحالة مطلوبة الآن." : "No referral needed right now."}
            </p>
          )}
          {error && (
            <p className="rounded-lg bg-[var(--urgent-soft)] px-3 py-2 text-xs text-[var(--urgent)]">
              {ar ? "تعذر الإرسال" : "Send failed"}: {error}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)]">
          {tier === "insufficient_info"
            ? ar
              ? "أضف مصادر بموافقة أولًا — ثم يظهر الحجز."
              : "Attach consented sources first — booking appears after."
            : ar
              ? "الرعاية الذاتية كافية الآن. الحجز يظهر إن ارتفع المسار."
              : "Self-care is enough for now. Booking appears if pathway escalates."}
        </p>
      )}

      {receipt && (
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-900 space-y-1">
          <div>
            {ar
              ? `تم الاستلام (تجريبي): ${receipt.receiptId}`
              : `Received (mock): ${receipt.receiptId}`}
          </div>
          <div>
            {ar
              ? `الوجهة: ${receipt.destination} · لم تُخزَّن ولم تُرسل لجهة حقيقية.`
              : `Destination: ${receipt.destination} · not stored, not forwarded to a real provider.`}
          </div>
        </div>
      )}
    </section>
  );
}
