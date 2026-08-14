import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/queries";
import { formatPrice, formatDate } from "@/lib/format";
import { DELIVERY_METHOD_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import type { DeliveryMethod, PaymentMethod, OrderStatus } from "@/lib/constants";
import { OrderStatusSelect } from "@/components/admin/order-status-select";

export const metadata: Metadata = { title: "Detalle de pedido" };

export default async function AdminPedidoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Pedido #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-[var(--color-ink-faint)]">{formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusSelect orderId={order.id} status={order.status as OrderStatus} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-raised)] p-5">
          <h2 className="mb-3 font-display text-base font-semibold">Cliente</h2>
          <dl className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--color-ink-faint)]">Nombre</dt><dd>{order.customer.firstName} {order.customer.lastName}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--color-ink-faint)]">Email</dt><dd>{order.customer.email}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--color-ink-faint)]">Teléfono</dt><dd>{order.customer.phone}</dd></div>
            {order.customer.dni && <div className="flex justify-between"><dt className="text-[var(--color-ink-faint)]">DNI</dt><dd>{order.customer.dni}</dd></div>}
          </dl>
        </div>
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-raised)] p-5">
          <h2 className="mb-3 font-display text-base font-semibold">Entrega y pago</h2>
          <dl className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--color-ink-faint)]">Método</dt><dd>{DELIVERY_METHOD_LABELS[order.deliveryMethod as DeliveryMethod]}</dd></div>
            {order.shippingAddress && <div className="flex justify-between"><dt className="text-[var(--color-ink-faint)]">Dirección</dt><dd>{order.shippingAddress}</dd></div>}
            {order.shippingCity && <div className="flex justify-between"><dt className="text-[var(--color-ink-faint)]">Ciudad</dt><dd>{order.shippingCity}</dd></div>}
            {order.shippingZip && <div className="flex justify-between"><dt className="text-[var(--color-ink-faint)]">CP</dt><dd>{order.shippingZip}</dd></div>}
            <div className="flex justify-between"><dt className="text-[var(--color-ink-faint)]">Pago</dt><dd>{PAYMENT_METHOD_LABELS[order.paymentMethod as PaymentMethod]}</dd></div>
          </dl>
        </div>
      </div>

      {order.notes && (
        <div className="mt-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-raised)] p-5">
          <h2 className="mb-2 font-display text-base font-semibold">Notas</h2>
          <p className="text-sm text-[var(--color-ink-soft)]">{order.notes}</p>
        </div>
      )}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-raised)] p-5">
        <h2 className="mb-3 font-display text-base font-semibold">Productos</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
              <th className="py-2">Producto</th>
              <th className="py-2">Cantidad</th>
              <th className="py-2">Precio unit.</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-t border-[var(--color-line)]">
                <td className="py-2">
                  {item.productName}
                  {item.variantLabel && <div className="text-xs text-[var(--color-ink-faint)]">{item.variantLabel}</div>}
                </td>
                <td className="py-2 tabular-nums">{item.quantity}</td>
                <td className="py-2 tabular-nums">{formatPrice(item.unitPrice)}</td>
                <td className="py-2 text-right tabular-nums">{formatPrice(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex flex-col items-end gap-1 border-t border-[var(--color-line)] pt-4 text-sm">
          <div className="flex w-48 justify-between"><span className="text-[var(--color-ink-faint)]">Subtotal</span><span className="tabular-nums">{formatPrice(order.subtotal)}</span></div>
          <div className="flex w-48 justify-between"><span className="text-[var(--color-ink-faint)]">Envío</span><span className="tabular-nums">{formatPrice(order.shippingCost)}</span></div>
          <div className="flex w-48 justify-between font-semibold"><span>Total</span><span className="tabular-nums">{formatPrice(order.total)}</span></div>
        </div>
      </div>
    </div>
  );
}
