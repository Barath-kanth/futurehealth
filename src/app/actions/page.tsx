"use client";

import { ActionCards } from "@/components/ActionCards";
import { CareAccessPanel } from "@/components/CareAccessPanel";
import { useSeedShield } from "@/lib/store";
import Link from "next/link";

export default function ActionsPage() {
  const { locale, actions, vitalityIndex } = useSeedShield();
  const ar = locale === "ar";

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <header>
        <h1 className="font-display text-4xl text-[var(--cedar)]">
          {ar ? "ماذا تفعل الآن" : "What you should do"}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {ar
            ? `${actions.length} توصيات شخصية من قواعد المؤشر (${vitalityIndex}) والفرز الآمن — ليست مخرجات Gemini.`
            : `${actions.length} personal recommendations from the rules engine (index ${vitalityIndex}) + Safe Triage — not Gemini output.`}
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {ar
            ? "شخصية العرض: عمر، ٣٤. الحجز/الطبيب محاكاة."
            : "Demo persona: Omar, 34. Booking / doctor are simulated."}
        </p>
      </header>

      <CareAccessPanel />
      <ActionCards />

      <div className="flex flex-wrap gap-2">
        <Link href="/triage" className="rounded-md border border-[var(--cedar)] px-4 py-2 text-sm text-[var(--cedar)]">
          {ar ? "الفرز الآمن" : "Safe Triage"}
        </Link>
        <Link href="/chat" className="rounded-md bg-[var(--cedar)] px-4 py-2 text-sm text-[var(--mist)]">
          {ar ? "محادثة نصية" : "Text chat"}
        </Link>
      </div>
    </div>
  );
}
