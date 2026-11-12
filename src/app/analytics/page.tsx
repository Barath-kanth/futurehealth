"use client";

import { IndexBandMeter } from "@/components/IndexBandMeter";
import { SimulatedBadge } from "@/components/SimulatedBadge";
import {
  careLoopFromPopulation,
  clinicianQueueFromPopulation,
  fairnessFromPopulation,
  funnelFromPopulation,
  getSyntheticPopulation,
  metricsFromPopulation,
} from "@/lib/synthetic-population";
import { runTriageSafetyTests } from "@/lib/triage-safety";
import { useSeedShield } from "@/lib/store";
import Link from "next/link";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function AnalyticsPage() {
  const {
    locale,
    vitalityIndex,
    indexSeries,
    indexBand,
    doctorAlerts,
    doctorAlertOptIn,
    acknowledgeDoctorAlert,
    assignedDoctor,
    pairedDeviceIds,
    actions,
    assessment,
  } = useSeedShield();
  const ar = locale === "ar";

  const population = useMemo(() => getSyntheticPopulation(), []);
  const metrics = useMemo(() => metricsFromPopulation(population), [population]);
  const funnel = useMemo(() => funnelFromPopulation(population), [population]);
  const fairness = useMemo(() => fairnessFromPopulation(population), [population]);
  const careLoop = useMemo(() => careLoopFromPopulation(population), [population]);
  const queue = useMemo(() => clinicianQueueFromPopulation(population), [population]);
  const safety = useMemo(() => runTriageSafetyTests(), []);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-4xl text-[var(--cedar)]">
            {ar ? "لوحة المراجعين" : "Reviewer board"}
          </h1>
          <SimulatedBadge label="Demo data" labelAr="بيانات عرض" ar={ar} />
        </div>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          {ar
            ? "للمحكّمين والعيادات — ليست شاشة المريض اليومية."
            : "For judges and clinics — not the everyday patient screen."}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Stat
          label={ar ? "تقييمات مكتملة" : "Completed assessments"}
          value={String(metrics.completedAssessments)}
        />
        <Stat
          label={ar ? "ساعات وسيط للإكمال" : "Median hrs to eval/complete"}
          value={String(metrics.medianHoursToEvaluation)}
        />
        <Stat
          label={ar ? "إكمال الإحالة" : "Referral completion"}
          value={`${Math.round(metrics.referralCompletionRate * 100)}%`}
        />
        <Stat label={ar ? "ثقة المستخدم" : "User trust"} value="N/A" />
        <Stat label={ar ? "مراجعة ثقافية" : "Cultural review"} value="Pending" />
        <Stat
          label={ar ? "اختبارات أمان الفرز" : "Triage safety tests"}
          value={`${safety.passed}/${safety.total}`}
        />
      </div>

      <details className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-5">
        <summary className="cursor-pointer font-display text-xl text-[var(--cedar)]">
          {ar
            ? `اختبارات الأمان (${safety.passed}/${safety.total}) — اضغط للعرض`
            : `Safety checks (${safety.passed}/${safety.total}) — tap to open`}
        </summary>
        <p className="mt-2 text-xs text-[var(--muted)]">
          {ar ? "للمراجعين فقط." : "For reviewers only."}
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--line)] text-[var(--muted)]">
                <th className="py-1 pe-2">{ar ? "الحالة" : "Case"}</th>
                <th className="py-1 pe-2">{ar ? "النتيجة" : "Result"}</th>
                <th className="py-1">OK</th>
              </tr>
            </thead>
            <tbody>
              {safety.results.map((r) => (
                <tr key={r.id} className="border-b border-[var(--line)]/60">
                  <td className="py-1.5 pe-2">{r.title}</td>
                  <td className="py-1.5 pe-2">{String(r.actual).replaceAll("_", " ")}</td>
                  <td className="py-1.5">{r.pass ? "PASS" : "FAIL"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-5">
          <h2 className="font-display text-xl text-[var(--cedar)]">
            {ar ? "حلقة الرعاية المغلقة" : "Closed-loop care pathway"}
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {ar
              ? `مدعو ${careLoop.invited} · مُقيَّم ${careLoop.assessed} · مُحال ${careLoop.referred} · مكتمل ${careLoop.referralCompleted}`
              : `Invited ${careLoop.invited} · Assessed ${careLoop.assessed} · Referred ${careLoop.referred} · Completed ${careLoop.referralCompleted}`}
          </p>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={careLoop.byStage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#c9d4cc" />
                <XAxis
                  dataKey="stage"
                  tickFormatter={(v) => String(v).replaceAll("_", " ")}
                  stroke="#5d6b63"
                  fontSize={10}
                />
                <YAxis stroke="#5d6b63" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" fill="#1f3d32" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-5">
          <h2 className="font-display text-xl text-[var(--cedar)]">
            {ar ? "قائمة الطبيب (اصطناعي)" : "Clinician queue (synthetic)"}
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {ar
              ? "يُظهر زمن التقييم ومرحلة الإحالة على الجانب السريري."
              : "Shows time-to-assessment and referral stage on the clinician side."}
          </p>
          <ul className="mt-3 max-h-56 space-y-1 overflow-y-auto text-xs">
            {queue.map((q) => (
              <li
                key={q.id}
                className="flex flex-wrap justify-between gap-2 border-b border-[var(--line)] py-1.5"
              >
                <span className="font-medium text-[var(--cedar)]">
                  {q.id} · {q.triage.replaceAll("_", " ")}
                </span>
                <span className="text-[var(--muted)]">
                  {q.careStage.replaceAll("_", " ")} · {q.hoursToAssessment}h
                  {q.hoursToReferralComplete != null
                    ? ` → ${q.hoursToReferralComplete}h`
                    : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-5">
          <h2 className="font-display text-xl text-[var(--cedar)]">
            {ar ? "قمع الفرز (اصطناعي)" : "Triage funnel (synthetic)"}
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {ar ? "مسارك أنت:" : "Your path:"}{" "}
            <span className="font-medium text-[var(--cedar)]">
              {assessment.triage.tier.replaceAll("_", " ")}
            </span>
          </p>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel}>
                <CartesianGrid strokeDasharray="3 3" stroke="#c9d4cc" />
                <XAxis
                  dataKey="tier"
                  tickFormatter={(v) => String(v).replaceAll("_", " ").slice(0, 10)}
                  stroke="#5d6b63"
                  fontSize={10}
                />
                <YAxis stroke="#5d6b63" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" fill="#1f3d32" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-5">
          <h2 className="font-display text-xl text-[var(--cedar)]">
            {ar ? "العدالة عبر المجموعات" : "Fairness across groups"}
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {ar
              ? "وكيل إكمال المسار + بوابة المراجعة البشرية (عرض توضيحي)."
              : "Proxy: pathway completion + human-review gate coverage (illustrative)."}
          </p>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fairness} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#c9d4cc" />
                <XAxis type="number" domain={[0, 1]} stroke="#5d6b63" fontSize={11} />
                <YAxis
                  type="category"
                  dataKey="group"
                  width={78}
                  stroke="#5d6b63"
                  fontSize={10}
                />
                <Tooltip />
                <Bar dataKey="score" fill="#8a6a1f" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-dashed border-[var(--brass)]/50 bg-[var(--watch-soft)]/40 p-4 text-sm text-[var(--watch)]">
        {ar
          ? "فجوة الرعاية: الرجال في «معلومات غير كافية» أو «رعاية ذاتية» مع علامات حمراء صامتة يظهرون هنا كفرصة متابعة صامتة — دون افتراض رغبة في الإنجاب."
          : "Care-gap view: men in insufficient-info or self-care with silent red-flag history appear as quiet follow-up opportunities — without assuming family-building intent."}
        <div className="mt-2 text-xs">
          {funnel.find((f) => f.tier === "insufficient_info")?.count ?? 0}{" "}
          {ar ? "معلومات غير كافية ·" : "insufficient info ·"}{" "}
          {funnel.find((f) => f.tier === "urgent")?.count ?? 0}{" "}
          {ar ? "عاجل" : "urgent"}
        </div>
      </section>

      <IndexBandMeter />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={ar ? "مؤشرك الحي" : "Your live MVI"} value={String(vitalityIndex)} />
        <Stat label={ar ? "نطاقك التوضيحي" : "Your illustrative band"} value={indexBand} />
        <Stat label={ar ? "أجهزة مربوطة" : "Devices on"} value={String(pairedDeviceIds.length)} />
        <Stat label={ar ? "إجراءات مفتوحة" : "Open actions"} value={String(actions.length)} />
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-4">
        <h2 className="font-display text-xl text-[var(--cedar)]">
          {ar ? "منحنى ملفك (٣٠ يومًا)" : "Your file curve (30 days)"}
        </h2>
        <div className="mt-3 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={indexSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#c9d4cc" />
              <XAxis dataKey="day" hide />
              <YAxis domain={[40, 100]} width={30} stroke="#5d6b63" fontSize={11} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="index"
                stroke="#1f3d32"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl text-[var(--cedar)]">
                {ar ? "صندوق وارد الطبيب (محاكاة)" : "Doctor inbox (simulated)"}
              </h2>
              <SimulatedBadge ar={ar} />
            </div>
            <p className="text-sm text-[var(--muted)]">
              {ar ? assignedDoctor.nameAr : assignedDoctor.name} ·{" "}
              {ar ? assignedDoctor.clinicAr : assignedDoctor.clinic}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {doctorAlertOptIn
                ? ar
                  ? "الموافقة على التنبيه: مفعّلة"
                  : "Alert opt-in: ON"
                : ar
                  ? "الموافقة على التنبيه: معطّلة — لا مشاركة تلقائية"
                  : "Alert opt-in: OFF — no automatic sharing"}
            </p>
          </div>
          <Link href="/triage" className="text-sm text-[var(--cedar)] underline">
            {ar ? "الفرز الآمن" : "Safe triage"}
          </Link>
        </div>
        <ul className="mt-4 space-y-2">
          {doctorAlerts.length === 0 && (
            <li className="text-sm text-[var(--muted)]">
              {ar ? "لا تنبيهات بعد." : "No alerts yet."}
            </li>
          )}
          {doctorAlerts.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            >
              <span>
                {ar ? a.summaryAr : a.summary} · MVI {a.index}
              </span>
              {!a.acknowledged && (
                <button
                  type="button"
                  onClick={() => acknowledgeDoctorAlert(a.id)}
                  className="rounded-md bg-[var(--cedar)] px-2 py-1 text-xs text-[var(--mist)]"
                >
                  {ar ? "إقرار" : "Ack"}
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--mist)] px-4 py-3">
      <div className="text-[10px] uppercase tracking-wide text-[var(--muted)]">{label}</div>
      <div className="mt-1 font-display text-2xl text-[var(--cedar)]">{value}</div>
    </div>
  );
}
