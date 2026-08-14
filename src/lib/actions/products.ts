"use server";

import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session";
import { productSchema } from "@/lib/validations";
import { saveProductImage } from "@/lib/upload";

function slug(s: string) {
  return slugify(s, { lower: true, strict: true, locale: "es" });
}

async function uniqueSlug(name: string, ignoreId?: string) {
  const base = slug(name);
  let candidate = base;
  let n = 2;
  for (;;) {
    const existing = await prisma.product.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === ignoreId) return candidate;
    candidate = `${base}-${n++}`;
  }
}

type VariantInput = { attribute: string; value: string; price?: number; stock: number };

function parseVariants(json: string | null): VariantInput[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((v) => v && v.attribute && v.value)
      .map((v) => ({
        attribute: String(v.attribute),
        value: String(v.value),
        price: v.price ? Number(v.price) : undefined,
        stock: Number(v.stock) || 0,
      }));
  } catch {
    return [];
  }
}

function readProductFields(formData: FormData) {
  return productSchema.parse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    sku: formData.get("sku") || undefined,
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice") || "",
    stock: formData.get("stock") || 0,
    categoryId: formData.get("categoryId"),
    featured: formData.get("featured") === "on",
    onSale: formData.get("onSale") === "on",
    status: formData.get("status") || "active",
  });
}

export async function createProduct(formData: FormData) {
  await requireAdminSession();
  const data = readProductFields(formData);
  const variants = parseVariants(formData.get("variantsJson") as string | null);
  const productSlug = await uniqueSlug(data.name);

  const imageFile = formData.get("image") as File | null;
  const imageUrl =
    imageFile && imageFile.size > 0 ? await saveProductImage(imageFile) : `placeholder:${productSlug}`;

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug: productSlug,
      description: data.description || undefined,
      sku: data.sku || undefined,
      price: data.price,
      compareAtPrice: data.compareAtPrice === "" ? undefined : Number(data.compareAtPrice),
      stock: variants.length > 0 ? 0 : data.stock,
      categoryId: data.categoryId,
      featured: data.featured,
      onSale: data.onSale,
      status: data.status,
      images: { create: [{ url: imageUrl, alt: data.name, order: 0 }] },
      variants: variants.length > 0 ? { create: variants } : undefined,
    },
  });

  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  return { id: product.id };
}

export async function updateProduct(productId: string, formData: FormData) {
  await requireAdminSession();
  const data = readProductFields(formData);
  const variants = parseVariants(formData.get("variantsJson") as string | null);
  const productSlug = await uniqueSlug(data.name, productId);

  const imageFile = formData.get("image") as File | null;
  const newImageUrl = imageFile && imageFile.size > 0 ? await saveProductImage(imageFile) : null;

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        slug: productSlug,
        description: data.description || undefined,
        sku: data.sku || undefined,
        price: data.price,
        compareAtPrice: data.compareAtPrice === "" ? undefined : Number(data.compareAtPrice),
        stock: variants.length > 0 ? 0 : data.stock,
        categoryId: data.categoryId,
        featured: data.featured,
        onSale: data.onSale,
        status: data.status,
      },
    });

    await tx.productVariant.deleteMany({ where: { productId } });
    if (variants.length > 0) {
      await tx.productVariant.createMany({
        data: variants.map((v) => ({ ...v, productId })),
      });
    }

    if (newImageUrl) {
      await tx.productImage.deleteMany({ where: { productId } });
      await tx.productImage.create({
        data: { productId, url: newImageUrl, alt: data.name, order: 0 },
      });
    }
  });

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}`);
  revalidatePath("/catalogo");
  revalidatePath(`/producto/${productSlug}`);
}

export async function deleteProduct(productId: string) {
  await requireAdminSession();
  const orderItemCount = await prisma.orderItem.count({ where: { productId } });
  if (orderItemCount > 0) {
    throw new Error(
      "Este producto ya tiene pedidos asociados y no se puede eliminar. Marcalo como inactivo en su lugar."
    );
  }
  await prisma.product.delete({ where: { id: productId } });
  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
}

export async function setProductStatus(productId: string, status: "active" | "inactive" | "draft") {
  await requireAdminSession();
  const product = await prisma.product.update({ where: { id: productId }, data: { status } });
  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  revalidatePath(`/producto/${product.slug}`);
}

export async function toggleFeatured(productId: string, featured: boolean) {
  await requireAdminSession();
  const product = await prisma.product.update({ where: { id: productId }, data: { featured } });
  revalidatePath("/admin/productos");
  revalidatePath("/");
  revalidatePath(`/producto/${product.slug}`);
}
