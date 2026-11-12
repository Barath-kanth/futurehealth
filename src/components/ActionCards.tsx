"use client";

import { useSeedShield } from "@/lib/store";
import clsx from "clsx";
import Link from "next/link";

export function ActionCards() {
  const { actions, completeAction, locale } = useSeedShield();
  const ar = locale === "ar";

  if (actions.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-6 text-sm text-[var(--muted)]">
        {ar
          ? "لا إجراءات معلّقة — استمر بالمراقبة الصامتة."
          : "No open actions — keep consented watch on."}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {actions.map((a) => (
        <article
          key={a.id}
          className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-display text-xl text-[var(--cedar)]">
                {ar ? a.titleAr : a.title}
              </h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {ar ? a.whyAr : a.why}
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              <Chip>{a.dueLabel && (ar ? a.dueLabelAr : a.dueLabel)}</Chip>
              <Chip tone={a.impact === "high" ? "hot" : "cool"}>
                {a.impact} impact
              </Chip>
              <Chip>{a.effort}</Chip>
            </div>
          </div>
          <ol className="mt-3 list-decimal space-y-1 ps-5 text-sm text-[var(--ink)]/85">
            {(ar ? a.stepsAr : a.steps).map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => completeAction(a.id)}
              className="rounded-md bg-[var(--cedar)] px-3 py-2 text-xs font-medium text-[var(--mist)]"
            >
              {ar ? "تمّ — حدّث خطتي" : "Done — update my plan"}
            </button>
            <Link
              href="/chat"
              className="rounded-md border border-[var(--cedar)] px-3 py-2 text-xs font-medium text-[var(--cedar)]"
            >
              {ar ? "اسأل الطبيب" : "Ask doctor"}
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

function Chip({
  children,
  tone = "cool",
}: {
  children: React.ReactNode;
  tone?: "cool" | "hot";
}) {
  return (
    <span
      className={clsx(
        "rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide",
        tone === "hot"
          ? "bg-[var(--elevated-soft)] text-[var(--elevated)]"
          : "bg-[var(--sand)] text-[var(--muted)]",
      )}
    >
      {children}
    </span>
  );
}
