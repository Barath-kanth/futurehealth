"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { levelWord, timeWord } from "@/lib/ui-words";
import { useSeedShield } from "@/lib/store";
import clsx from "clsx";
import Link from "next/link";

export function NotificationBell() {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    markNotificationDone,
    refreshScenarioNotices,
    locale,
  } = useSeedShield();
  const [open, setOpen] = useState(false);
  const ar = locale === "ar";
  const active = notifications.filter((n) => !n.done);
  const unread = active.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => {
          refreshScenarioNotices();
          setOpen((v) => !v);
        }}
        className="relative rounded-md border border-[var(--line)] bg-[var(--mist)] p-2 text-[var(--cedar)]"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--elevated)] px-1 text-[9px] text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute end-0 z-50 mt-2 w-[22rem] overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--mist)] shadow-lg">
          <div className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2">
            <span className="text-xs font-semibold text-[var(--cedar)]">
              {ar
                ? `تذكيرات (${unread} غير مقروء)`
                : `Reminders (${unread} unread)`}
            </span>
            <div className="flex gap-2">
              <Link
                href="/reminders"
                className="text-[10px] text-[var(--cedar)]"
                onClick={() => setOpen(false)}
              >
                {ar ? "الكل" : "All"}
              </Link>
              <button
                type="button"
                className="text-[10px] text-[var(--muted)]"
                onClick={markAllNotificationsRead}
              >
                {ar ? "مقروء" : "Read"}
              </button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {active.length === 0 && (
              <p className="px-3 py-4 text-xs text-[var(--muted)]">
                {ar ? "لا تذكيرات معلّقة." : "No pending reminders."}
              </p>
            )}
            {active.map((n) => (
              <div
                key={n.id}
                className={clsx(
                  "border-b border-[var(--line)] px-3 py-2.5",
                  !n.read && "bg-[var(--sand)]/50",
                )}
              >
                <button
                  type="button"
                  className="w-full text-start"
                  onClick={() => markNotificationRead(n.id)}
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    {n.scenario && (
                      <span className="rounded bg-[var(--sand)] px-1.5 py-0.5 text-[9px] uppercase text-[var(--muted)]">
                        {ar ? n.scenarioAr : n.scenario}
                      </span>
                    )}
                    <span
                      className={clsx(
                        "rounded px-1.5 py-0.5 text-[9px] uppercase",
                        n.level === "urgent" &&
                          "bg-[var(--urgent-soft)] text-[var(--urgent)]",
                        n.level === "watch" &&
                          "bg-[var(--watch-soft)] text-[var(--watch)]",
                        n.level === "info" &&
                          "bg-[var(--info-soft)] text-[var(--cedar)]",
                      )}
                    >
                      {levelWord(n.level, ar)}
                    </span>
                  </div>
                  <div className="mt-1 text-xs font-medium text-[var(--ink)]">
                    {ar ? n.titleAr : n.title}
                  </div>
                  <p className="mt-1 text-[11px] leading-snug text-[var(--muted)]">
                    {ar ? n.bodyAr : n.body}
                  </p>
                  {(n.doNow || n.doNowAr) && (
                    <p className="mt-1.5 rounded-md bg-[var(--cedar)]/8 px-2 py-1.5 text-[11px] font-medium text-[var(--cedar)]">
                      → {ar ? n.doNowAr : n.doNow}
                    </p>
                  )}
                </button>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => markNotificationDone(n.id)}
                    className="rounded-md bg-[var(--cedar)] px-2 py-1 text-[10px] text-[var(--mist)]"
                  >
                    {ar ? "تمّ" : "Done"}
                  </button>
                  {n.href && (
                    <Link
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className="text-[10px] font-medium text-[var(--brass-deep)] underline"
                    >
                      {ar ? "افتح" : "Open"}
                    </Link>
                  )}
                  <span className="text-[10px] text-[var(--muted)]">{timeWord(n.time, ar)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
