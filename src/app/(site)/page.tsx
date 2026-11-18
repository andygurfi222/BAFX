import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { CategoryTile } from "@/components/site/category-tile";
import { ProductGrid } from "@/components/product/product-grid";
import Image from "next/image";
import type { Settings } from "@prisma/client";
import { whatsappUrl } from "@/lib/whatsapp";
import {
  getCategoryTree,
  getFeaturedProducts,
  getOnSaleProducts,
  getSettings,
} from "@/lib/queries";

function INFO_ITEMS(settings: Settings) {
  return [
    {
      title: "Retiro en Palermo",
      body: settings.pickupInfo,
      icon: (
        <>
          <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </>
      ),
      cta: null as { href: string; label: string } | null,
    },
    {
      title: "Envíos a todo el país",
      body: settings.shippingInfo,
      icon: (
        <>
          <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
          <circle cx="7" cy="18" r="1.8" />
          <circle cx="17" cy="18" r="1.8" />
        </>
      ),
      cta: null as { href: string; label: string } | null,
    },
    {
      title: "Asesoramiento a medida",
      body: `Escribinos por WhatsApp al ${settings.whatsapp} y te ayudamos a armar tu evento.`,
      icon: <path d="M4 5h16v11H9l-5 4V5Z" />,
      cta: { href: whatsappUrl(settings.whatsapp), label: "Escribinos por WhatsApp" },
    },
  ];
}

export default async function HomePage() {
  const [categories, featured, onSale, settings] = await Promise.all([
    getCategoryTree(),
    getFeaturedProducts(8),
    getOnSaleProducts(8),
    getSettings(),
  ]);

  return (
    <>
      <section className="container-page grid gap-10 pt-12 pb-16 lg:grid-cols-2 lg:items-center lg:pt-20">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent-ink)]">
            30 años vistiendo la fiesta
          </span>
          <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Todo el cotillón,
            <br />
            en un solo lugar.
          </h1>
          <p className="mt-5 max-w-md text-[var(--color-ink-soft)]">
            {settings.aboutText}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/catalogo" variant="accent" size="lg">
              Ver catálogo
            </ButtonLink>
            <ButtonLink href="/nosotros" variant="outline" size="lg">
              Conocé BAFX
            </ButtonLink>
          </div>
        </div>
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-black">
          <Image src="/logo.jpg" alt="BAFX" fill quality={90} sizes="(min-width: 1024px) 45vw, 90vw" className="object-contain" priority />
        </div>
      </section>

      <section className="container-page py-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => (
            <CategoryTile key={cat.id} name={cat.name} slug={cat.slug} count={cat.children.length} />
          ))}
        </div>
      </section>

      <section className="container-page py-14">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold">Destacados</h2>
          <Link href="/catalogo" className="neon-hover text-sm font-medium text-[var(--color-accent-ink)]">
            Ver todo →
          </Link>
        </div>
        <ProductGrid products={featured} />
      </section>

      {onSale.length > 0 && (
        <section className="bg-[var(--color-paper-sunken)] py-14">
          <div className="container-page">
            <div className="mb-6 flex items-end justify-between">
              <h2 className="font-display text-2xl font-semibold">Ofertas del mes</h2>
              <Link href="/catalogo?onSale=1" className="neon-hover text-sm font-medium text-[var(--color-accent-ink)]">
                Ver todo →
              </Link>
            </div>
            <ProductGrid products={onSale} />
          </div>
        </section>
      )}

      {/* Retiro / envíos / asesoramiento: mismas tarjetas del sitio, con detalles en verde neón */}
      <section className="container-page pt-14 pb-2">
        <div className="grid gap-6 sm:grid-cols-3">
          {INFO_ITEMS(settings).map((item) => (
            <div
              key={item.title}
              className="group flex flex-col rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-raised)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-neon)] hover:shadow-[0_0_28px_rgba(182,226,58,0.30)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-neon)] text-[#0a0a0a] shadow-[0_0_16px_rgba(182,226,58,0.40)]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {item.icon}
                </svg>
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--color-ink-soft)]">{item.body}</p>
              {item.cta && (
                <a
                  href={item.cta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex h-10 items-center justify-center self-start rounded-full bg-[var(--color-neon)] px-5 text-sm font-semibold text-[#0a0a0a] shadow-[0_0_14px_rgba(182,226,58,0.30)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_0_26px_var(--color-neon-glow)]"
                >
                  {item.cta.label}
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
