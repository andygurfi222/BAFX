import "server-only";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Guarda una imagen subida por el admin y devuelve su URL pública.
 *
 * En local (o si no hay `BLOB_READ_WRITE_TOKEN`) la guarda en disco, bajo
 * `public/uploads/products/`. En un hosting serverless (Vercel) el
 * filesystem es efímero, así que ahí hace falta un storage real — si la
 * variable `BLOB_READ_WRITE_TOKEN` está seteada (se genera sola al crear un
 * Blob Store en el proyecto de Vercel), sube a Vercel Blob en su lugar sin
 * que el resto del código tenga que cambiar.
 */
export async function saveProductImage(file: File): Promise<string> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    throw new Error("Formato de imagen no soportado (usar JPG, PNG o WEBP)");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("La imagen no puede pesar más de 5MB");
  }

  const filename = `${crypto.randomUUID()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`products/${filename}`, file, { access: "public" });
    return blob.url;
  }

  if (process.env.VERCEL) {
    // En Vercel el disco es de solo lectura: sin Blob no hay dónde guardar la foto.
    throw new Error(
      "Todavía no está activado el almacenamiento de fotos del sitio. Avisale a quien administra el hosting (Vercel → Storage → Blob) y probá de nuevo."
    );
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return `/uploads/products/${filename}`;
}
