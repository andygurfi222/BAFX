import type { Metadata } from "next";
import { getSettings } from "@/lib/queries";

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
        </div>
        <div className="rounded-2xl border border-[var(--color-line)] p-6">
          <h2 className="font-display text-lg font-semibold">Retiro y envíos</h2>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{settings.pickupInfo}</p>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{settings.shippingInfo}</p>
        </div>
      </div>
    </div>
  );
}
