"use client";

import { levelWord, timeWord } from "@/lib/ui-words";
import { useSeedShield } from "@/lib/store";
import clsx from "clsx";
import Link from "next/link";
import { useEffect } from "react";

export default function RemindersPage() {
  const {
    locale,
    notifications,
    markNotificationDone,
    markNotificationRead,
    refreshScenarioNotices,
    actions,
    variables,
  } = useSeedShield();
  const ar = locale === "ar";

  useEffect(() => {
    refreshScenarioNotices();
  }, [refreshScenarioNotices, variables.heatIndexC, variables.aqi, variables.hydrationLiters]);

  const pending = notifications.filter((n) => !n.done);
  const done = notifications.filter((n) => n.done);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--brass-deep)]">
          {ar ? "إنتاج حي" : "Live production"}
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--cedar)]">
          {ar ? "تذكيرات السيناريو" : "Scenario reminders"}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {ar
            ? "حرارة، هواء، ماء، طعام، نوم، عمل، دخان، كحول — كل تنبيه يقول ماذا تفعل الآن. يتحدّث مع ملفك الحي."
            : "Heat, air, water, food, sleep, work, smoke, alcohol — every alert says what to do now. Updates with your live file."}
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--muted)]">
          <span>
            {pending.length} {ar ? "معلّق" : "pending"}
          </span>
          <span>
            {actions.length} {ar ? "إجراءات خطة" : "plan actions"}
          </span>
          <button
            type="button"
            onClick={refreshScenarioNotices}
            className="text-[var(--cedar)] underline"
          >
            {ar ? "تحديث الآن" : "Refresh now"}
          </button>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-xl text-[var(--cedar)]">
          {ar ? "ماذا تفعل الآن" : "What to do now"}
        </h2>
        {pending.length === 0 && (
          <p className="rounded-xl border border-[var(--line)] bg-[var(--mist)] p-4 text-sm text-[var(--muted)]">
            {ar
              ? "لا تذكيرات — المراقبة الصامتة مستمرة."
              : "No reminders — consented watch continues."}
          </p>
        )}
        {pending.map((n) => (
          <article
            key={n.id}
            className={clsx(
              "rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-4",
              !n.read && "ring-1 ring-[var(--brass)]/40",
            )}
            onClick={() => markNotificationRead(n.id)}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--sand)] px-2 py-0.5 text-[10px] uppercase text-[var(--muted)]">
                {ar ? n.scenarioAr : n.scenario}
              </span>
              <span
                className={clsx(
                  "rounded px-1.5 py-0.5 text-[10px] uppercase",
                  n.level === "urgent" && "bg-[var(--urgent-soft)] text-[var(--urgent)]",
                  n.level === "watch" && "bg-[var(--watch-soft)] text-[var(--watch)]",
                  n.level === "info" && "bg-[var(--info-soft)] text-[var(--cedar)]",
                )}
              >
                {n.level}
              </span>
              <span className="text-[10px] text-[var(--muted)]">{timeWord(n.time, ar)}</span>
            </div>
            <h3 className="mt-2 font-display text-lg text-[var(--cedar)]">
              {ar ? n.titleAr : n.title}
            </h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {ar ? n.bodyAr : n.body}
            </p>
            <p className="mt-3 rounded-xl bg-[var(--cedar)] px-3 py-2 text-sm font-medium text-[var(--mist)]">
              → {ar ? n.doNowAr : n.doNow}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  markNotificationDone(n.id);
                }}
                className="rounded-md bg-[var(--cedar)] px-3 py-1.5 text-xs text-[var(--mist)]"
              >
                {ar ? "تمّ — أغلق التذكير" : "Done — clear reminder"}
              </button>
              {n.href && (
                <Link
                  href={n.href}
                  className="rounded-md border border-[var(--cedar)] px-3 py-1.5 text-xs text-[var(--cedar)]"
                >
                  {ar ? "افتح المسار" : "Open path"}
                </Link>
              )}
            </div>
          </article>
        ))}
      </section>

      {done.length > 0 && (
        <section>
          <h2 className="font-display text-lg text-[var(--muted)]">
            {ar ? "مكتمل" : "Completed"}
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-[var(--muted)]">
            {done.map((n) => (
              <li key={n.id} className="line-through">
                {ar ? n.titleAr : n.title}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
