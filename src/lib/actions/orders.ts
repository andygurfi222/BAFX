"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations";
import { requireAdminSession } from "@/lib/session";
import { ORDER_STATUSES, SITE_URL, type OrderStatus } from "@/lib/constants";
import { getPreferenceClient } from "@/lib/mercadopago";

export async function createOrder(input: CheckoutInput) {
  const data = checkoutSchema.parse(input);

  const result = await prisma.$transaction(async (tx) => {
    let subtotal = 0;
    const itemsData: Array<{
      productId: string;
      variantId?: string;
      productName: string;
      variantLabel?: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }> = [];

    for (const line of data.items) {
      const product = await tx.product.findUnique({
        where: { id: line.productId },
        include: { variants: true },
      });
      if (!product || product.status !== "active") {
        throw new Error(`Producto no disponible: ${line.productId}`);
      }

      const variant = line.variantId
        ? product.variants.find((v) => v.id === line.variantId)
        : undefined;

      const availableStock = variant ? variant.stock : product.stock;
      if (availableStock < line.quantity) {
        throw new Error(`Sin stock suficiente para "${product.name}"`);
      }

      const unitPrice = variant?.price ?? product.price;
      const totalPrice = unitPrice * line.quantity;
      subtotal += totalPrice;

      itemsData.push({
        productId: product.id,
        variantId: variant?.id,
        productName: product.name,
        variantLabel: variant ? `${variant.attribute}: ${variant.value}` : undefined,
        quantity: line.quantity,
        unitPrice,
        totalPrice,
      });

      // Los pedidos por WhatsApp son una solicitud que BAFX confirma a mano:
      // el stock no se descuenta solo (se ajusta desde el admin al cerrar la venta).
      if (data.paymentMethod === "whatsapp") continue;

      if (variant) {
        await tx.productVariant.update({
          where: { id: variant.id },
          data: { stock: { decrement: line.quantity } },
        });
      } else {
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: line.quantity } },
        });
      }
    }

    const shippingCost = 0; // se coordina manualmente según destino (ver Settings.shippingInfo)
    const discount = 0;
    const total = subtotal - discount + shippingCost;

    // El email es opcional: sin email, se reconoce al cliente por teléfono.
    const email = data.email ?? "";
    let customer = await tx.customer.findFirst({
      where: email ? { email } : { email: "", phone: data.phone },
    });
    if (!customer) {
      customer = await tx.customer.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email,
          phone: data.phone,
          dni: data.dni || undefined,
        },
      });
    }

    const order = await tx.order.create({
      data: {
        customerId: customer.id,
        subtotal,
        discount,
        shippingCost,
        total,
        deliveryMethod: data.deliveryMethod,
        paymentMethod: data.paymentMethod,
        shippingAddress: data.shippingAddress || undefined,
        shippingCity: data.shippingCity || undefined,
        shippingZip: data.shippingZip || undefined,
        notes: data.notes || undefined,
        items: { create: itemsData },
      },
    });

    return order.id;
  });

  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  return { orderId: result };
}

export async function createMercadoPagoPreference(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, customer: true },
  });
  if (!order) throw new Error("Pedido no encontrado");

  const preference = getPreferenceClient();

  const items = order.items.map((item) => ({
    id: item.productId,
    title: item.variantLabel ? `${item.productName} (${item.variantLabel})` : item.productName,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    currency_id: "ARS",
  }));

  if (order.shippingCost > 0) {
    items.push({
      id: "envio",
      title: "Envío",
      quantity: 1,
      unit_price: order.shippingCost,
      currency_id: "ARS",
    });
  }

  const response = await preference.create({
    body: {
      items,
      external_reference: order.id,
      payer: {
        name: order.customer.firstName,
        surname: order.customer.lastName,
        email: order.customer.email,
        phone: { number: order.customer.phone },
      },
      back_urls: {
        success: `${SITE_URL}/pedido/${order.id}?mp=success`,
        pending: `${SITE_URL}/pedido/${order.id}?mp=pending`,
        failure: `${SITE_URL}/pedido/${order.id}?mp=failure`,
      },
      auto_return: "approved",
      notification_url: `${SITE_URL}/api/webhooks/mercadopago`,
      statement_descriptor: "BAFX",
    },
  });

  if (!response.id || !response.init_point) {
    throw new Error("Mercado Pago no devolvió un link de pago válido");
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentProviderRef: response.id },
  });

  return { initPoint: response.init_point };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await requireAdminSession();
  if (!ORDER_STATUSES.includes(status)) throw new Error("Estado inválido");
  await prisma.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
}
