"use client";

import { DEFAULT_COORDS, HEAT_BAND_LABEL, personalHeatExposure } from "@/lib/env-live";
import { useSeedShield } from "@/lib/store";
import Link from "next/link";
import { useState } from "react";

type Draft = {
  shiftWork: boolean;
  nightShiftsPerWeek: number;
  outdoorHeatHours: number;
  sedentaryHours: number;
  occupationalStress: number;
};

export function SelfReportForm() {
  const {
    locale,
    consents,
    variables,
    patchVariables,
    envSource,
    refreshLiveEnvironment,
  } = useSeedShield();
  const ar = locale === "ar";

  const [draft, setDraft] = useState<Draft>(() => ({
    shiftWork: variables.shiftWork,
    nightShiftsPerWeek: variables.nightShiftsPerWeek,
    outdoorHeatHours: variables.outdoorHeatHours,
    sedentaryHours: variables.sedentaryHours,
    occupationalStress: variables.occupationalStress,
  }));
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [locNote, setLocNote] = useState<string | null>(null);

  const selfReportOn = consents.self_report;
  const envOn = consents.environment;

  function save() {
    patchVariables(draft);
    setSavedAt(new Date().toLocaleTimeString());
  }

  async function useLiveEnvironment() {
    setLocating(true);
    setLocNote(null);
    const coords = await new Promise<{ lat: number; lon: number } | null>((resolve) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
        () => resolve(null),
        { timeout: 5000, maximumAge: 600000 },
      );
    });
    if (!coords) {
      setLocNote(
        ar
          ? "لم يُسمح بالموقع — نستخدم موقع أبوظبي الافتراضي."
          : "Location not shared — using the Abu Dhabi default.",
      );
    }
    await refreshLiveEnvironment(coords ?? DEFAULT_COORDS);
    setLocating(false);
  }

  const fields: {
    key: "nightShiftsPerWeek" | "outdoorHeatHours" | "sedentaryHours" | "occupationalStress";
    en: string;
    ar: string;
    min: number;
    max: number;
    step: number;
  }[] = [
    { key: "nightShiftsPerWeek", en: "Night shifts per week", ar: "ورديات ليلية أسبوعيًا", min: 0, max: 6, step: 1 },
    { key: "outdoorHeatHours", en: "Hours outdoors in heat per day", ar: "ساعات بالخارج في الحر يوميًا", min: 0, max: 10, step: 0.5 },
    { key: "sedentaryHours", en: "Hours sitting per day", ar: "ساعات الجلوس يوميًا", min: 2, max: 14, step: 0.5 },
    { key: "occupationalStress", en: "Work stress (0–100)", ar: "إجهاد العمل (٠–١٠٠)", min: 0, max: 100, step: 1 },
  ];

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-5 space-y-4">
      <div>
        <h2 className="font-display text-xl text-[var(--cedar)]">
          {ar ? "أخبرنا عن أسبوعك" : "Tell us about your week"}
        </h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {ar
            ? "إجاباتك تُحفظ في هذا المتصفح فقط، وتُستخدم عند موافقتك على الإبلاغ الذاتي."
            : "Your answers stay in this browser and feed triage only when you agree to self-report."}
        </p>
      </div>

      {!selfReportOn ? (
        <p className="rounded-lg bg-[var(--watch-soft)] px-3 py-2 text-xs text-[var(--watch)]">
          {ar ? "فعّل موافقة الإبلاغ الذاتي أولًا من " : "Turn on self-report consent first in "}
          <Link href="/vault" className="underline">
            {ar ? "الخزنة" : "Vault"}
          </Link>
          .
        </p>
      ) : (
        <>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={draft.shiftWork}
              onChange={(e) => setDraft({ ...draft, shiftWork: e.target.checked })}
              className="size-4"
            />
            {ar ? "أعمل بنظام الورديات" : "I work shifts"}
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((f) => (
              <label key={f.key} className="block text-sm">
                <div className="mb-1 flex justify-between text-[var(--muted)]">
                  <span>{ar ? f.ar : f.en}</span>
                  <span className="tabular-nums text-[var(--ink)]">{draft[f.key]}</span>
                </div>
                <input
                  type="range"
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  value={draft[f.key]}
                  onChange={(e) => setDraft({ ...draft, [f.key]: Number(e.target.value) })}
                  className="w-full accent-[var(--cedar)]"
                />
              </label>
            ))}
          </div>

          {envOn && (
            <p className="rounded-lg bg-[var(--sand)] px-3 py-2 text-xs text-[var(--ink)]" data-testid="personal-heat">
              {(() => {
                const e = personalHeatExposure(variables.heatIndexC, draft.outdoorHeatHours);
                const label = ar ? HEAT_BAND_LABEL[e.band].ar : HEAT_BAND_LABEL[e.band].en;
                return ar
                  ? `تقدير تعرّضك للحرارة: مؤشر الحرارة في منطقتك ${variables.heatIndexC}°م (${label}) × ${draft.outdoorHeatHours} ساعة بالخارج = ${e.hoursInBand} ساعة في هذا النطاق. الظل والأماكن المكيّفة غير محسوبة، والشمس المباشرة تزيد الإحساس حتى نحو ٨°م.`
                  : `Your estimated heat exposure: area heat index ${variables.heatIndexC}°C (${label}) × ${draft.outdoorHeatHours} h outdoors = ${e.hoursInBand} h in that range. Shade and air-conditioned time are not counted, and direct sun can add up to about 8°C.`;
              })()}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={save}
              className="rounded-md bg-[var(--cedar)] px-4 py-2 text-xs font-medium text-[var(--mist)]"
            >
              {ar ? "احفظ إجاباتي" : "Save my answers"}
            </button>
            {savedAt && (
              <span className="text-xs text-[var(--muted)]">
                {ar ? `حُفظت ${savedAt}` : `Saved ${savedAt}`}
              </span>
            )}
          </div>
        </>
      )}

      <div className="border-t border-[var(--line)] pt-4 space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!envOn || locating}
            onClick={useLiveEnvironment}
            className="rounded-md border border-[var(--line)] px-3 py-2 text-xs disabled:opacity-50"
          >
            {locating
              ? ar ? "جارٍ الجلب…" : "Fetching…"
              : ar ? "احصل على الحرارة وجودة الهواء الحية" : "Get live heat & air quality"}
          </button>
          {envSource && (
            <span className="text-xs text-[var(--muted)]">
              {envSource === "live"
                ? ar ? "مصدر حي (OpenWeatherMap)" : "Live source (OpenWeatherMap)"
                : ar ? "مصدر محاكى" : "Simulated feed (no live key or offline)"}
            </span>
          )}
        </div>
        {!envOn && (
          <p className="text-xs text-[var(--muted)]">
            {ar ? "فعّل موافقة البيئة في الخزنة لجلب القيم الحية." : "Turn on environment consent in Vault to fetch live values."}
          </p>
        )}
        {locNote && <p className="text-xs text-[var(--muted)]">{locNote}</p>}
        <p className="text-[11px] text-[var(--muted)]">
          {ar
            ? "نرسل إحداثيات مُقرّبة (~1 كم) فقط. لا نرسل اسمك أو بياناتك الصحية."
            : "Only coarse coordinates (~1 km) are sent. No name or health data leaves for this lookup."}
        </p>
      </div>
    </section>
  );
}
