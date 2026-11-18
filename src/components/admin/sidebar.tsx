"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { logoutAdmin } from "@/lib/actions/auth";
import { Logo } from "@/components/site/logo";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/precios", label: "Lista de precios" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/configuracion", label: "Configuración" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              active
                ? "bg-[var(--color-ink)] text-[var(--color-paper)]"
                : "text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-sunken)]"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

function AccountFooter({ adminName }: { adminName: string }) {
  const router = useRouter();
  return (
    <div className="border-t border-[var(--color-line)] px-6 pt-4">
      <p className="truncate text-xs text-[var(--color-ink-faint)]">{adminName}</p>
      <button
        onClick={async () => {
          await logoutAdmin();
          router.push("/admin/login");
          router.refresh();
        }}
        className="mt-2 text-sm font-medium text-[var(--color-accent-ink)] hover:underline"
      >
        Cerrar sesión
      </button>
      <Link href="/" className="mt-2 block text-xs text-[var(--color-ink-faint)] hover:underline">
        ← Volver al sitio
      </Link>
    </div>
  );
}

export function AdminSidebar({ adminName }: { adminName: string }) {
  return (
    <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-[var(--color-line)] bg-[var(--color-paper-raised)] py-6 lg:flex">
      <div className="px-6">
        <Link href="/admin">
          <Logo size={26} />
        </Link>
        <p className="mt-1 text-xs text-[var(--color-ink-faint)]">Admin</p>
      </div>
      <div className="mt-8 flex flex-1 flex-col">
        <NavLinks />
      </div>
      <AccountFooter adminName={adminName} />
    </aside>
  );
}

export function AdminMobileHeader({ adminName }: { adminName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[var(--color-line)] bg-[var(--color-paper-raised)] lg:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/admin">
          <Logo size={24} />
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menú"
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--color-paper-sunken)]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>
      {open && (
        <div className="flex flex-col border-t border-[var(--color-line)] py-4">
          <NavLinks onNavigate={() => setOpen(false)} />
          <AccountFooter adminName={adminName} />
        </div>
      )}
    </div>
  );
}
