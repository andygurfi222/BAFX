"use client";

import { useState } from "react";
import { changeAdminPassword } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldGroup } from "@/components/ui/field";

/** Formulario para que el administrador cambie su propia contraseña. */
export function PasswordForm() {
  const [message, setMessage] = useState<{ tone: "good" | "bad"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setMessage(null);
    const result = await changeAdminPassword({
      current: String(data.get("current") ?? ""),
      next: String(data.get("next") ?? ""),
      repeat: String(data.get("repeat") ?? ""),
    });
    setBusy(false);
    if (result.ok) {
      form.reset();
      setMessage({ tone: "good", text: "Listo: tu contraseña se cambió. Usá la nueva la próxima vez que ingreses." });
    } else {
      setMessage({ tone: "bad", text: result.error ?? "No se pudo cambiar la contraseña." });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      <FieldGroup>
        <Label htmlFor="current">Contraseña actual</Label>
        <Input id="current" name="current" type="password" autoComplete="current-password" required />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="next">Contraseña nueva (mínimo 10 caracteres)</Label>
        <Input id="next" name="next" type="password" autoComplete="new-password" minLength={10} required />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="repeat">Repetí la contraseña nueva</Label>
        <Input id="repeat" name="repeat" type="password" autoComplete="new-password" minLength={10} required />
      </FieldGroup>
      {message && (
        <p
          role="status"
          className={`rounded-lg px-3 py-2 text-sm ${
            message.tone === "good"
              ? "bg-[var(--color-good-soft)] text-[var(--color-good)]"
              : "bg-[var(--color-bad-soft)] text-[var(--color-bad)]"
          }`}
        >
          {message.text}
        </p>
      )}
      <div>
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? "Guardando…" : "Cambiar contraseña"}
        </Button>
      </div>
    </form>
  );
}
