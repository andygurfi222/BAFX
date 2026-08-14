"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";

const SORT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "relevance", label: "Más recientes" },
  { value: "name-asc", label: "Nombre A-Z" },
  { value: "name-desc", label: "Nombre Z-A" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
];

export function CatalogControls({ resultCount }: { resultCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-[var(--color-line)] pb-6 sm:flex-row sm:items-center sm:justify-between">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateParam("q", query);
        }}
        className="flex w-full max-w-sm items-center gap-2"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar productos…"
          className="w-full rounded-full border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-4 py-2 text-sm focus:outline-2 focus:outline-[var(--color-accent)]"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-[var(--color-ink)] px-4 py-2 text-sm font-medium text-[var(--color-paper)]"
        >
          Buscar
        </button>
      </form>

      <div className="flex items-center gap-3">
        <span className="text-sm text-[var(--color-ink-faint)]">{resultCount} productos</span>
        <select
          defaultValue={searchParams.get("sort") ?? "relevance"}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="rounded-full border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-3 py-2 text-sm"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
