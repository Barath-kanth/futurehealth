"use client";

import { useState } from "react";
import { useSeedShield } from "@/lib/store";

export function AgeGate({ children }: { children: React.ReactNode }) {
  const { ageVerified, verifyAge, locale } = useSeedShield();
  const ar = locale === "ar";
  const [year, setYear] = useState(1996);
  const [error, setError] = useState("");
  // Adults 18+ (fixed ceiling avoids Date during prerender)
  const maxBirthYear = 2008;

  return (
    <>
      {/* Always keep route children mounted so Next.js instant-navigation
          validation does not drop the page segment. */}
      <div className={ageVerified ? "contents" : "hidden"} aria-hidden={!ageVerified}>
        {children}
      </div>

      {!ageVerified && (
        <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-16">
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--brass-deep)]">
            SeedShield
          </p>
          <h1 className="mt-3 font-display text-4xl text-[var(--cedar)]">
            {ar ? "للبالغين ١٨+" : "For adults 18+"}
          </h1>
          <p className="mt-3 text-sm text-[var(--muted)]">
            {ar
              ? "فحص فردي خاص لصحة الرجل. بوابة لمرة واحدة في هذه الجلسة — لا نفترض الزواج أو الرغبة في الإنجاب."
              : "A private individual health check for men. One-time gate this session — we never assume marriage or family-building goals."}
          </p>
          <label className="mt-8 text-sm text-[var(--ink)]">
            {ar ? "سنة الميلاد" : "Birth year"}
            <input
              type="number"
              min={1950}
              max={maxBirthYear}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--mist)] px-3 py-3 text-base outline-none focus:border-[var(--cedar)]"
            />
          </label>
          {error && <p className="mt-2 text-sm text-[var(--urgent)]">{error}</p>}
          <button
            type="button"
            className="mt-6 rounded-md bg-[var(--cedar)] px-5 py-3 text-sm font-medium text-[var(--mist)]"
            onClick={() => {
              const res = verifyAge(year);
              if (!res.ok) setError(res.message);
            }}
          >
            {ar ? "ابدأ" : "Continue"}
          </button>
        </div>
      )}
    </>
  );
}
