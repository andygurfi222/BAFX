"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { CartButton } from "@/components/cart/cart-button";
import { Logo } from "@/components/site/logo";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/nosotros", label: "Conócenos" },
];

/**
 * Enlaces del menú: la letra se pone verde neón al pasar el mouse (clase
 * neon-hover) y se queda verde (neon-on) en la sección donde estás.
 */
const NAV_BASE = "neon-hover px-3 py-1.5 text-sm font-semibold text-[var(--color-ink-soft)]";

/** Home solo en "/", y el resto también en sus páginas internas (producto, categoría). */
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
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  function submitSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q");
    setSearchOpen(false);
    setMenuOpen(false);
    router.push(`/catalogo${q ? `?q=${encodeURIComponent(String(q))}` : ""}`);
  }

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

        <nav className="hidden flex-1 items-center justify-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
              className={`${NAV_BASE} ${isActive(pathname, link.href) ? "neon-on" : ""}`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => setSearchOpen((v) => !v)}
            className={`${NAV_BASE} ${searchOpen ? "neon-on" : ""}`}
          >
            Buscar
          </button>
        </nav>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Buscar"
            className={`neon-hover hidden h-10 w-10 items-center justify-center max-md:flex ${searchOpen ? "neon-on" : ""}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
          </button>
          <CartButton />
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-[var(--color-line)] bg-[var(--color-paper-raised)]">
          <form onSubmit={submitSearch} className="container-page flex items-center gap-3 py-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0 text-[var(--color-ink-faint)]">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              ref={searchInputRef}
              name="q"
              placeholder="Buscar cualquier producto…"
              className="flex-1 bg-transparent text-lg outline-none placeholder:text-[var(--color-ink-faint)]"
            />
            <button
              type="submit"
              className="rounded-full bg-[var(--color-neon)] px-4 py-2 text-sm font-semibold text-[#0a0a0a] shadow-[0_0_14px_rgba(182,226,58,0.30)] transition-[transform,box-shadow] hover:shadow-[0_0_26px_var(--color-neon-glow)] active:scale-[0.96]"
            >
              Buscar
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label="Cerrar buscador"
              className="neon-hover text-sm text-[var(--color-ink-faint)]"
            >
              Cancelar
            </button>
          </form>
        </div>
      )}

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
