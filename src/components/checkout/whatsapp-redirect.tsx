"use client";

import { useEffect } from "react";

/**
 * Abre WhatsApp con el pedido ya escrito, una sola vez por pedido (si se
 * recarga la página no vuelve a saltar). El botón de la página queda como
 * respaldo por si el navegador lo bloquea.
 */
export function WhatsAppRedirect({ url, orderId }: { url: string; orderId: string }) {
  useEffect(() => {
    const key = `bafx-wa-${orderId}`;
    try {
      if (sessionStorage.getItem(key)) return;
    } catch {
      // sin sessionStorage: igual se redirige
    }
    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem(key, "1");
      } catch {
        // ignorar
      }
      window.location.href = url;
    }, 1200);
    return () => clearTimeout(timer);
  }, [url, orderId]);

  return null;
}
