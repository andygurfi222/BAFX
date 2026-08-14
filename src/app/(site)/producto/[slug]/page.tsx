import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ProductImage } from "@/components/product/product-image";
import { ProductPurchasePanel } from "@/components/product/product-purchase-panel";
import { ProductGrid } from "@/components/product/product-grid";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description ?? `${product.name} — ${product.category.name} en BAFX.`,
    openGraph: { title: product.name, description: product.description ?? undefined },
  };
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categoryId, product.id, 4);
  const image = product.images[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    sku: product.sku ?? undefined,
    category: product.category.name,
    offers: {
      "@type": "Offer",
      priceCurrency: "ARS",
      price: product.price,
      availability:
        (product.variants.length > 0
          ? product.variants.some((v) => v.stock > 0)
          : product.stock > 0)
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="container-page py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs
        items={[
          { label: product.category.name, href: `/categoria/${product.category.slug}` },
          { label: product.name },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--color-paper-sunken)]">
          <ProductImage url={image?.url} alt={image?.alt ?? product.name} seed={product.id} sizes="(min-width: 1024px) 45vw, 90vw" />
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-faint)]">
            {product.category.name}
          </span>
          <h1 className="mt-1 font-display text-3xl font-bold leading-tight">{product.name}</h1>
          <div className="mt-6">
            <ProductPurchasePanel product={product} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 font-display text-2xl font-semibold">También te puede interesar</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
