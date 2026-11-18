import { applyConsents } from "./consent-filter";
import type { ConsentCategory, IndependentVariables, RiskAssessment } from "./types";

/**
 * Real, partner-free care steps. Nothing here is sent anywhere by SeedShield:
 * the person gets a video link, a calendar file with reminders, and a summary
 * they can hand to a clinician they choose.
 */

// ---------- Video room ----------

export const VIDEO_HOST = "https://meet.jit.si";
const HEX_RE = /^[0-9a-f]{24,64}$/;

/** Random hex string from the browser/Node crypto source (96 bits by default). */
export function randomHex(bytes = 12): string {
  const buf = new Uint8Array(bytes);
  globalThis.crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Public Jitsi Meet room with an unguessable name. No account, no name, no
 * health data in the URL. Anyone holding the link can join, so it must only be
 * shared with the clinician the person chooses.
 */
export function videoRoomUrl(hex: string): string {
  if (!HEX_RE.test(hex)) throw new Error("room_id_must_be_24_to_64_lowercase_hex_chars");
  return `${VIDEO_HOST}/SeedShield-${hex}`;
}

// ---------- Calendar (.ics) ----------

/** Local date-time as typed in <input type="datetime-local">, e.g. 2026-11-25T09:30. */
export type LocalDateTime = string;
const LOCAL_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

export function isLocalDateTime(v: string): boolean {
  const m = LOCAL_RE.exec(v);
  if (!m) return false;
  const [, y, mo, d, h, mi] = m.map(Number);
  const dt = new Date(Date.UTC(y, mo - 1, d, h, mi));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === mo - 1 &&
    dt.getUTCDate() === d &&
    dt.getUTCHours() === h &&
    dt.getUTCMinutes() === mi
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

function icsLocal(dt: Date): string {
  return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}00`;
}

function icsUtcStamp(dt: Date): string {
  return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}${pad(dt.getUTCSeconds())}Z`;
}

function localToUtcDate(v: LocalDateTime, addMinutes = 0): Date {
  const m = LOCAL_RE.exec(v);
  if (!m) throw new Error("bad_local_datetime");
  const [, y, mo, d, h, mi] = m.map(Number);
  return new Date(Date.UTC(y, mo - 1, d, h, mi) + addMinutes * 60_000);
}

function escapeText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Fold to <= 75 octets per line (RFC 5545), splitting on character boundaries. */
function fold(line: string): string[] {
  const enc = new TextEncoder();
  const out: string[] = [];
  let cur = "";
  let curBytes = 0;
  let limit = 75;
  for (const ch of Array.from(line)) {
    const b = enc.encode(ch).length;
    if (curBytes + b > limit) {
      out.push(cur);
      cur = " ";
      curBytes = 1;
      limit = 75;
    }
    cur += ch;
    curBytes += b;
  }
  out.push(cur);
  return out;
}

export type CalendarEvent = {
  uid: string;
  title: string;
  start: LocalDateTime;
  durationMin: number;
  description?: string;
  url?: string;
  /** Alarm triggers as ISO-8601 durations before start, e.g. "-PT1H", "-P1D", "PT0M". */
  alarms: string[];
  alarmText: string;
};

/**
 * Calendar text is deliberately neutral. Calendars sync to shared phones,
 * family accounts, and lock screens, so titles never name a body system, test,
 * or condition. Details stay in the app and in the summary the person controls.
 */
export const NEUTRAL_VISIT_TITLE = "Health check-in (video)";
export const NEUTRAL_FOLLOW_UP_TITLE = "Health check follow-up";
export const NEUTRAL_DESCRIPTION = "Open SeedShield for details.";

export function buildIcs(events: CalendarEvent[], now: Date = new Date()): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SeedShield//Care journey//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  for (const e of events) {
    if (!isLocalDateTime(e.start)) throw new Error("bad_local_datetime");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}@seedshield`,
      `DTSTAMP:${icsUtcStamp(now)}`,
      `DTSTART:${icsLocal(localToUtcDate(e.start))}`,
      `DTEND:${icsLocal(localToUtcDate(e.start, e.durationMin))}`,
      `SUMMARY:${escapeText(e.title)}`,
    );
    if (e.description) lines.push(`DESCRIPTION:${escapeText(e.description)}`);
    if (e.url) lines.push(`URL:${e.url}`);
    for (const trigger of e.alarms) {
      lines.push(
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        `DESCRIPTION:${escapeText(e.alarmText)}`,
        `TRIGGER:${trigger}`,
        "END:VALARM",
      );
    }
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.flatMap(fold).join("\r\n") + "\r\n";
}

/** Default suggestions, as local date-times for <input type="datetime-local">. */
export function defaultLocalSlot(now: Date, addDays: number, hour: number): LocalDateTime {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + addDays, hour, 0);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ---------- Clinician summary ----------

export type SummaryOptions = {
  includeLabs: boolean;
  includeSelfReport: boolean;
  now?: Date;
};

const TIER_FOLLOW_UP: Record<string, string> = {
  primary_care: "Primary care review",
  andrology_urology: "Specialist review (needs a clinician who agrees to see you)",
  fertility_services: "Fertility service review (doctor must approve)",
};

/**
 * Plain-text summary the PERSON hands to a clinician. No name, contact details,
 * exact location, or chat text. Values appear only if the person ticks them AND
 * the matching consent is on.
 */
export function buildClinicianSummary(args: {
  assessment: RiskAssessment;
  variables: IndependentVariables;
  consents: Record<ConsentCategory, boolean>;
  options: SummaryOptions;
}): string {
  const { assessment, consents, options } = args;
  const iv = applyConsents(args.variables, consents);
  const date = (options.now ?? new Date()).toISOString().slice(0, 10);
  const lines: string[] = [];

  lines.push("HEALTH SCREENING SUMMARY (prepared by the person, not a diagnosis)");
  lines.push(`Date: ${date}`);
  lines.push(
    "Source: SeedShield prototype. Self-entered, unverified data. No name or contact details are included.",
  );
  lines.push("");
  lines.push(
    `Suggested next step: ${TIER_FOLLOW_UP[assessment.triage.tier] ?? assessment.triage.label}`,
  );
  if (assessment.triage.requiresHumanReview) {
    lines.push("Human clinical review is required before any specialist referral.");
  }
  lines.push("");

  const shown = assessment.signals.filter((s) => s.severity !== "info").slice(0, 8);
  lines.push("Why this appeared:");
  if (shown.length === 0) lines.push("- No active screening cues.");
  for (const s of shown) {
    const drivers = s.drivers.length ? ` [${s.drivers.slice(0, 3).join(", ")}]` : "";
    lines.push(`- ${s.title}${drivers}`);
    // Full explanations only for clinical cues; lifestyle cues carry internal UI wording.
    if (["metabolic", "infectious", "anatomical", "semen"].includes(s.domain)) {
      lines.push(`  ${s.explanation}`);
    }
  }

  if (options.includeLabs && consents.clinical_lab) {
    const labs: string[] = [];
    if (iv.testosteroneNgDl !== undefined) {
      labs.push(`- Total testosterone: ${iv.testosteroneNgDl} ng/dL (first reading)`);
    }
    if (iv.testosteroneRepeatNgDl !== undefined) {
      labs.push(`- Total testosterone, repeat early-morning: ${iv.testosteroneRepeatNgDl} ng/dL`);
    }
    if (iv.glucoseMgDl !== undefined) labs.push(`- Fasting glucose: ${iv.glucoseMgDl} mg/dL`);
    if (labs.length) {
      lines.push("", "Self-entered lab values (unverified, copied from the person's reports):", ...labs);
    }
  }

  if (options.includeSelfReport && consents.self_report) {
    lines.push(
      "",
      "Self-reported lifestyle and work:",
      `- Shift work: ${iv.shiftWork ? `yes, ${iv.nightShiftsPerWeek} night shifts per week` : "no"}`,
      `- Outdoor heat exposure: ${iv.outdoorHeatHours} h per day`,
      `- Sitting: ${iv.sedentaryHours} h per day`,
      `- Work stress (0-100): ${iv.occupationalStress}`,
    );
  }

  if (consents.environment) {
    lines.push(
      "",
      `Local conditions (area-level, not personal exposure): heat index ${iv.heatIndexC} C, air quality index ${iv.aqi}.`,
    );
  }

  if (assessment.signals.some((s) => s.id === "hormone-repeat")) {
    lines.push(
      "",
      "Question for the clinician: one total testosterone value was below 300 ng/dL. Is a repeat early-morning test advised before further steps?",
    );
  }

  lines.push(
    "",
    "Limits: a screening cue only. Not a diagnosis, not clinician-reviewed, thresholds pending clinical sign-off. Treatment decisions stay with the clinician.",
  );
  return lines.join("\n") + "\n";
}

export const SUMMARY_FILENAME = (now: Date = new Date()) =>
  `health-check-summary-${now.toISOString().slice(0, 10)}.txt`;
export const CALENDAR_FILENAME = "health-check-reminders.ics";
