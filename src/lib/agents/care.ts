import type { TriageTier } from "../types";
import type { AgentFinding, BookingRequest } from "./types";

/**
 * Care agent — connects doctor path + consultation booking from triage outcome.
 */
export function runCareAgent(opts: {
  triageTier: TriageTier;
  requestBooking?: boolean;
  bookingKind?: BookingRequest["kind"];
  locale?: "en" | "ar";
}): { findings: AgentFinding[]; booking: BookingRequest | null } {
  const locale = opts.locale ?? "en";
  const findings: AgentFinding[] = [];
  let booking: BookingRequest | null = null;

  const needsCare =
    opts.triageTier !== "self_care" && opts.triageTier !== "insufficient_info";

  if (!needsCare) {
    findings.push({
      id: `care-none-${Date.now()}`,
      agent: "care",
      title: "No booking needed now",
      titleAr: "لا حجز مطلوب الآن",
      summary:
        "Self-care / wait for more info — Care agent stays quiet. You can still message the doctor.",
      summaryAr:
        "رعاية ذاتية / انتظار معلومات — وكيل الرعاية هادئ. يمكنك مراسلة الطبيب.",
      severity: "info",
      evidence: [`triage=${opts.triageTier}`],
      sources: [{ label: "Safe Triage", kind: "rule" }],
      relatedProducts: ["Do now", "Doctor"],
      at: new Date().toISOString(),
      simulated: false,
    });
    return { findings, booking };
  }

  findings.push({
    id: `care-bridge-${Date.now()}`,
    agent: "care",
    title: "Doctor bridge ready",
    titleAr: "جسر الطبيب جاهز",
    summary:
      locale === "ar"
        ? "يمكن فتح محادثة الطبيب أو طلب استشارة. الطبيب في العرض محاكى."
        : "Doctor chat or consult booking is available. Demo clinician is simulated.",
    summaryAr: "محادثة طبيب أو حجز استشارة متاحة. الطبيب محاكى في العرض.",
    severity: opts.triageTier === "urgent" ? "urgent" : "watch",
    evidence: [`triage=${opts.triageTier}`],
    sources: [{ label: "Care connect", kind: "rule" }],
    relatedProducts: ["Doctor", "Next step"],
    at: new Date().toISOString(),
    simulated: true,
  });

  if (opts.requestBooking || opts.triageTier === "urgent") {
    const kind: BookingRequest["kind"] =
      opts.bookingKind ??
      (opts.triageTier === "urgent"
        ? "primary"
        : opts.triageTier === "andrology_urology" ||
            opts.triageTier === "fertility_services"
          ? "specialty"
          : "teleconsult");

    booking = {
      id: `book-${Date.now()}`,
      kind,
      status: "confirmed_sim",
      slotLabel:
        kind === "teleconsult"
          ? "Today · private video (simulated)"
          : kind === "specialty"
            ? "Within 72h · specialty review (simulated)"
            : "Next available · primary / urgent desk (simulated)",
      slotLabelAr:
        kind === "teleconsult"
          ? "اليوم · فيديو خاص (محاكاة)"
          : kind === "specialty"
            ? "خلال ٧٢ ساعة · مراجعة تخصصية (محاكاة)"
            : "أقرب موعد · رعاية أولية/عاجلة (محاكاة)",
      triageAtBooking: opts.triageTier,
      at: new Date().toISOString(),
    };

    findings.push({
      id: `care-book-${booking.id}`,
      agent: "care",
      title: "Consultation booked (simulated)",
      titleAr: "تم حجز استشارة (محاكاة)",
      summary: `${booking.kind} · ${booking.slotLabel}`,
      summaryAr: `${booking.kind} · ${booking.slotLabelAr}`,
      severity: "info",
      evidence: [`booking=${booking.id}`, `kind=${booking.kind}`],
      sources: [{ label: "Booking API (sim)", kind: "rule" }],
      relatedProducts: ["Doctor", "Notifications"],
      at: booking.at,
      simulated: true,
    });
  }

  return { findings, booking };
}
