"use client";

import { SimulatedBadge } from "@/components/SimulatedBadge";
import {
  HOME_FINGERPRICK_STEPS,
  HOME_SEMEN_ZERO_RISK_STEPS,
  LIFESTYLE_SUBSTANCE_NOTES,
} from "@/lib/clinical-ranges";
import { PAIRABLE_DEVICES } from "@/lib/me-profile";
import { useSeedShield } from "@/lib/store";
import clsx from "clsx";
import Link from "next/link";

const CATEGORIES = [
  {
    id: "core" as const,
    en: "Core reproductive-relevant streams",
    ar: "التيارات الأساسية ذات الصلة بالتناسل",
  },
  {
    id: "lab" as const,
    en: "Home lab kits (simulated product demos)",
    ar: "أطقم المختبر المنزلي (عروض منتجات محاكاة)",
  },
  {
    id: "demoted_sim" as const,
    en: "Demoted · alcohol / smoke / lung (simulated, out of focus)",
    ar: "مُخفَّض · كحول / تدخين / رئة (محاكاة، خارج التركيز)",
  },
];

export default function DevicesPage() {
  const {
    locale,
    pairedDeviceIds,
    pairDevice,
    unpairDevice,
    streams,
    variables,
    patchVariables,
  } = useSeedShield();
  const ar = locale === "ar";

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-10">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--brass-deep)]">
          {ar ? "اقتران نموذجي · وُسم كمحاكاة" : "Prototype pairing · labeled simulated"}
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--cedar)]">
          {ar ? "مصادر لملف الحيوية التناسلي" : "Sources for the reproductive vitality file"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          {ar
            ? "التركيز: ساعة، بيئة، حاسوب، مقياس، أطقم هرمون/مني محاكاة. أجهزة الكحول/الرئة مُخفَّضة وموسومة — ليست ادعاء تكامل حي."
            : "Focus: watch, environment, PC, scale, simulated hormone/semen kits. Alcohol/lung devices are demoted and tagged — not live integration claims."}
        </p>
      </header>

      {CATEGORIES.map((cat) => {
        const items = PAIRABLE_DEVICES.filter((d) => d.category === cat.id);
        if (!items.length) return null;
        const demoted = cat.id === "demoted_sim";
        return (
          <section
            key={cat.id}
            className={clsx("space-y-3", demoted && "opacity-80")}
          >
            <h2 className="font-display text-2xl text-[var(--cedar)]">
              {ar ? cat.ar : cat.en}
            </h2>
            {demoted && (
              <p className="text-xs text-[var(--muted)]">
                {ar
                  ? "خارج نطاق الصحة الإنجابية الذكرية للتحكيم — أبقِها مطوية في العرض إن أمكن."
                  : "Outside male reproductive health scope for judging — keep folded in the demo if possible."}
              </p>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((d) => {
                const on = pairedDeviceIds.includes(d.id);
                const stream = d.streamId
                  ? streams.find((s) => s.id === d.streamId)
                  : undefined;
                return (
                  <article
                    key={d.id}
                    className={clsx(
                      "rounded-2xl border p-5",
                      on
                        ? "border-emerald-700/40 bg-emerald-50/40"
                        : "border-[var(--line)] bg-[var(--mist)]",
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-xl text-[var(--cedar)]">
                            {ar ? d.nameAr : d.name}
                          </h3>
                          {d.simulated && <SimulatedBadge ar={ar} />}
                        </div>
                        <p className="mt-1 text-[11px] font-medium text-[var(--brass-deep)]">
                          {d.productExample}
                        </p>
                        <p className="mt-1 text-[10px] uppercase tracking-wide text-[var(--muted)]">
                          {d.reliability} reliability
                          {stream ? ` · ${stream.freshness}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => (on ? unpairDevice(d.id) : pairDevice(d.id))}
                        className={clsx(
                          "rounded-md px-3 py-1.5 text-xs font-medium",
                          on
                            ? "border border-[var(--line)] text-[var(--ink)]"
                            : "bg-[var(--cedar)] text-[var(--mist)]",
                        )}
                      >
                        {on
                          ? ar
                            ? "فصل"
                            : "Unpair"
                          : ar
                            ? "اقتران (محاكاة)"
                            : "Pair (sim)"}
                      </button>
                    </div>
                    <p className="mt-3 text-sm text-[var(--ink)]/85">
                      {ar ? d.howAr : d.how}
                    </p>
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      {ar ? d.creativeHookAr : d.creativeHook}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}

      <section className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-6">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-2xl text-[var(--cedar)]">
            {ar ? "خطوات المختبر المنزلي" : "Home lab steps"}
          </h2>
          <SimulatedBadge ar={ar} />
        </div>
        <p className="text-xs text-[var(--muted)]">
          {ar
            ? "عرض تدفق فقط. التعليمات الحقيقية تأتي من طقم معتمد — لا تتبع هذه الخطوات كإجراء طبي."
            : "Demo flow only. Real instructions come from a validated kit — do not follow these steps as medical procedure."}
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <ol className="space-y-2 text-sm">
            <li className="font-medium text-[var(--cedar)]">
              {ar ? "وخز الإصبع" : "Finger-prick"}
            </li>
            {HOME_FINGERPRICK_STEPS.map((s, i) => (
              <li key={i} className="text-[var(--muted)]">
                {i + 1}. {ar ? s.ar : s.en}
              </li>
            ))}
          </ol>
          <ol className="space-y-2 text-sm">
            <li className="font-medium text-[var(--cedar)]">
              {ar ? "مني + SDF" : "Semen + SDF"}
            </li>
            {HOME_SEMEN_ZERO_RISK_STEPS.map((s, i) => (
              <li key={i} className="text-[var(--muted)]">
                {i + 1}. {ar ? s.ar : s.en}
              </li>
            ))}
          </ol>
        </div>
        <button
          type="button"
          onClick={() =>
            patchVariables({
              semenConcentration: 28,
              motilityPct: 42,
              morphologyPct: 5,
              sdfPct: 18,
              testosteroneNgDl: 420,
            })
          }
          className="rounded-md border border-[var(--cedar)] px-4 py-2 text-sm text-[var(--cedar)]"
        >
          {ar ? "حقن نتائج محاكاة في الملف" : "Inject simulated kit results"}
        </button>
        {(variables.semenConcentration !== undefined ||
          variables.testosteroneNgDl !== undefined) && (
          <p className="text-xs text-emerald-800">
            {ar ? "نتائج محاكاة على الملف." : "Simulated results on file."} T=
            {variables.testosteroneNgDl ?? "—"} · conc=
            {variables.semenConcentration ?? "—"}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-[var(--line)] bg-[var(--sand)]/50 p-4 text-xs text-[var(--muted)]">
        <p className="font-medium text-[var(--cedar)]">
          {ar ? "ملاحظات نمط الحياة" : "Lifestyle notes"}
        </p>
        <ul className="mt-2 list-disc space-y-1 ps-4">
          {Object.values(LIFESTYLE_SUBSTANCE_NOTES).map((n, i) => (
            <li key={i}>{ar ? n.ar : n.en}</li>
          ))}
        </ul>
        <Link href="/triage" className="mt-3 inline-block text-[var(--cedar)] underline">
          {ar ? "العودة إلى الفرز الآمن" : "Back to Safe Triage"}
        </Link>
      </section>
    </div>
  );
}
