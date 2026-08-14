"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({
  action,
  confirmMessage,
  redirectTo,
  label = "Eliminar",
}: {
  action: () => Promise<void>;
  confirmMessage: string;
  redirectTo?: string;
  label?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    setPending(true);
    setError(null);
    try {
      await action();
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar.");
      setPending(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={pending}
        className="text-sm font-medium text-[var(--color-bad)] hover:underline disabled:opacity-50"
      >
        {pending ? "Eliminando…" : label}
      </button>
      {error && <span className="max-w-56 text-right text-xs text-[var(--color-bad)]">{error}</span>}
    </div>
  );
}
