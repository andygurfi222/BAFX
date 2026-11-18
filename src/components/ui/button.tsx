import { cn } from "@/lib/cn";
import Link from "next/link";
import type { ComponentProps } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[transform,box-shadow,background-color,color] duration-150 ease-out will-change-transform active:scale-[0.96] disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]";

/** Botón verde lima con brillo neón: se usa en los botones principales. */
export const neonButton =
  "bg-[var(--color-neon)] text-[#0a0a0a] shadow-[0_0_14px_rgba(182,226,58,0.30)] hover:shadow-[0_0_26px_var(--color-neon-glow)] hover:-translate-y-0.5 active:shadow-[0_0_10px_rgba(182,226,58,0.35)] active:translate-y-0";

const variants = {
  primary: neonButton,
  accent: neonButton,
  outline:
    "border-[1.5px] border-[var(--color-ink)] text-[var(--color-ink)] bg-transparent hover:bg-[var(--color-neon)] hover:border-[var(--color-neon)] hover:text-[#0a0a0a] hover:shadow-[0_0_22px_var(--color-neon-glow)]",
  ghost: "text-[var(--color-ink)] hover:bg-[var(--color-paper-sunken)]",
};

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
};

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props} />
  );
}

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  href,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...props} />
  );
}
