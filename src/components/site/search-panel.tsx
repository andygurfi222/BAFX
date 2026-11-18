"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "bafx-busquedas-recientes";
const MAX_RECENTS = 8;

function readRecents(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string").slice(0, MAX_RECENTS)
      : [];
  } catch {
    return [];
  }
}

function writeRecents(list: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_RECENTS)));
  } catch {
    // sin almacenamiento (modo privado): simplemente no se guardan recientes
  }
}

function addRecent(term: string): string[] {
  const clean = term.trim();
  if (!clean) return readRecents();
  const next = [clean, ...readRecents().filter((t) => t.toLowerCase() !== clean.toLowerCase())];
  writeRecents(next);
  return next.slice(0, MAX_RECENTS);
}

export type SearchSuggestion = { name: string; slug: string };

/**
 * Panel de la página Buscar: campo grande, búsquedas recientes (se guardan solo
 * en este navegador) y atajos por categoría.
 */
export function SearchPanel({
  initialQuery,
  suggestions,
}: {
  initialQuery: string;
  suggestions: SearchSuggestion[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [recents, setRecents] = useState<string[]>([]);

  // Cargar recientes y, si llegamos con una búsqueda en la URL, guardarla.
  useEffect(() => {
    setRecents(initialQuery ? addRecent(initialQuery) : readRecents());
  }, [initialQuery]);

  useEffect(() => {
    if (!initialQuery) inputRef.current?.focus();
  }, [initialQuery]);

  function go(term: string) {
    const clean = term.trim();
    if (!clean) return;
    setRecents(addRecent(clean));
    router.push(`/buscar?q=${encodeURIComponent(clean)}`);
  }

  function removeRecent(term: string) {
    const next = recents.filter((t) => t !== term);
    writeRecents(next);
    setRecents(next);
  }

  function clearRecents() {
    writeRecents([]);
    setRecents([]);
  }

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(query);
        }}
        role="search"
        className="flex items-center gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-raised)] p-2 pl-5 focus-within:border-[var(--color-ink)]"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="shrink-0 text-[var(--color-ink-faint)]"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscá vinchas, sombreros, anteojos…"
          aria-label="Buscar productos"
          className="min-w-0 flex-1 bg-transparent py-3 text-lg outline-none placeholder:text-[var(--color-ink-faint)]"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-[var(--color-neon)] px-6 py-3 text-sm font-semibold text-[#0a0a0a] shadow-[0_0_14px_rgba(182,226,58,0.30)] transition-[transform,box-shadow] hover:shadow-[0_0_26px_var(--color-neon-glow)] active:scale-[0.96]"
        >
          Buscar
        </button>
      </form>

      {recents.length > 0 && (
        <section className="mt-10" aria-labelledby="recientes">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 id="recientes" className="font-display text-lg font-bold">
              Búsquedas recientes
            </h2>
            <button
              type="button"
              onClick={clearRecents}
              className="neon-hover text-sm text-[var(--color-ink-faint)]"
            >
              Borrar todo
            </button>
          </div>
          <ul className="flex flex-col">
            {recents.map((term) => (
              <li
                key={term}
                className="flex items-center justify-between gap-3 border-b border-[var(--color-line)]"
              >
                <Link
                  href={`/buscar?q=${encodeURIComponent(term)}`}
                  className="neon-hover flex flex-1 items-center gap-3 py-3 text-base"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="shrink-0 text-[var(--color-ink-faint)]"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {term}
                </Link>
                <button
                  type="button"
                  onClick={() => removeRecent(term)}
                  aria-label={`Quitar "${term}" de recientes`}
                  className="neon-hover px-2 py-2 text-[var(--color-ink-faint)]"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {suggestions.length > 0 && (
        <section className="mt-10" aria-labelledby="explorar">
          <h2 id="explorar" className="mb-3 font-display text-lg font-bold">
            Explorá por categoría
          </h2>
          <ul className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/categoria/${s.slug}`}
                  className="neon-hover inline-flex rounded-full bg-[var(--color-paper-sunken)] px-4 py-2 text-sm font-medium text-[var(--color-ink-soft)]"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
