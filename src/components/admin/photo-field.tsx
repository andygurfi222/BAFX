"use client";

import { useEffect, useRef, useState } from "react";
import { ProductImage } from "@/components/product/product-image";

const MAX_SIDE = 1600; // px: suficiente para verse nítida en la tienda
const JPEG_QUALITY = 0.86;

/**
 * Achica la foto antes de subirla. Las fotos de celular pesan 3–8 MB y el
 * servidor tiene un tope, así que se reducen a ~1600 px en JPEG (suele quedar
 * en 200–600 KB) sin que la persona tenga que hacer nada.
 */
async function shrink(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#ffffff"; // los PNG con transparencia quedan sobre fondo blanco
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    if (!blob || (scale === 1 && blob.size >= file.size)) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file; // si el navegador no puede procesarla, se sube tal cual y el servidor la valida
  }
}

function formatSize(bytes: number) {
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

/** Campo de foto grande y claro: elegir/arrastrar, vista previa y quitar. */
export function PhotoField({
  currentUrl,
  productName,
  productId,
}: {
  currentUrl?: string | null;
  productName?: string;
  productId?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setInfo("Ese archivo no es una imagen. Elegí una foto JPG, PNG o WEBP.");
      return;
    }
    setBusy(true);
    setInfo(null);
    const ready = await shrink(file);
    if (inputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(ready);
      inputRef.current.files = dt.files;
    }
    setPreview(URL.createObjectURL(ready));
    setInfo(`${ready.name} · ${formatSize(ready.size)}`);
    setBusy(false);
  }

  function clear() {
    if (inputRef.current) inputRef.current.value = "";
    setPreview(null);
    setInfo(null);
  }

  const hasCurrent = Boolean(currentUrl) && !String(currentUrl).startsWith("placeholder:");

  return (
    <div className="sm:col-span-2">
      <p className="mb-2 text-sm font-medium">Foto del producto</p>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFile(e.dataTransfer.files?.[0]);
        }}
        className={`flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed p-4 sm:flex-row ${
          dragging ? "border-[var(--color-neon)] bg-[var(--color-paper-sunken)]" : "border-[var(--color-line)]"
        }`}
      >
        <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-xl bg-[var(--color-paper-sunken)]">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Vista previa de la foto nueva" className="h-full w-full object-cover" />
          ) : hasCurrent || productId ? (
            <ProductImage url={currentUrl} alt={productName ?? "Foto actual"} seed={productId ?? "nuevo"} sizes="160px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-3 text-center text-xs text-[var(--color-ink-faint)]">
              Todavía no hay foto
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col items-center gap-3 text-center sm:items-start sm:text-left">
          <p className="text-sm text-[var(--color-ink-soft)]">
            {preview
              ? "Esta foto se va a guardar cuando toques el botón de guardar."
              : hasCurrent
                ? "Esta es la foto actual. Si elegís una nueva, la reemplaza."
                : "Subí una foto del producto. Si no ponés ninguna, se muestra un dibujo de relleno."}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-[var(--color-neon)] px-6 text-sm font-semibold text-[#0a0a0a] shadow-[0_0_14px_rgba(182,226,58,0.30)] hover:shadow-[0_0_26px_var(--color-neon-glow)]">
              {busy ? "Preparando foto…" : preview || hasCurrent ? "Cambiar foto" : "Elegir foto"}
              <input
                ref={inputRef}
                id="image"
                name="image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(e) => void handleFile(e.target.files?.[0])}
              />
            </label>
            {preview && (
              <button
                type="button"
                onClick={clear}
                className="text-sm font-medium text-[var(--color-ink-soft)] hover:underline"
              >
                Quitar la foto elegida
              </button>
            )}
          </div>
          <p className="text-xs text-[var(--color-ink-faint)]">
            {info ?? "También podés arrastrar la foto hasta acá. Formatos: JPG, PNG o WEBP. Se achica sola para que cargue rápido."}
          </p>
        </div>
      </div>
    </div>
  );
}
