import type { Metadata } from "next";
import Link from "next/link";
import { getAllCategoriesFlat } from "@/lib/queries";
import { deleteCategory } from "@/lib/actions/categories";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";

export const metadata: Metadata = { title: "Categorías" };

export default async function AdminCategoriasPage() {
  const categories = await getAllCategoriesFlat();
  const topLevel = categories.filter((c) => !c.parentId);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Categorías</h1>
        <ButtonLink href="/admin/categorias/nueva" variant="accent" size="sm">
          + Nueva categoría
        </ButtonLink>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {topLevel.map((parent) => (
          <div key={parent.id} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-raised)] p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link href={`/admin/categorias/${parent.id}`} className="font-display text-lg font-semibold hover:underline">
                  {parent.name}
                </Link>
                {!parent.active && <Badge tone="neutral">Inactiva</Badge>}
              </div>
              <DeleteButton
                action={deleteCategory.bind(null, parent.id)}
                confirmMessage={`¿Eliminar "${parent.name}"? Esta acción no se puede deshacer.`}
              />
            </div>
            <ul className="mt-3 flex flex-wrap gap-2">
              {categories
                .filter((c) => c.parentId === parent.id)
                .map((child) => (
                  <li key={child.id}>
                    <Link
                      href={`/admin/categorias/${child.id}`}
                      className="flex items-center gap-1.5 rounded-full border border-[var(--color-line)] px-3 py-1.5 text-sm hover:border-[var(--color-ink)]"
                    >
                      {child.name}
                      {!child.active && <Badge tone="neutral">Inactiva</Badge>}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
