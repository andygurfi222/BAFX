"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { CartButton } from "@/components/cart/cart-button";
import { Logo } from "@/components/site/logo";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/nosotros", label: "Conócenos" },
  { href: "/buscar", label: "Buscar" },
];

/**
 * Enlaces del menú de arriba:
 *  - la sección donde estás queda prendida en un círculo verde neón (NAV_ON);
 *  - los demás enlaces solo ponen la letra verde al pasar el mouse (NAV_OFF).
 */
const NAV_OFF =
  "neon-hover rounded-full px-4 py-1.5 text-sm font-semibold text-[var(--color-ink-soft)]";
const NAV_ON =
  "rounded-full bg-[var(--color-neon)] px-4 py-1.5 text-sm font-semibold text-[#0a0a0a] shadow-[0_0_20px_var(--color-neon-glow)]";

/** Home solo en "/", y Catálogo también en sus páginas internas (producto, categoría). */
function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/catalogo") {
    return ["/catalogo", "/categoria", "/producto"].some(
      (p) => pathname === p || pathname.startsWith(`${p}/`),
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const searchActive = isActive(pathname, "/buscar");

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-paper)]/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <button
          className="neon-hover flex h-10 w-10 items-center justify-center md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>

        <Link href="/" className="shrink-0">
          <Logo size={30} />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-2 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
              className={isActive(pathname, link.href) ? NAV_ON : NAV_OFF}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/buscar"
            aria-label="Buscar"
            className={`neon-hover hidden h-10 w-10 items-center justify-center max-md:flex ${searchActive ? "neon-on" : ""}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
          </Link>
          <CartButton />
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-[var(--color-line)] bg-[var(--color-paper)] md:hidden">
          <ul className="container-page flex flex-col py-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isActive(pathname, link.href) ? "page" : undefined}
                  className={`neon-hover block border-b border-[var(--color-line)] py-3 text-base font-semibold ${
                    isActive(pathname, link.href) ? "neon-on" : ""
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
