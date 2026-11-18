import type { Metadata } from "next";
import { getOrders } from "@/lib/queries";
import { formatPrice, formatDate } from "@/lib/format";
import { OrdersTable } from "@/components/admin/orders-table";
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

      <div className="mt-6">
        <OrdersTable
          key={`${sp.status ?? ""}|${sp.q ?? ""}|${page}`}
          rows={items.map((order) => ({
            id: order.id,
            shortId: order.id.slice(-8).toUpperCase(),
            customerName: `${order.customer.firstName} ${order.customer.lastName}`,
            email: order.customer.email,
            date: formatDate(order.createdAt),
            total: formatPrice(order.total),
            statusLabel: ORDER_STATUS_LABELS[order.status as OrderStatus],
          }))}
        />
      </div>

      <Pagination page={page} pageCount={pageCount} basePath="/admin/pedidos" searchParams={{ status: sp.status, q: sp.q }} />
    </div>
  );
}
