import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "@/lib/constants";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-only-insecure-secret-change-me"
);

const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 días

export type AdminSessionPayload = {
  adminId: string;
  email: string;
  name: string;
};

export async function createAdminSession(payload: AdminSessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as AdminSessionPayload;
  } catch {
    return null;
  }
}

export async function requireAdminSession(): Promise<AdminSessionPayload> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("No autorizado");
  }
  return session;
}
