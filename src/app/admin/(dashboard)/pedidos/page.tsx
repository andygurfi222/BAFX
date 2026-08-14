import type { Metadata } from "next";
import Link from "next/link";
import { getOrders } from "@/lib/queries";
import { formatPrice, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/constants";
import type { OrderStatus } from "@/lib/constants";
import { Pagination } from "@/components/site/pagination";

export const metadata: Metadata = { title: "Pedidos" };

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const { items, total, pageCount } = await getOrders({ status: sp.status, search: sp.q, page });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Pedidos</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-faint)]">{total} pedidos en total</p>

      <form className="mt-4 flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="Buscar por cliente o email…"
          className="w-64 rounded-full border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-4 py-2 text-sm"
        />
        <select
          name="status"
          defaultValue={sp.status ?? ""}
          className="rounded-full border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-full bg-[var(--color-ink)] px-4 py-2 text-sm font-medium text-[var(--color-paper)]">
          Filtrar
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-raised)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-line)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {items.map((order) => (
              <tr key={order.id} className="border-b border-[var(--color-line)] last:border-0 hover:bg-[var(--color-paper-sunken)]">
                <td className="px-4 py-3">
                  <Link href={`/admin/pedidos/${order.id}`} className="font-mono text-xs hover:underline">
                    #{order.id.slice(-8).toUpperCase()}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {order.customer.firstName} {order.customer.lastName}
                  <div className="text-xs text-[var(--color-ink-faint)]">{order.customer.email}</div>
                </td>
                <td className="px-4 py-3 text-[var(--color-ink-soft)]">{formatDate(order.createdAt)}</td>
                <td className="px-4 py-3 tabular-nums">{formatPrice(order.total)}</td>
                <td className="px-4 py-3">
                  <Badge tone="warn">{ORDER_STATUS_LABELS[order.status as OrderStatus]}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <p className="p-8 text-center text-sm text-[var(--color-ink-faint)]">No hay pedidos con estos filtros.</p>
        )}
      </div>

      <Pagination page={page} pageCount={pageCount} basePath="/admin/pedidos" searchParams={{ status: sp.status, q: sp.q }} />
    </div>
  );
}
