import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/settings-form";
import { getSettings } from "@/lib/queries";

export const metadata: Metadata = { title: "Configuración" };

export default async function AdminConfiguracionPage() {
  const settings = await getSettings();
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold">Configuración del negocio</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
