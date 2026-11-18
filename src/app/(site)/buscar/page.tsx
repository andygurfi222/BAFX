import type { Metadata } from "next";
import Link from "next/link";
import { ProductGrid } from "@/components/product/product-grid";
import { Pagination } from "@/components/site/pagination";
import { SearchPanel } from "@/components/site/search-panel";
import { getCatalogProducts, getCategoryTree } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Buscar",
  description: "Buscá cualquier producto de BAFX: cotillón, disfraces y accesorios de fiesta.",
  robots: { index: false, follow: true },
};

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";
  const page = typeof sp.page === "string" ? Number(sp.page) || 1 : 1;

  const [categories, results] = await Promise.all([
    getCategoryTree(),
    q ? getCatalogProducts({ search: q, page }) : Promise.resolve(null),
  ]);

  // Atajos: las subcategorías de cada sección (o la sección si no tiene).
  const suggestions = categories
    .flatMap((c) => (c.children.length > 0 ? c.children : [c]))
    .slice(0, 16)
    .map((c) => ({ name: c.name, slug: c.slug }));

  return (
    <div className="container-page py-12">
      <div className="max-w-3xl">
        <h1 className="font-display text-3xl font-bold">Buscar</h1>
        <p className="mt-2 mb-8 text-sm text-[var(--color-ink-soft)]">
          Encontrá cualquier producto del catálogo por nombre.
        </p>

        <SearchPanel initialQuery={q} suggestions={q ? [] : suggestions} />
      </div>

      {results && (
        <section className="mt-12" aria-live="polite">
          <h2 className="font-display text-xl font-bold">
            {results.total === 0
              ? `No encontramos resultados para "${q}"`
              : `${results.total} resultado${results.total === 1 ? "" : "s"} para "${q}"`}
          </h2>
          {results.total === 0 ? (
            <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
              Probá con otra palabra (por ejemplo, “vincha” en lugar de “vinchas luminosas”) o
              explorá las categorías.
            </p>
          ) : (
            <div className="mt-6">
              <ProductGrid products={results.items} />
              <Pagination
                page={page}
                pageCount={results.pageCount}
                basePath="/buscar"
                searchParams={{ q }}
              />
            </div>
          )}
        </section>
      )}

      {results && results.total === 0 && suggestions.length > 0 && (
        <div className="mt-10 max-w-3xl">
          <SearchSuggestions suggestions={suggestions} />
        </div>
      )}
    </div>
  );
}

function SearchSuggestions({ suggestions }: { suggestions: { name: string; slug: string }[] }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-lg font-bold">Explorá por categoría</h2>
      <ul className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <li key={s.slug}>
            <Link
              href={`/categoria/${s.slug}`}
              className="neon-hover inline-flex rounded-full bg-[var(--color-paper-sunken)] px-4 py-2 text-sm font-medium text-[var(--color-ink-soft)]"
            >
              {s.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
