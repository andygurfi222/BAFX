"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session";
import { settingsSchema } from "@/lib/validations";

export async function updateSettings(formData: FormData) {
  await requireAdminSession();
  const data = settingsSchema.parse({
    businessName: formData.get("businessName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp"),
    address: formData.get("address"),
    city: formData.get("city"),
    hours: formData.get("hours"),
    instagram: formData.get("instagram") || undefined,
    facebook: formData.get("facebook") || undefined,
    shippingInfo: formData.get("shippingInfo") || undefined,
    pickupInfo: formData.get("pickupInfo") || undefined,
    aboutText: formData.get("aboutText") || undefined,
  });

  await prisma.settings.upsert({
    where: { id: 1 },
    create: { id: 1, ...data },
    update: data,
  });

  revalidatePath("/admin/configuracion");
  revalidatePath("/", "layout");
}
