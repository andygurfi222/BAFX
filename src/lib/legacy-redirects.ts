/**
 * Mapa de URLs del sitio viejo (bafx.com.ar / Neostore) a la sección
 * equivalente del sitio nuevo. Se usa desde `[...legacyPath]/page.tsx` para
 * redirigir de forma permanente (308) en vez de romper los links que ya
 * están indexados en Google o compartidos por ahí.
 *
 * Debe reflejar el mismo criterio que scripts/import-full-catalog.mjs
 * (TOP_LEVEL_MAP) — si se agrega o reordena una categoría ahí, replicar acá.
 */
export const LEGACY_CATEGORY_TO_NEW: Record<string, string> = {
  "32c9-anteojos": "anteojos-y-antifaces",
  "32c23-antifaz": "anteojos-y-antifaces",
  "32c49-coronas": "coronas",
  "32c27-cotillón-animales": "tematicas-de-fiesta",
  "32c30-cotillon-animal-print": "tematicas-de-fiesta",
  "32c18-cotillon-arabe": "tematicas-de-fiesta",
  "32c21-cotillon-argentina-": "tematicas-de-fiesta",
  "32c48-cotillon-emoji": "tematicas-de-fiesta",
  "32c4-cotillon-fluo": "tematicas-de-fiesta",
  "32c7-cotillon-futbolero": "futbol",
  "32c29-cotillon-hawaii": "tematicas-de-fiesta",
  "32c28-cotillon-hipster": "tematicas-de-fiesta",
  "32c43-cotillon-lluvia": "tematicas-de-fiesta",
  "32c32-cotillon-love": "tematicas-de-fiesta",
  "32c1-cotillon-luminoso": "cotillon-luminoso",
  "32c5-cotillon-ochentoso": "tematicas-de-fiesta",
  "32c31-cotillon-primavera": "tematicas-de-fiesta",
  "32c38-cotillon-quimico": "cotillon-luminoso",
  "32c20-cotillon-reggae": "tematicas-de-fiesta",
  "32c6-cotillon-reggaeton": "tematicas-de-fiesta",
  "32c8-cotillon-veneciano": "tematicas-de-fiesta",
  "32c13-cotillon-xxx": "tematicas-de-fiesta",
  "32c11-disfraces": "disfraces",
  "32c39-globos": "globos",
  "32c53-guantes": "guantes",
  "32c17-halloween": "halloween",
  "32c14-inflables": "inflables",
  "32c55-navidad-": "navidad",
  "32c47-novedades-2026": "novedades-de-temporada",
  "32c2-pelucas": "pelucas",
  "32c52-personajes": "personajes",
  "32c3-plumas": "plumas",
  "32c12-productos-para-decoracion": "productos-para-decoracion",
  "32c51-san-patricios": "san-patricio",
  "32c10-sombreros": "sombreros",
  "32c50-tanda-fashion": "combos-por-evento",
  "32c56-tanda-gold-dorada": "combos-por-evento",
  "32c24-tanda-invierno-": "combos-por-evento",
  "32c58-tanda-peluche": "combos-por-evento",
  "32c54-tanda-pink-bresh-barbie": "combos-por-evento",
  "32c57-tanda-silver-plata": "combos-por-evento",
  "32c42-tanda-summer": "combos-por-evento",
  "32c16-varios": "varios",
  "32c26-vinchas": "vinchas",
  "32c22-white-fest---tanda-blanca": "combos-por-evento",
  "32c35-z-packs": "packs-por-cantidad",
  "32c25-z-super-ofertas-del-mes": "varios",
};

/** Páginas institucionales / de flujo del sitio viejo -> ruta nueva equivalente. */
export const LEGACY_STATIC_PAGES: Record<string, string> = {
  "32a-quienes-somos": "/nosotros",
  "32b-como-comprar": "/contacto",
  "32c-destacados": "/catalogo",
  "32d-preguntas-frecuentes": "/contacto",
  "32e-contáctenos": "/contacto",
  "32e-contactenos": "/contacto",
  "32f-novedades": "/catalogo",
  "32-registro.php": "/checkout",
  "32-recup_pwd.php": "/contacto",
  "32-carro.php": "/catalogo",
  "32-pedido.php": "/checkout",
};

export function resolveLegacyPath(segments: string[]): string | null {
  if (segments.length === 0) return null;
  const first = decodeURIComponent(segments[0]).toLowerCase();

  const staticPage = LEGACY_STATIC_PAGES[first];
  if (staticPage) return staticPage;

  const productMatch = first.match(/^32p(\d+)-/);
  if (productMatch) return `__product__${productMatch[1]}`;

  const categoryMatch = LEGACY_CATEGORY_TO_NEW[first];
  if (categoryMatch) return `/categoria/${categoryMatch}`;

  return null;
}
