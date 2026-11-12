"use client";

import { useMemo, useState, useEffectEvent } from "react";
import { useSeedShield } from "@/lib/store";
import { computeVitalityIndex, buildIndexSeries } from "@/lib/vitality-analyst";
import { mergeVariables } from "@/lib/risk-engine";
import { computeSensitivityTable } from "@/lib/dynamic-sensitivity";
import { SimulatedBadge } from "@/components/SimulatedBadge";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  BarChart,
} from "recharts";
import Link from "next/link";

type AgentPayload = {
  available: boolean;
  provider: string;
  model: string;
  reasonIfUnavailable?: string;
  agent?: {
    headline: string;
    interactionStory: string;
    pathwayOutlook: { tier: string; probabilityNote: string }[];
    rankedLevers: {
      lever: string;
      whyItMattersTogether: string;
      expectedDirection: string;
    }[];
    sevenDayStewardship: string[];
    whatNotToFear: string;
    disclaimer: string;
  };
  grounding?: {
    vitalityIndex: number;
    triage: { tier: string; label: string; labelAr: string };
    sensitivity: ReturnType<typeof computeSensitivityTable>;
  };
};

export default function StudioPage() {
  const {
    locale,
    variables,
    vitalityIndex,
    assessment,
    culturalTone,
    patchVariables,
  } = useSeedShield();
  const ar = locale === "ar";
  const [heatBias, setHeatBias] = useState(0);
  const [sleepBias, setSleepBias] = useState(0);
  const [stressBias, setStressBias] = useState(0);
  const [agent, setAgent] = useState<AgentPayload | null>(null);
  const [loading, setLoading] = useState(false);

  const foresight = useMemo(() => {
    const patched = mergeVariables(variables, {
      heatIndexC: variables.heatIndexC + heatBias,
      sleepHours: Math.max(3, variables.sleepHours + sleepBias),
      occupationalStress: Math.min(
        100,
        Math.max(0, variables.occupationalStress + stressBias),
      ),
    });
    const snap = computeVitalityIndex(patched);
    const series = buildIndexSeries(patched).map((p, i) => ({
      ...p,
      baseline: buildIndexSeries(variables)[i]?.index,
      foresight: p.index,
    }));
    const sensitivity = computeSensitivityTable(patched);
    return { snap, series, patched, sensitivity };
  }, [variables, heatBias, sleepBias, stressBias]);

  const runAgent = useEffectEvent(async (iv: typeof variables) => {
    setLoading(true);
    try {
      const res = await fetch("/api/gemini-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variables: iv,
          locale,
          culturalTone,
        }),
      });
      const data = (await res.json()) as AgentPayload;
      setAgent(data);
    } catch {
      setAgent({
        available: false,
        provider: "unavailable",
        model: "—",
        reasonIfUnavailable: ar
          ? "تعذّر الاتصال بوكيل Gemini."
          : "Could not reach the Gemini agent.",
      });
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--brass-deep)]">
            {ar ? "ابتكار Gemini فقط" : "Gemini-only innovation"}
          </p>
          <SimulatedBadge
            label="Requires Vertex"
            labelAr="يتطلب Vertex"
            ar={ar}
          />
        </div>
        <h1 className="mt-2 font-display text-4xl text-[var(--cedar)]">
          {ar ? "وكيل الحيوية الديناميكي" : "Dynamic Vitality Agent"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          {ar
            ? "الفرز الحتمي يبقى أرضية الأمان. Gemini يفسر تفاعل العوامل والاحتمالات وخطة الرعاية — شيء لا تستطيع القواعد الثابتة وحدها فعله. دون اعتمادات Vertex يُوقف الوكيل (بلا ذكاء مزيف)."
            : "Deterministic Safe Triage stays the safety floor. Gemini reasons about factor interactions, soft pathway outlook, and stewardship — work rules alone cannot do. Without Vertex credentials the agent stays offline (no fake AI)."}
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">
          {ar ? "مسار اليوم المقفول:" : "Locked pathway today:"}{" "}
          <strong className="text-[var(--cedar)]">
            {ar ? assessment.triage.labelAr : assessment.triage.label}
          </strong>
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-4">
          <p className="text-xs font-medium text-[var(--cedar)]">
            {ar
              ? "تضمين ديناميكي — حرّك عاملًا واحدًا وأعد الحساب فورًا"
              : "Dynamic inclusion — nudge one factor, recompute instantly"}
          </p>
          <Slider
            label={ar ? "انحياز الحرارة °C" : "Heat bias °C"}
            value={heatBias}
            min={-5}
            max={8}
            step={0.5}
            onChange={setHeatBias}
          />
          <Slider
            label={ar ? "انحياز النوم (ساعات)" : "Sleep bias (hours)"}
            value={sleepBias}
            min={-2}
            max={2}
            step={0.1}
            onChange={setSleepBias}
          />
          <Slider
            label={ar ? "انحياز إجهاد العمل" : "Work-stress bias"}
            value={stressBias}
            min={-30}
            max={30}
            step={1}
            onChange={setStressBias}
          />
          <div className="rounded-xl bg-[var(--cedar)] p-4 text-[var(--mist)]">
            <div className="text-[10px] uppercase tracking-wide text-[var(--brass)]">
              {ar ? "مؤشر بعد التحريك (حتمي)" : "Index after nudge (deterministic)"}
            </div>
            <div className="font-display text-4xl">{foresight.snap.index}</div>
            <div className="text-xs text-[var(--mist)]/75">
              {ar ? "الحي الآن" : "Live now"}: {vitalityIndex} · Δ{" "}
              {(foresight.snap.index - vitalityIndex).toFixed(1)}
            </div>
            <div className="mt-2 text-[10px] text-[var(--brass)]">
              {ar ? "تآزر حرارة×نوم:" : "Heat×sleep synergy:"}{" "}
              {foresight.sensitivity.interactionGap.synergy > 0 ? "+" : ""}
              {foresight.sensitivity.interactionGap.synergy}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => runAgent(foresight.patched)}
              disabled={loading}
              className="rounded-md bg-[var(--cedar)] px-3 py-2 text-xs text-[var(--mist)] disabled:opacity-60"
            >
              {loading
                ? "…"
                : ar
                  ? "تشغيل وكيل Gemini"
                  : "Run Gemini Agent"}
            </button>
            <button
              type="button"
              onClick={() => {
                patchVariables({
                  heatIndexC: foresight.patched.heatIndexC,
                  sleepHours: foresight.patched.sleepHours,
                  occupationalStress: foresight.patched.occupationalStress,
                });
              }}
              className="rounded-md border border-[var(--cedar)] px-3 py-2 text-xs text-[var(--cedar)]"
            >
              {ar ? "طبّق على ملفي" : "Apply to my file"}
            </button>
            <Link
              href="/triage"
              className="rounded-md border border-[var(--line)] px-3 py-2 text-xs"
            >
              {ar ? "الفرز الآمن" : "Safe Triage"}
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-4">
            <h3 className="font-display text-lg text-[var(--cedar)]">
              {ar ? "٣٠ يومًا: حي مقابل متوقع" : "30 days: live vs foresight"}
            </h3>
            <div className="mt-3 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={foresight.series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#c9d4cc" />
                  <XAxis dataKey="day" hide />
                  <YAxis domain={[40, 100]} width={30} stroke="#5d6b63" fontSize={11} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    stroke="#9aa89f"
                    strokeWidth={2}
                    dot={false}
                    name="Live"
                  />
                  <Line
                    type="monotone"
                    dataKey="foresight"
                    stroke="#1f3d32"
                    strokeWidth={2.5}
                    dot={false}
                    name="Foresight"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-4">
            <h3 className="font-display text-lg text-[var(--cedar)]">
              {ar
                ? "حساسية العوامل (حتمية · تتحدث فورًا)"
                : "Factor sensitivity (deterministic · live)"}
            </h3>
            <p className="mt-1 text-[10px] text-[var(--muted)]">
              {ar
                ? "أرقام التغيير من المحرك — Gemini يفسر التفاعل لاحقًا."
                : "Delta numbers from the engine — Gemini interprets interactions next."}
            </p>
            <div className="mt-3 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={foresight.sensitivity.topImprove.map((d) => ({
                    name: ar ? d.labelAr : d.label,
                    delta: d.indexDelta,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#c9d4cc" />
                  <XAxis dataKey="name" hide />
                  <YAxis stroke="#5d6b63" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="delta" fill="#1f3d32" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 space-y-1 text-xs text-[var(--muted)]">
              {foresight.sensitivity.topImprove.slice(0, 4).map((d) => (
                <li key={d.id} className="flex justify-between gap-2">
                  <span>{ar ? d.labelAr : d.label}</span>
                  <span className="tabular-nums text-[var(--cedar)]">
                    {d.indexDelta >= 0 ? "+" : ""}
                    {d.indexDelta}
                    {d.triageChanged ? " · triageΔ" : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-[var(--cedar)]/30 bg-[var(--mist)] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-2xl text-[var(--cedar)]">
            {ar ? "مخرجات وكيل Gemini" : "Gemini Agent output"}
          </h2>
          {agent && (
            <span className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
              {agent.provider} · {agent.model}
            </span>
          )}
        </div>

        {!agent && (
          <p className="text-sm text-[var(--muted)]">
            {ar
              ? "اضغط «تشغيل وكيل Gemini» بعد تحريك العوامل. هذا الابتكار لا يُستبدل بقواعد محلية."
              : "Press “Run Gemini Agent” after nudging factors. This innovation is not replaced by local rules."}
          </p>
        )}

        {agent && !agent.available && (
          <div className="rounded-xl border border-[var(--watch)]/40 bg-[var(--watch-soft)] p-4 text-sm text-[var(--watch)]">
            <p className="font-medium">
              {ar ? "الوكيل غير متاح (متعمد)" : "Agent unavailable (by design)"}
            </p>
            <p className="mt-1 text-xs">{agent.reasonIfUnavailable}</p>
            <p className="mt-2 text-xs">
              {ar
                ? "أضف GOOGLE_CLOUD_PROJECT و GOOGLE_APPLICATION_CREDENTIALS في .env.local — الفرز الحتمي يبقى يعمل."
                : "Set GOOGLE_CLOUD_PROJECT + GOOGLE_APPLICATION_CREDENTIALS in .env.local — deterministic triage still works."}
            </p>
          </div>
        )}

        {agent?.available && agent.agent && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-xl text-[var(--cedar)]">
                {agent.agent.headline}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]/85">
                {agent.agent.interactionStory}
              </p>
            </div>

            {agent.agent.pathwayOutlook.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-[var(--cedar)]">
                  {ar ? "أفق المسار (احتمالي · استكشافي)" : "Pathway outlook (probabilistic · exploratory)"}
                </h4>
                <ul className="mt-2 space-y-2 text-sm">
                  {agent.agent.pathwayOutlook.map((p, i) => (
                    <li
                      key={i}
                      className="rounded-lg border border-[var(--line)] px-3 py-2"
                    >
                      <span className="font-medium text-[var(--cedar)]">
                        {p.tier.replaceAll("_", " ")}
                      </span>
                      <span className="text-[var(--muted)]"> — {p.probabilityNote}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold text-[var(--cedar)]">
                {ar ? "عوامل مرتبة بالتفاعل" : "Levers ranked by interaction"}
              </h4>
              <ul className="mt-2 space-y-2 text-sm">
                {agent.agent.rankedLevers.map((r, i) => (
                  <li key={i} className="rounded-lg bg-[var(--sand)]/50 px-3 py-2">
                    <div className="font-medium text-[var(--cedar)]">{r.lever}</div>
                    <p className="text-xs text-[var(--muted)]">{r.whyItMattersTogether}</p>
                    <p className="mt-1 text-xs text-[var(--brass-deep)]">
                      {r.expectedDirection}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {agent.agent.sevenDayStewardship.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-[var(--cedar)]">
                  {ar ? "خطة ٧ أيام" : "7-day stewardship"}
                </h4>
                <ol className="mt-2 list-decimal space-y-1 ps-5 text-sm text-[var(--ink)]/85">
                  {agent.agent.sevenDayStewardship.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ol>
              </div>
            )}

            <p className="text-sm text-[var(--muted)]">{agent.agent.whatNotToFear}</p>
            <p className="text-xs text-[var(--watch)]">{agent.agent.disclaimer}</p>
          </div>
        )}
      </section>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block text-sm">
      <div className="mb-1 flex justify-between text-[var(--muted)]">
        <span>{label}</span>
        <span className="tabular-nums text-[var(--ink)]">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--cedar)]"
      />
    </label>
  );
}
