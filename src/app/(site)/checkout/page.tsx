import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getSettings } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const settings = await getSettings();
  return (
    <div className="container-page py-12">
      <h1 className="mb-8 font-display text-3xl font-bold">Finalizar compra</h1>
      <CheckoutForm settings={settings} />
    </div>
  );
}
