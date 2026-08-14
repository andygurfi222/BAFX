"use client";

import { useMemo, useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { PriceTag } from "@/components/product/price-tag";
import { Button } from "@/components/ui/button";
import type { ProductDetailData } from "@/lib/types";

export function ProductPurchasePanel({ product }: { product: ProductDetailData }) {
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const attributeGroups = useMemo(() => {
    const groups = new Map<string, string[]>();
    for (const v of product.variants) {
      const values = groups.get(v.attribute) ?? [];
      if (!values.includes(v.value)) values.push(v.value);
      groups.set(v.attribute, values);
    }
    return groups;
  }, [product.variants]);

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const [attr, values] of attributeGroups) initial[attr] = values[0];
    return initial;
  });

  const selectedVariant = useMemo(() => {
    if (product.variants.length === 0) return null;
    return (
      product.variants.find((v) =>
        Object.entries(selected).every(([attr, val]) => (v.attribute === attr ? v.value === val : true))
      ) ?? product.variants[0]
    );
  }, [product.variants, selected]);

  const price = selectedVariant?.price ?? product.price;
  const stock = selectedVariant ? selectedVariant.stock : product.stock;
  const outOfStock = stock <= 0;
  const image = product.images[0];

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        variantId: selectedVariant?.id,
        name: product.name,
        variantLabel: selectedVariant ? `${selectedVariant.attribute}: ${selectedVariant.value}` : undefined,
        price,
        image: image?.url,
        slug: product.slug,
        maxStock: stock,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div>
      <PriceTag price={price} compareAtPrice={product.compareAtPrice} size="lg" />

      {product.description && (
        <p className="mt-4 text-[var(--color-ink-soft)]">{product.description}</p>
      )}

      {[...attributeGroups.entries()].map(([attr, values]) => (
        <div key={attr} className="mt-6">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-faint)]">
            {attr}
          </span>
          <div className="flex flex-wrap gap-2">
            {values.map((val) => (
              <button
                key={val}
                onClick={() => setSelected((s) => ({ ...s, [attr]: val }))}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  selected[attr] === val
                    ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)]"
                    : "border-[var(--color-line)] hover:border-[var(--color-ink)]"
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-6 flex items-center gap-3">
        <div className="flex items-center rounded-full border border-[var(--color-line)]">
          <button
            className="h-11 w-11 text-lg"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Restar cantidad"
          >
            −
          </button>
          <span className="w-8 text-center tabular-nums">{quantity}</span>
          <button
            className="h-11 w-11 text-lg"
            onClick={() => setQuantity((q) => Math.min(stock || 1, q + 1))}
            aria-label="Sumar cantidad"
            disabled={quantity >= stock}
          >
            +
          </button>
        </div>
        <Button variant="accent" size="lg" className="flex-1" onClick={handleAdd} disabled={outOfStock}>
          {outOfStock ? "Sin stock" : added ? "¡Agregado! ✓" : "Agregar al carrito"}
        </Button>
      </div>

      <p className="mt-3 text-xs text-[var(--color-ink-faint)]">
        {outOfStock ? "Sin stock por el momento." : `${stock} unidades disponibles.`}
        {product.sku && ` · SKU ${product.sku}`}
      </p>
    </div>
  );
}
