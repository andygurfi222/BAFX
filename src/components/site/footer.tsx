import Link from "next/link";
import type { Settings } from "@prisma/client";
import { Logo } from "@/components/site/logo";

export function Footer({ settings }: { settings: Settings }) {
  return (
    <footer className="mt-24 border-t border-[var(--color-line)] bg-[var(--color-paper-sunken)]">
      <div className="container-page grid gap-10 py-14 lg:grid-cols-4">
        <div>
          <Logo size={30} />
          <p className="mt-3 max-w-xs text-sm text-[var(--color-ink-soft)]">
            {settings.aboutText}
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-faint)]">
            Tienda
          </h3>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link href="/catalogo" className="hover:text-[var(--color-ink)]">Catálogo completo</Link></li>
            <li><Link href="/catalogo?onSale=1" className="hover:text-[var(--color-ink)]">Ofertas</Link></li>
            <li><Link href="/nosotros" className="hover:text-[var(--color-ink)]">Conócenos</Link></li>
            <li><Link href="/contacto" className="hover:text-[var(--color-ink)]">Contacto</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-faint)]">
            Showroom
          </h3>
          <ul className="flex flex-col gap-2 text-sm text-[var(--color-ink-soft)]">
            <li>{settings.address}</li>
            <li>{settings.city}</li>
            <li>{settings.hours}</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-faint)]">
            Contacto
          </h3>
          <ul className="flex flex-col gap-2 text-sm text-[var(--color-ink-soft)]">
            <li>
              <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`} className="hover:text-[var(--color-accent-ink)]">
                WhatsApp: {settings.whatsapp}
              </a>
            </li>
            <li>
              <a href={`mailto:${settings.email}`} className="hover:text-[var(--color-accent-ink)]">{settings.email}</a>
            </li>
            {settings.instagram && (
              <li>
                <a href={`https://instagram.com/${settings.instagram.replace("@", "")}`} className="hover:text-[var(--color-accent-ink)]">
                  {settings.instagram}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--color-line)] py-5">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--color-ink-faint)]">
          <p>© {new Date().getFullYear()} {settings.businessName}. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link href="/terminos" className="hover:text-[var(--color-ink)]">Términos y Condiciones</Link>
            <Link href="/privacidad" className="hover:text-[var(--color-ink)]">Privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
