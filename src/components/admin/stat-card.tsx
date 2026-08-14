export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-raised)] p-5">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-faint)]">{label}</span>
      <div className="mt-2 font-display text-2xl font-bold tabular-nums">{value}</div>
      {hint && <p className="mt-1 text-xs text-[var(--color-ink-faint)]">{hint}</p>}
    </div>
  );
}
