import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/settings-form";
import { PasswordForm } from "@/components/admin/password-form";
import { getSettings } from "@/lib/queries";

export const metadata: Metadata = { title: "Configuración" };

export default async function AdminConfiguracionPage() {
  const settings = await getSettings();
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold">Configuración del negocio</h1>
      <SettingsForm settings={settings} />

      <section className="mt-12 border-t border-[var(--color-line)] pt-8">
        <h2 className="font-display text-xl font-bold">Seguridad: cambiar mi contraseña</h2>
        <p className="mt-1 mb-5 text-sm text-[var(--color-ink-soft)]">
          Elegí una contraseña propia y difícil de adivinar. Solo la sabés vos.
        </p>
        <PasswordForm />
      </section>
    </div>
  );
}
