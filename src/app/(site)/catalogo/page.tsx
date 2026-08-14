import type { Metadata } from "next";
import { CatalogControls } from "@/components/site/catalog-controls";
import { CategoryDirectory } from "@/components/site/category-directory";
import { ProductGrid } from "@/components/product/product-grid";
import { Pagination } from "@/components/site/pagination";
import { getCatalogProducts, getCategoryTree } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Todo el cotillón, disfraces y accesorios de fiesta de BAFX en un solo lugar.",
};

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const sort = typeof sp.sort === "string" ? (sp.sort as never) : undefined;
  const page = typeof sp.page === "string" ? Number(sp.page) || 1 : 1;
  const onSale = sp.onSale === "1";
  const isBrowsing = !q && !onSale && page === 1 && !sort;

  const [{ items, total, pageCount }, categories] = await Promise.all([
    getCatalogProducts({ search: q, sort, page, onSale }),
    getCategoryTree(),
  ]);

  return (
    <div className="container-page py-12">
      <h1 className="font-display text-3xl font-bold">
        {onSale ? "Ofertas del mes" : q ? `Resultados para "${q}"` : "Catálogo completo"}
      </h1>
      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
        {q
          ? `${total} producto${total === 1 ? "" : "s"} encontrado${total === 1 ? "" : "s"}`
          : "Buscá cualquier producto o entrá directo a la sección que quieras."}
      </p>

      <div className="mt-6">
        <CatalogControls resultCount={total} />
      </div>

      {isBrowsing && (
        <section className="mb-16">
          <h2 className="mb-5 font-display text-xl font-bold">Todas las secciones</h2>
          <CategoryDirectory categories={categories} />
        </section>
      )}

      <section>
        {isBrowsing && <h2 className="mb-5 font-display text-xl font-bold">Todos los productos</h2>}
        <ProductGrid products={items} />
        <Pagination
          page={page}
          pageCount={pageCount}
          basePath="/catalogo"
          searchParams={{ q, sort, onSale: onSale ? "1" : undefined }}
        />
      </section>
    </div>
  );
}
