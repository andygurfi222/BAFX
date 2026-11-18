// Importa el catálogo COMPLETO scrapeado de bafx.com.ar (1550 productos
// reales, con sus imágenes reales) a la base de datos nueva, mapeando cada
// categoría original a la taxonomía reorganizada del sitio nuevo.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import slugify from "slugify";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();
const DATA_DIR = path.join(process.cwd(), "scripts", "data");

function slug(s) {
  return slugify(s, { lower: true, strict: true, locale: "es" });
}

// ---- Taxonomía nueva -------------------------------------------------
const CATEGORY_TREE = [
  {
    name: "Sombreros y Tocados",
    children: ["Sombreros", "Vinchas", "Coronas", "Pelucas", "Plumas"],
  },
  {
    name: "Cotillón de Fiesta",
    children: [
      "Anteojos y Antifaces",
      "Cotillón Luminoso",
      "Collares y Accesorios de Mano",
      "Globos",
      "Guantes",
      "Fútbol",
      "Temáticas de Fiesta",
    ],
  },
  {
    name: "Disfraces y Personajes",
    children: ["Disfraces", "Personajes", "Halloween", "Inflables"],
  },
  {
    name: "Fechas y Eventos",
    children: ["Navidad", "San Patricio", "Novedades de Temporada"],
  },
  {
    name: "Packs y Mayorista",
    children: ["Packs por Cantidad", "Combos por Evento"],
  },
  {
    name: "Decoración",
    children: ["Productos para Decoración", "Varios"],
  },
];

// ---- Mapeo: categoría original de bafx.com.ar -> subcategoría nueva --
// priority más bajo = más específico / gana si el producto aparece en
// varias categorías originales a la vez.
const TOP_LEVEL_MAP = {
  "32c9-ANTEOJOS": { sub: "anteojos-y-antifaces", priority: 1 },
  "32c23-ANTIFAZ": { sub: "anteojos-y-antifaces", priority: 1 },
  "32c49-CORONAS": { sub: "coronas", priority: 1 },
  "32c27-COTILLÓN-ANIMALES": { sub: "tematicas-de-fiesta", priority: 4 },
  "32c30-COTILLON-ANIMAL-PRINT": { sub: "tematicas-de-fiesta", priority: 4 },
  "32c18-COTILLON-ARABE": { sub: "tematicas-de-fiesta", priority: 4 },
  "32c21-COTILLON-ARGENTINA-": { sub: "tematicas-de-fiesta", priority: 4 },
  "32c48-COTILLON-EMOJI": { sub: "tematicas-de-fiesta", priority: 4 },
  "32c4-COTILLON-FLUO": { sub: "tematicas-de-fiesta", priority: 4 },
  "32c7-COTILLON-FUTBOLERO": { sub: "futbol", priority: 2 },
  "32c29-COTILLON-HAWAII": { sub: "tematicas-de-fiesta", priority: 4 },
  "32c28-COTILLON-HIPSTER": { sub: "tematicas-de-fiesta", priority: 4 },
  "32c43-COTILLON-LLUVIA": { sub: "tematicas-de-fiesta", priority: 4 },
  "32c32-COTILLON-LOVE": { sub: "tematicas-de-fiesta", priority: 4 },
  "32c1-COTILLON-LUMINOSO": { sub: "cotillon-luminoso", priority: 2 },
  "32c5-COTILLON-OCHENTOSO": { sub: "tematicas-de-fiesta", priority: 4 },
  "32c31-COTILLON-PRIMAVERA": { sub: "tematicas-de-fiesta", priority: 4 },
  "32c38-COTILLON-QUIMICO": { sub: "cotillon-luminoso", priority: 2 },
  "32c20-COTILLON-REGGAE": { sub: "tematicas-de-fiesta", priority: 4 },
  "32c6-COTILLON-REGGAETON": { sub: "tematicas-de-fiesta", priority: 4 },
  "32c8-COTILLON-VENECIANO": { sub: "tematicas-de-fiesta", priority: 4 },
  "32c13-COTILLON-XXX": { sub: "tematicas-de-fiesta", priority: 4 },
  "32c11-DISFRACES": { sub: "disfraces", priority: 1 },
  "32c39-GLOBOS": { sub: "globos", priority: 1 },
  "32c53-GUANTES": { sub: "guantes", priority: 1 },
  "32c17-HALLOWEEN": { sub: "halloween", priority: 1 },
  "32c14-INFLABLES": { sub: "inflables", priority: 1 },
  "32c55-NAVIDAD-": { sub: "navidad", priority: 1 },
  "32c47-NOVEDADES-2026": { sub: "novedades-de-temporada", priority: 2 },
  "32c2-PELUCAS": { sub: "pelucas", priority: 1 },
  "32c52-PERSONAJES": { sub: "personajes", priority: 1 },
  "32c3-PLUMAS": { sub: "plumas", priority: 1 },
  "32c12-PRODUCTOS-PARA-DECORACION": { sub: "productos-para-decoracion", priority: 1 },
  "32c51-SAN-PATRICIOS": { sub: "san-patricio", priority: 1 },
  "32c10-SOMBREROS": { sub: "sombreros", priority: 1 },
  "32c50-TANDA-FASHION": { sub: "combos-por-evento", priority: 3 },
  "32c56-TANDA-GOLD-DORADA": { sub: "combos-por-evento", priority: 3 },
  "32c24-TANDA-INVIERNO-": { sub: "combos-por-evento", priority: 3 },
  "32c58-TANDA-PELUCHE": { sub: "combos-por-evento", priority: 3 },
  "32c54-TANDA-PINK-BRESH-BARBIE": { sub: "combos-por-evento", priority: 3 },
  "32c57-TANDA-SILVER-PLATA": { sub: "combos-por-evento", priority: 3 },
  "32c42-TANDA-SUMMER": { sub: "combos-por-evento", priority: 3 },
  "32c16-VARIOS": { sub: "varios", priority: 5 },
  "32c26-VINCHAS": { sub: "vinchas", priority: 1 },
  "32c22-WHITE-FEST---tanda-blanca": { sub: "combos-por-evento", priority: 3 },
  "32c35-Z-PACKS": { sub: "packs-por-cantidad", priority: 1 },
  "32c25-Z-SUPER-OFERTAS-DEL-MES": { sub: "varios", priority: 5 },
};

