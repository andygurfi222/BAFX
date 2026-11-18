"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteOrders } from "@/lib/actions/orders";
import { Badge } from "@/components/ui/badge";

export type OrderRow = {
  id: string;
  shortId: string;
  customerName: string;
  email: string;
  date: string;
  total: string;
  statusLabel: string;
};

/**
 * Tabla de pedidos con modo "Seleccionar": se tildan los pedidos que se
 * quieren y se eliminan todos juntos (con confirmación).
 */
export function OrdersTable({ rows }: { rows: OrderRow[] }) {
  const router = useRouter();
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<{ tone: "good" | "bad"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const allSelected = rows.length > 0 && selected.size === rows.length;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
  }

  function stopSelecting() {
    setSelecting(false);
    setSelected(new Set());
  }

  function removeSelected() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    const ok = window.confirm(
      `¿Eliminar ${ids.length} pedido${ids.length === 1 ? "" : "s"}?\n\nSe borran para siempre y no se puede deshacer.`,
    );
    if (!ok) return;
    setMessage(null);
    startTransition(async () => {
      const res = await deleteOrders(ids);
      if (res.error) {
        setMessage({ tone: "bad", text: res.error });
        return;
      }
      setMessage({
        tone: "good",
        text: `Listo: se ${res.deleted === 1 ? "eliminó 1 pedido" : `eliminaron ${res.deleted} pedidos`}.`,
      });
      stopSelecting();
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-[var(--color-ink-faint)]">
          {selecting
            ? "Tocá los pedidos que querés eliminar. Después usá el botón rojo de abajo."
            : "Para borrar pedidos, tocá “Seleccionar”."}
        </p>
        {rows.length > 0 &&
          (selecting ? (
            <button
              type="button"
              onClick={stopSelecting}
              className="shrink-0 rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-medium"
            >
              Cancelar
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSelecting(true)}
              className="shrink-0 rounded-full border-[1.5px] border-[var(--color-ink)] px-4 py-2 text-sm font-semibold"
            >
              Seleccionar
            </button>
          ))}
      </div>

      {message && (
        <p
          role="status"
          className={`mb-3 rounded-xl px-4 py-3 text-sm font-medium ${
            message.tone === "good"
              ? "bg-[var(--color-good-soft)] text-[var(--color-good)]"
              : "bg-[var(--color-bad-soft)] text-[var(--color-bad)]"
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-raised)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-line)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
              {selecting && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Seleccionar todos los pedidos de esta página"
                    className="h-5 w-5 cursor-pointer accent-[var(--color-ink)]"
                  />
                </th>
              )}
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const checked = selected.has(row.id);
              return (
                <tr
                  key={row.id}
                  onClick={selecting ? () => toggle(row.id) : undefined}
                  className={`border-b border-[var(--color-line)] last:border-0 hover:bg-[var(--color-paper-sunken)] ${
                    selecting ? "cursor-pointer" : ""
                  } ${checked ? "bg-[var(--color-bad-soft)]" : ""}`}
                >
                  {selecting && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(row.id)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Seleccionar el pedido de ${row.customerName}`}
                        className="h-5 w-5 cursor-pointer accent-[var(--color-ink)]"
                      />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    {selecting ? (
                      <span className="font-mono text-xs">#{row.shortId}</span>
                    ) : (
                      <Link href={`/admin/pedidos/${row.id}`} className="font-mono text-xs hover:underline">
                        #{row.shortId}
                      </Link>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {row.customerName}
                    <div className="text-xs text-[var(--color-ink-faint)]">{row.email}</div>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-ink-soft)]">{row.date}</td>
                  <td className="px-4 py-3 tabular-nums">{row.total}</td>
                  <td className="px-4 py-3">
                    <Badge tone="warn">{row.statusLabel}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="p-8 text-center text-sm text-[var(--color-ink-faint)]">No hay pedidos con estos filtros.</p>
        )}
      </div>

      {selecting && (
        <div className="sticky bottom-4 z-30 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-5 py-3 shadow-lg">
          <p className="text-sm font-medium">
            {selected.size === 0
              ? "No elegiste ningún pedido"
              : `${selected.size} pedido${selected.size === 1 ? "" : "s"} seleccionado${selected.size === 1 ? "" : "s"}`}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={toggleAll}
              className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-medium"
            >
              {allSelected ? "Quitar todos" : "Seleccionar todos"}
            </button>
            <button
              type="button"
              onClick={removeSelected}
              disabled={pending || selected.size === 0}
              className="rounded-full bg-[var(--color-bad)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {pending ? "Eliminando…" : "Eliminar seleccionados"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
