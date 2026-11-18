import Link from "next/link";
import { PriceTag } from "@/components/product/price-tag";
import { ProductImage } from "@/components/product/product-image";
import { Badge } from "@/components/ui/badge";
import type { ProductCardData } from "@/lib/types";

export function ProductCard({ product }: { product: ProductCardData }) {
  const image = product.images[0];
  const totalStock =
    product.variants.length > 0
      ? product.variants.reduce((sum, v) => sum + v.stock, 0)
      : product.stock;
  const outOfStock = totalStock <= 0;

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group flex flex-col"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[var(--color-paper-sunken)] transition-[transform,box-shadow] duration-300 group-hover:scale-[1.02] group-hover:shadow-[0_0_28px_4px_rgba(182,226,58,0.55),0_0_70px_14px_rgba(182,226,58,0.32)]">
        <ProductImage
          url={image?.url}
          alt={image?.alt ?? product.name}
          seed={product.id}
          sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.onSale && <Badge tone="accent">Oferta</Badge>}
          {product.featured && <Badge tone="neutral">Destacado</Badge>}
        </div>
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-paper)]/70 backdrop-blur-[1px]">
            <Badge tone="bad">Sin stock</Badge>
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-col gap-1">
        <span className="text-[11px] uppercase tracking-wide text-[var(--color-ink-faint)]">
          {product.category.name}
        </span>
        <h3 className="neon-group text-sm font-medium text-[var(--color-ink)] leading-snug">
          {product.name}
        </h3>
        <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} size="sm" />
      </div>
    </Link>
  );
}
