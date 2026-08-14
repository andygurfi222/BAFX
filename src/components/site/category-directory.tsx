import Link from "next/link";
import type { CategoryWithChildren } from "@/lib/types";

export function CategoryDirectory({ categories }: { categories: CategoryWithChildren[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((cat) => (
        <div key={cat.id} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-raised)] p-5">
          <Link href={`/categoria/${cat.slug}`} className="font-display text-base font-bold hover:underline">
            {cat.name}
          </Link>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {cat.children.map((child) => (
              <li key={child.id}>
                <Link
                  href={`/categoria/${child.slug}`}
                  className="inline-flex rounded-full bg-[var(--color-paper-sunken)] px-3 py-1 text-xs font-medium text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]"
                >
                  {child.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
