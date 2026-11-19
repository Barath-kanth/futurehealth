"use client";

import { DoctorChat } from "@/components/DoctorChat";
import { useSeedShield } from "@/lib/store";
import Link from "next/link";

export default function ChatPage() {
  const { locale, doctorAlertOptIn } = useSeedShield();
  const ar = locale === "ar";

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-4xl text-[var(--cedar)]">
            {ar ? "مرشد الفحص الذكي" : "AI screening guide"}
          </h1>
        </div>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {ar
            ? "مرشد فحص مصمم لـ Gemini ضمن قواعد أمان ثابتة — ليس طبيبًا. لا نصيحة ببدء/إيقاف دواء. الفرز الآمن هو المرجع، وأسئلة الأمان تُجاب بقواعد ثابتة قبل أي نموذج. كل رد يوضح هل كتبه Gemini أم القواعد."
            : "A screening guide built for Gemini inside fixed safety rules. It is not a clinician. No start/stop medication advice. Safe Triage is the source of truth, and safety questions are answered by fixed rules before any model sees them. Each reply says whether Gemini or the rules wrote it."}
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {doctorAlertOptIn
            ? ar
              ? "موافقة تنبيه الطبيب: مفعّلة"
              : "Doctor alert opt-in: ON"
            : ar
              ? "موافقة تنبيه الطبيب: معطّلة"
              : "Doctor alert opt-in: OFF"}{" "}
          ·{" "}
          <Link href="/vault" className="underline text-[var(--cedar)]">
            {ar ? "الخزنة" : "Vault"}
          </Link>
        </p>
      </header>
      <DoctorChat />
    </div>
  );
}
