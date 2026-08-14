"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldGroup } from "@/components/ui/field";
import { Logo } from "@/components/site/logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      await loginAdmin({
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      });
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos iniciar sesión.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-paper-sunken)] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-raised)] p-8 shadow-sm">
        <Logo size={32} />
        <p className="mt-3 text-sm text-[var(--color-ink-soft)]">Panel de administración</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <FieldGroup>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoFocus />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" required />
          </FieldGroup>
          {error && (
            <p className="rounded-lg bg-[var(--color-bad-soft)] px-3 py-2 text-sm text-[var(--color-bad)]">{error}</p>
          )}
          <Button type="submit" variant="primary" className="mt-2" disabled={submitting}>
            {submitting ? "Ingresando…" : "Ingresar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
