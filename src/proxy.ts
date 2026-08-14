import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/constants";

/**
 * Chequeo optimista y barato (solo mira si existe la cookie) para redirigir
 * de una sin sesión antes de renderizar. La verificación real (firma y
 * expiración del JWT) ocurre en el layout de `/admin/(dashboard)` y en cada
 * server action de mutación — el proxy no reemplaza esa capa.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const hasSession = request.cookies.has(ADMIN_SESSION_COOKIE);
  if (!hasSession) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
