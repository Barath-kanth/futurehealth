"use client";

import {
  GLUCOSE_RANGE_MGDL,
  TESTOSTERONE_RANGE_NGDL,
  glucoseToMgDl,
  testosteroneToNgDl,
  type GlucoseUnit,
  type LabParse,
  type TestosteroneUnit,
} from "@/lib/lab-units";
import { useSeedShield } from "@/lib/store";
import Link from "next/link";
import { useState } from "react";

function errorText(p: LabParse, ar: boolean, min: number, max: number): string | null {
  if (p.ok || p.error === "empty") return null;
  if (p.error === "not_a_number") {
    return ar ? "أدخل رقمًا فقط." : "Enter a number only.";
  }
  return ar
    ? `خارج النطاق المعقول (${min}–${max} بوحدة ng/dL أو mg/dL بعد التحويل). تحقق من الوحدة.`
    : `Outside the plausible range (${min}–${max} after conversion). Check the unit.`;
}

export function LabEntryForm() {
  const { locale, consents, variables, patchVariables } = useSeedShield();
  const ar = locale === "ar";

  const [tRaw, setTRaw] = useState("");
  const [tUnit, setTUnit] = useState<TestosteroneUnit>("ng/dL");
  const [rRaw, setRRaw] = useState("");
  const [rUnit, setRUnit] = useState<TestosteroneUnit>("ng/dL");
  const [gRaw, setGRaw] = useState("");
  const [gUnit, setGUnit] = useState<GlucoseUnit>("mg/dL");
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const labOn = consents.clinical_lab;
  const t = testosteroneToNgDl(tRaw, tUnit);
  const r = testosteroneToNgDl(rRaw, rUnit);
  const g = glucoseToMgDl(gRaw, gUnit);

  const tEntered = tRaw.trim() !== "";
  const rEntered = rRaw.trim() !== "";
  const gEntered = gRaw.trim() !== "";
  const hasFirstReading = tEntered || variables.testosteroneNgDl !== undefined;
  const repeatNeedsFirst = rEntered && !hasFirstReading;
  const anyInvalid =
    (tEntered && !t.ok) || (rEntered && !r.ok) || (gEntered && !g.ok) || repeatNeedsFirst;
  const canSave = labOn && (tEntered || rEntered || gEntered) && !anyInvalid;

  function save() {
    const patch: {
      testosteroneNgDl?: number;
      testosteroneRepeatNgDl?: number;
      glucoseMgDl?: number;
    } = {};
    const parts: string[] = [];
    if (tEntered && t.ok) {
      patch.testosteroneNgDl = t.value;
      parts.push(`${ar ? "تستوستيرون" : "testosterone"} ${t.value} ng/dL`);
    }
    if (rEntered && r.ok) {
      patch.testosteroneRepeatNgDl = r.value;
      parts.push(`${ar ? "تستوستيرون مكرر" : "repeat testosterone"} ${r.value} ng/dL`);
    }
    if (gEntered && g.ok) {
      patch.glucoseMgDl = g.value;
      parts.push(`${ar ? "جلوكوز" : "glucose"} ${g.value} mg/dL`);
    }
    patchVariables(patch);
    setSavedNote(parts.join(" · "));
  }

  function clearLabs() {
    patchVariables({
      testosteroneNgDl: undefined,
      testosteroneRepeatNgDl: undefined,
      glucoseMgDl: undefined,
    });
    setTRaw("");
    setRRaw("");
    setGRaw("");
    setSavedNote(null);
  }

  const onFile =
    variables.testosteroneNgDl !== undefined ||
    variables.testosteroneRepeatNgDl !== undefined ||
    variables.glucoseMgDl !== undefined;

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-5 space-y-4">
      <div>
        <h2 className="font-display text-xl text-[var(--cedar)]">
          {ar ? "نتائجي المخبرية" : "My lab results"}
        </h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {ar
            ? "أدخل القيم كما هي في تقرير المختبر. تبقى في هذا المتصفح، وهي غير موثّقة، وتُستخدم عند موافقتك على البيانات السريرية."
            : "Enter values exactly as printed on your lab report. They stay in this browser, are unverified, and are used only when you agree to clinical data."}
        </p>
      </div>

      {!labOn ? (
        <p className="rounded-lg bg-[var(--watch-soft)] px-3 py-2 text-xs text-[var(--watch)]">
          {ar ? "فعّل موافقة البيانات السريرية/المخبرية أولًا من " : "Turn on clinical / lab consent first in "}
          <Link href="/vault" className="underline">
            {ar ? "الخزنة" : "Vault"}
          </Link>
          .
        </p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-sm text-[var(--ink)]" htmlFor="lab-t">
                {ar ? "التستوستيرون الكلي" : "Total testosterone"}
              </label>
              <div className="flex gap-2">
                <input
                  id="lab-t"
                  inputMode="decimal"
                  value={tRaw}
                  onChange={(e) => setTRaw(e.target.value)}
                  placeholder={tUnit === "ng/dL" ? "e.g. 540" : "e.g. 18.7"}
                  className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm"
                />
                <select
                  value={tUnit}
                  onChange={(e) => setTUnit(e.target.value as TestosteroneUnit)}
                  aria-label="Testosterone unit"
                  className="rounded-md border border-[var(--line)] bg-white px-2 text-sm"
                >
                  <option value="ng/dL">ng/dL</option>
                  <option value="nmol/L">nmol/L</option>
                </select>
              </div>
              {tEntered && t.ok && tUnit === "nmol/L" && (
                <p className="text-[11px] text-[var(--muted)]">= {t.value} ng/dL</p>
              )}
              {tEntered && (
                <p className="text-[11px] text-[var(--urgent)]">
                  {errorText(t, ar, TESTOSTERONE_RANGE_NGDL.min, TESTOSTERONE_RANGE_NGDL.max)}
                </p>
              )}
              <p className="text-[11px] text-[var(--muted)]">
                {ar
                  ? "قيمة منخفضة واحدة تحتاج تأكيدًا بفحص صباحي مبكر ثانٍ. هذا ليس تشخيصًا."
                  : "One low value needs confirming with a second early-morning test. This is not a diagnosis."}
              </p>
              <label className="mt-3 block text-sm text-[var(--ink)]" htmlFor="lab-t2">
                {ar ? "تستوستيرون مكرر (صباح مبكر، اختياري)" : "Repeat early-morning testosterone (optional)"}
              </label>
              <div className="flex gap-2">
                <input
                  id="lab-t2"
                  inputMode="decimal"
                  value={rRaw}
                  onChange={(e) => setRRaw(e.target.value)}
                  placeholder={rUnit === "ng/dL" ? "e.g. 280" : "e.g. 9.7"}
                  className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm"
                />
                <select
                  value={rUnit}
                  onChange={(e) => setRUnit(e.target.value as TestosteroneUnit)}
                  aria-label="Repeat testosterone unit"
                  className="rounded-md border border-[var(--line)] bg-white px-2 text-sm"
                >
                  <option value="ng/dL">ng/dL</option>
                  <option value="nmol/L">nmol/L</option>
                </select>
              </div>
              {rEntered && r.ok && rUnit === "nmol/L" && (
                <p className="text-[11px] text-[var(--muted)]">= {r.value} ng/dL</p>
              )}
              {rEntered && (
                <p className="text-[11px] text-[var(--urgent)]">
                  {errorText(r, ar, TESTOSTERONE_RANGE_NGDL.min, TESTOSTERONE_RANGE_NGDL.max)}
                </p>
              )}
              {repeatNeedsFirst && (
                <p className="text-[11px] text-[var(--urgent)]">
                  {ar ? "أدخل القراءة الأولى أيضًا." : "Enter the first reading too."}
                </p>
              )}
              <p className="text-[11px] text-[var(--muted)]">
                {ar
                  ? "قراءة أولى منخفضة وحدها تؤدي إلى الرعاية الأولية. تُفتح المراجعة التخصصية فقط إذا أكّد الفحص المكرر الانخفاض."
                  : "A single low reading leads to primary care. Specialist review opens only if the repeat confirms the low value."}
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-sm text-[var(--ink)]" htmlFor="lab-g">
                {ar ? "جلوكوز الصيام" : "Fasting glucose"}
              </label>
              <div className="flex gap-2">
                <input
                  id="lab-g"
                  inputMode="decimal"
                  value={gRaw}
                  onChange={(e) => setGRaw(e.target.value)}
                  placeholder={gUnit === "mg/dL" ? "e.g. 92" : "e.g. 5.1"}
                  className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm"
                />
                <select
                  value={gUnit}
                  onChange={(e) => setGUnit(e.target.value as GlucoseUnit)}
                  aria-label="Glucose unit"
                  className="rounded-md border border-[var(--line)] bg-white px-2 text-sm"
                >
                  <option value="mg/dL">mg/dL</option>
                  <option value="mmol/L">mmol/L</option>
                </select>
              </div>
              {gEntered && g.ok && gUnit === "mmol/L" && (
                <p className="text-[11px] text-[var(--muted)]">= {g.value} mg/dL</p>
              )}
              {gEntered && (
                <p className="text-[11px] text-[var(--urgent)]">
                  {errorText(g, ar, GLUCOSE_RANGE_MGDL.min, GLUCOSE_RANGE_MGDL.max)}
                </p>
              )}
              <p className="text-[11px] text-[var(--muted)]">
                {ar
                  ? "يظهر تنبيه من ١١٠ ملغ/دل (منظمة الصحة العالمية). ADA تستخدم ١٠٠."
                  : "A watch cue appears from 110 mg/dL (6.1 mmol/L, WHO). ADA uses 100."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!canSave}
              onClick={save}
              className="rounded-md bg-[var(--cedar)] px-4 py-2 text-xs font-medium text-[var(--mist)] disabled:opacity-50"
            >
              {ar ? "احفظ النتائج" : "Save results"}
            </button>
            {onFile && (
              <button
                type="button"
                onClick={clearLabs}
                className="rounded-md border border-[var(--line)] px-3 py-2 text-xs"
              >
                {ar ? "امسح القيم المخبرية" : "Clear lab values"}
              </button>
            )}
            {savedNote && (
              <span className="text-xs text-[var(--muted)]">
                {ar ? "حُفظت: " : "Saved: "}
                {savedNote}
              </span>
            )}
          </div>
        </>
      )}
    </section>
  );
}
