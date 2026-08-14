"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea, FieldGroup } from "@/components/ui/field";
import type { Category } from "@prisma/client";

export function CategoryForm({
  categories,
  category,
  onSubmit,
  mode = "edit",
}: {
  categories: Category[];
  mode?: "create" | "edit";
  category?: Category;
  onSubmit: (formData: FormData) => Promise<{ id?: string } | void>;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(new FormData(e.currentTarget));
      if (mode === "create") router.push("/admin/categorias");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos guardar la categoría.");
      setSubmitting(false);
    }
  }

  const parentOptions = categories.filter((c) => !c.parentId && c.id !== category?.id);

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4">
      <FieldGroup>
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" defaultValue={category?.name} required />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Textarea id="description" name="description" defaultValue={category?.description ?? ""} />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="parentId">Categoría padre (opcional)</Label>
        <Select id="parentId" name="parentId" defaultValue={category?.parentId ?? ""}>
          <option value="">— Categoría principal —</option>
          {parentOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="order">Orden</Label>
        <Input id="order" name="order" type="number" defaultValue={category?.order ?? 0} />
      </FieldGroup>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={category?.active ?? true} /> Activa (visible en el sitio)
      </label>

      {error && <p className="rounded-lg bg-[var(--color-bad-soft)] px-4 py-3 text-sm text-[var(--color-bad)]">{error}</p>}

      <Button type="submit" variant="accent" disabled={submitting} className="w-fit">
        {submitting ? "Guardando…" : category ? "Guardar cambios" : "Crear categoría"}
      </Button>
    </form>
  );
}
