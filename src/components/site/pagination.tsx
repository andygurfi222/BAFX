import Link from "next/link";

export function Pagination({
  page,
  pageCount,
  basePath,
  searchParams,
}: {
  page: number;
  pageCount: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  if (pageCount <= 1) return null;

  function hrefFor(p: number) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v && k !== "page") params.set(k, v);
    }
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <nav className="mt-12 flex items-center justify-center gap-1" aria-label="Paginación">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm ${page === 1 ? "pointer-events-none text-[var(--color-ink-faint)]" : "hover:bg-[var(--color-paper-sunken)]"}`}
      >
        ‹
      </Link>
      {pages.map((p) => (
        <Link
          key={p}
          href={hrefFor(p)}
          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm tabular-nums ${
            p === page ? "bg-[var(--color-ink)] text-[var(--color-paper)]" : "hover:bg-[var(--color-paper-sunken)]"
          }`}
        >
          {p}
        </Link>
      ))}
      <Link
        href={hrefFor(Math.min(pageCount, page + 1))}
        aria-disabled={page === pageCount}
        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm ${page === pageCount ? "pointer-events-none text-[var(--color-ink-faint)]" : "hover:bg-[var(--color-paper-sunken)]"}`}
      >
        ›
      </Link>
    </nav>
  );
}
