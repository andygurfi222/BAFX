import type { Metadata } from "next";
import { CategoryForm } from "@/components/admin/category-form";
import { createCategory } from "@/lib/actions/categories";
import { getAllCategoriesFlat } from "@/lib/queries";

export const metadata: Metadata = { title: "Nueva categoría" };

export default async function NuevaCategoriaPage() {
  const categories = await getAllCategoriesFlat();
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold">Nueva categoría</h1>
      <CategoryForm categories={categories} onSubmit={createCategory} mode="create" />
    </div>
  );
}
