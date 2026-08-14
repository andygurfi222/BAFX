// Mejora la presentación de las fotos de producto: bafx.com.ar no tiene
// nada más grande que ~500x500 disponible (ya se usa esa versión), así que
// esto no "inventa" resolución — hace un upscale con buen algoritmo
// (Lanczos3) + enfoque suave y las re-codifica en JPEG de alta calidad,
// para que se vean nítidas incluso en el hero grande y la ficha de producto.
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

const IMG_DIR = path.join(process.cwd(), "public", "uploads", "scraped");
const TARGET = 1200; // lado máximo final
const CONCURRENCY = 6;

async function enhanceOne(filename) {
  const file = path.join(IMG_DIR, filename);
  try {
    const buffer = await fs.readFile(file);
    const meta = await sharp(buffer).metadata();
    const maxSide = Math.max(meta.width ?? 0, meta.height ?? 0);
    if (!maxSide) return { filename, ok: false, reason: "sin metadata" };

    const scale = Math.min(TARGET / maxSide, 3); // no más de 3x
    const width = Math.round((meta.width ?? TARGET) * scale);
    const height = Math.round((meta.height ?? TARGET) * scale);

    const out = await sharp(buffer)
      .resize(width, height, { kernel: sharp.kernel.lanczos3 })
      .sharpen({ sigma: 0.8, m1: 0.6, m2: 0.3 })
      .jpeg({ quality: 92, mozjpeg: true })
      .toBuffer();

    await fs.writeFile(file, out);
    return { filename, ok: true, from: `${meta.width}x${meta.height}`, to: `${width}x${height}` };
  } catch (e) {
    return { filename, ok: false, reason: String(e) };
  }
}

async function main() {
  const files = await fs.readdir(IMG_DIR);
  console.log(`Mejorando ${files.length} imágenes…`);

  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < files.length) {
      const i = idx++;
      const r = await enhanceOne(files[i]);
      results.push(r);
      if (results.length % 150 === 0) console.log(`  ${results.length}/${files.length}`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const ok = results.filter((r) => r.ok);
  const failed = results.filter((r) => !r.ok);
  console.log(`\nOK: ${ok.length} · Fallidas: ${failed.length}`);
  if (ok[0]) console.log("Ejemplo:", ok[0]);
  if (failed.length > 0) console.log("Fallos:", failed.slice(0, 10));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
