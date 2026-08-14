import type { Metadata } from "next";
import Link from "next/link";
import { getAdminProducts } from "@/lib/queries";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Pagination } from "@/components/site/pagination";

export const metadata: Metadata = { title: "Productos" };

const STATUS_TONE = { active: "good", inactive: "neutral", draft: "warn" } as const;
const STATUS_LABEL = { active: "Activo", inactive: "Inactivo", draft: "Borrador" } as const;

export default async function AdminProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;
  const { items, total, pageCount } = await getAdminProducts(q, undefined, page);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Productos</h1>
        <ButtonLink href="/admin/productos/nuevo" variant="accent" size="sm">
          + Agregar producto
        </ButtonLink>
      </div>
      <p className="mt-1 text-sm text-[var(--color-ink-faint)]">{total} productos en total</p>

      <form className="mt-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre…"
          className="w-full max-w-sm rounded-full border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-4 py-2 text-sm"
        />
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-raised)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-line)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => {
              const stock = p.variants.length > 0 ? p.variants.reduce((s, v) => s + v.stock, 0) : p.stock;
              return (
                <tr key={p.id} className="border-b border-[var(--color-line)] last:border-0 hover:bg-[var(--color-paper-sunken)]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/productos/${p.id}`} className="font-medium hover:underline">
                      {p.name}
                    </Link>
                    {p.featured && <Badge tone="accent" className="ml-2">Destacado</Badge>}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-ink-soft)]">{p.category.name}</td>
                  <td className="px-4 py-3 tabular-nums">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3 tabular-nums">{stock}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[p.status as keyof typeof STATUS_TONE]}>
                      {STATUS_LABEL[p.status as keyof typeof STATUS_LABEL]}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {items.length === 0 && (
          <p className="p-8 text-center text-sm text-[var(--color-ink-faint)]">No se encontraron productos.</p>
        )}
      </div>

      <Pagination page={page} pageCount={pageCount} basePath="/admin/productos" searchParams={{ q }} />
    </div>
  );
}
