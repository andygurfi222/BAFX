"use server";

import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session";
import { categorySchema } from "@/lib/validations";

function slug(s: string) {
  return slugify(s, { lower: true, strict: true, locale: "es" });
}

async function uniqueSlug(name: string, ignoreId?: string) {
  const base = slug(name);
  let candidate = base;
  let n = 2;
  for (;;) {
    const existing = await prisma.category.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === ignoreId) return candidate;
    candidate = `${base}-${n++}`;
  }
}

function readCategoryFields(formData: FormData) {
  return categorySchema.parse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    parentId: formData.get("parentId") || "",
    order: formData.get("order") || 0,
    active: formData.get("active") === "on",
  });
}

export async function createCategory(formData: FormData) {
  await requireAdminSession();
  const data = readCategoryFields(formData);
  const categorySlug = await uniqueSlug(data.name);

  const category = await prisma.category.create({
    data: {
      name: data.name,
      slug: categorySlug,
      description: data.description || undefined,
      parentId: data.parentId || undefined,
      order: data.order,
      active: data.active,
    },
  });

  revalidatePath("/admin/categorias");
  revalidatePath("/");
  return { id: category.id };
}

export async function updateCategory(categoryId: string, formData: FormData) {
  await requireAdminSession();
  const data = readCategoryFields(formData);

  if (data.parentId === categoryId) {
    throw new Error("Una categoría no puede ser su propia categoría padre");
  }

  const categorySlug = await uniqueSlug(data.name, categoryId);

  await prisma.category.update({
    where: { id: categoryId },
    data: {
      name: data.name,
      slug: categorySlug,
      description: data.description || undefined,
      parentId: data.parentId || null,
      order: data.order,
      active: data.active,
    },
  });

  revalidatePath("/admin/categorias");
  revalidatePath("/");
  revalidatePath(`/categoria/${categorySlug}`);
}

export async function deleteCategory(categoryId: string) {
  await requireAdminSession();
  const [productCount, childCount] = await Promise.all([
    prisma.product.count({ where: { categoryId } }),
    prisma.category.count({ where: { parentId: categoryId } }),
  ]);
  if (productCount > 0) {
    throw new Error("Esta categoría tiene productos asignados. Movelos a otra categoría antes de eliminarla.");
  }
  if (childCount > 0) {
    throw new Error("Esta categoría tiene subcategorías. Eliminalas primero.");
  }
  await prisma.category.delete({ where: { id: categoryId } });
  revalidatePath("/admin/categorias");
  revalidatePath("/");
}
