import { z } from "zod";

/** Error pensado para mostrarse tal cual a la persona (mensaje en castellano). */
export class UserError extends Error {}

/**
 * Convierte cualquier error en un texto seguro para mostrar. Solo pasan los
 * mensajes propios (UserError) y los de validación; el resto se registra en el
 * servidor y se muestra genérico, para no exponer detalles internos.
 */
export function describeError(e: unknown): string {
  if (e instanceof UserError) return e.message;
  if (e instanceof z.ZodError) return e.issues[0]?.message ?? "Revisá los datos ingresados.";
  console.error(e);
  return "No se pudo completar la acción. Probá de nuevo en unos minutos.";
}
