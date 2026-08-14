import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";

export function PriceTag({
  price,
  compareAtPrice,
  size = "md",
  className,
}: {
  price: number;
  compareAtPrice?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const onSale = !!compareAtPrice && compareAtPrice > price;
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl",
  };
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className={cn("font-semibold text-[var(--color-ink)]", sizes[size])}>
        {formatPrice(price)}
      </span>
      {onSale && (
        <span className="text-[var(--color-ink-faint)] line-through text-sm">
          {formatPrice(compareAtPrice!)}
        </span>
      )}
    </div>
  );
}
