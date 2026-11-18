"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { applyPercentChange, deleteProduct, setProductStatus, updatePrices } from "@/lib/actions/products";
import { DeleteButton } from "@/components/admin/delete-button";
import { ProductImage } from "@/components/product/product-image";
import { formatPrice } from "@/lib/format";

export type PriceRow = {
  id: string;
  name: string;
  category: string;
  price: number;
  status: string;
  imageUrl: string | null;
  hasVariants: boolean;
};

type Props = {
  rows: PriceRow[];
  total: number;
  categorySlug?: string;
  categoryLabel?: string;
};

const ROUND_OPTIONS: Array<{ value: 0 | 10 | 100 | 500; label: string }> = [
  { value: 0, label: "Sin redondear" },
  { value: 10, label: "Redondear a $10" },
  { value: 100, label: "Redondear a $100" },
  { value: 500, label: "Redondear a $500" },
];

function parsePrice(raw: string): number | null {
  const digits = raw.replace(/[^\d]/g, "");
  if (digits === "") return null;
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}

export function PriceEditor({ rows, total, categorySlug, categoryLabel }: Props) {
  const router = useRouter();
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ tone: "good" | "bad"; text: string } | null>(null);
  const [saving, startSaving] = useTransition();

  const [percent, setPercent] = useState("");
  const [roundTo, setRoundTo] = useState<0 | 10 | 100 | 500>(0);
  const [bulkBusy, setBulkBusy] = useState(false);

  const changes = useMemo(() => {
    const out: Array<{ id: string; price: number }> = [];
    for (const row of rows) {
      const raw = edits[row.id];
      if (raw === undefined) continue;
      const n = parsePrice(raw);
      if (n !== null && n !== row.price) out.push({ id: row.id, price: n });
    }
    return out;
  }, [edits, rows]);

  const invalid = rows.some((r) => edits[r.id] !== undefined && parsePrice(edits[r.id]) === null);

  function save() {
    setMessage(null);
    startSaving(async () => {
      try {
        const res = await updatePrices(changes);
        setEdits({});
        setMessage({
          tone: "good",
          text: `Listo: se actualizaron ${res.updated} precio${res.updated === 1 ? "" : "s"}.`,
        });
        router.refresh();
      } catch (err) {
        setMessage({
          tone: "bad",
          text: err instanceof Error ? err.message : "No se pudieron guardar los precios.",
        });
      }
    });
  }

  async function bulkApply() {
    const p = Number(percent.replace(",", "."));
    if (!Number.isFinite(p) || p === 0) {
      setMessage({ tone: "bad", text: "Escribí un porcentaje distinto de 0. Ejemplo: 10 para subir 10 %, -5 para bajar 5 %." });
      return;
    }
    const scope = categorySlug
      ? `los productos de "${categoryLabel ?? categorySlug}"`
      : "TODOS los productos del catálogo";
    const example = rows[0]
      ? `\n\nEjemplo: "${rows[0].name}" pasaría de ${formatPrice(rows[0].price)} a ${formatPrice(
          previewPrice(rows[0].price, p, roundTo),
        )}.`
      : "";
    const ok = window.confirm(
      `Vas a ${p > 0 ? "subir" : "bajar"} un ${Math.abs(p)} % el precio de ${scope}.${example}\n\nEsto se aplica de inmediato en la tienda. ¿Confirmás?`,
    );
    if (!ok) return;
    setBulkBusy(true);
    setMessage(null);
    try {
      const res = await applyPercentChange({ percent: p, categorySlug, roundTo });
      setPercent("");
      setEdits({});
      setMessage({ tone: "good", text: `Listo: se actualizaron los precios de ${res.updated} productos.` });
      router.refresh();
    } catch (err) {
      setMessage({ tone: "bad", text: err instanceof Error ? err.message : "No se pudo aplicar el cambio." });
    } finally {
      setBulkBusy(false);
    }
  }

  return (
    <div>
      {/* Cambio masivo por porcentaje */}
      <details className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-raised)] p-5">
        <summary className="cursor-pointer text-sm font-semibold">
          Subir o bajar todos los precios un porcentaje
        </summary>
        <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
          Útil cuando hay un aumento general. Se aplica a{" "}
          <strong>{categorySlug ? `los productos de "${categoryLabel ?? categorySlug}"` : "todos los productos"}</strong>
          {categorySlug ? " (el filtro de arriba)" : ""}, incluidos precios tachados y de variantes. Antes de
          confirmar te mostramos un ejemplo. Te recomendamos descargar la lista de precios primero, como respaldo.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-[var(--color-ink-soft)]">
            Porcentaje
            <input
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
              inputMode="decimal"
              placeholder="Ej: 10  o  -5"
              className="w-36 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper)] px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-[var(--color-ink-soft)]">
            Redondeo
            <select
              value={roundTo}
              onChange={(e) => setRoundTo(Number(e.target.value) as 0 | 10 | 100 | 500)}
              className="rounded-lg border border-[var(--color-line)] bg-[var(--color-paper)] px-3 py-2 text-sm"
            >
              {ROUND_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={bulkApply}
            disabled={bulkBusy}
            className="rounded-full bg-[var(--color-neon)] px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] shadow-[0_0_14px_rgba(182,226,58,0.30)] disabled:opacity-50"
          >
            {bulkBusy ? "Aplicando…" : "Aplicar porcentaje"}
          </button>
        </div>
      </details>

      {message && (
        <p
          role="status"
          className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${
            message.tone === "good"
              ? "bg-[var(--color-good-soft)] text-[var(--color-good)]"
              : "bg-[var(--color-bad-soft)] text-[var(--color-bad)]"
          }`}
        >
          {message.text}
        </p>
      )}

      {/* Tabla de precios */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-raised)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-line)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const raw = edits[row.id];
              const changed = raw !== undefined && parsePrice(raw) !== null && parsePrice(raw) !== row.price;
              const bad = raw !== undefined && parsePrice(raw) === null;
              const hidden = row.status !== "active";
              return (
                <tr
                  key={row.id}
                  className={`border-b border-[var(--color-line)] last:border-0 ${
                    changed ? "bg-[var(--color-warn-soft)]" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[var(--color-paper-sunken)]">
                        <ProductImage url={row.imageUrl} alt={row.name} seed={row.id} sizes="48px" />
                      </div>
                      <div className="min-w-0">
                        <Link href={`/admin/productos/${row.id}`} className="font-medium hover:underline">
                          {row.name}
                        </Link>
                        <p className="text-xs text-[var(--color-ink-faint)]">
                          {row.category}
                          {hidden && " · Oculto en la tienda"}
                          {row.hasVariants && " · Tiene variantes (editá sus precios en el producto)"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--color-ink-faint)]">$</span>
                      <input
                        value={raw ?? String(row.price)}
                        onChange={(e) => setEdits((prev) => ({ ...prev, [row.id]: e.target.value }))}
                        inputMode="numeric"
                        aria-label={`Precio de ${row.name}`}
                        aria-invalid={bad}
                        className={`w-28 rounded-lg border px-3 py-2 text-right text-base font-semibold tabular-nums ${
                          bad ? "border-[var(--color-bad)]" : "border-[var(--color-line)]"
                        } bg-[var(--color-paper)]`}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-4 whitespace-nowrap">
                      <RowStatusButton id={row.id} status={row.status} />
                      <DeleteButton
                        action={() => deleteProduct(row.id)}
                        confirmMessage={`¿Eliminar "${row.name}"? No se puede deshacer.`}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="p-8 text-center text-sm text-[var(--color-ink-faint)]">No se encontraron productos.</p>
        )}
      </div>
      <p className="mt-3 text-xs text-[var(--color-ink-faint)]">
        Mostrando {rows.length} de {total} productos. Los cambios de precio se guardan con el botón verde de abajo.
      </p>

      {/* Barra de guardado */}
      {(changes.length > 0 || invalid) && (
        <div className="sticky bottom-4 z-30 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-5 py-3 shadow-lg">
          <p className="text-sm font-medium">
            {invalid
              ? "Hay un precio vacío o inválido: usá solo números."
              : `Tenés ${changes.length} cambio${changes.length === 1 ? "" : "s"} sin guardar`}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEdits({})}
              disabled={saving}
              className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-medium"
            >
              Descartar
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving || invalid || changes.length === 0}
              className="rounded-full bg-[var(--color-neon)] px-5 py-2 text-sm font-semibold text-[#0a0a0a] shadow-[0_0_14px_rgba(182,226,58,0.30)] disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function previewPrice(price: number, percent: number, roundTo: number) {
  const raw = price * (1 + percent / 100);
  if (roundTo > 0) {
    const rounded = Math.round(raw / roundTo) * roundTo;
    return Math.max(rounded, Math.min(price, roundTo));
  }
  return Math.max(Math.round(raw), 0);
}

function RowStatusButton({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const active = status === "active";
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await setProductStatus(id, active ? "inactive" : "active");
          router.refresh();
        })
      }
      className="text-sm font-medium text-[var(--color-ink-soft)] hover:underline disabled:opacity-50"
    >
      {pending ? "…" : active ? "Ocultar" : "Mostrar"}
    </button>
  );
}
