import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "@/lib/actions/products";
import { getAllCategoriesFlat } from "@/lib/queries";

export const metadata: Metadata = { title: "Nuevo producto" };

export default async function NuevoProductoPage() {
  const categories = await getAllCategoriesFlat();
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold">Nuevo producto</h1>
      <ProductForm categories={categories} onSubmit={createProduct} mode="create" />
    </div>
  );
}
