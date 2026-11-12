"use client";

import { SimulatedBadge } from "@/components/SimulatedBadge";
import { useSeedShield } from "@/lib/store";
import Link from "next/link";
import { useState } from "react";

export function CareAccessPanel() {
  const { locale, assessment, interactionMode, setInteractionMode } =
    useSeedShield();
  const ar = locale === "ar";
  const [booked, setBooked] = useState<string | null>(null);

  const tier = assessment.triage.tier;
  const showBooking =
    tier !== "self_care" &&
    tier !== "insufficient_info";

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
          ? "حجز أو استشارة عن بعد أو محادثة نصية فقط — كما في بيان التحدي. كلها محاكاة في هذا النموذج."
          : "Booking, teleconsult, or text-only — as listed in the challenge statement. All simulated in this prototype."}
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

      {showBooking ? (
        <div className="grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setBooked("primary")}
            className="rounded-xl border border-[var(--line)] px-3 py-3 text-start text-sm hover:border-[var(--cedar)]"
          >
            <div className="font-medium text-[var(--cedar)]">
              {ar ? "حجز رعاية أولية" : "Book primary care"}
            </div>
            <div className="mt-1 text-[10px] text-[var(--muted)]">
              {ar ? "فتحات محاكاة · أبوظبي" : "Simulated slots · Abu Dhabi"}
            </div>
          </button>
          <button
            type="button"
            onClick={() => setBooked("tele")}
            className="rounded-xl border border-[var(--line)] px-3 py-3 text-start text-sm hover:border-[var(--cedar)]"
          >
            <div className="font-medium text-[var(--cedar)]">
              {ar ? "استشارة عن بعد" : "Teleconsultation"}
            </div>
            <div className="mt-1 text-[10px] text-[var(--muted)]">
              {ar ? "فيديو/صوت خاص" : "Private video / voice"}
            </div>
          </button>
          <Link
            href="/chat"
            className="rounded-xl border border-[var(--line)] px-3 py-3 text-start text-sm hover:border-[var(--cedar)]"
          >
            <div className="font-medium text-[var(--cedar)]">
              {ar ? "محادثة نصية" : "Text-only chat"}
            </div>
            <div className="mt-1 text-[10px] text-[var(--muted)]">
              {ar ? "طبيب محاكى" : "Simulated clinician"}
            </div>
          </Link>
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

      {booked && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          {ar
            ? `طلب ${booked === "tele" ? "استشارة عن بعد" : "حجز أولي"} سُجِّل (محاكاة). لا بيانات شخصية تُرسل لشبكة خارجية.`
            : `${booked === "tele" ? "Teleconsult" : "Primary"} request logged (simulated). No personal data leaves this browser.`}
        </p>
      )}
    </section>
  );
}
