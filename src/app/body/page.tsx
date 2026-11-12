"use client";

import { BodyMap } from "@/components/BodyMap";
import { WatchLive } from "@/components/WatchLive";
import { useSeedShield } from "@/lib/store";
import Link from "next/link";

export default function BodyPage() {
  const { locale, vitalityIndex } = useSeedShield();
  const ar = locale === "ar";

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--brass-deep)]">
          {ar ? "طبقة ثانوية · خارج مركز الفرز" : "Secondary layer · outside triage centerpiece"}
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--cedar)]">
          {ar ? "خريطة الجسم (مُخفَّضة)" : "Body map (demoted)"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          {ar
            ? `مؤشرك ${vitalityIndex}. للتحكيم: اجعل الفرز الآمن والصحة التناسلية في المقدمة — هذه الخريطة اختيارية.`
            : `Index ${vitalityIndex}. For judging: lead with Safe Triage and reproductive health — this map is optional context.`}{" "}
          <Link href="/triage" className="text-[var(--cedar)] underline">
            {ar ? "الفرز الآمن" : "Safe Triage"}
          </Link>
        </p>
      </header>

      <WatchLive />
      <BodyMap />

      <div className="flex flex-wrap gap-2">
        <Link href="/actions" className="rounded-md bg-[var(--cedar)] px-4 py-2 text-sm text-[var(--mist)]">
          {ar ? "افتح خطة العمل" : "Open action plan"}
        </Link>
        <Link href="/chat" className="rounded-md border border-[var(--cedar)] px-4 py-2 text-sm text-[var(--cedar)]">
          {ar ? "اسأل الطبيب عن منطقة" : "Ask doctor about a region"}
        </Link>
      </div>
    </div>
  );
}
