export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-4 px-4 py-16">
      <div className="h-4 w-32 rounded bg-[var(--sand)]" />
      <div className="h-10 w-2/3 max-w-md rounded bg-[var(--sand)]" />
      <div className="h-40 rounded-2xl bg-[var(--sand)]/70" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-28 rounded-xl bg-[var(--sand)]/60" />
        <div className="h-28 rounded-xl bg-[var(--sand)]/60" />
      </div>
    </div>
  );
}
