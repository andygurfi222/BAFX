// Descarga las imágenes reales de producto detectadas por scrape-bafx.mjs
import fs from "fs/promises";
import path from "path";

const OUT_DIR = path.join(process.cwd(), "scripts", "data");
const IMG_DIR = path.join(process.cwd(), "public", "uploads", "scraped");
const CONCURRENCY = 10;

function extFromUrl(url) {
  const m = url.match(/\.(jpe?g|png|webp|gif)(?:$|\?)/i);
  return m ? m[1].toLowerCase().replace("jpeg", "jpg") : "jpg";
}

async function downloadOne(product) {
  if (!product.image) return { id: product.id, ok: false, reason: "sin imagen" };
  const ext = extFromUrl(product.image);
  const filename = `${product.id}.${ext}`;
  const dest = path.join(IMG_DIR, filename);

  try {
    await fs.access(dest);
    return { id: product.id, ok: true, filename, cached: true };
  } catch {
    // no existe, descargar
  }

  try {
    const res = await fetch(product.image, { headers: { "User-Agent": "Mozilla/5.0 (BAFX migration script)" } });
    if (!res.ok) return { id: product.id, ok: false, reason: `HTTP ${res.status}` };
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

  console.log(`Descargando imágenes de ${products.length} productos (concurrencia ${CONCURRENCY})…`);

  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < products.length) {
      const i = idx++;
      const r = await downloadOne(products[i]);
      results.push(r);
      if (results.length % 100 === 0) {
        console.log(`  ${results.length}/${products.length}`);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const ok = results.filter((r) => r.ok);
  const failed = results.filter((r) => !r.ok);
  console.log(`\nOK: ${ok.length} · Fallidas: ${failed.length}`);
  if (failed.length > 0) {
    console.log("Ejemplos de fallos:", failed.slice(0, 10));
  }

  const imageMap = Object.fromEntries(ok.map((r) => [r.id, r.filename]));
  await fs.writeFile(path.join(OUT_DIR, "image-map.json"), JSON.stringify(imageMap, null, 2));
  console.log("Guardado scripts/data/image-map.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
