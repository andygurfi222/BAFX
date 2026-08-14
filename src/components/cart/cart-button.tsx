"use client";

import { useCartStore, cartTotals } from "@/lib/cart-store";
import { useHasMounted } from "@/lib/use-has-mounted";

export function CartButton() {
  const lines = useCartStore((s) => s.lines);
  const open = useCartStore((s) => s.open);
  const mounted = useHasMounted();

  const { itemCount } = cartTotals(lines);

  return (
    <button
      onClick={open}
      aria-label="Abrir carrito"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--color-paper-sunken)]"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-2.3 4.6A1 1 0 0 0 5.6 19H17" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="21.5" r="1" fill="currentColor" stroke="none" />
        <circle cx="17" cy="21.5" r="1" fill="currentColor" stroke="none" />
      </svg>
      {mounted && itemCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[var(--color-accent)] px-1 text-[10px] font-bold text-white">
          {itemCount}
        </span>
      )}
    </button>
  );
}
