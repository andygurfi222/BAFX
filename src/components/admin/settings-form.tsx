"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSettings } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, FieldGroup } from "@/components/ui/field";
import type { Settings } from "@prisma/client";

export function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSaved(false);
    try {
      await updateSettings(new FormData(e.currentTarget));
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos guardar los cambios.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-4">
      <FieldGroup>
        <Label htmlFor="businessName">Nombre del negocio</Label>
        <Input id="businessName" name="businessName" defaultValue={settings.businessName} required />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="aboutText">Descripción / sobre nosotros</Label>
        <Textarea id="aboutText" name="aboutText" defaultValue={settings.aboutText ?? ""} />
      </FieldGroup>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={settings.email} required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" name="phone" defaultValue={settings.phone} required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" name="whatsapp" defaultValue={settings.whatsapp} required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="hours">Horario de atención</Label>
          <Input id="hours" name="hours" defaultValue={settings.hours} required />
        </FieldGroup>
        <FieldGroup className="sm:col-span-2">
          <Label htmlFor="address">Dirección del showroom</Label>
          <Input id="address" name="address" defaultValue={settings.address} required />
        </FieldGroup>
        <FieldGroup className="sm:col-span-2">
          <Label htmlFor="city">Ciudad</Label>
          <Input id="city" name="city" defaultValue={settings.city} required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="instagram">Instagram</Label>
          <Input id="instagram" name="instagram" defaultValue={settings.instagram ?? ""} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="facebook">Facebook</Label>
          <Input id="facebook" name="facebook" defaultValue={settings.facebook ?? ""} />
        </FieldGroup>
      </div>
      <FieldGroup>
        <Label htmlFor="pickupInfo">Información de retiro</Label>
        <Textarea id="pickupInfo" name="pickupInfo" defaultValue={settings.pickupInfo ?? ""} />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="shippingInfo">Información de envío</Label>
        <Textarea id="shippingInfo" name="shippingInfo" defaultValue={settings.shippingInfo ?? ""} />
      </FieldGroup>

      {error && <p className="rounded-lg bg-[var(--color-bad-soft)] px-4 py-3 text-sm text-[var(--color-bad)]">{error}</p>}
      {saved && !error && <p className="rounded-lg bg-[var(--color-good-soft)] px-4 py-3 text-sm text-[var(--color-good)]">Cambios guardados.</p>}

      <Button type="submit" variant="accent" className="w-fit" disabled={submitting}>
        {submitting ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}
