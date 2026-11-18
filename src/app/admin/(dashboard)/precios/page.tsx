import type { Metadata } from "next";
import Link from "next/link";
import { getAdminProducts, getCategoryTree } from "@/lib/queries";
import { ButtonLink } from "@/components/ui/button";
import { Pagination } from "@/components/site/pagination";
import { PriceEditor } from "@/components/admin/price-editor";

export const metadata: Metadata = { title: "Lista de precios" };

export default async function AdminPreciosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; page?: string }>;
}) {
  const { q, cat, page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;

  const [{ items, total, pageCount }, categories] = await Promise.all([
    getAdminProducts(q, cat || undefined, page),
    getCategoryTree(),
  ]);

  const options = categories.flatMap((c) =>
    c.children.length > 0
      ? c.children.map((ch) => ({ slug: ch.slug, label: `${c.name} › ${ch.name}` }))
      : [{ slug: c.slug, label: c.name }],
  );
  const categoryLabel = options.find((o) => o.slug === cat)?.label;

  const rows = items.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category.name,
    price: p.price,
    status: p.status,
    imageUrl: p.images[0]?.url ?? null,
    hasVariants: p.variants.length > 0,
  }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Lista de precios</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
            Cambiá el precio de cualquier producto directo en la tabla. Después tocá “Guardar cambios”.
          </p>
        </div>
        <div className="flex gap-2">
          <ButtonLink href="/admin/productos/nuevo" variant="accent" size="sm">
            + Agregar producto
          </ButtonLink>
          <a
            href="/admin/precios/exportar"
            className="inline-flex h-9 items-center justify-center rounded-full border-[1.5px] border-[var(--color-ink)] px-4 text-sm font-semibold"
          >
            Descargar lista (Excel)
          </a>
        </div>
      </div>

      <form className="mt-5 flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre…"
          className="w-full max-w-xs rounded-full border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-4 py-2 text-sm"
        />
        <select
          name="cat"
          defaultValue={cat ?? ""}
          className="max-w-xs rounded-full border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-4 py-2 text-sm"
        >
          <option value="">Todas las categorías</option>
          {options.map((o) => (
            <option key={o.slug} value={o.slug}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-full bg-[var(--color-ink)] px-5 py-2 text-sm font-semibold text-[var(--color-paper)]"
        >
          Filtrar
        </button>
        {(q || cat) && (
          <Link href="/admin/precios" className="self-center text-sm text-[var(--color-ink-soft)] hover:underline">
            Quitar filtros
          </Link>
        )}
      </form>

      <div className="mt-6">
        {/* key: al cambiar de página o filtro se descartan los cambios sin guardar */}
        <PriceEditor
          key={`${q ?? ""}|${cat ?? ""}|${page}`}
          rows={rows}
          total={total}
          categorySlug={cat || undefined}
          categoryLabel={categoryLabel}
        />
      </div>

      <Pagination
        page={page}
        pageCount={pageCount}
        basePath="/admin/precios"
        searchParams={{ q, cat }}
      />
    </div>
  );
}
