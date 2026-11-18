import Link from "next/link";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-[var(--color-ink-faint)]">
      <Link href="/" className="neon-hover">Inicio</Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span>/</span>
          {item.href ? (
            <Link href={item.href} className="neon-hover">{item.label}</Link>
          ) : (
            <span className="text-[var(--color-ink-soft)]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
