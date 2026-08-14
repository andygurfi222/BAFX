/**
 * Seed con datos reales relevados de bafx.com.ar (nombres, precios y
 * categorías tal como existen en el sitio actual) reorganizados en la
 * taxonomía nueva definida en el documento de Fase 0. No hay productos
 * inventados: lo que no se relevó, no se creó.
 *
 * Las imágenes se dejan como placeholders generados (`placeholder:<slug>`)
 * hasta que se carguen fotos reales desde /admin — el sitio original solo
 * tenía miniaturas de ~150px, no aptas para la nueva experiencia.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import slugify from "slugify";

const prisma = new PrismaClient();

function slug(s: string) {
  return slugify(s, { lower: true, strict: true, locale: "es" });
}

type SeedVariant = { attribute: string; value: string; price?: number; stock: number };
type SeedProduct = {
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  category: string; // slug de subcategoría
  featured?: boolean;
  onSale?: boolean;
  stock?: number;
  variants?: SeedVariant[];
};

type SeedCategory = {
  name: string;
  children?: SeedCategory[];
};

const CATEGORY_TREE: SeedCategory[] = [
  {
    name: "Sombreros y Tocados",
    children: [
      { name: "Sombreros" },
      { name: "Vinchas" },
      { name: "Coronas" },
      { name: "Pelucas" },
      { name: "Plumas" },
    ],
  },
  {
    name: "Cotillón de Fiesta",
    children: [
      { name: "Anteojos y Antifaces" },
      { name: "Cotillón Luminoso" },
      { name: "Collares y Accesorios de Mano" },
      { name: "Globos" },
      { name: "Guantes" },
    ],
  },
  {
    name: "Disfraces y Personajes",
    children: [
      { name: "Disfraces" },
      { name: "Personajes" },
      { name: "Halloween" },
      { name: "Inflables" },
    ],
  },
  {
    name: "Fechas y Eventos",
    children: [
      { name: "Navidad" },
      { name: "San Patricio" },
      { name: "Novedades de Temporada" },
    ],
  },
  {
    name: "Packs y Mayorista",
    children: [{ name: "Packs por Cantidad" }, { name: "Combos por Evento" }],
  },
  {
    name: "Decoración",
    children: [{ name: "Productos para Decoración" }],
  },
];

const PRODUCTS: SeedProduct[] = [
  // --- Sombreros y Tocados > Sombreros ---
  {
    name: "Cowboy Gamuza",
    description: "Sombrero cowboy en gamuza sintética.",
    price: 7000,
    category: "sombreros",
    featured: true,
    variants: [
      { attribute: "Color", value: "Chocolate", stock: 12 },
      { attribute: "Color", value: "Marrón", stock: 9 },
      { attribute: "Color", value: "Negro", stock: 14 },
      { attribute: "Color", value: "Varios colores", stock: 20 },
    ],
  },
  { name: "Sombrero Gorro Panamá Natural", price: 15000, category: "sombreros", featured: true, stock: 10 },
  { name: "Gorro Rocky Blanco NY Lurex Plata", price: 9000, category: "sombreros", stock: 8 },
  { name: "Cap Cat Brillo Blanco", price: 8000, category: "sombreros", featured: true, stock: 15 },
  { name: "Cap Plano Kiss Glow in the Dark Plata con Negro", price: 14400, category: "sombreros", stock: 6 },
  { name: "Cap Plana Tachas Puntas Negra", price: 9600, category: "sombreros", stock: 11 },
  { name: "Sombrero Cap Strass Ala Completo Natural", price: 12000, category: "sombreros", featured: true, stock: 7 },
  { name: "Sombrero Cowboy Fluo Verde", price: 10000, category: "sombreros", stock: 13 },
  { name: "Sombrero Cowboy Charol con Corazón", price: 10000, category: "sombreros", stock: 9 },
  { name: "Cowboy Neón Azul", price: 19000, category: "sombreros", stock: 5 },
  {
    name: "Sombrero Cowboy Cuerina Lujo",
    price: 12000,
    category: "sombreros",
    featured: true,
    variants: [{ attribute: "Color", value: "Surtido de colores", stock: 18 }],
  },
  { name: "Piluso Cuerina Lujo Marrón Claro", price: 15000, category: "sombreros", featured: true, stock: 6 },
  { name: "Cap Flores Hawai Plana", price: 10000, category: "sombreros", featured: true, stock: 10 },
  { name: "Gorro Almirante Premium Dorado Importado", price: 60000, category: "sombreros", featured: true, stock: 3 },

  // --- Sombreros y Tocados > Vinchas ---
  { name: "Vincha Stefi Plata con Lentejuelas y Perlas", price: 12000, category: "vinchas", featured: true, stock: 10 },
  { name: "Vincha Tornasolada con Piedras y Plumas", price: 40000, category: "vinchas", featured: true, stock: 4 },
  { name: "Vincha Maca Argentina", price: 18000, category: "vinchas", featured: true, stock: 8 },
  { name: "Vincha Dreadlocks Mediana", price: 2400, category: "vinchas", stock: 22 },
  { name: "Vincha Reina Antenas Cristal LED", price: 2000, category: "vinchas", featured: true, stock: 25 },
  {
    name: "Vincha Acetato Flores 360 Maca",
    description: "Vincha de acetato con flores, línea 360 Maca.",
    price: 20000,
    category: "vinchas",
    variants: [
      { attribute: "Color", value: "Fucsia combinado", stock: 6 },
      { attribute: "Color", value: "Multicolor", stock: 7 },
      { attribute: "Color", value: "Multicolor pastel", stock: 5 },
      { attribute: "Color", value: "Naranja", stock: 6 },
      { attribute: "Color", value: "Naranja con LEDs", price: 30000, stock: 4 },
      { attribute: "Color", value: "Verde", stock: 5 },
    ],
  },
  { name: "Vincha Cacique Plumas Negro", price: 33000, category: "vinchas", stock: 5 },
  { name: "Vincha Conejo Peluche con Lentejuelas y LEDs", price: 2400, category: "vinchas", stock: 16 },
  { name: "Vincha Flor Primavera Blanca", price: 4000, category: "vinchas", stock: 14 },
  { name: "Vincha Minie Mediana con 4 LEDs 3 Secuencias", price: 1600, category: "vinchas", stock: 20 },

  // --- Sombreros y Tocados > Coronas ---
  { name: "Corona Reina Lujo", description: "Varios colores.", price: 20000, category: "coronas", featured: true, stock: 6 },
  {
    name: "Corona Rey David",
    price: 16000,
    category: "coronas",
    variants: [
      { attribute: "Color", value: "Dorada", stock: 8 },
      { attribute: "Color", value: "Plateada", stock: 8 },
    ],
  },
  { name: "Corona Rey de Niño Dorada", price: 12800, category: "coronas", stock: 7 },
  {
    name: "Corona Rey Diana",
    price: 16000,
    category: "coronas",
    variants: [
      { attribute: "Color", value: "Dorada", stock: 6 },
      { attribute: "Color", value: "Plateada", stock: 6 },
    ],
  },
  { name: "Corona Victoria Plumas y Piedras", price: 35000, category: "coronas", featured: true, stock: 3 },
  { name: "Vincha Corona Isabel Plata con Piedras", price: 16000, category: "coronas", stock: 5 },

  // --- Sombreros y Tocados > Pelucas ---
  { name: "Peluca Afro Negra Mediana", price: 6000, category: "pelucas", stock: 12 },
  {
    name: "Peluca Afro Rulo",
    price: 6000,
    category: "pelucas",
    variants: [
      { attribute: "Color", value: "Amarillo", stock: 5 },
      { attribute: "Color", value: "Rojo", stock: 5 },
      { attribute: "Color", value: "Azul", stock: 5 },
      { attribute: "Color", value: "Blanca", stock: 5 },
      { attribute: "Color", value: "Fucsia", stock: 5 },
      { attribute: "Color", value: "Lila", stock: 5 },
      { attribute: "Color", value: "Naranja", stock: 5 },
      { attribute: "Color", value: "Negro", stock: 5 },
    ],
  },

  // --- Sombreros y Tocados > Plumas ---
  { name: "Abanico de Tela Tornasolado Plata", price: 7000, category: "plumas", featured: true, stock: 9 },
  {
    name: "Abanico Grande Letras Chinas",
    price: 5000,
    category: "plumas",
    variants: [
      { attribute: "Color", value: "Azul dragón", stock: 6 },
      { attribute: "Color", value: "Blanco dragón", stock: 6 },
      { attribute: "Color", value: "Azul letras chinas", stock: 6 },
      { attribute: "Color", value: "Negro letras chinas", stock: 6 },
    ],
  },
  { name: "Boa de Flores Premium Amarillo Fluo", price: 14000, category: "plumas", stock: 5 },

  // --- Cotillón de Fiesta > Anteojos y Antifaces ---
  { name: "Anteojo Ciencia Ficción", price: 10000, category: "anteojos-y-antifaces", featured: true, stock: 8 },
  { name: "Anteojo Acrílico Cuadrado Colores Surtidos", price: 4000, category: "anteojos-y-antifaces", stock: 20 },
  { name: "Anteojo Acrílico Fuego Varios Colores", price: 2200, category: "anteojos-y-antifaces", stock: 25 },
  { name: "Anteojo Acrílico Lady Gaga", price: 4000, category: "anteojos-y-antifaces", stock: 18 },
  { name: "Anteojo Acrílico Pixel Negro", price: 2200, category: "anteojos-y-antifaces", stock: 22 },
  { name: "Anteojo Araña 6 LEDs Varios Colores", price: 1600, category: "anteojos-y-antifaces", stock: 30 },
  { name: "Anteojo Audiorítmico Color", description: "Se enciende y apaga al ritmo de la música.", price: 4000, category: "anteojos-y-antifaces", stock: 14 },
  { name: "Anteojo Aviador Colores Transparentes", price: 4000, category: "anteojos-y-antifaces", stock: 16 },
  { name: "Anteojo Aviador Corazón", price: 5000, category: "anteojos-y-antifaces", stock: 12 },
  { name: "Anteojo Envolvente Estilo OVNI Futurista", description: "Colores surtidos.", price: 4000, category: "anteojos-y-antifaces", featured: true, stock: 15 },
  { name: "Anteojo Risky Fluo", description: "Verde, naranja, amarillo y fucsia.", price: 2400, category: "anteojos-y-antifaces", onSale: true, stock: 20 },
  { name: "Anteojo Flogger Moderno 3 LED", price: 1600, category: "anteojos-y-antifaces", onSale: true, stock: 24 },
  { name: "Anteojo Neón 3 Secuencias", description: "Varios colores.", price: 3000, category: "anteojos-y-antifaces", onSale: true, stock: 18 },
  { name: "Anteojos 6 LEDs Surtidos", description: "Varios modelos.", price: 1600, category: "anteojos-y-antifaces", onSale: true, stock: 28 },
  { name: "Anteojo Fantasía Dedo", description: "Varios colores.", price: 800, category: "anteojos-y-antifaces", onSale: true, stock: 40 },
  { name: "Anteojo Fantasía Galera", price: 800, category: "anteojos-y-antifaces", onSale: true, stock: 35 },
  {
    name: "Antifaz Antiguo Beige",
    price: 1600,
    category: "anteojos-y-antifaces",
    stock: 15,
  },
  { name: "Antifaz Blanco Piedra Plata", price: 1700, category: "anteojos-y-antifaces", stock: 12 },
  { name: "Antifaz Chico con Brillantina", price: 1200, category: "anteojos-y-antifaces", stock: 20 },
  { name: "Antifaz con Brillantina", description: "Varios colores.", price: 1280, category: "anteojos-y-antifaces", stock: 22 },
  { name: "Antifaz con Encaje de Colores", price: 1600, category: "anteojos-y-antifaces", stock: 14 },
  { name: "Antifaz con Plumas", description: "Varios modelos.", price: 1920, category: "anteojos-y-antifaces", stock: 10 },
  { name: "Antifaz de Encaje con Flores", description: "Varios colores.", price: 1600, category: "anteojos-y-antifaces", stock: 16 },
  { name: "Antifaz Lentejuelas", description: "Varios colores.", price: 2500, category: "anteojos-y-antifaces", stock: 12 },
  { name: "Antifaz Metal Económico", description: "Varios colores.", price: 1280, category: "anteojos-y-antifaces", stock: 20 },
  { name: "Antifaz Perlado Veneciano", price: 6000, category: "anteojos-y-antifaces", stock: 6 },
  { name: "Máscara Lisa Blanca", price: 1600, category: "anteojos-y-antifaces", stock: 18 },
  {
    name: "Máscara LED La Purga",
    price: 10000,
    category: "anteojos-y-antifaces",
    variants: [
      { attribute: "Color", value: "Blanca", stock: 5 },
      { attribute: "Color", value: "Azul", stock: 5 },
    ],
  },

  // --- Cotillón de Fiesta > Cotillón Luminoso ---
  {
    name: "Abanico LED",
    price: 20000,
    category: "cotillon-luminoso",
    featured: true,
    variants: [
      { attribute: "Color", value: "Amarillo", stock: 4 },
      { attribute: "Color", value: "Azul", stock: 4 },
      { attribute: "Color", value: "Blanco", stock: 4 },
      { attribute: "Color", value: "Fucsia", stock: 4 },
      { attribute: "Color", value: "Rojo", stock: 4 },
      { attribute: "Color", value: "Verde", stock: 4 },
      { attribute: "Color", value: "Varios colores", stock: 6 },
    ],
  },
  {
    name: "Alas de Ángel con Luces Multicolor",
    price: 9000,
    category: "cotillon-luminoso",
    variants: [
      { attribute: "Color", value: "Blanco", stock: 6 },
      { attribute: "Color", value: "Rosa", stock: 6 },
    ],
  },
  { name: "Colgante Calavera LED", price: 1600, category: "cotillon-luminoso", stock: 25 },
  { name: "Anillos Jely LEDs Surtidos", price: 750, category: "cotillon-luminoso", onSale: true, stock: 50 },
  { name: "Barra Goma Espuma LED Azul", price: 1600, category: "cotillon-luminoso", onSale: true, stock: 30 },
  { name: "Barra Globo LEDs Gigante Luminosa con Pilas Incluidas", price: 3200, category: "cotillon-luminoso", stock: 20 },
  { name: "Pandereta Luminosa", price: 4800, category: "cotillon-luminoso", stock: 10 },

  // --- Cotillón de Fiesta > Collares y Accesorios de Mano ---
  { name: "Collar Hawai Premium Naranja Fluo", price: 3000, category: "collares-y-accesorios-de-mano", featured: true, stock: 20 },
  { name: "Gemas Sticker Varios Modelos", price: 1000, category: "collares-y-accesorios-de-mano", stock: 40 },
  { name: "Gemas Dapop Nuevos Modelos", price: 2000, category: "collares-y-accesorios-de-mano", stock: 30 },

  // --- Cotillón de Fiesta > Globos ---
  { name: "Globos Tirabuzón x 12 Unidades", description: "Colores surtidos.", price: 1920, category: "globos", stock: 40 },

  // --- Cotillón de Fiesta > Guantes ---
  {
    name: "Par de Guantes Red Fluo Largos",
    price: 2700,
    category: "guantes",
    variants: [
      { attribute: "Color", value: "Amarillo", stock: 10 },
      { attribute: "Color", value: "Fucsia", stock: 10 },
      { attribute: "Color", value: "Naranja", stock: 10 },
      { attribute: "Color", value: "Surtidos", stock: 15 },
      { attribute: "Color", value: "Verde", stock: 10 },
    ],
  },
  { name: "Par de Guantes Red Multicolor Largos", price: 3000, category: "guantes", stock: 12 },

  // --- Disfraces y Personajes > Disfraces ---
  {
    name: "Disfraz Inflable",
    description: "Disfraz inflable de cuerpo completo, con motor a pila.",
    price: 99000,
    category: "disfraces",
    variants: [
      { attribute: "Modelo", value: "Alien 1", stock: 3 },
      { attribute: "Modelo", value: "Alien 2", stock: 3 },
      { attribute: "Modelo", value: "Alien 3", stock: 3 },
      { attribute: "Modelo", value: "Cocodrilo", stock: 3 },
      { attribute: "Modelo", value: "Gato chino", stock: 3 },
      { attribute: "Modelo", value: "Inodoro", stock: 2 },
      { attribute: "Modelo", value: "Jirafa", stock: 3 },
      { attribute: "Modelo", value: "Flamenco adulto (1.90m)", stock: 2 },
    ],
  },
  { name: "Disfraz Inflable Mariposa", price: 50000, category: "disfraces", stock: 3 },

  // --- Disfraces y Personajes > Personajes ---
  { name: "Gorro Peluche Orejas Largas Vaca", price: 8000, category: "personajes", stock: 8 },
  { name: "Trofeo del Dibu Réplica", price: 38400, category: "personajes", featured: true, stock: 4 },

  // --- Disfraces y Personajes > Halloween ---
  {
    name: "Gorro Bruja",
    price: 3000,
    category: "halloween",
    variants: [
      { attribute: "Modelo", value: "Metalizado reversible", stock: 8 },
      { attribute: "Modelo", value: "Varios modelos y colores", stock: 10 },
      { attribute: "Modelo", value: "Negro", stock: 10 },
      { attribute: "Modelo", value: "Araña", stock: 8 },
    ],
  },
  { name: "Máscara Calavera Rígida", price: 3000, category: "halloween", stock: 12 },
  { name: "Máscara Conejo Maldito LED Neón", price: 15000, category: "halloween", stock: 4 },
  { name: "Máscara El Juego del Calamar", description: "4 modelos, precio por cada uno.", price: 4000, category: "halloween", stock: 16 },
  { name: "Máscara Halloween Calabaza", price: 3000, category: "halloween", stock: 14 },

  // --- Disfraces y Personajes > Inflables ---
  { name: "Colchoneta Inflable", price: 10000, category: "inflables", stock: 6 },
  { name: "Inflable Pelota Frutas Cortadas", price: 8000, category: "inflables", featured: true, stock: 10 },
  { name: "Inflable Delfín Grande", price: 25600, category: "inflables", stock: 4 },

  // --- Fechas y Eventos > Navidad ---
  {
    name: "Gorro de Papá Noel",
    price: 2000,
    category: "navidad",
    variants: [
      { attribute: "Modelo", value: "Eco", stock: 20 },
      { attribute: "Modelo", value: "Raso", price: 3000, stock: 15 },
      { attribute: "Modelo", value: "Rombos", price: 5000, stock: 10 },
      { attribute: "Modelo", value: "Terciopelo", price: 4000, stock: 12 },
    ],
  },

  // --- Packs y Mayorista > Packs por Cantidad ---
  { name: "Pack de 10 Sombreros Cap Cuerina con Pompón", description: "Varios colores.", price: 100000, category: "packs-por-cantidad", stock: 4 },
  {
    name: "Pack de 10 Tiradores Fluo",
    price: 30000,
    category: "packs-por-cantidad",
    variants: [
      { attribute: "Color", value: "Amarillo", stock: 5 },
      { attribute: "Color", value: "Fucsia", stock: 5 },
      { attribute: "Color", value: "Naranja", stock: 5 },
      { attribute: "Color", value: "Verde", stock: 5 },
    ],
  },
  { name: "Pack de 10 Vinchas Crisantemo Fluo Surtidas", price: 90000, category: "packs-por-cantidad", stock: 3 },
  {
    name: "Pack de Barras de Goma Espuma Multicolor",
    price: 75000,
    category: "packs-por-cantidad",
    variants: [
      { attribute: "Cantidad", value: "x50", stock: 4 },
      { attribute: "Cantidad", value: "x100", price: 150000, stock: 3 },
    ],
  },
  { name: "Pack por 10 Guapos Tela Fluo con LED Multicolor", price: 56000, category: "packs-por-cantidad", stock: 3 },
  { name: "Pack x 10 Cap Trucker Combinadas Frente Blanco", price: 40000, category: "packs-por-cantidad", stock: 4 },
  { name: "Pack de 100 Gorro Cap Red Fluo Surtidas", price: 400000, category: "packs-por-cantidad", stock: 2 },

  // --- Decoración > Productos para Decoración ---
  {
    name: "Globos Mylar Metalizados 18 Pulgadas",
    price: 800,
    category: "productos-para-decoracion",
    variants: [
      { attribute: "Forma", value: "Estrella", stock: 30 },
      { attribute: "Forma", value: "Corazón", stock: 30 },
      { attribute: "Forma", value: "Redondos", stock: 30 },
    ],
  },
  { name: "Velas Luminosas Multicolor", description: "Ideales para decorar.", price: 400, category: "productos-para-decoracion", stock: 60 },
];

async function main() {
  console.log("Seed: limpiando datos existentes…");
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

  console.log("Seed: categorías…");
  const categoryIdBySlug = new Map<string, string>();

  for (let i = 0; i < CATEGORY_TREE.length; i++) {
    const top = CATEGORY_TREE[i];
    const created = await prisma.category.create({
      data: { name: top.name, slug: slug(top.name), order: i },
    });
    categoryIdBySlug.set(created.slug, created.id);

    for (let j = 0; j < (top.children ?? []).length; j++) {
      const child = top.children![j];
      const createdChild = await prisma.category.create({
        data: {
          name: child.name,
          slug: slug(child.name),
          order: j,
          parentId: created.id,
        },
      });
      categoryIdBySlug.set(createdChild.slug, createdChild.id);
    }
  }

  console.log("Seed: productos…");
  for (const p of PRODUCTS) {
    const categoryId = categoryIdBySlug.get(p.category);
    if (!categoryId) {
      throw new Error(`Categoría no encontrada: ${p.category} (producto ${p.name})`);
    }
    const productSlug = slug(p.name);

    await prisma.product.create({
      data: {
        name: p.name,
        slug: productSlug,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        stock: p.variants ? 0 : (p.stock ?? 10),
        featured: !!p.featured,
        onSale: !!p.onSale,
        categoryId,
        images: { create: [{ url: `placeholder:${productSlug}`, alt: p.name, order: 0 }] },
        variants: p.variants
          ? {
              create: p.variants.map((v) => ({
                attribute: v.attribute,
                value: v.value,
                price: v.price,
                stock: v.stock,
              })),
            }
          : undefined,
      },
    });
  }

  console.log("Seed: configuración del negocio…");
  await prisma.settings.create({
    data: {
      id: 1,
      businessName: "BAFX Cotillón",
      email: "info@bafx.com.ar",
      phone: "(54-11) 4864-3317",
      whatsapp: "+5411 4491-6091",
      address: "Jerónimo Salguero 1166 (entre Av. Córdoba y Cabrera)",
      city: "Palermo, Ciudad Autónoma de Buenos Aires, Argentina",
      hours: "Lunes a viernes de 10 a 17 h",
      instagram: "@BAFX_COTILLON",
      facebook: "Cotillón BAFX",
      shippingInfo:
        "Envíos a todo el país una vez acreditado el pago. El costo se coordina según destino.",
      pickupInfo: "Retiro sin cargo en el showroom de Palermo, de lunes a viernes de 10 a 17 h.",
      aboutText:
        "30 años vistiendo la fiesta de todo el país: el mayor surtido de cotillón, disfraces y accesorios de fiesta, con fabricación propia e importación directa.",
    },
  });

  console.log("Seed: usuario admin…");
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@bafx.com.ar";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Bafx2026!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.adminUser.create({
    data: {
      email: adminEmail,
      passwordHash,
      name: "Administrador BAFX",
      role: "admin",
    },
  });

  const productCount = await prisma.product.count();
  const categoryCount = await prisma.category.count();
  console.log(`Listo: ${categoryCount} categorías, ${productCount} productos.`);
  console.log(`Login admin: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
