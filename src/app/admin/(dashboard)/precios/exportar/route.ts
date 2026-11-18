import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";

export const dynamic = "force-dynamic";

function cell(value: string | number | null | undefined) {
  const s = value === null || value === undefined ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

/** Descarga la lista de precios en CSV (se abre directo en Excel). Solo para admins. */
export async function GET() {
  const session = await getAdminSession();
  if (!session) return new Response("No autorizado", { status: 401 });

  const products = await prisma.product.findMany({
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    include: { category: true },
  });

  const header = ["Código", "Producto", "Categoría", "Precio", "Precio anterior (tachado)", "Estado"];
  const statusLabel: Record<string, string> = { active: "Visible", inactive: "Oculto", draft: "Borrador" };
  const lines = [
    header.map(cell).join(";"),
    ...products.map((p) =>
      [p.sku ?? p.id, p.name, p.category.name, p.price, p.compareAtPrice, statusLabel[p.status] ?? p.status]
        .map(cell)
        .join(";"),
    ),
  ];

  const date = new Date().toISOString().slice(0, 10);
  // BOM + separador ";" para que Excel en español lo abra bien (con tildes y columnas)
  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lista-de-precios-bafx-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
