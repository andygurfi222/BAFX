import { notFound, permanentRedirect } from "next/navigation";
import { resolveLegacyPath } from "@/lib/legacy-redirects";
import { getProductBySku } from "@/lib/queries";

/**
 * Atrapa cualquier URL que no matchee ninguna ruta real. Si coincide con el
 * patrón de una URL vieja de bafx.com.ar (producto, categoría o página
 * institucional), redirige de forma permanente (308) a su equivalente en el
 * sitio nuevo — así no se pierden los links ya indexados en Google ni los
 * que la gente tenga guardados. Si no matchea nada conocido, 404 real.
 */
export default async function LegacyCatchAllPage({
  params,
}: {
  params: Promise<{ legacyPath: string[] }>;
}) {
  const { legacyPath } = await params;
  const resolved = resolveLegacyPath(legacyPath);

  if (!resolved) notFound();

  if (resolved.startsWith("__product__")) {
    const legacyId = resolved.replace("__product__", "");
    const product = await getProductBySku(`BAFX-${legacyId}`);
    if (!product) notFound();
    permanentRedirect(`/producto/${product.slug}`);
  }

  permanentRedirect(resolved);
}
