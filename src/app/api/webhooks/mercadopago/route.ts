import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { WebhookSignatureValidator, InvalidWebhookSignatureError } from "mercadopago";
import { getPaymentClient } from "@/lib/mercadopago";
import { prisma } from "@/lib/prisma";

// Mapeo del estado de pago de Mercado Pago al estado interno del pedido.
const MP_STATUS_TO_ORDER_STATUS: Record<string, string> = {
  approved: "confirmed",
  pending: "pending",
  in_process: "pending",
  authorized: "pending",
  rejected: "cancelled",
  cancelled: "cancelled",
  refunded: "cancelled",
  charged_back: "cancelled",
};

/**
 * Webhook de Mercado Pago. Se registra como `notification_url` al crear la
 * preferencia (ver src/lib/actions/orders.ts). MP llama a esta URL cada vez
 * que cambia el estado de un pago — acá lo confirmamos contra su API (nunca
 * confiamos en el estado que venga en la URL/body sin verificar) y
 * actualizamos el pedido real.
 */
export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? url.searchParams.get("topic");
  const dataId = url.searchParams.get("data.id") ?? url.searchParams.get("id");

  if (type !== "payment" || !dataId) {
    // Otros tipos de notificación (merchant_order, etc.) — los ignoramos.
    return NextResponse.json({ received: true });
  }

  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (secret) {
    try {
      WebhookSignatureValidator.validate({
        xSignature: request.headers.get("x-signature"),
        xRequestId: request.headers.get("x-request-id"),
        dataId,
        secret,
        toleranceSeconds: 300,
      });
    } catch (err) {
      const reason = err instanceof InvalidWebhookSignatureError ? err.reason : "unknown";
      console.error("Webhook de Mercado Pago rechazado:", reason);
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }
  } else {
    console.warn(
      "MERCADOPAGO_WEBHOOK_SECRET no configurado — la notificación no se pudo verificar criptográficamente."
    );
  }

  try {
    const payment = await getPaymentClient().get({ id: dataId });
    const orderId = payment.external_reference;
    const mpStatus = payment.status;
    if (!orderId || !mpStatus) {
      return NextResponse.json({ received: true });
    }

    const nextStatus = MP_STATUS_TO_ORDER_STATUS[mpStatus];
    if (!nextStatus) {
      return NextResponse.json({ received: true });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      console.error(`Webhook de Mercado Pago: pedido ${orderId} no encontrado`);
      return NextResponse.json({ received: true });
    }

    // No pisar un pedido que ya avanzó manualmente más allá de "confirmado"
    // (en preparación, enviado, entregado) con un reintento tardío del webhook.
    const alreadyAdvanced = ["preparing", "shipped", "delivered"].includes(order.status);
    if (!alreadyAdvanced) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: nextStatus, paymentProviderRef: String(payment.id) },
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Error procesando webhook de Mercado Pago:", err);
    // 200 igual: si devolvemos error, MP reintenta indefinidamente por un pago
    // que puede no tener nada que ver con un bug nuestro (id inválido, etc.)
    return NextResponse.json({ received: true });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
