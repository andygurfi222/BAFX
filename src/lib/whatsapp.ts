import { formatPrice } from "@/lib/format";
import { DELIVERY_METHOD_LABELS, type DeliveryMethod } from "@/lib/constants";

/**
 * Normaliza un celular argentino al formato que pide wa.me: 54 + 9 + área +
 * número (ej. "+54 11 4490-5950" -> "5491144905950"). Sin el 9, WhatsApp no
 * siempre encuentra el chat de un celular argentino.
 */
export function whatsappNumber(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (!digits.startsWith("54")) digits = `54${digits}`;
  if (!digits.startsWith("549")) digits = `549${digits.slice(2)}`;
  return digits;
}

export function whatsappUrl(rawNumber: string, text?: string): string {
  const base = `https://wa.me/${whatsappNumber(rawNumber)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

type MessageOrder = {
  id: string;
  total: number;
  deliveryMethod: string;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingZip: string | null;
  notes: string | null;
  customer: { firstName: string; lastName: string; phone: string };
  items: Array<{
    productName: string;
    variantLabel: string | null;
    quantity: number;
    totalPrice: number;
  }>;
};

/** Texto del pedido que se le manda a BAFX por WhatsApp. */
export function buildOrderMessage(order: MessageOrder): string {
  const lines = order.items.map((item) => {
    const name = item.variantLabel ? `${item.productName} (${item.variantLabel})` : item.productName;
    return `• ${item.quantity} x ${name} — ${formatPrice(item.totalPrice)}`;
  });

  const delivery = DELIVERY_METHOD_LABELS[order.deliveryMethod as DeliveryMethod] ?? order.deliveryMethod;
  const address = [order.shippingAddress, order.shippingCity, order.shippingZip && `CP ${order.shippingZip}`]
    .filter(Boolean)
    .join(", ");

  return [
    `¡Hola BAFX! Quiero hacer este pedido (#${order.id.slice(-8).toUpperCase()}):`,
    "",
    ...lines,
    "",
    `Total: ${formatPrice(order.total)}`,
    "",
    `Nombre: ${order.customer.firstName} ${order.customer.lastName}`,
    `Teléfono: ${order.customer.phone}`,
    `Entrega: ${delivery}${address ? ` — ${address}` : ""}`,
    ...(order.notes ? [`Notas: ${order.notes}`] : []),
  ].join("\n");
}
