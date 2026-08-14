// Vuelve a descargar las imágenes de producto en su versión de mayor
// resolución. bafx.com.ar sirve miniaturas de listado como "..._peq.jpg"
// (150x113) pero la misma imagen existe sin el sufijo "_peq" en tamaño
// completo (500x500) — es la que usa su propio visor de zoom.
import fs from "fs/promises";
import path from "path";

const OUT_DIR = path.join(process.cwd(), "scripts", "data");
const IMG_DIR = path.join(process.cwd(), "public", "uploads", "scraped");
const CONCURRENCY = 10;

function hiResUrl(url) {
  return url.replace(/_peq(\.\w+)$/i, "$1");
}

function extFromUrl(url) {
  const m = url.match(/\.(jpe?g|png|webp|gif)(?:$|\?)/i);
  return m ? m[1].toLowerCase().replace("jpeg", "jpg") : "jpg";
}

async function downloadOne(product) {
  if (!product.image) return { id: product.id, ok: false, reason: "sin imagen" };
  const url = hiResUrl(product.image);
  const ext = extFromUrl(url);
  const filename = `${product.id}.${ext}`;
  const dest = path.join(IMG_DIR, filename);

  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (BAFX migration script)" } });
    if (!res.ok) {
      // fallback: la miniatura original, por si la versión grande no existe
      const fallback = await fetch(product.image, { headers: { "User-Agent": "Mozilla/5.0 (BAFX migration script)" } });
      if (!fallback.ok) return { id: product.id, ok: false, reason: `HTTP ${res.status}` };
      const buffer = Buffer.from(await fallback.arrayBuffer());
      await fs.writeFile(dest, buffer);
      return { id: product.id, ok: true, filename, downgraded: true };
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(dest, buffer);
    return { id: product.id, ok: true, filename };
  } catch (e) {
    return { id: product.id, ok: false, reason: String(e) };
  }
}

async function main() {
  await fs.mkdir(IMG_DIR, { recursive: true });
  const products = JSON.parse(await fs.readFile(path.join(OUT_DIR, "products-raw.json"), "utf8"));

  console.log(`Re-descargando ${products.length} imágenes en alta resolución…`);

  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < products.length) {
      const i = idx++;
      const r = await downloadOne(products[i]);
      results.push(r);
      if (results.length % 100 === 0) console.log(`  ${results.length}/${products.length}`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const ok = results.filter((r) => r.ok);
  const downgraded = ok.filter((r) => r.downgraded);
  const failed = results.filter((r) => !r.ok);
  console.log(`\nOK: ${ok.length} (${downgraded.length} usaron fallback a miniatura) · Fallidas: ${failed.length}`);
  if (failed.length > 0) console.log("Ejemplos de fallos:", failed.slice(0, 10));

  const imageMap = Object.fromEntries(ok.map((r) => [r.id, r.filename]));
  await fs.writeFile(path.join(OUT_DIR, "image-map.json"), JSON.stringify(imageMap, null, 2));
  console.log("Guardado scripts/data/image-map.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
