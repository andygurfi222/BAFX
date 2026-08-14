import Link from "next/link";

const ICONS: Record<string, React.ReactNode> = {
  "sombreros-y-tocados": (
    <path d="M5 16c0-5 3-9 7-9s7 4 7 9M3 16h18M8 16v2a4 4 0 0 0 8 0v-2" strokeLinecap="round" strokeLinejoin="round" />
  ),
  "cotillon-de-fiesta": (
    <path d="M4 9a4 4 0 1 1 8 0v1H4V9ZM12 9a4 4 0 1 1 8 0v1h-8V9ZM6 10v2a2 2 0 0 0 4 0v-2M14 10v2a2 2 0 0 0 4 0v-2" strokeLinecap="round" strokeLinejoin="round" />
  ),
  "disfraces-y-personajes": (
    <path d="M4 10c0-4 3.5-7 8-7s8 3 8 7-3 8-8 8-8-4-8-8Z M9 10h.01M15 10h.01M8 14c1 1.2 2.3 2 4 2s3-.8 4-2" strokeLinecap="round" strokeLinejoin="round" />
  ),
  "fechas-y-eventos": (
    <path d="M4 8h16M7 4v4M17 4v4M5 8h14v11H5V8ZM9 13l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
  ),
  "packs-y-mayorista": (
    <path d="M4 8l8-4 8 4-8 4-8-4Zm0 0v8l8 4m0-4v4m0-4 8-4v8l-8 4" strokeLinecap="round" strokeLinejoin="round" />
  ),
  decoracion: (
    <path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" strokeLinecap="round" strokeLinejoin="round" />
  ),
};

export function CategoryTile({
  name,
  slug,
  count,
}: {
  name: string;
  slug: string;
  count: number;
}) {
  return (
    <Link
      href={`/categoria/${slug}`}
      className="group flex flex-col justify-between rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-raised)] p-6 transition-colors hover:border-[var(--color-ink)]"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-[var(--color-accent-ink)]">
        {ICONS[slug]}
      </svg>
      <div className="mt-8">
        <h3 className="font-display text-lg font-semibold">{name}</h3>
        <span className="text-xs text-[var(--color-ink-faint)]">{count} categorías</span>
      </div>
    </Link>
  );
}
