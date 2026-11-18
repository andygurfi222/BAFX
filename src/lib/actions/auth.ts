"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createAdminSession, destroyAdminSession, requireAdminSession } from "@/lib/session";
import { loginSchema } from "@/lib/validations";

type Result = { ok: boolean; error?: string };

/*
 * Freno contra adivinar contraseñas: tras 5 intentos fallidos desde la misma
 * conexión y para el mismo email, se bloquea 15 minutos. Vive en la memoria
 * del servidor (best-effort en hosting serverless): frena los intentos
 * automáticos sin necesitar tablas extra.
 */
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;
const fails = new Map<string, { count: number; until: number }>();

async function clientKey(label: string) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  return `${ip}|${label.toLowerCase()}`;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function registerFail(key: string) {
  const entry = fails.get(key);
  const count = (entry && entry.until > Date.now() ? entry.count : 0) + 1;
  fails.set(key, { count, until: Date.now() + LOCK_MS });
}

function isLocked(key: string) {
  const entry = fails.get(key);
  return entry && entry.until > Date.now() && entry.count >= MAX_FAILS ? entry : null;
}

export async function loginAdmin(input: { email: string; password: string }): Promise<Result> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisá los datos." };
  const data = parsed.data;

  const key = await clientKey(data.email);
  const lock = isLocked(key);
  if (lock) {
    const minutes = Math.ceil((lock.until - Date.now()) / 60000);
    return { ok: false, error: `Demasiados intentos. Probá de nuevo en ${minutes} minuto${minutes === 1 ? "" : "s"}.` };
  }

  const admin = await prisma.adminUser.findUnique({ where: { email: data.email } });
  // se compara siempre contra un hash, para que el tiempo de respuesta no delate si el email existe
  const hash = admin?.passwordHash ?? "$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ01234";
  const valid = await bcrypt.compare(data.password, hash);

  if (!admin || !valid) {
    registerFail(key);
    await sleep(700);
    return { ok: false, error: "Email o contraseña incorrectos" };
  }

  fails.delete(key);
  try {
    await createAdminSession({ adminId: admin.id, email: admin.email, name: admin.name });
  } catch (e) {
    console.error(e);
    return {
      ok: false,
      error: "El panel no está configurado correctamente (falta la clave de sesión en el hosting).",
    };
  }
  return { ok: true };
}

export async function logoutAdmin() {
  await destroyAdminSession();
}

/** Cambia la contraseña del administrador que tiene la sesión abierta. */
export async function changeAdminPassword(input: {
  current: string;
  next: string;
  repeat: string;
}): Promise<Result> {
  const session = await requireAdminSession();

  if (input.next.length < 10) return { ok: false, error: "La contraseña nueva debe tener al menos 10 caracteres." };
  if (input.next !== input.repeat) return { ok: false, error: "Las dos contraseñas nuevas no coinciden." };
  if (input.next === input.current) {
    return { ok: false, error: "La contraseña nueva tiene que ser distinta de la actual." };
  }

  const admin = await prisma.adminUser.findUnique({ where: { id: session.adminId } });
  if (!admin) return { ok: false, error: "No encontramos tu usuario." };

  const key = await clientKey(`cambio:${admin.email}`);
  if (isLocked(key)) return { ok: false, error: "Demasiados intentos. Probá de nuevo más tarde." };

  if (!(await bcrypt.compare(input.current, admin.passwordHash))) {
    registerFail(key);
    await sleep(700);
    return { ok: false, error: "La contraseña actual no es correcta." };
  }
  fails.delete(key);

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { passwordHash: await bcrypt.hash(input.next, 12) },
  });
  return { ok: true };
}
