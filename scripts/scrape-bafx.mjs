// Scrapea el catálogo completo real de bafx.com.ar (nombre, precio, descripción
// corta e imagen de cada producto) recorriendo todas las categorías y
// subcategorías reales del sitio actual. Migración de datos propios del
// negocio a la plataforma nueva — no se inventa ningún producto.
import * as cheerio from "cheerio";
import fs from "fs/promises";
import path from "path";

const BASE = "https://www.bafx.com.ar";
const OUT_DIR = path.join(process.cwd(), "scripts", "data");
const IMG_DIR = path.join(process.cwd(), "public", "uploads", "scraped");

// Categorías de primer nivel tal como existen hoy en bafx.com.ar
const TOP_CATEGORIES = [
  "32c9-ANTEOJOS",
  "32c23-ANTIFAZ",
  "32c49-CORONAS",
  "32c27-COTILLÓN-ANIMALES",
  "32c30-COTILLON-ANIMAL-PRINT",
  "32c18-COTILLON-ARABE",
  "32c21-COTILLON-ARGENTINA-",
  "32c48-COTILLON-EMOJI",
  "32c4-COTILLON-FLUO",
  "32c7-COTILLON-FUTBOLERO",
  "32c29-COTILLON-HAWAII",
  "32c28-COTILLON-HIPSTER",
  "32c43-COTILLON-LLUVIA",
  "32c32-COTILLON-LOVE",
  "32c1-COTILLON-LUMINOSO",
  "32c5-COTILLON-OCHENTOSO",
  "32c31-COTILLON-PRIMAVERA",
  "32c38-COTILLON-QUIMICO",
  "32c20-COTILLON-REGGAE",
  "32c6-COTILLON-REGGAETON",
  "32c8-COTILLON-VENECIANO",
  "32c13-COTILLON-XXX",
  "32c11-DISFRACES",
  "32c39-GLOBOS",
  "32c53-GUANTES",
  "32c17-HALLOWEEN",
  "32c14-INFLABLES",
  "32c55-NAVIDAD-",
  "32c47-NOVEDADES-2026",
  "32c2-PELUCAS",
  "32c52-PERSONAJES",
  "32c3-PLUMAS",
  "32c12-PRODUCTOS-PARA-DECORACION",
  "32c51-SAN-PATRICIOS",
  "32c10-SOMBREROS",
  "32c50-TANDA-FASHION",
  "32c56-TANDA-GOLD-DORADA",
  "32c24-TANDA-INVIERNO-",
  "32c58-TANDA-PELUCHE",
  "32c54-TANDA-PINK-BRESH-BARBIE",
  "32c57-TANDA-SILVER-PLATA",
  "32c42-TANDA-SUMMER",
  "32c16-VARIOS",
  "32c26-VINCHAS",
  "32c22-WHITE-FEST---tanda-blanca",
  "32c35-Z-PACKS",
  "32c25-Z-SUPER-OFERTAS-DEL-MES",
];