// Overrides por subcategoría original exacta (más específico que el mapeo
// por categoría de primer nivel)
const EXACT_OVERRIDES = {
  "32c4-COTILLON-FLUO/29-COLGANTES-Y-COLLARES": { sub: "collares-y-accesorios-de-mano", priority: 1 },
  "32c4-COTILLON-FLUO/32-ARTICULOS-PARA-MANO": { sub: "collares-y-accesorios-de-mano", priority: 1 },
  "32c10-SOMBREROS/14-COWBOYS": { sub: "sombreros", priority: 1 },
};

// Si el producto solo aparece en categorías catch-all ("Varios" / ofertas),
// se intenta reconocer el tipo de producto por su nombre antes de dejarlo
// en el cajón general — evita que gorros, vinchas, etc. terminen en "Varios"
// solo porque el sitio original no los etiquetó también en su categoría.
const NAME_HEURISTICS = [
  [/vincha/i, "vinchas"],
  [/corona/i, "coronas"],
  [/peluca/i, "pelucas"],
  [/\b(gorro|sombrero|cap|galera|piluso|boina|capelina|viser)/i, "sombreros"],
  [/\b(antifaz|anteojo)/i, "anteojos-y-antifaces"],
  [/\bglobo/i, "globos"],
  [/\bguante/i, "guantes"],
  [/disfraz/i, "disfraces"],
  [/\b(mascara|máscara|bruja|calaver|halloween|calabaza)/i, "halloween"],
  [/inflable/i, "inflables"],
  [/\b(papa noel|papá noel|navide|navidad)/i, "navidad"],
  [/\b(led|luminos|quimico|químico|fibra optica|fibra óptica)/i, "cotillon-luminoso"],
  [/\b(collar|colgante)/i, "collares-y-accesorios-de-mano"],
  [/\bpluma|abanico|boa\b/i, "plumas"],
  [/\bpack de|pack x|pack por/i, "packs-por-cantidad"],
];

function bestCategory(sources, name) {
  let best = null;
  for (const src of sources) {
    const exact = EXACT_OVERRIDES[src];
    if (exact && (!best || exact.priority < best.priority)) best = exact;
    const topLevel = src.split("/")[0];
    const top = TOP_LEVEL_MAP[topLevel];
    if (top && (!best || top.priority < best.priority)) best = top;
  }
  if (!best || best.priority >= 5) {
    const match = NAME_HEURISTICS.find(([re]) => re.test(name));
    if (match) return match[1];
  }
  return best?.sub ?? "varios";
}

