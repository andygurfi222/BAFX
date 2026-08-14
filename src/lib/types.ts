import type { Prisma } from "@prisma/client";

export type ProductCardData = Prisma.ProductGetPayload<{
  include: { images: true; category: true; variants: true };
}>;

export type ProductDetailData = ProductCardData;

export type CategoryWithChildren = Prisma.CategoryGetPayload<{
  include: { children: true };
}>;

export type OrderWithDetails = Prisma.OrderGetPayload<{
  include: { customer: true; items: { include: { product: true; variant: true } } };
}>;
