import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { updateProduct, deleteProduct } from "@/lib/actions/products";
import { getProductById, getAllCategoriesFlat } from "@/lib/queries";

export const metadata: Metadata = { title: "Editar producto" };

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProductById(id), getAllCategoriesFlat()]);
  if (!product) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Editar producto</h1>
        <DeleteButton
          action={deleteProduct.bind(null, product.id)}
          confirmMessage={`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`}
          redirectTo="/admin/productos"
        />
      </div>
      <ProductForm categories={categories} product={product} onSubmit={updateProduct.bind(null, product.id)} />
    </div>
  );
}
