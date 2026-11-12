"use client";

import { useEffect } from "react";
import { useSeedShield } from "@/lib/store";

export function WatchLive() {
  const { variables, watchLive, setWatchLive, tickWatch, locale } = useSeedShield();
  const ar = locale === "ar";

  useEffect(() => {
    if (!watchLive) return;
    const id = setInterval(() => tickWatch(), 2800);
    return () => clearInterval(id);
  }, [watchLive, tickWatch]);

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--cedar)] p-4 text-[var(--mist)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--brass)]">
            {ar ? "ساعة حيّة" : "Live watch feed"}
          </p>
          <p className="mt-1 text-sm text-[var(--mist)]/85">
            {ar
              ? "محاكاة بيانات فسيولوجية ونفسية من الجهاز القابل للارتداء"
              : "Simulated physio + recovery stream from wearable"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setWatchLive(!watchLive)}
          className="rounded-full bg-[var(--mist)]/15 px-3 py-1 text-xs"
        >
          {watchLive ? (ar ? "إيقاف" : "Pause") : ar ? "تشغيل" : "Live"}
        </button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="HRV trend" value={String(variables.hrvTrend)} />
        <Stat label="Resting HR" value={`${variables.restingHr}`} />
        <Stat label="Temp Δ" value={`${variables.bodyTempAnomaly}`} />
        <Stat label="Sleep reg." value={`${variables.sleepRegularity}`} />
      </div>
      {watchLive && (
        <div className="mt-3 flex items-center gap-2 text-[10px] text-[var(--brass)]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          {ar ? "يبث الآن · يحدّث المؤشر وخريطة الجسم" : "Streaming · updates index & body map"}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--mist)]/10 px-3 py-2">
      <div className="text-[9px] uppercase tracking-wide text-[var(--mist)]/60">
        {label}
      </div>
      <div className="font-display text-xl tabular-nums">{value}</div>
    </div>
  );
}
