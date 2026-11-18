"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCartStore, cartTotals } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/product/product-image";
import { ButtonLink } from "@/components/ui/button";
import { useHasMounted } from "@/lib/use-has-mounted";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.close);
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const mounted = useHasMounted();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  if (!mounted) return null;

  const { subtotal, itemCount } = cartTotals(lines);

  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}
    >
      <div
        onClick={close}
        className={`absolute inset-0 bg-[var(--color-ink)]/40 transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[var(--color-paper-raised)] shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-4">
          <h2 className="font-display text-lg font-semibold">Tu carrito {itemCount > 0 && `(${itemCount})`}</h2>
          <button
            onClick={close}
            aria-label="Cerrar carrito"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--color-paper-sunken)]"
          >
            ✕
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-[var(--color-ink-soft)]">Todavía no agregaste productos.</p>
            <ButtonLink href="/catalogo" variant="accent" size="sm" onClick={close}>
              Ver catálogo
            </ButtonLink>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-5 py-4">
              {lines.map((line) => {
                const key = `${line.productId}::${line.variantId ?? ""}`;
                return (
                  <li key={key} className="flex gap-3 border-b border-[var(--color-line)] py-4 first:pt-0">
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--color-paper-sunken)]">
                      <ProductImage url={line.image} alt={line.name} seed={line.productId} />
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <Link href={`/producto/${line.slug}`} onClick={close} className="neon-hover text-sm font-medium leading-snug">
                        {line.name}
                      </Link>
                      {line.variantLabel && (
                        <span className="text-xs text-[var(--color-ink-faint)]">{line.variantLabel}</span>
                      )}
                      <div className="mt-1 flex items-center justify-between">
                        <div className="flex items-center rounded-full border border-[var(--color-line)]">
                          <button
                            className="h-7 w-7 text-sm"
                            onClick={() => setQuantity(line.productId, line.variantId, line.quantity - 1)}
                            aria-label="Restar cantidad"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm tabular-nums">{line.quantity}</span>
                          <button
                            className="h-7 w-7 text-sm"
                            onClick={() => setQuantity(line.productId, line.variantId, line.quantity + 1)}
                            aria-label="Sumar cantidad"
                            disabled={line.quantity >= (line.maxStock || 9999)}
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm font-semibold tabular-nums">
                          {formatPrice(line.price * line.quantity)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(line.productId, line.variantId)}
                      aria-label="Quitar producto"
                      className="self-start text-[var(--color-ink-faint)] hover:text-[var(--color-bad)]"
                    >
                      ✕
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-[var(--color-line)] px-5 py-4">
              <div className="mb-1 flex items-center justify-between text-sm text-[var(--color-ink-soft)]">
                <span>Envío</span>
                <span>A coordinar por WhatsApp</span>
              </div>
              <div className="mb-4 flex items-center justify-between text-base font-semibold">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              <ButtonLink href="/checkout" variant="accent" className="w-full" onClick={close}>
                Finalizar compra
              </ButtonLink>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
