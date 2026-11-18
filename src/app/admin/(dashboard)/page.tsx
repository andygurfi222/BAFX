import Link from "next/link";
import type { Metadata } from "next";
import { getDashboardStats } from "@/lib/queries";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { formatPrice, formatDate } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import type { OrderStatus } from "@/lib/constants";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/admin/precios" variant="accent" size="sm">
            Actualizar precios
          </ButtonLink>
          <ButtonLink href="/admin/productos/nuevo" variant="outline" size="sm">
            + Agregar producto
          </ButtonLink>
          <ButtonLink href="/admin/pedidos" variant="outline" size="sm">
            Ver pedidos
          </ButtonLink>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Ingresos totales" value={formatPrice(stats.revenue)} hint="Pedidos no cancelados" />
        <StatCard label="Pedidos" value={String(stats.orderCount)} />
        <StatCard label="Pedidos pendientes" value={String(stats.pendingCount)} />
        <StatCard label="Productos con poco stock" value={String(stats.lowStockProducts.length)} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-raised)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Pedidos recientes</h2>
            <Link href="/admin/pedidos" className="text-sm text-[var(--color-accent-ink)] hover:underline">
              Ver todos
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-faint)]">Todavía no hay pedidos.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-[var(--color-line)]">
              {stats.recentOrders.map((order) => (
                <li key={order.id} className="flex items-center justify-between py-3">
                  <div>
                    <Link href={`/admin/pedidos/${order.id}`} className="text-sm font-medium hover:underline">
                      {order.customer.firstName} {order.customer.lastName}
                    </Link>
                    <p className="text-xs text-[var(--color-ink-faint)]">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm tabular-nums">{formatPrice(order.total)}</span>
                    <Badge tone="warn">{ORDER_STATUS_LABELS[order.status as OrderStatus]}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-raised)] p-5">
          <h2 className="mb-4 font-display text-lg font-semibold">Sin stock / poco stock</h2>
          {stats.lowStockProducts.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-faint)]">Todo el stock está en buen nivel.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-[var(--color-line)]">
              {stats.lowStockProducts.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3">
                  <Link href={`/admin/productos/${p.id}`} className="text-sm font-medium hover:underline">
                    {p.name}
                  </Link>
                  <Badge tone={p.stock === 0 ? "bad" : "warn"}>{p.stock} u.</Badge>
                </li>
              ))}
            </ul>
          )}

          <h2 className="mb-4 mt-8 font-display text-lg font-semibold">Más vendidos</h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-faint)]">Todavía no hay ventas registradas.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-[var(--color-line)]">
              {stats.topProducts.map((tp) => (
                <li key={tp.productName} className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium">{tp.productName}</span>
                  <span className="text-xs text-[var(--color-ink-faint)]">{tp._sum.quantity} vendidos</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
