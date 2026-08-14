import { cn } from "@/lib/cn";
import Link from "next/link";
import type { ComponentProps } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[transform,box-shadow,background-color,color] duration-150 ease-out will-change-transform active:scale-[0.96] disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]";

const variants = {
  primary:
    "bg-[var(--color-ink)] text-[var(--color-paper)] shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 active:shadow-none active:translate-y-0",
  accent:
    "bg-[var(--color-ink)] text-[var(--color-paper)] shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 active:shadow-none active:translate-y-0",
  outline:
    "border-[1.5px] border-[var(--color-ink)] text-[var(--color-ink)] bg-transparent hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]",
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
