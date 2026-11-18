"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useSeedShield } from "@/lib/store";
import { NotificationBell } from "@/components/NotificationBell";
import { AgeGate } from "@/components/AgeGate";
import { useEffect, useState } from "react";

/** Patient-first nav — keep short. Extra pages live under More. */
const NAV = [
  { href: "/", label: "Home", labelAr: "الرئيسية" },
  { href: "/triage", label: "Next step", labelAr: "خطوتي" },
  { href: "/analyst", label: "My health", labelAr: "صحتي" },
  { href: "/devices", label: "Devices", labelAr: "أجهزتي" },
  { href: "/actions", label: "Do now", labelAr: "افعل الآن" },
  { href: "/chat", label: "Doctor", labelAr: "الطبيب" },
  { href: "/vault", label: "Privacy", labelAr: "خصوصيتي" },
  { href: "/agents", label: "Watch", labelAr: "المراقبة" },
];

const MORE = [
  { href: "/reminders", label: "Reminders", labelAr: "تذكيرات" },
  { href: "/studio", label: "What-if", labelAr: "ماذا لو" },
  { href: "/analytics", label: "For reviewers", labelAr: "للمراجعين" },
  { href: "/boundaries", label: "Our limits", labelAr: "حدودنا" },
  { href: "/ranges", label: "Lab ranges", labelAr: "نطاقات المختبر" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { locale, setLocale, ageVerified, resetDemoData, interactionMode, discreet, setDiscreet } =
    useSeedShield();
  const ar = locale === "ar";
  const textOnly = interactionMode === "text";
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = MORE.some((m) => m.href === pathname);

  // Discreet mode: neutral browser-tab title (re-applied on every navigation).
  useEffect(() => {
    if (!discreet) return;
    const t = window.setTimeout(() => {
      document.title = "Health check";
    }, 0);
    return () => window.clearTimeout(t);
  }, [discreet, pathname]);

  return (
    <div
      className={clsx(
        "min-h-full flex flex-col",
        ar && "font-arabic",
        textOnly && "text-only-mode",
      )}
      dir={ar ? "rtl" : "ltr"}
    >
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--mist)_88%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="font-display text-xl tracking-tight text-[var(--cedar)] md:text-2xl">
            SeedShield
          </Link>
          {ageVerified && (
            <nav className="hidden items-center gap-1 lg:flex">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "rounded-md px-2.5 py-1.5 text-sm transition",
                    pathname === item.href
                      ? "bg-[var(--cedar)] text-[var(--mist)]"
                      : "text-[var(--ink)]/80 hover:bg-[var(--sand)]",
                  )}
                >
                  {ar ? item.labelAr : item.label}
                </Link>
              ))}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMoreOpen((o) => !o)}
                  className={clsx(
                    "rounded-md px-2.5 py-1.5 text-sm",
                    moreActive || moreOpen
                      ? "bg-[var(--sand)] text-[var(--cedar)]"
                      : "text-[var(--ink)]/80 hover:bg-[var(--sand)]",
                  )}
                >
                  {ar ? "المزيد" : "More"}
                </button>
                {moreOpen && (
                  <div className="absolute end-0 top-full z-50 mt-1 min-w-[10rem] rounded-lg border border-[var(--line)] bg-[var(--mist)] py-1 shadow-md">
                    {MORE.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        className={clsx(
                          "block px-3 py-2 text-sm",
                          pathname === item.href
                            ? "bg-[var(--cedar)] text-[var(--mist)]"
                            : "text-[var(--ink)] hover:bg-[var(--sand)]",
                        )}
                      >
                        {ar ? item.labelAr : item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          )}
          <div className="flex items-center gap-2">
            {ageVerified && <NotificationBell />}
            {ageVerified && (
              <button
                type="button"
                onClick={() => resetDemoData()}
                className="hidden rounded-md border border-[var(--line)] px-2 py-1.5 text-[10px] text-[var(--muted)] sm:inline"
              >
                {ar ? "إعادة" : "Reset"}
              </button>
            )}
            {ageVerified && (
              <button
                type="button"
                aria-pressed={discreet}
                onClick={() => setDiscreet(!discreet)}
                className={clsx(
                  "rounded-md border px-2 py-1.5 text-[10px]",
                  discreet
                    ? "border-[var(--cedar)] bg-[var(--cedar)] text-[var(--mist)]"
                    : "border-[var(--line)] text-[var(--muted)]",
                )}
              >
                {ar ? "الوضع الخفي" : "Discreet"}
              </button>
            )}
            {ageVerified && discreet && (
              <button
                type="button"
                onClick={() => window.location.replace("https://www.google.com")}
                className="rounded-md border border-[var(--urgent)] px-2 py-1.5 text-[10px] text-[var(--urgent)]"
              >
                {ar ? "خروج سريع" : "Quick exit"}
              </button>
            )}
            <button
              type="button"
              onClick={() => setLocale(ar ? "en" : "ar")}
              className="rounded-md border border-[var(--line)] bg-[var(--mist)] px-3 py-1.5 text-xs font-medium text-[var(--cedar)]"
            >
              {ar ? "English" : "العربية"}
            </button>
          </div>
        </div>
        {ageVerified && (
          <div className="flex gap-1 overflow-x-auto border-t border-[var(--line)] px-2 py-2 lg:hidden">
            {[...NAV, ...MORE].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "shrink-0 rounded-md px-2.5 py-1 text-xs",
                  pathname === item.href
                    ? "bg-[var(--cedar)] text-[var(--mist)]"
                    : "bg-[var(--sand)] text-[var(--ink)]",
                )}
              >
                {ar ? item.labelAr : item.label}
              </Link>
            ))}
          </div>
        )}
      </header>
      <main className="flex-1">{/* Age gate still applies */}
        <AgeGate>{children}</AgeGate>
      </main>
      <footer className="border-t border-[var(--line)] bg-[var(--sand)]/60">
        <div className="mx-auto max-w-6xl px-4 py-5 text-xs text-[var(--muted)]">
          {ar
            ? "هذا فحص أولي — ليس تشخيصًا. قرار العلاج للطبيب."
            : "This is an early check — not a diagnosis. Treatment decisions stay with your doctor."}
        </div>
      </footer>
    </div>
  );
}
