import type { Metadata } from "next";
import { getSettings } from "@/lib/queries";
import { whatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Showroom, teléfonos, WhatsApp y redes de BAFX.",
};

export default async function ContactoPage() {
  const settings = await getSettings();

  const items = [
    { label: "Showroom", value: `${settings.address} — ${settings.city}` },
    { label: "Horario", value: settings.hours },
    { label: "Teléfono", value: settings.phone },
    { label: "WhatsApp", value: settings.whatsapp, href: whatsappUrl(settings.whatsapp) },
    ...(settings.whatsapp2
      ? [{ label: "WhatsApp", value: settings.whatsapp2, href: whatsappUrl(settings.whatsapp2) }]
      : []),
    { label: "Email", value: settings.email, href: `mailto:${settings.email}` },
    ...(settings.instagram ? [{ label: "Instagram", value: settings.instagram, href: `https://instagram.com/${settings.instagram.replace("@", "")}` }] : []),
    ...(settings.facebook ? [{ label: "Facebook", value: settings.facebook }] : []),
  ];

  return (
    <div className="container-page max-w-2xl py-16">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent-ink)]">
        Contáctenos
      </span>
      <h1 className="mt-3 font-display text-4xl font-bold">Hablemos de tu evento</h1>
      <p className="mt-4 text-[var(--color-ink-soft)]">
        Escribinos por WhatsApp para consultar stock, precios por mayor o coordinar tu pedido.
      </p>
      <dl className="mt-10 divide-y divide-[var(--color-line)] rounded-2xl border border-[var(--color-line)]">
        {items.map((item) => (
          <div key={`${item.label}-${item.value}`} className="flex items-center justify-between gap-4 px-6 py-4">
            <dt className="text-sm text-[var(--color-ink-faint)]">{item.label}</dt>
            <dd className="text-sm font-medium">
              {item.href ? (
                <a href={item.href} className="neon-hover text-[var(--color-accent-ink)]">
                  {item.value}
                </a>
              ) : (
                item.value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
