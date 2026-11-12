export function SimulatedBadge({
  label = "Simulated",
  labelAr = "محاكى",
  ar = false,
}: {
  label?: string;
  labelAr?: string;
  ar?: boolean;
}) {
  return (
    <span className="inline-flex rounded border border-[var(--brass)]/50 bg-[var(--watch-soft)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[var(--watch)]">
      {ar ? labelAr : label}
    </span>
  );
}
