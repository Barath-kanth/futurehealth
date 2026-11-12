"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSeedShield } from "@/lib/store";
import { computeVitalityIndex } from "@/lib/vitality-analyst";

export function VitalityChart() {
  const { indexSeries, variables, vitalityIndex, locale } = useSeedShield();
  const ar = locale === "ar";
  const meta = computeVitalityIndex(variables);
  const up = meta.deltaVsBaseline >= 0;

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-4 md:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
            {ar ? "اتجاه درجة العرض (مخترعة)" : "Demo guide trend (invented bands)"}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-2xl text-[var(--cedar)]">
              {vitalityIndex}
            </span>
            <span
              className={
                up ? "text-sm font-medium text-emerald-700" : "text-sm font-medium text-[var(--elevated)]"
              }
            >
              {up ? "+" : ""}
              {meta.deltaVsBaseline} vs baseline
            </span>
          </div>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {ar
              ? "توضيحي فقط — ثق بالفرز الآمن أكثر من الرقم."
              : "Illustrative only — trust Safe Triage more than this number."}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          <Pill label={ar ? "قابل للتحكم" : "Controllable drag"} value={meta.controllableDrag} />
          <Pill label={ar ? "غير قابل" : "Uncontrollable"} value={meta.uncontrollableDrag} />
          <Pill label={ar ? "العمل" : "Work drag"} value={meta.workDrag} />
          <Pill label={ar ? "نفسي" : "Psycho drag"} value={meta.psychoDrag} />
        </div>
      </div>

      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={indexSeries}>
            <defs>
              <linearGradient id="mviFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1f3d32" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#1f3d32" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#c9d4cc" />
            <XAxis dataKey="day" hide />
            <YAxis domain={[40, 100]} stroke="#5d6b63" fontSize={11} width={32} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #c9d4cc",
                background: "#f3f6f4",
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="index"
              stroke="none"
              fill="url(#mviFill)"
            />
            <Line
              type="monotone"
              dataKey="index"
              stroke="#1f3d32"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: "#b89b5e" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Pill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-[var(--sand)]/70 px-2.5 py-2">
      <div className="text-[9px] uppercase tracking-wide text-[var(--muted)]">{label}</div>
      <div className="font-display text-lg text-[var(--cedar)]">−{value}</div>
    </div>
  );
}
