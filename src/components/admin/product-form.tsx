"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea, FieldGroup } from "@/components/ui/field";
import { PhotoField } from "@/components/admin/photo-field";
import type { Category, ProductVariant } from "@prisma/client";

type VariantRow = { attribute: string; value: string; price: string; stock: string };

export function ProductForm({
  categories,
  product,
  onSubmit,
  mode = "edit",
}: {
  categories: Category[];
  mode?: "create" | "edit";
  product?: {
    id: string;
    name: string;
    description: string | null;
    sku: string | null;
    price: number;
    compareAtPrice: number | null;
    stock: number;
    categoryId: string;
    featured: boolean;
    onSale: boolean;
    status: string;
    variants: ProductVariant[];
    images?: { url: string }[];
  };
  onSubmit: (formData: FormData) => Promise<{ id?: string; error?: string } | void>;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [variants, setVariants] = useState<VariantRow[]>(
    product?.variants.map((v) => ({
      attribute: v.attribute,
      value: v.value,
      price: v.price?.toString() ?? "",
      stock: String(v.stock),
    })) ?? []
  );

  function addVariant() {
    setVariants((v) => [...v, { attribute: "Color", value: "", price: "", stock: "0" }]);
  }
  function updateVariant(i: number, patch: Partial<VariantRow>) {
    setVariants((v) => v.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }
  function removeVariant(i: number) {
    setVariants((v) => v.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.set(
      "variantsJson",
      JSON.stringify(
        variants
          .filter((v) => v.attribute && v.value)
          .map((v) => ({ attribute: v.attribute, value: v.value, price: v.price || undefined, stock: v.stock }))
      )
    );
    try {
      const result = await onSubmit(formData);
      if (result?.error) {
        setError(result.error);
        setSubmitting(false);
        return;
      }
      if (mode === "create" && result?.id) {
        router.push(`/admin/productos/${result.id}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos guardar el producto.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <PhotoField
          currentUrl={product?.images?.[0]?.url}
          productName={product?.name}
          productId={product?.id}
        />
        <FieldGroup className="sm:col-span-2">
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" defaultValue={product?.name} required />
        </FieldGroup>
        <FieldGroup className="sm:col-span-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea id="description" name="description" defaultValue={product?.description ?? ""} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="sku">SKU (opcional)</Label>
          <Input id="sku" name="sku" defaultValue={product?.sku ?? ""} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="categoryId">Categoría</Label>
          <Select id="categoryId" name="categoryId" defaultValue={product?.categoryId} required>
            <option value="">Elegir…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.parentId ? `— ${c.name}` : c.name}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="price">Precio</Label>
          <Input id="price" name="price" type="number" min={0} defaultValue={product?.price} required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="compareAtPrice">Precio anterior (opcional)</Label>
          <Input id="compareAtPrice" name="compareAtPrice" type="number" min={0} defaultValue={product?.compareAtPrice ?? ""} />
        </FieldGroup>
        {variants.length === 0 && (
          <FieldGroup>
            <Label htmlFor="stock">Stock</Label>
            <Input id="stock" name="stock" type="number" min={0} defaultValue={product?.stock ?? 0} />
          </FieldGroup>
        )}
        <FieldGroup>
          <Label htmlFor="status">Estado</Label>
          <Select id="status" name="status" defaultValue={product?.status ?? "active"}>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="draft">Borrador</option>
          </Select>
        </FieldGroup>
        <div className="flex items-center gap-6 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" defaultChecked={product?.featured} /> Destacado
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="onSale" defaultChecked={product?.onSale} /> En oferta
          </label>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Variantes</h2>
          <Button type="button" variant="outline" size="sm" onClick={addVariant}>
            + Agregar variante
          </Button>
        </div>
        {variants.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-faint)]">
            Sin variantes: el producto usa el precio y el stock de arriba. Agregá variantes para color, talle, etc.
          </p>
        ) : (
          <div className="flex flex-col gap-2 overflow-x-auto">
            {variants.map((v, i) => (
              <div key={i} className="grid min-w-[560px] grid-cols-[1fr_1fr_1fr_1fr_auto] items-end gap-2">
                <FieldGroup>
                  <Label>Atributo</Label>
                  <Input value={v.attribute} onChange={(e) => updateVariant(i, { attribute: e.target.value })} />
                </FieldGroup>
                <FieldGroup>
                  <Label>Valor</Label>
                  <Input value={v.value} onChange={(e) => updateVariant(i, { value: e.target.value })} />
                </FieldGroup>
                <FieldGroup>
                  <Label>Precio (opcional)</Label>
                  <Input type="number" min={0} value={v.price} onChange={(e) => updateVariant(i, { price: e.target.value })} />
                </FieldGroup>
                <FieldGroup>
                  <Label>Stock</Label>
                  <Input type="number" min={0} value={v.stock} onChange={(e) => updateVariant(i, { stock: e.target.value })} />
                </FieldGroup>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(i)}>
                  Quitar
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="rounded-lg bg-[var(--color-bad-soft)] px-4 py-3 text-sm text-[var(--color-bad)]">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" variant="accent" disabled={submitting}>
          {submitting ? "Guardando…" : product ? "Guardar cambios" : "Crear producto"}
        </Button>
      </div>
    </form>
  );
}
