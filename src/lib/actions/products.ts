"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
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

const priceUpdatesSchema = z
  .array(z.object({ id: z.string().min(1), price: z.number().int().min(0).max(100_000_000) }))
  .min(1)
  .max(500);

/** Guarda el precio de varios productos de una sola vez (lista de precios). */
export async function updatePrices(items: Array<{ id: string; price: number }>) {
  await requireAdminSession();
  const parsed = priceUpdatesSchema.parse(items);
  await prisma.$transaction(
    parsed.map((it) => prisma.product.update({ where: { id: it.id }, data: { price: it.price } })),
  );
  revalidatePath("/", "layout");
  return { updated: parsed.length };
}

const percentSchema = z.object({
  percent: z
    .number()
    .min(-90, "No se puede bajar más de 90%")
    .max(500, "No se puede subir más de 500%")
    .refine((p) => p !== 0, "El porcentaje no puede ser 0"),
  categorySlug: z.string().optional(),
  roundTo: z.union([z.literal(0), z.literal(10), z.literal(100), z.literal(500)]),
});

/**
 * Sube o baja los precios un porcentaje (ej. 10 = +10 %, -5 = -5 %).
 * Alcanza al precio del producto, al precio tachado ("antes") y a los
 * precios propios de las variantes. Opcionalmente redondea a $10/$100/$500.
 */
export async function applyPercentChange(input: {
  percent: number;
  categorySlug?: string;
  roundTo: 0 | 10 | 100 | 500;
}) {
  await requireAdminSession();
  const { percent, categorySlug, roundTo } = percentSchema.parse(input);
  const factor = 1 + percent / 100;

  const products = await prisma.product.findMany({
    where: categorySlug ? { category: { slug: categorySlug } } : {},
    select: { id: true },
  });
  if (products.length === 0) return { updated: 0 };
  const ids = Prisma.join(products.map((p) => p.id));

  // nuevo valor para una columna de precio, con o sin redondeo (nunca negativo)
  const next = (col: Prisma.Sql) =>
    roundTo > 0
      ? Prisma.sql`GREATEST(ROUND(${col}::numeric * ${factor}::numeric / ${roundTo}::numeric) * ${roundTo}::numeric, LEAST(${col}::numeric, ${roundTo}::numeric))::int`
      : Prisma.sql`GREATEST(ROUND(${col}::numeric * ${factor}::numeric), 0)::int`;

  const price = Prisma.raw('"price"');
  const compare = Prisma.raw('"compareAtPrice"');

  await prisma.$transaction([
    prisma.$executeRaw`UPDATE "Product" SET "price" = ${next(price)} WHERE "id" IN (${ids})`,
    prisma.$executeRaw`UPDATE "Product" SET "compareAtPrice" = ${next(compare)} WHERE "id" IN (${ids}) AND "compareAtPrice" IS NOT NULL`,
    prisma.$executeRaw`UPDATE "ProductVariant" SET "price" = ${next(price)} WHERE "productId" IN (${ids}) AND "price" IS NOT NULL`,
  ]);

  revalidatePath("/", "layout");
  return { updated: products.length };
}
