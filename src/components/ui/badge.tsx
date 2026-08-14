import { cn } from "@/lib/cn";

const tones = {
  accent: "bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)]",
  good: "bg-[var(--color-good-soft)] text-[var(--color-good)]",
  warn: "bg-[var(--color-warn-soft)] text-[var(--color-warn)]",
  bad: "bg-[var(--color-bad-soft)] text-[var(--color-bad)]",
  neutral: "bg-[var(--color-paper-sunken)] text-[var(--color-ink-soft)]",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: keyof typeof tones;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
