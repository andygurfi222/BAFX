import type { Metadata } from "next";
import { getSettings } from "@/lib/queries";
import { ShowroomMap } from "@/components/site/showroom-map";
import { ButtonLink } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/whatsapp";

const HOW_TO_BUY = [
  "Elegí tus productos y sumalos al carrito.",
  "Completá tus datos y enviá el pedido por WhatsApp.",
  "Coordinamos con vos el pago y la entrega.",
  "Retirás en Palermo o te lo enviamos al país una vez acreditado el pago.",
];

export const metadata: Metadata = {
  title: "Quiénes somos",
  description: "30 años de trayectoria vistiendo la fiesta de todo el país.",
};

export default async function NosotrosPage() {
  const settings = await getSettings();

  return (
    <div className="container-page max-w-2xl py-16">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent-ink)]">
        Quiénes somos
      </span>
      <h1 className="mt-3 font-display text-4xl font-bold">{settings.businessName}</h1>
      <p className="mt-6 text-lg leading-relaxed text-[var(--color-ink-soft)]">
        {settings.aboutText}
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-line)] p-6">
          <h2 className="font-display text-lg font-semibold">Showroom</h2>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{settings.address}</p>
          <p className="text-sm text-[var(--color-ink-soft)]">{settings.city}</p>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{settings.hours}</p>
          <ShowroomMap address={settings.address} city={settings.city} />
        </div>
        <div className="rounded-2xl border border-[var(--color-line)] p-6">
          <h2 className="font-display text-lg font-semibold">Retiro y envíos</h2>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{settings.pickupInfo}</p>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{settings.shippingInfo}</p>

          <h3 className="mt-6 font-display text-base font-semibold">Cómo comprar</h3>
          <ol className="mt-3 flex flex-col gap-3">
            {HOW_TO_BUY.map((step, i) => (
              <li key={step} className="flex gap-3 text-sm text-[var(--color-ink-soft)]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-ink)] text-xs font-bold text-[var(--color-paper)]">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex flex-col gap-2">
            <ButtonLink
              href={whatsappUrl(settings.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              variant="accent"
              size="sm"
            >
              WhatsApp {settings.whatsapp}
            </ButtonLink>
            {settings.whatsapp2 && (
              <ButtonLink
                href={whatsappUrl(settings.whatsapp2)}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                size="sm"
              >
                WhatsApp {settings.whatsapp2}
              </ButtonLink>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