async function main() {
  const products = JSON.parse(await fs.readFile(path.join(DATA_DIR, "products-raw.json"), "utf8"));
  const imageMap = JSON.parse(await fs.readFile(path.join(DATA_DIR, "image-map.json"), "utf8"));

  console.log(`Importando ${products.length} productos…`);

  console.log("Limpiando datos existentes…");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.settings.deleteMany();

  console.log("Creando categorías…");
  const categoryIdBySlug = new Map();
  for (let i = 0; i < CATEGORY_TREE.length; i++) {
    const top = CATEGORY_TREE[i];
    const created = await prisma.category.create({ data: { name: top.name, slug: slug(top.name), order: i } });
    categoryIdBySlug.set(created.slug, created.id);
    for (let j = 0; j < top.children.length; j++) {
      const child = top.children[j];
      const createdChild = await prisma.category.create({
        data: { name: child, slug: slug(child), order: j, parentId: created.id },
      });
      categoryIdBySlug.set(createdChild.slug, createdChild.id);
    }
  }

  console.log("Creando productos…");
  const usedSlugs = new Set();
  const featuredPerCategory = new Map();
  let created = 0;
  let skipped = 0;

  for (const p of products) {
    const subSlug = bestCategory(p.sources, p.name);
    const categoryId = categoryIdBySlug.get(subSlug);
    if (!categoryId) {
      skipped++;
      continue;
    }

    let baseSlug = slug(p.name) || `producto-${p.id}`;
    let productSlug = baseSlug;
    let n = 2;
    while (usedSlugs.has(productSlug)) {
      productSlug = `${baseSlug}-${n++}`;
    }
    usedSlugs.add(productSlug);

    const imageFilename = imageMap[p.id];
    const imageUrl = imageFilename ? `/uploads/scraped/${imageFilename}` : `placeholder:${productSlug}`;
    const onSale = p.sources.includes("32c25-Z-SUPER-OFERTAS-DEL-MES");

    const featuredCount = featuredPerCategory.get(subSlug) ?? 0;
    const featured = featuredCount === 0;
    featuredPerCategory.set(subSlug, featuredCount + 1);

    await prisma.product.create({
      data: {
        name: p.name,
        slug: productSlug,
        description: p.description && p.description !== p.name ? p.description : undefined,
        sku: `BAFX-${p.id}`,
        price: p.price,
        stock: 10,
        featured,
        onSale,
        categoryId,
        images: { create: [{ url: imageUrl, alt: p.name, order: 0 }] },
      },
    });
    created++;
    if (created % 200 === 0) console.log(`  ${created}/${products.length}`);
  }

  console.log(`Productos creados: ${created} · sin categoría (omitidos): ${skipped}`);

  console.log("Configuración del negocio…");
  await prisma.settings.create({
    data: {
      id: 1,
      businessName: "BAFX Cotillón",
      email: "info@bafx.com.ar",
      phone: "(54-11) 4864-3317",
      whatsapp: "+54 9 11 4490-5950",
      whatsapp2: "+54 9 11 4491-6091",
      address: "Jerónimo Salguero 1166 (entre Av. Córdoba y Cabrera)",
      city: "Palermo, Ciudad Autónoma de Buenos Aires, Argentina",
      hours: "Lunes a viernes de 10 a 17 h",
      instagram: "@BAFX_COTILLON",
      facebook: "Cotillón BAFX",
      shippingInfo: "Envíos a todo el país una vez acreditado el pago. El costo se coordina según destino.",
      pickupInfo: "Retiro sin cargo en el showroom de Palermo, de lunes a viernes de 10 a 17 h.",
      aboutText:
        "30 años vistiendo la fiesta de todo el país: el mayor surtido de cotillón, disfraces y accesorios de fiesta, con fabricación propia e importación directa.",
    },
  });

  console.log("Usuario admin…");
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@bafx.com.ar";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Bafx2026!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.adminUser.create({
    data: { email: adminEmail, passwordHash, name: "Administrador BAFX", role: "admin" },
  });

  console.log("Listo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
