import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById, getSettings } from "@/lib/queries";
import { formatPrice, formatDate } from "@/lib/format";
import { ORDER_STATUS_LABELS, DELIVERY_METHOD_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { buildOrderMessage, whatsappUrl } from "@/lib/whatsapp";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { WhatsAppRedirect } from "@/components/checkout/whatsapp-redirect";
import type { DeliveryMethod, PaymentMethod, OrderStatus } from "@/lib/constants";

export const metadata: Metadata = { title: "Tu pedido", robots: { index: false } };

export default async function PedidoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mp?: string; wa?: string }>;
}) {
  const { id } = await params;
  const { mp, wa } = await searchParams;
  const [order, settings] = await Promise.all([getOrderById(id), getSettings()]);
  if (!order) notFound();

  const isWhatsApp = order.paymentMethod === "whatsapp";
  const isMercadoPago = order.paymentMethod === "mercadopago";
  const waUrl = whatsappUrl(settings.whatsapp, buildOrderMessage(order));

  return (
    <div className="container-page max-w-2xl py-16">
      {isWhatsApp && wa === "1" && <WhatsAppRedirect url={waUrl} orderId={order.id} />}

      <Badge tone={mp === "failure" ? "bad" : "good"}>
        {mp === "failure" ? "El pago no se pudo procesar" : isWhatsApp ? "Pedido recibido" : "Pedido confirmado"}
      </Badge>
      <h1 className="mt-4 font-display text-3xl font-bold">¡Gracias, {order.customer.firstName}!</h1>
      <p className="mt-2 text-[var(--color-ink-soft)]">
        Guardamos tu pedido <span className="font-mono">#{order.id.slice(-8).toUpperCase()}</span>.{" "}
        {isWhatsApp
          ? "Para terminar, mandanos el pedido por WhatsApp: ahí coordinamos el pago y la entrega. Si no se abrió solo, tocá el botón de abajo."
          : isMercadoPago
            ? mp === "failure"
              ? "El pago con Mercado Pago no se completó — podés reintentar el pedido cuando quieras."
              : "Estamos confirmando tu pago con Mercado Pago; en cuanto se acredite vas a ver el pedido como Confirmado."
            : `Te contactamos por WhatsApp al ${settings.whatsapp} para coordinar ${
                order.deliveryMethod === "pickup" ? "el retiro" : "el envío"
              } y el pago.`}
      </p>

      {isWhatsApp && (
        <ButtonLink
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          variant="accent"
          size="lg"
          className="mt-6 w-full sm:w-auto"
        >
          Enviar pedido por WhatsApp
        </ButtonLink>
      )}

      <div className="mt-8 rounded-2xl border border-[var(--color-line)] p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-ink-faint)]">Estado</span>
          <Badge tone="warn">{ORDER_STATUS_LABELS[order.status as OrderStatus]}</Badge>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-[var(--color-ink-faint)]">Fecha</span>
          <span>{formatDate(order.createdAt)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-[var(--color-ink-faint)]">Entrega</span>
          <span>{DELIVERY_METHOD_LABELS[order.deliveryMethod as DeliveryMethod]}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-[var(--color-ink-faint)]">Pago</span>
          <span>{PAYMENT_METHOD_LABELS[order.paymentMethod as PaymentMethod]}</span>
        </div>

        <ul className="mt-4 divide-y divide-[var(--color-line)] border-t border-[var(--color-line)]">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-3 text-sm">
              <span>
                {item.quantity}× {item.productName}
                {item.variantLabel && <span className="block text-xs text-[var(--color-ink-faint)]">{item.variantLabel}</span>}
              </span>
              <span className="tabular-nums">{formatPrice(item.totalPrice)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex justify-between border-t border-[var(--color-line)] pt-4 text-base font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{formatPrice(order.total)}</span>
        </div>
      </div>

      <ButtonLink href="/catalogo" variant="outline" className="mt-8">
        Seguir explorando el catálogo
      </ButtonLink>
      <Link href="/" className="mt-4 block text-sm text-[var(--color-ink-faint)] hover:underline">
        Volver al inicio
      </Link>
    </div>
  );
}
