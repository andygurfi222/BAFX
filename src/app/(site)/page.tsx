import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { CategoryTile } from "@/components/site/category-tile";
import { ProductGrid } from "@/components/product/product-grid";
import Image from "next/image";
import {
  getCategoryTree,
  getFeaturedProducts,
  getOnSaleProducts,
  getSettings,
} from "@/lib/queries";

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
          <Link href="/catalogo" className="text-sm font-medium text-[var(--color-accent-ink)] hover:underline">
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
              <Link href="/catalogo?onSale=1" className="text-sm font-medium text-[var(--color-accent-ink)] hover:underline">
                Ver todo →
              </Link>
            </div>
            <ProductGrid products={onSale} />
          </div>
        </section>
      )}

      <section className="container-page grid gap-6 py-16 sm:grid-cols-3">
        {[
          { title: "Retiro en Palermo", body: settings.pickupInfo },
          { title: "Envíos a todo el país", body: settings.shippingInfo },
          { title: "Asesoramiento a medida", body: `Escribinos por WhatsApp al ${settings.whatsapp} y te ayudamos a armar tu evento.` },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-[var(--color-line)] p-6">
            <h3 className="font-display text-lg font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{item.body}</p>
          </div>
        ))}
      </section>
    </>
  );
}
