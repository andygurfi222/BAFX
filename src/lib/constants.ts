export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "En preparación",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export const DELIVERY_METHODS = ["pickup", "shipping"] as const;
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];

export const DELIVERY_METHOD_LABELS: Record<DeliveryMethod, string> = {
  pickup: "Retiro en showroom (Palermo)",
  shipping: "Envío a domicilio",
};

export const PAYMENT_METHODS = ["mercadopago", "transfer", "cash"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  mercadopago: "Tarjeta / Mercado Pago",
  transfer: "Transferencia bancaria",
  cash: "Efectivo en el showroom",
};

export const SITE_NAME = "BAFX";

export const ADMIN_SESSION_COOKIE = "bafx_admin_session";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
