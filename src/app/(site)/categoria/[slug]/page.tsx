import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CatalogControls } from "@/components/site/catalog-controls";
import { ProductGrid } from "@/components/product/product-grid";
import { Pagination } from "@/components/site/pagination";
import { getCategoryBySlug, getCatalogProducts } from "@/lib/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description ?? `${category.name} en BAFX: cotillón y fiesta para todo el país.`,
  };
}

export default async function CategoriaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const q = typeof sp.q === "string" ? sp.q : undefined;
  const sort = typeof sp.sort === "string" ? (sp.sort as never) : undefined;
  const page = typeof sp.page === "string" ? Number(sp.page) || 1 : 1;

  const { items, total, pageCount } = await getCatalogProducts({
    categorySlug: slug,
    search: q,
    sort,
    page,
  });

  const crumbs = category.parent
    ? [{ label: category.parent.name, href: `/categoria/${category.parent.slug}` }, { label: category.name }]
    : [{ label: category.name }];

  return (
    <div className="container-page py-12">
      <Breadcrumbs items={crumbs} />
      <h1 className="font-display text-3xl font-bold">{category.name}</h1>
      {category.description && (
        <p className="mt-2 max-w-xl text-sm text-[var(--color-ink-soft)]">{category.description}</p>
      )}

      {category.children.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {category.children.map((child) => (
            <Link
              key={child.id}
              href={`/categoria/${child.slug}`}
              className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-medium hover:border-[var(--color-ink)]"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8">
        <CatalogControls resultCount={total} />
        <ProductGrid products={items} />
        <Pagination
          page={page}
          pageCount={pageCount}
          basePath={`/categoria/${slug}`}
          searchParams={{ q, sort }}
        />
      </div>
    </div>
  );
}
