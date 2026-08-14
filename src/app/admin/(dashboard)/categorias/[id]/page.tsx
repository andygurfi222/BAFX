import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/category-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { updateCategory, deleteCategory } from "@/lib/actions/categories";
import { getAllCategoriesFlat } from "@/lib/queries";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Editar categoría" };

export default async function EditarCategoriaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [category, categories] = await Promise.all([
    prisma.category.findUnique({ where: { id } }),
    getAllCategoriesFlat(),
  ]);
  if (!category) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Editar categoría</h1>
        <DeleteButton
          action={deleteCategory.bind(null, category.id)}
          confirmMessage={`¿Eliminar "${category.name}"? Esta acción no se puede deshacer.`}
          redirectTo="/admin/categorias"
        />
      </div>
      <CategoryForm categories={categories} category={category} onSubmit={updateCategory.bind(null, category.id)} />
    </div>
  );
}
