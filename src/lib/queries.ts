import "server-only";
import { prisma } from "@/lib/prisma";

const PRODUCT_INCLUDE = { images: true, category: true, variants: true } as const;

export async function getSettings() {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!settings) {
    throw new Error("Settings no inicializados — correr `npm run db:seed`.");
  }
  return settings;
}

export async function getCategoryTree() {
  const categories = await prisma.category.findMany({
    where: { active: true, parentId: null },
    orderBy: { order: "asc" },
    include: { children: { where: { active: true }, orderBy: { order: "asc" } } },
  });
  return categories;
}

export async function getAllCategoriesFlat() {
  return prisma.category.findMany({ orderBy: [{ parentId: "asc" }, { order: "asc" }] });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: { children: { where: { active: true }, orderBy: { order: "asc" } }, parent: true },
  });
}

export async function getFeaturedProducts(take = 8) {
  return prisma.product.findMany({
    where: { featured: true, status: "active" },
    include: PRODUCT_INCLUDE,
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getOnSaleProducts(take = 8) {
  return prisma.product.findMany({
    where: { onSale: true, status: "active" },
    include: PRODUCT_INCLUDE,
    orderBy: { createdAt: "desc" },
    take,
  });
}

export type CatalogFilters = {
  categorySlug?: string;
  search?: string;
  onSale?: boolean;
  sort?: "relevance" | "name-asc" | "name-desc" | "price-asc" | "price-desc" | "newest";
  page?: number;
  pageSize?: number;
};

export async function getCatalogProducts(filters: CatalogFilters) {
  const { categorySlug, search, onSale, sort = "relevance", page = 1, pageSize = 24 } = filters;

  const where: Record<string, unknown> = { status: "active" };
  if (onSale) where.onSale = true;

  if (categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      include: { children: true },
    });
    if (category) {
      const ids = [category.id, ...category.children.map((c) => c.id)];
      where.categoryId = { in: ids };
    }
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy: Record<string, "asc" | "desc"> =
    sort === "name-asc"
      ? { name: "asc" }
      : sort === "name-desc"
        ? { name: "desc" }
        : sort === "price-asc"
          ? { price: "asc" }
          : sort === "price-desc"
            ? { price: "desc" }
            : { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: PRODUCT_INCLUDE,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: PRODUCT_INCLUDE,
  });
}

export async function getProductBySku(sku: string) {
  return prisma.product.findUnique({ where: { sku }, select: { slug: true } });
}

export async function getRelatedProducts(categoryId: string, excludeId: string, take = 4) {
  return prisma.product.findMany({
    where: { categoryId, status: "active", id: { not: excludeId } },
    include: PRODUCT_INCLUDE,
    take,
  });
}

export async function getAdminProducts(search?: string, categorySlug?: string, page = 1, pageSize = 50) {
  const where: Record<string, unknown> = {};
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (categorySlug) where.category = { slug: categorySlug };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: PRODUCT_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { images: true, variants: true, category: true },
  });
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { customer: true, items: { include: { product: true, variant: true } } },
  });
}

export type OrdersFilters = {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

export async function getOrders(filters: OrdersFilters = {}) {
  const { status, search, page = 1, pageSize = 20 } = filters;
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    where.customer = {
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { customer: true, items: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getDashboardStats() {
  const [orderCount, pendingCount, revenueAgg, lowStockProducts, recentOrders, topProducts] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "pending" } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: "cancelled" } },
      }),
      prisma.product.findMany({
        where: { status: "active", stock: { lte: 3 }, variants: { none: {} } },
        take: 6,
        orderBy: { stock: "asc" },
      }),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: { customer: true },
      }),
      prisma.orderItem.groupBy({
        by: ["productName"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
    ]);

  return {
    orderCount,
    pendingCount,
    revenue: revenueAgg._sum.total ?? 0,
    lowStockProducts,
    recentOrders,
    topProducts,
  };
}
