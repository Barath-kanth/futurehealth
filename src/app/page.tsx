"use client";

import Link from "next/link";
import { useSeedShield } from "@/lib/store";
import { SimulatedBadge } from "@/components/SimulatedBadge";

export default function HomePage() {
  const { locale, assessment } = useSeedShield();
  const ar = locale === "ar";

  return (
    <div>
      <section className="relative overflow-hidden border-b border-[var(--line)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.2fr_0.8fr] md:py-20">
          <div className="animate-rise">
            <h1 className="font-display text-5xl leading-[1.05] text-[var(--cedar)] md:text-7xl">
              SeedShield
            </h1>
            <p className="mt-3 text-xs text-[var(--muted)]">
              {ar
                ? "شخصية العرض: عمر، ٣٤ — بيانات تجريبية مسبقة التحميل"
                : "Demo persona: Omar, 34 — pre-loaded synthetic data"}
            </p>
            <p className="mt-5 max-w-lg text-lg text-[var(--ink)]/85">
              {ar
                ? "يساعدك على فهم إشارات جسمك مبكرًا، ويقترح الخطوة التالية الآمنة. ليس تشخيصًا."
                : "Helps you notice early body signals and suggests a safe next step. Not a diagnosis."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/triage"
                className="rounded-md bg-[var(--cedar)] px-5 py-3 text-sm font-medium text-[var(--mist)]"
              >
                {ar ? "ما خطوتي التالية؟" : "What’s my next step?"}
              </Link>
              <Link
                href="/analyst"
                className="rounded-md border border-[var(--cedar)] px-5 py-3 text-sm font-medium text-[var(--cedar)]"
              >
                {ar ? "ملفي الصحي" : "My health file"}
              </Link>
            </div>
            <ol className="mt-10 max-w-md list-decimal space-y-2 ps-5 text-sm text-[var(--muted)]">
              <li>
                {ar
                  ? "ننظر إلى إشارات وافقت على مشاركتها فقط."
                  : "We only use signals you agreed to share."}
              </li>
              <li>
                {ar
                  ? "نقترح مسار رعاية بسيط — والطبيب يراجع قبل التخصص."
                  : "We suggest a simple care path — a doctor reviews before specialty."}
              </li>
              <li>
                {ar
                  ? "أنت تقرر إن كان الطبيب يتلقى تنبيهًا."
                  : "You decide if a doctor gets an alert."}
              </li>
            </ol>
          </div>

          <div className="animate-rise-delay rounded-[2rem] border border-[var(--line)] bg-[var(--cedar)] p-6 text-[var(--mist)]">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--brass)]">
                {ar ? "خطوتك الآن" : "Your step now"}
              </p>
              <SimulatedBadge ar={ar} />
            </div>
            <p className="mt-2 text-[11px] text-[var(--mist)]/70">
              {ar
                ? "مبني على عرض عمر (٣٤) — ليس إدخالًا فارغًا"
                : "Based on demo persona Omar (34) — not a blank intake"}
            </p>
            <div className="mt-4 font-display text-3xl leading-tight">
              {ar ? assessment.triage.labelAr : assessment.triage.label}
            </div>
            <p className="mt-3 text-sm text-[var(--mist)]/80">
              {ar
                ? "هذا اقتراح فحص أولي. أكّد مع طبيب عند الحاجة."
                : "This is an early-check suggestion. Confirm with a doctor when needed."}
            </p>
            <Link
              href="/triage"
              className="mt-6 inline-flex rounded-xl bg-[var(--mist)]/15 px-4 py-3 text-sm hover:bg-[var(--mist)]/25"
            >
              {ar ? "افتح التفاصيل ←" : "Open details →"}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl border border-[var(--cedar)]/30 bg-[var(--mist)] p-5">
          <h2 className="font-display text-xl text-[var(--cedar)]">
            {ar ? "ابدأ من هنا: خطوتي → الخزنة → المراجعين" : "Start here: Triage → Vault → Analytics"}
          </h2>
          <p className="mt-2 text-sm text-[var(--ink)]">
            {ar ? (
              <>
                <Link href="/triage" className="underline text-[var(--cedar)]">خطوتي</Link>
                {" → "}
                <Link href="/vault" className="underline text-[var(--cedar)]">الخزنة</Link>
                {" → "}
                <Link href="/analytics" className="underline text-[var(--cedar)]">لوحة المراجعين</Link>
              </>
            ) : (
              <>
                <Link href="/triage" className="underline text-[var(--cedar)]">Triage</Link>
                {" → "}
                <Link href="/vault" className="underline text-[var(--cedar)]">Vault</Link>
                {" → "}
                <Link href="/analytics" className="underline text-[var(--cedar)]">Analytics</Link>
              </>
            )}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {ar
              ? "ثم المراقبة → الطبيب. النبرة الخليجية في الخصوصية."
              : "Then Watch → Doctor. Gulf tone picker lives in Privacy."}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="font-display text-2xl text-[var(--cedar)]">
          {ar ? "اختصارات بسيطة" : "Simple shortcuts"}
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              t: ar ? "خصوصيتي" : "My privacy",
              d: ar ? "ماذا نستخدم وما لا نستخدم" : "What we use — and what we don’t",
              h: "/vault",
            },
            {
              t: ar ? "أجهزتي" : "My devices",
              d: ar ? "اربط ساعة أو طقمًا إن رغبت" : "Connect a watch or kit if you want",
              h: "/devices",
            },
            {
              t: ar ? "افعل الآن" : "Do now",
              d: ar ? "خطوات عملية قصيرة" : "Short practical steps",
              h: "/actions",
            },
            {
              t: ar ? "حدودنا" : "Our limits",
              d: ar ? "ما لا يفعله التطبيق" : "What this app will not do",
              h: "/boundaries",
            },
          ].map((c) => (
            <Link
              key={c.h}
              href={c.h}
              className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-4 transition hover:border-[var(--cedar)]"
            >
              <div className="font-display text-lg text-[var(--cedar)]">{c.t}</div>
              <p className="mt-1 text-sm text-[var(--muted)]">{c.d}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
