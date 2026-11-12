"use client";

import { useSeedShield } from "@/lib/store";
import Link from "next/link";

const DONT = [
  {
    en: "We do not diagnose",
    ar: "لا نشخّص",
    detail:
      "We never say you have infertility, hormone disease, infection, or any illness. Only a doctor can diagnose.",
    detailAr:
      "لا نقول إن لديك عقمًا أو مرضًا هرمونيًا أو عدوى أو أي مرض. التشخيص للطبيب فقط.",
  },
  {
    en: "We do not change your medicine",
    ar: "لا نغيّر دواءك",
    detail:
      "We never tell you to start, stop, or change testosterone therapy or any medicine.",
    detailAr: "لا نطلب منك بدء أو إيقاف أو تغيير علاج التستوستيرون أو أي دواء.",
  },
  {
    en: "This demo keeps data on your device",
    ar: "هذا العرض يبقي البيانات على جهازك",
    detail: "Practice data stays in your browser for the demo. It is not a hospital record.",
    detailAr: "بيانات التمرين تبقى في متصفحك للعرض. ليست ملف مستشفى.",
  },
  {
    en: "Scores are guides, not proof",
    ar: "الأرقام إرشاد وليست إثباتًا",
    detail:
      "The health score bands are examples for this demo. They are not proven medical cut-offs.",
    detailAr: "نطاقات درجة الصحة أمثلة لهذا العرض. ليست حدودًا طبية مثبتة.",
  },
  {
    en: "We do not book fertility care alone",
    ar: "لا نحجز رعاية الخصوبة وحدنا",
    detail: "Fertility clinic steps need a doctor’s OK first.",
    detailAr: "خطوات عيادة الخصوبة تحتاج موافقة الطبيب أولًا.",
  },
  {
    en: "Not for insurance or work",
    ar: "ليس للتأمين أو العمل",
    detail: "Your data here is not for insurance, employers, or ads.",
    detailAr: "بياناتك هنا ليست للتأمين أو أصحاب العمل أو الإعلانات.",
  },
] as const;

export default function BoundariesPage() {
  const { locale } = useSeedShield();
  const ar = locale === "ar";

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <header>
        <h1 className="font-display text-4xl text-[var(--cedar)]">
          {ar ? "ما لا يفعله SeedShield" : "What SeedShield will not do"}
        </h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {ar
            ? "كلمات واضحة حتى تعرف حدود التطبيق."
            : "Plain words so you know the app’s limits."}
        </p>
      </header>

      <div className="space-y-3">
        {DONT.map((d) => (
          <article
            key={d.en}
            className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-5"
          >
            <h2 className="font-display text-xl text-[var(--cedar)]">
              {ar ? d.ar : d.en}
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {ar ? d.detailAr : d.detail}
            </p>
          </article>
        ))}
      </div>

      <Link href="/triage" className="inline-flex text-sm text-[var(--cedar)] underline">
        {ar ? "العودة إلى خطوتي" : "Back to my next step"}
      </Link>
    </div>
  );
}
