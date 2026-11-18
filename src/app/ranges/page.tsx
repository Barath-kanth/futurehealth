"use client";

import {
  HORMONE_RANGES,
  METABOLIC_RANGES,
  QUESTIONNAIRE_RANGES,
} from "@/lib/clinical-ranges";
import { useSeedShield } from "@/lib/store";
import Link from "next/link";

export default function RangesPage() {
  const { locale, variables } = useSeedShield();
  const ar = locale === "ar";
  // Note: BP / vitamin D / TSH / IPSS exist for context but triage stays reproductive-first.

  const yours = [
    {
      label: ar ? "تستوستيرونك الكلي" : "Your total T",
      value:
        variables.testosteroneNgDl !== undefined
          ? `${variables.testosteroneNgDl} ng/dL`
          : ar
            ? "غير مربوط بعد — أرفق طقم الهرمون"
            : "Not attached yet — pair hormone kit",
      ok:
        variables.testosteroneNgDl === undefined
          ? null
          : variables.testosteroneNgDl >= 300,
    },
    {
      label: ar ? "التستوستيرون الحر" : "Your free T",
      value:
        variables.freeTestosteronePgMl !== undefined
          ? `${variables.freeTestosteronePgMl} pg/mL`
          : "—",
      ok:
        variables.freeTestosteronePgMl === undefined
          ? null
          : variables.freeTestosteronePgMl >= 50,
    },
    {
      label: "IIEF-5",
      value: variables.iief5Score !== undefined ? String(variables.iief5Score) : "—",
      ok: variables.iief5Score === undefined ? null : variables.iief5Score >= 22,
    },
    {
      label: "AMS",
      value: variables.amsScore !== undefined ? String(variables.amsScore) : "—",
      ok: variables.amsScore === undefined ? null : variables.amsScore <= 26,
    },
    {
      label: "IPSS",
      value: variables.ipssScore !== undefined ? String(variables.ipssScore) : "—",
      ok: variables.ipssScore === undefined ? null : variables.ipssScore <= 7,
    },
    {
      label: ar ? "جلوكوز الصيام" : "Fasting glucose",
      value:
        variables.glucoseMgDl !== undefined ? `${variables.glucoseMgDl} mg/dL` : "—",
      ok:
        variables.glucoseMgDl === undefined
          ? null
          : variables.glucoseMgDl >= 70 && variables.glucoseMgDl <= 99,
    },
    {
      label: ar ? "فيتامين د" : "Vitamin D",
      value:
        variables.vitaminDNgMl !== undefined ? `${variables.vitaminDNgMl} ng/mL` : "—",
      ok:
        variables.vitaminDNgMl === undefined
          ? null
          : variables.vitaminDNgMl >= 30 && variables.vitaminDNgMl <= 50,
    },
    {
      label: "TSH",
      value: variables.tshMiuL !== undefined ? `${variables.tshMiuL} mIU/L` : "—",
      ok:
        variables.tshMiuL === undefined
          ? null
          : variables.tshMiuL >= 0.4 && variables.tshMiuL <= 4,
    },
    {
      label: ar ? "ضغط الدم" : "Blood pressure",
      value:
        variables.systolicBp && variables.diastolicBp
          ? `${variables.systolicBp}/${variables.diastolicBp}`
          : "—",
      ok:
        !variables.systolicBp
          ? null
          : variables.systolicBp < 120 && (variables.diastolicBp ?? 0) < 80,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-10">
      <header>
        <h1 className="font-display text-4xl text-[var(--cedar)]">
          {ar ? "نطاقاتك السريرية" : "Your clinical ranges"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          {ar
            ? "التركيز التحكيمي: هرمون/مني/استقلاب مرتبط بالصحة التناسلية. ضغط الدم وفيتامين د وTSH وIPSS سياقية — الفرز الآمن يبقى المركز. راجع تقرير مختبرك."
            : "Judging focus: hormone / semen / reproductive-linked metabolic. BP, vitamin D, TSH, IPSS are secondary context — Safe Triage stays primary. Use YOUR lab report ranges."}
        </p>
      </header>

      <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {yours.map((y) => (
          <div key={y.label} className="rounded-xl border border-[var(--line)] bg-[var(--mist)] p-3">
            <div className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
              {y.label}
            </div>
            <div className="mt-1 font-display text-xl text-[var(--cedar)]">{y.value}</div>
            {y.ok === true && (
              <div className="text-[10px] text-emerald-700">{ar ? "ضمن النطاق" : "In band"}</div>
            )}
            {y.ok === false && (
              <div className="text-[10px] text-[var(--elevated)]">
                {ar ? "خارج النطاق المفضل" : "Outside preferred band"}
              </div>
            )}
          </div>
        ))}
      </section>

      <Section title={ar ? "١ · نطاقات هرمونية" : "1 · Hormone ranges"}>
        {HORMONE_RANGES.map((h) => (
          <Row
            key={h.id}
            title={ar ? h.biomarkerAr : h.biomarker}
            meta={`${h.acceptable} ${h.unit}`}
            note={ar ? h.notesAr : h.notes}
          />
        ))}
      </Section>

      <Section title={ar ? "٢ · استبيانات مرجعية (مراجع)" : "2 · Reference questionnaires"}>
        {QUESTIONNAIRE_RANGES.map((q) => (
          <Row
            key={q.id}
            title={ar ? q.nameAr : q.name}
            meta={`${ar ? "طبيعي" : "Normal"} ${q.normal} · ${ar ? "المقياس" : "scale"} ${q.scale}`}
            note={ar ? q.notesAr : q.notes}
          />
        ))}
      </Section>

      <Section title={ar ? "٣ · استقلاب وقلب" : "3 · Metabolic & cardiovascular"}>
        {METABOLIC_RANGES.map((m) => (
          <Row
            key={m.id}
            title={ar ? m.nameAr : m.name}
            meta={m.acceptable}
            note={ar ? m.notesAr : m.notes}
          />
        ))}
      </Section>

      <div className="flex flex-wrap gap-2">
        <Link href="/devices" className="rounded-md bg-[var(--cedar)] px-4 py-2 text-sm text-[var(--mist)]">
          {ar ? "أرفق طقم الهرمون / المنوي" : "Attach hormone / semen kit"}
        </Link>
        <Link href="/chat" className="rounded-md border border-[var(--cedar)] px-4 py-2 text-sm text-[var(--cedar)]">
          {ar ? "فسّر مع الطبيب" : "Interpret with doctor"}
        </Link>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl text-[var(--cedar)]">{title}</h2>
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  );
}

function Row({ title, meta, note }: { title: string; meta: string; note: string }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--mist)] px-4 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="font-medium text-[var(--ink)]">{title}</div>
        <div className="font-mono text-xs text-[var(--cedar)]">{meta}</div>
      </div>
      <p className="mt-1 text-xs text-[var(--muted)]">{note}</p>
    </div>
  );
}
