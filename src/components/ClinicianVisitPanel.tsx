"use client";

import { Sensitive } from "@/components/Sensitive";
import {
  CALENDAR_FILENAME,
  CLINICIAN_CHECK_LINKS,
  NEUTRAL_DESCRIPTION,
  NEUTRAL_FOLLOW_UP_TITLE,
  NEUTRAL_VISIT_TITLE,
  SUMMARY_FILENAME,
  buildClinicianSummary,
  buildIcs,
  defaultLocalSlot,
  isLocalDateTime,
  randomHex,
  videoRoomUrl,
} from "@/lib/care-journey";
import { useSeedShield } from "@/lib/store";
import { useEffect, useMemo, useState } from "react";

function download(filename: string, mime: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: `${mime};charset=utf-8` }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ClinicianVisitPanel() {
  const { locale, assessment, variables, consents, addCareReminder } = useSeedShield();
  const ar = locale === "ar";

  const [room, setRoom] = useState<string | null>(null);
  const [visitAt, setVisitAt] = useState("");
  const [followAt, setFollowAt] = useState("");
  const [includeLabs, setIncludeLabs] = useState(false);
  const [includeSelf, setIncludeSelf] = useState(false);
  const [approved, setApproved] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    const now = new Date();
    setVisitAt(defaultLocalSlot(now, 1, 10));
    setFollowAt(defaultLocalSlot(now, 14, 8));
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const hasRepeatCue = assessment.signals.some((s) => s.id === "hormone-repeat");
  const labsAvailable =
    consents.clinical_lab &&
    (variables.testosteroneNgDl !== undefined || variables.glucoseMgDl !== undefined);

  const summary = useMemo(
    () =>
      buildClinicianSummary({
        assessment,
        variables,
        consents,
        options: { includeLabs: includeLabs && labsAvailable, includeSelfReport: includeSelf },
      }),
    [assessment, variables, consents, includeLabs, includeSelf, labsAvailable],
  );

  const datesOk = isLocalDateTime(visitAt) && isLocalDateTime(followAt);

  function createRoom() {
    setRoom(videoRoomUrl(randomHex(12)));
    setNote(null);
  }

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNote(ar ? `تم النسخ: ${label}` : `Copied: ${label}`);
    } catch {
      setNote(ar ? "تعذّر النسخ. حدّد النص وانسخه يدويًا." : "Copy failed. Select the text and copy it by hand.");
    }
  }

  function downloadCalendar() {
    if (!datesOk) return;
    const stamp = Date.now().toString(36);
    const ics = buildIcs([
      {
        uid: `visit-${stamp}`,
        title: NEUTRAL_VISIT_TITLE,
        start: visitAt,
        durationMin: 30,
        description: room ? `${NEUTRAL_DESCRIPTION} Video link: ${room}` : NEUTRAL_DESCRIPTION,
        url: room ?? undefined,
        alarms: ["-P1D", "-PT1H"],
        alarmText: NEUTRAL_VISIT_TITLE,
      },
      {
        uid: `follow-${stamp}`,
        title: NEUTRAL_FOLLOW_UP_TITLE,
        start: followAt,
        durationMin: 15,
        description: NEUTRAL_DESCRIPTION,
        alarms: ["-P1D", "PT0M"],
        alarmText: NEUTRAL_FOLLOW_UP_TITLE,
      },
    ]);
    download(CALENDAR_FILENAME, "text/calendar", ics);
    const day = followAt.slice(0, 10);
    addCareReminder({
      title: ar ? `متابعة بتاريخ ${day}` : `Follow-up on ${day}`,
      titleAr: `متابعة بتاريخ ${day}`,
      body: hasRepeatCue
        ? "Repeat the early-morning blood test and share the result with your clinician."
        : "Check in on your next step and update your results.",
      bodyAr: hasRepeatCue
        ? "كرّر الفحص الصباحي المبكر وشارك النتيجة مع طبيبك."
        : "تابع خطوتك التالية وحدّث نتائجك.",
    });
    setNote(
      ar
        ? "تم تنزيل ملف التقويم. افتحه لإضافة الموعد والتذكيرات إلى تقويمك. العناوين محايدة عمدًا."
        : "Calendar file downloaded. Open it to add the visit and reminders to your calendar. Titles are neutral on purpose.",
    );
  }

  async function share() {
    try {
      await navigator.share({ title: "Health check summary", text: summary });
    } catch {
      /* user cancelled */
    }
  }

  const box = "rounded-xl border border-[var(--line)] bg-[var(--mist)] p-4 space-y-3";
  const btn =
    "rounded-md bg-[var(--cedar)] px-3 py-2 text-xs font-medium text-[var(--mist)] disabled:opacity-50";
  const btnGhost = "rounded-md border border-[var(--line)] px-3 py-2 text-xs disabled:opacity-50";

  return (
    <div className="space-y-4" data-testid="clinician-visit-panel">
      <div>
        <h3 className="font-display text-lg text-[var(--cedar)]">
          {ar ? "خطوة حقيقية تعمل الآن" : "A real next step that works today"}
        </h3>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {ar
            ? "أنت تختار الطبيب. لا يرسل SeedShield شيئًا، ولا يوفّر أطباء ولا يتحقق منهم. التوجيه إلى أخصائيين موثّقين هو الخطوة التالية بعد إبرام الشراكات."
            : "You choose the clinician. SeedShield sends nothing, and does not supply or verify clinicians. Verified specialist routing is the next step, pending partnerships."}
        </p>
      </div>

      <div className={box}>
        <div className="text-sm font-medium text-[var(--cedar)]">
          {ar ? "1. اختر طبيبًا وتحقّق من ترخيصه" : "1. Choose a clinician and check their licence"}
        </div>
        <p className="text-[11px] text-[var(--muted)]">
          {ar
            ? "لا يتحقق SeedShield من الأطباء. تحقّق بنفسك من الجهة المنظِّمة قبل مشاركة أي شيء. اطلب من الطبيب رقم الترخيص واسم المنشأة وتأكد أن تخصصه يناسب حالتك."
            : "SeedShield does not verify clinicians. Check with the regulator yourself before sharing anything. Ask for the licence number and facility, and confirm the specialty fits your need."}
        </p>
        <ul className="space-y-1 text-xs">
          <li>
            {ar ? "دبي: " : "Dubai: "}
            <a className="underline text-[var(--cedar)]" href={CLINICIAN_CHECK_LINKS.dubaiRegistry} target="_blank" rel="noopener noreferrer">
              {ar ? "السجل الطبي (هيئة الصحة بدبي)" : "Dubai Medical Registry (DHA)"}
            </a>
            {" · "}
            <a className="underline text-[var(--cedar)]" href={CLINICIAN_CHECK_LINKS.dubaiLicence} target="_blank" rel="noopener noreferrer">
              {ar ? "تحقق من رقم ترخيص" : "Verify a licence number"}
            </a>
          </li>
          <li>
            {ar ? "أبوظبي: " : "Abu Dhabi: "}
            <a className="underline text-[var(--cedar)]" href={CLINICIAN_CHECK_LINKS.abuDhabiTools} target="_blank" rel="noopener noreferrer">
              {ar ? "ابحث عن طبيب (دائرة الصحة)" : "Find a Medical Professional (DOH)"}
            </a>
            {ar
              ? " — لا يوجد بحث عام لحالة الترخيص، فاطلب رقم الترخيص وشهادة الوضع المهني الحالي."
              : " — DOH has no public licence-status lookup, so also ask for the licence number and a Current Professional Status Certificate."}
          </li>
          <li>
            {ar
              ? "إمارات أخرى أو دول أخرى: اطلب رقم الترخيص وتأكد منه لدى الجهة التي أصدرته."
              : "Elsewhere: ask for the licence number and confirm it with the regulator that issued it."}
          </li>
        </ul>
      </div>

      <div className={box}>
        <div className="text-sm font-medium text-[var(--cedar)]">
          {ar ? "2. غرفة فيديو خاصة" : "2. Private video room"}
        </div>
        <p className="text-[11px] text-[var(--muted)]">
          {ar
            ? "رابط Jitsi Meet مجاني وحقيقي باسم عشوائي، بلا حساب. يستطيع أي شخص يملك الرابط الدخول، لذا شاركه مع طبيبك فقط."
            : "A free, real Jitsi Meet link with a random name and no account. Anyone with the link can join, so share it only with your clinician."}
        </p>
        {!room ? (
          <button type="button" onClick={createRoom} className={btn}>
            {ar ? "أنشئ غرفة فيديو" : "Create video room"}
          </button>
        ) : (
          <div className="space-y-2">
            <input
              readOnly
              value={room}
              aria-label={ar ? "رابط الفيديو" : "Video link"}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 text-xs"
            />
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => copy(room, ar ? "الرابط" : "link")} className={btnGhost}>
                {ar ? "انسخ الرابط" : "Copy link"}
              </button>
              <a href={room} target="_blank" rel="noopener noreferrer" className={btnGhost}>
                {ar ? "افتح الغرفة" : "Open room"}
              </a>
              <button type="button" onClick={createRoom} className={btnGhost}>
                {ar ? "غرفة جديدة" : "New room"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={box}>
        <div className="text-sm font-medium text-[var(--cedar)]">
          {ar ? "3. الموعد والتذكيرات في تقويمك" : "3. Visit and reminders in your calendar"}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs text-[var(--ink)]">
            {ar ? "موعد الزيارة" : "Visit time"}
            <input
              type="datetime-local"
              value={visitAt}
              onChange={(e) => setVisitAt(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--line)] bg-white px-2 py-2 text-sm"
            />
          </label>
          <label className="block text-xs text-[var(--ink)]">
            {ar ? "تذكير المتابعة" : "Follow-up reminder"}
            <input
              type="datetime-local"
              value={followAt}
              onChange={(e) => setFollowAt(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--line)] bg-white px-2 py-2 text-sm"
            />
          </label>
        </div>
        <p className="text-[11px] text-[var(--muted)]">
          {hasRepeatCue
            ? ar
              ? "اقتراح: كرّر فحص التستوستيرون في الصباح الباكر قبل موعد المتابعة."
              : "Suggestion: schedule the repeat early-morning blood test before the follow-up date."
            : ar
              ? "تُضاف تنبيهات قبل يوم وعند الموعد. تبقى تفاصيل الحالة داخل التطبيق."
              : "Alarms fire a day before and at the time. Health details stay in the app, not in your calendar."}{" "}
          {ar ? "عناوين التقويم محايدة عمدًا." : "Calendar titles are neutral on purpose."}
        </p>
        <button type="button" onClick={downloadCalendar} disabled={!datesOk} className={btn}>
          {ar ? "نزّل ملف التقويم (.ics)" : "Download calendar file (.ics)"}
        </button>
      </div>

      <div className={box}>
        <div className="text-sm font-medium text-[var(--cedar)]">
          {ar ? "4. ملخص لطبيبك" : "4. Summary for your clinician"}
        </div>
        <p className="text-[11px] text-[var(--muted)]">
          {ar
            ? "بلا اسم أو بيانات اتصال أو موقع دقيق. تظهر القيم فقط إن اخترتها وكانت موافقتها مفعّلة. الملخص بالإنجليزية ليقرأه الطبيب."
            : "No name, contact details, or exact location. Values appear only if you tick them and that consent is on. The summary is in English for the clinician."}
        </p>
        <div className="flex flex-wrap gap-4 text-xs">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeLabs && labsAvailable}
              disabled={!labsAvailable}
              onChange={(e) => setIncludeLabs(e.target.checked)}
              className="size-4"
            />
            {ar ? "ضمّن القيم المخبرية التي أدخلتها" : "Include the lab values I entered"}
            {!labsAvailable && <span className="text-[var(--muted)]"> ({ar ? "غير متاحة" : "none available"})</span>}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeSelf && consents.self_report}
              disabled={!consents.self_report}
              onChange={(e) => setIncludeSelf(e.target.checked)}
              className="size-4"
            />
            {ar ? "ضمّن إجاباتي عن العمل ونمط الحياة" : "Include my work and lifestyle answers"}
            {!consents.self_report && <span className="text-[var(--muted)]"> ({ar ? "الموافقة متوقفة" : "consent off"})</span>}
          </label>
        </div>
        <Sensitive as="div">
          <pre
            aria-label={ar ? "معاينة الملخص" : "Summary preview"}
            className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-white p-3 text-[11px] leading-relaxed text-[var(--ink)]"
          >
            {summary}
          </pre>
        </Sensitive>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={approved}
            onChange={(e) => setApproved(e.target.checked)}
            className="mt-1 size-4"
          />
          {ar
            ? "قرأت هذا الملخص وأوافق على مشاركته بنفسي مع طبيب أختاره."
            : "I have read this summary and approve sharing it myself with a clinician I choose."}
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!approved}
            onClick={() => download(SUMMARY_FILENAME(), "text/plain", summary)}
            className={btn}
          >
            {ar ? "نزّل الملخص" : "Download summary"}
          </button>
          <button type="button" disabled={!approved} onClick={() => copy(summary, ar ? "الملخص" : "summary")} className={btnGhost}>
            {ar ? "انسخ الملخص" : "Copy summary"}
          </button>
          {canShare && (
            <button type="button" disabled={!approved} onClick={share} className={btnGhost}>
              {ar ? "شارك…" : "Share…"}
            </button>
          )}
        </div>
      </div>

      {note && (
        <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          {note}
        </p>
      )}
    </div>
  );
}
