"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createAdminSession, destroyAdminSession } from "@/lib/session";
import { loginSchema } from "@/lib/validations";

export async function loginAdmin(input: { email: string; password: string }) {
  const data = loginSchema.parse(input);

  const admin = await prisma.adminUser.findUnique({ where: { email: data.email } });
  if (!admin) {
    throw new Error("Email o contraseña incorrectos");
  }

  const valid = await bcrypt.compare(data.password, admin.passwordHash);
  if (!valid) {
    throw new Error("Email o contraseña incorrectos");
  }

  await createAdminSession({ adminId: admin.id, email: admin.email, name: admin.name });
}

export async function logoutAdmin() {
  await destroyAdminSession();
}