// Subcategorías conocidas (se scrapean como fuente adicional, no cambian el
// mapeo de categoría final — eso lo decide scripts/category-map.mjs)
const SUB_CATEGORIES = [
  "32c4-COTILLON-FLUO/40-ACCESORIOS",
  "32c4-COTILLON-FLUO/31-ARTICULOS-DE-CABEZA",
  "32c4-COTILLON-FLUO/32-ARTICULOS-PARA-MANO",
  "32c4-COTILLON-FLUO/29-COLGANTES-Y-COLLARES",
  "32c7-COTILLON-FUTBOLERO/39-ARGENTINA",
  "32c7-COTILLON-FUTBOLERO/34-BOCA",
  "32c7-COTILLON-FUTBOLERO/38-INDEPENDIENTE",
  "32c7-COTILLON-FUTBOLERO/36-RACING",
  "32c7-COTILLON-FUTBOLERO/35-RIVER",
  "32c7-COTILLON-FUTBOLERO/37-SAN-LORENZO",
  "32c1-COTILLON-LUMINOSO/4-ANILLOS-LUMINOSOS",
  "32c1-COTILLON-LUMINOSO/2-ANTEOJOS-LUMINOSOS",
  "32c1-COTILLON-LUMINOSO/3-BARRAS-LUMINOSAS---PROD-PARA-MANOS",
  "32c1-COTILLON-LUMINOSO/5-COLGANTES-LUMINOSOS",
  "32c1-COTILLON-LUMINOSO/1-COTILLON-QUIMICO",
  "32c1-COTILLON-LUMINOSO/8-NOVEDADES-2026",
  "32c1-COTILLON-LUMINOSO/6-PRODUCTOS-PARA-BARRAS-DE-TRAGOS",
  "32c1-COTILLON-LUMINOSO/7-REMERAS-LUMINOSAS",
  "32c1-COTILLON-LUMINOSO/9-VINCHAS---PROD.-PARA-CABEZA",
  "32c52-PERSONAJES/43-PATITOS",
  "32c3-PLUMAS/21-ABANICOS-DE-PLUMAS",
  "32c3-PLUMAS/23-ANTIFAZ-DE-PLUMAS",
  "32c3-PLUMAS/18-BOAS-DE-PLUMAS",
  "32c3-PLUMAS/20-CASCOS-DE-PLUMAS",
  "32c3-PLUMAS/22-ESPALDARES-DE-PLUMAS",
  "32c3-PLUMAS/19-VINCHAS-DE-PLUMAS",
  "32c3-PLUMAS/44-VINCHAS-INDIAS",
  "32c10-SOMBREROS/25-BOINAS",
  "32c10-SOMBREROS/11-CAPELINAS",
  "32c10-SOMBREROS/13-CAPS",
  "32c10-SOMBREROS/14-COWBOYS",
  "32c10-SOMBREROS/30-COYA",
  "32c10-SOMBREROS/33-DE-PAJA",
  "32c10-SOMBREROS/15-GALERAS",
  "32c10-SOMBREROS/42-GORRO-ROCKY-",
  "32c10-SOMBREROS/12-GUAPOS",
  "32c10-SOMBREROS/27-INVIERNO",
  "32c10-SOMBREROS/41-NAVIDAD",
  "32c10-SOMBREROS/10-PARA-HOMENAJEADOS",
  "32c10-SOMBREROS/26-PILUSOS",
  "32c10-SOMBREROS/17-PLAYA",
  "32c10-SOMBREROS/24-VARIOS",
  "32c10-SOMBREROS/28-VISERAS",
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parsePrice(text) {
  if (!text) return null;
  // "$ 4.000,00" -> quitar puntos de miles, tomar parte entera antes de la coma
  const noThousands = text.replace(/\$\s*/, "").replace(/\./g, "");
  const intPart = noThousands.split(",")[0];
  const n = parseInt(intPart, 10);
  return Number.isFinite(n) ? n : null;
}

async function fetchPage(catPath, page) {
  const url = `${BASE}/${catPath}${page > 1 ? `?p=${page}` : ""}`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (BAFX migration script)" } });
  if (!res.ok) return null;
  return res.text();
}

function extractProducts(html) {
  const $ = cheerio.load(html);
  const products = [];
  $(".prod1, .prod_dest1").each((_, el) => {
    const $el = $(el);
    const link = $el.find(".titulo_1 a").first();
    const href = link.attr("href");
    const name = link.text().trim();
    if (!href || !name) return;
    const idMatch = href.match(/\/32p(\d+)-/);
    if (!idMatch) return;
    const id = idMatch[1];
    const img = $el.find(".imagen_1 img").attr("src");
    const description = $el.find(".descrip_1").text().trim();
    const priceText = $el.find(".number_1").first().text().trim();
    const price = parsePrice(priceText);
    if (price === null) return;
    products.push({ id, href, name, image: img ? `${BASE}${img}` : null, description, price });
  });
  return products;
}

function maxPageFromHtml(html) {
  const matches = [...html.matchAll(/\?p=(\d+)/g)].map((m) => parseInt(m[1], 10));
  return matches.length > 0 ? Math.max(...matches) : 1;
}

async function scrapeCategory(catPath, all, sourceMap) {
  const first = await fetchPage(catPath, 1);
  if (!first) {
    console.log(`  ! no se pudo cargar ${catPath}`);
    return;
  }
  const maxPage = maxPageFromHtml(first);
  let total = 0;
  for (let p = 1; p <= maxPage; p++) {
    const html = p === 1 ? first : await fetchPage(catPath, p);
    if (!html) continue;
    const products = extractProducts(html);
    for (const prod of products) {
      if (!all.has(prod.id)) {
        all.set(prod.id, prod);
      }
      if (!sourceMap.has(prod.id)) sourceMap.set(prod.id, []);
      const list = sourceMap.get(prod.id);
      if (!list.includes(catPath)) list.push(catPath);
    }
    total += products.length;
    await sleep(120);
  }
  console.log(`  ${catPath}: ${maxPage} página(s), ${total} listados`);
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(IMG_DIR, { recursive: true });

  const all = new Map(); // id -> product
  const sourceMap = new Map(); // id -> [categoryPath,...] en orden de aparición

  console.log(`Categorías de primer nivel (${TOP_CATEGORIES.length}):`);
  for (const cat of TOP_CATEGORIES) {
    await scrapeCategory(cat, all, sourceMap);
  }

  console.log(`\nSubcategorías (${SUB_CATEGORIES.length}):`);
  for (const cat of SUB_CATEGORIES) {
    await scrapeCategory(cat, all, sourceMap);
  }

  console.log(`\nTotal de productos únicos: ${all.size}`);

  const products = [...all.values()].map((p) => ({
    ...p,
    sources: sourceMap.get(p.id) ?? [],
  }));

  await fs.writeFile(path.join(OUT_DIR, "products-raw.json"), JSON.stringify(products, null, 2));
  console.log(`Guardado scripts/data/products-raw.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
