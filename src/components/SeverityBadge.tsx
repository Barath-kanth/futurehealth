import clsx from "clsx";
import type { Confidence, SignalSeverity, TriageTier } from "@/lib/types";

const severityClass: Record<SignalSeverity, string> = {
  info: "bg-[var(--info-soft)] text-[var(--cedar)]",
  watch: "bg-[var(--watch-soft)] text-[var(--watch)]",
  elevated: "bg-[var(--elevated-soft)] text-[var(--elevated)]",
  urgent: "bg-[var(--urgent-soft)] text-[var(--urgent)]",
};

export function SeverityBadge({ severity }: { severity: SignalSeverity }) {
  return (
    <span
      className={clsx(
        "inline-flex rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        severityClass[severity],
      )}
    >
      {severity}
    </span>
  );
}

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  return (
    <span className="inline-flex rounded border border-[var(--line)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--muted)]">
      {confidence} confidence
    </span>
  );
}

export function TriageBadge({ tier }: { tier: TriageTier }) {
  const label = tier.replaceAll("_", " ");
  return (
    <span className="inline-flex rounded-md bg-[var(--cedar)] px-2.5 py-1 text-xs font-medium text-[var(--mist)]">
      {label}
    </span>
  );
}
