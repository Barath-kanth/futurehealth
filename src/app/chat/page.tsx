"use client";

import { DoctorChat } from "@/components/DoctorChat";
import { SimulatedBadge } from "@/components/SimulatedBadge";
import { useSeedShield } from "@/lib/store";
import Link from "next/link";

export default function ChatPage() {
  const { locale, assignedDoctor, doctorAlertOptIn } = useSeedShield();
  const ar = locale === "ar";

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-4xl text-[var(--cedar)]">
            {ar ? "محادثة الطبيب" : "Doctor chat"}
          </h1>
          <SimulatedBadge ar={ar} />
        </div>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {ar
            ? `${assignedDoctor.nameAr} شخصية عرض — ليست طبيبة حقيقية. لا نصيحة ببدء/إيقاف دواء. الفرز الآمن هو المرجع.`
            : `${assignedDoctor.name} is a demo persona — not a real clinician. No start/stop medication advice. Safe Triage is the source of truth.`}
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
