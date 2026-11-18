import { consentForSource } from "./signal-consent";
import type { ConsentCategory, RiskAssessment, TriageTier } from "./types";

/**
 * Minimum-necessary referral packet. This is the ONLY payload a referral
 * request may carry: no name, no chat text, no raw values, no exact location.
 */
export type ReferralKind = "primary_care" | "teleconsult" | "specialist_review";

export type ReferralPacket = {
  version: "1";
  kind: ReferralKind;
  tier: TriageTier;
  /** Internal signal ids only (e.g. "heat-spermatogenesis-stress"). */
  reasonCodes: string[];
  consentCategoriesUsed: ConsentCategory[];
  humanReviewRequired: boolean;
  /** Explicit user opt-in captured in the UI before sending. */
  userOptIn: true;
  /** Always true in this prototype: destinations are mock endpoints. */
  demo: true;
  createdAt: string;
};

const KINDS: ReferralKind[] = ["primary_care", "teleconsult", "specialist_review"];
const TIERS: TriageTier[] = [
  "insufficient_info",
  "self_care",
  "primary_care",
  "andrology_urology",
  "fertility_services",
  "urgent",
];
const ALLOWED_KEYS = [
  "version",
  "kind",
  "tier",
  "reasonCodes",
  "consentCategoriesUsed",
  "humanReviewRequired",
  "userOptIn",
  "demo",
  "createdAt",
] as const;
const CONSENTS: ConsentCategory[] = [
  "wearable",
  "at_home_device",
  "clinical_lab",
  "environment",
  "self_report",
  "family_mode",
];
const CODE_RE = /^[a-z0-9][a-z0-9-]{0,79}$/;

export type ReferralCheck =
  | { ok: true; packet: ReferralPacket }
  | { ok: false; error: string };

/** Build a packet from the current assessment. Blocks unsafe routes. */
export function buildReferralPacket(args: {
  assessment: RiskAssessment;
  kind: ReferralKind;
  now?: Date;
}): ReferralCheck {
  const { assessment, kind } = args;
  const tier = assessment.triage.tier;

  if (tier === "urgent") {
    return {
      ok: false,
      error: "urgent_care_now",
    };
  }
  if (tier === "self_care" || tier === "insufficient_info") {
    return { ok: false, error: "no_referral_needed" };
  }
  if (kind === "specialist_review" && tier !== "andrology_urology" && tier !== "fertility_services") {
    return { ok: false, error: "specialist_not_indicated" };
  }

  const signals = assessment.signals.filter((s) => s.severity !== "info");
  const reasonCodes = Array.from(new Set(signals.map((s) => s.id))).slice(0, 20);
  const consentCategoriesUsed = Array.from(
    new Set(signals.map((s) => consentForSource(s.source))),
  );

  return {
    ok: true,
    packet: {
      version: "1",
      kind,
      tier,
      reasonCodes,
      consentCategoriesUsed,
      humanReviewRequired: assessment.triage.requiresHumanReview,
      userOptIn: true,
      demo: true,
      createdAt: (args.now ?? new Date()).toISOString(),
    },
  };
}

/** Validate an untrusted payload. Rejects unknown keys (so names/chat cannot slip in). */
export function sanitizeReferralPacket(input: unknown): ReferralCheck {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "invalid_body" };
  }
  const obj = input as Record<string, unknown>;

  for (const key of Object.keys(obj)) {
    if (!(ALLOWED_KEYS as readonly string[]).includes(key)) {
      return { ok: false, error: `unexpected_field:${key.slice(0, 40)}` };
    }
  }
  if (obj.version !== "1") return { ok: false, error: "bad_version" };
  if (!KINDS.includes(obj.kind as ReferralKind)) return { ok: false, error: "bad_kind" };
  if (!TIERS.includes(obj.tier as TriageTier)) return { ok: false, error: "bad_tier" };
  if (obj.tier === "urgent") return { ok: false, error: "urgent_care_now" };
  if (obj.tier === "self_care" || obj.tier === "insufficient_info") {
    return { ok: false, error: "no_referral_needed" };
  }
  if (obj.userOptIn !== true) return { ok: false, error: "opt_in_required" };
  if (obj.demo !== true) return { ok: false, error: "demo_flag_required" };
  if (typeof obj.humanReviewRequired !== "boolean") {
    return { ok: false, error: "bad_review_flag" };
  }
  if (typeof obj.createdAt !== "string" || Number.isNaN(Date.parse(obj.createdAt))) {
    return { ok: false, error: "bad_timestamp" };
  }
  if (
    !Array.isArray(obj.reasonCodes) ||
    obj.reasonCodes.length > 20 ||
    !obj.reasonCodes.every((c) => typeof c === "string" && CODE_RE.test(c))
  ) {
    return { ok: false, error: "bad_reason_codes" };
  }
  if (
    !Array.isArray(obj.consentCategoriesUsed) ||
    !obj.consentCategoriesUsed.every((c) => CONSENTS.includes(c as ConsentCategory))
  ) {
    return { ok: false, error: "bad_consents" };
  }

  return {
    ok: true,
    packet: {
      version: "1",
      kind: obj.kind as ReferralKind,
      tier: obj.tier as TriageTier,
      reasonCodes: obj.reasonCodes as string[],
      consentCategoriesUsed: obj.consentCategoriesUsed as ConsentCategory[],
      humanReviewRequired: obj.humanReviewRequired,
      userOptIn: true,
      demo: true,
      createdAt: obj.createdAt,
    },
  };
}
