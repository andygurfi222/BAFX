import "server-only";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

function getConfig(): MercadoPagoConfig {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken || accessToken.startsWith("TEST-CAMBIAR") || accessToken.length < 10) {
    throw new Error(
      "Mercado Pago no está configurado todavía. Cargá MERCADOPAGO_ACCESS_TOKEN en .env con tus credenciales reales."
    );
  }
  return new MercadoPagoConfig({ accessToken });
}

export function getPreferenceClient(): Preference {
  return new Preference(getConfig());
}

export function getPaymentClient(): Payment {
  return new Payment(getConfig());
}

export function isMercadoPagoConfigured(): boolean {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  return !!accessToken && !accessToken.startsWith("TEST-CAMBIAR") && accessToken.length >= 10;
}
