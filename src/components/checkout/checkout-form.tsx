"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, cartTotals } from "@/lib/cart-store";
import { useHasMounted } from "@/lib/use-has-mounted";
import { formatPrice } from "@/lib/format";
import { createOrder } from "@/lib/actions/orders";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, FieldGroup } from "@/components/ui/field";
import { DELIVERY_METHOD_LABELS, type DeliveryMethod } from "@/lib/constants";
import type { Settings } from "@prisma/client";

export function CheckoutForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);
  const mounted = useHasMounted();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("pickup");

  const { subtotal } = cartTotals(lines);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      const { orderId } = await createOrder({
        firstName: String(form.get("firstName") ?? ""),
        lastName: String(form.get("lastName") ?? ""),
        email: String(form.get("email") ?? ""),
        phone: String(form.get("phone") ?? ""),
        dni: "",
        deliveryMethod,
        paymentMethod: "whatsapp",
        shippingAddress: String(form.get("shippingAddress") ?? ""),
        shippingCity: String(form.get("shippingCity") ?? ""),
        shippingZip: String(form.get("shippingZip") ?? ""),
        notes: String(form.get("notes") ?? ""),
        items: lines.map((l) => ({
          productId: l.productId,
          variantId: l.variantId,
          quantity: l.quantity,
        })),
      });

      clear();
      // wa=1: la página del pedido abre WhatsApp con el mensaje ya armado
      router.push(`/pedido/${orderId}?wa=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos generar el pedido. Probá de nuevo.");
      setSubmitting(false);
    }
  }

  if (!mounted) return null;

  if (lines.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--color-line)] p-10 text-center">
        <p className="text-[var(--color-ink-soft)]">Tu carrito está vacío.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div>
          <h2 className="mb-4 font-display text-lg font-semibold">Tus datos</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldGroup>
              <Label htmlFor="firstName">Nombre</Label>
              <Input id="firstName" name="firstName" required />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="lastName">Apellido</Label>
              <Input id="lastName" name="lastName" required />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="phone">Teléfono / WhatsApp</Label>
              <Input id="phone" name="phone" type="tel" required />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="email">Email (opcional)</Label>
              <Input id="email" name="email" type="email" />
            </FieldGroup>
          </div>
        </div>

        <div>
          <h2 className="mb-4 font-display text-lg font-semibold">Entrega</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {(Object.entries(DELIVERY_METHOD_LABELS) as [DeliveryMethod, string][]).map(([value, label]) => (
              <label
                key={value}
                className={`cursor-pointer rounded-xl border p-4 text-sm ${
                  deliveryMethod === value ? "border-[var(--color-ink)]" : "border-[var(--color-line)]"
                }`}
              >
                <input
                  type="radio"
                  name="deliveryMethodRadio"
                  value={value}
                  checked={deliveryMethod === value}
                  onChange={() => setDeliveryMethod(value)}
                  className="mr-2"
                />
                {label}
              </label>
            ))}
          </div>
          {deliveryMethod === "shipping" && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FieldGroup className="sm:col-span-2">
                <Label htmlFor="shippingAddress">Dirección</Label>
                <Input id="shippingAddress" name="shippingAddress" required />
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="shippingCity">Ciudad</Label>
                <Input id="shippingCity" name="shippingCity" required />
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="shippingZip">Código postal</Label>
                <Input id="shippingZip" name="shippingZip" required />
              </FieldGroup>
              <p className="text-xs text-[var(--color-ink-soft)] sm:col-span-2">{settings.shippingInfo}</p>
            </div>
          )}
          {deliveryMethod === "pickup" && (
            <p className="mt-3 text-xs text-[var(--color-ink-soft)]">{settings.pickupInfo}</p>
          )}
        </div>

        <FieldGroup>
          <Label htmlFor="notes">Notas (opcional)</Label>
          <Textarea id="notes" name="notes" placeholder="Referencias de entrega, horarios, aclaraciones…" />
        </FieldGroup>

        {error && (
          <p className="rounded-lg bg-[var(--color-bad-soft)] px-4 py-3 text-sm text-[var(--color-bad)]">{error}</p>
        )}

        <div>
          <Button type="submit" variant="accent" size="lg" className="w-full sm:w-auto" disabled={submitting}>
            {submitting ? "Generando pedido…" : "Enviar pedido por WhatsApp"}
          </Button>
          <p className="mt-3 text-xs text-[var(--color-ink-soft)]">
            Se abre WhatsApp con tu pedido ya escrito para que lo mandes a BAFX. Ahí coordinan el pago y la
            entrega — no hace falta pagar en la web.
          </p>
        </div>
      </form>

      <aside className="h-fit rounded-2xl border border-[var(--color-line)] p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Resumen</h2>
        <ul className="flex flex-col gap-3">
          {lines.map((l) => (
            <li key={`${l.productId}::${l.variantId ?? ""}`} className="flex justify-between text-sm">
              <span className="text-[var(--color-ink-soft)]">
                {l.quantity}× {l.name}
                {l.variantLabel && <span className="block text-xs">{l.variantLabel}</span>}
              </span>
              <span className="tabular-nums">{formatPrice(l.price * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-[var(--color-line)] pt-4 text-base font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{formatPrice(subtotal)}</span>
        </div>
        <p className="mt-2 text-xs text-[var(--color-ink-faint)]">El envío se coordina por WhatsApp.</p>
      </aside>
    </div>
  );
}
