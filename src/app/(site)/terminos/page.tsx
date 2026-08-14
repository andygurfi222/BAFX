import type { Metadata } from "next";
import Link from "next/link";
import { LegalDisclaimer } from "@/components/site/legal-disclaimer";
import { getSettings } from "@/lib/queries";

export const metadata: Metadata = { title: "Términos y Condiciones" };

export default async function TerminosPage() {
  const settings = await getSettings();

  return (
    <div className="container-page max-w-2xl py-16">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-faint)]">Legal</span>
      <h1 className="mt-2 font-display text-3xl font-bold">Términos y Condiciones</h1>

      <div className="mt-6">
        <LegalDisclaimer />
      </div>

      <div className="flex flex-col gap-8 text-sm leading-relaxed text-[var(--color-ink-soft)]">
        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-[var(--color-ink)]">1. Quiénes somos</h2>
          <p>
            El presente sitio (en adelante, &ldquo;el Sitio&rdquo;) es operado por <strong>{settings.businessName}</strong>,{" "}
            <span className="bg-[var(--color-warn-soft)] px-1">[RAZÓN SOCIAL A COMPLETAR]</span>, CUIT{" "}
            <span className="bg-[var(--color-warn-soft)] px-1">[A COMPLETAR]</span>, con domicilio legal en{" "}
            <span className="bg-[var(--color-warn-soft)] px-1">[DOMICILIO LEGAL A COMPLETAR]</span> (showroom en{" "}
            {settings.address}, {settings.city}).
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-[var(--color-ink)]">2. Objeto</h2>
          <p>
            Estos Términos regulan el uso del Sitio y la compra de los productos de cotillón, disfraces y
            accesorios de fiesta que ofrece {settings.businessName}. Al usar el Sitio o realizar un pedido,
            el usuario acepta estos Términos y la Política de Privacidad.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-[var(--color-ink)]">3. Proceso de compra</h2>
          <p>
            El usuario selecciona productos, los agrega al carrito y completa sus datos de contacto y
            entrega en el checkout. La confirmación de un pedido no implica su aceptación automática:{" "}
            {settings.businessName} se comunica luego por WhatsApp o email para confirmar stock, coordinar
            el pago y la entrega. El pedido queda perfeccionado cuando el pago es acreditado.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-[var(--color-ink)]">4. Precios y medios de pago</h2>
          <p>
            Los precios se muestran en pesos argentinos (ARS) e incluyen los impuestos aplicables, salvo
            que se indique lo contrario. Pueden modificarse sin previo aviso, pero el precio válido para un
            pedido ya confirmado es el vigente al momento de la compra. Los medios de pago disponibles se
            informan en el checkout.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-[var(--color-ink)]">5. Envíos y retiro</h2>
          <p>{settings.shippingInfo} {settings.pickupInfo}</p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-[var(--color-ink)]">
            6. Derecho de arrepentimiento
          </h2>
          <p>
            De acuerdo con el artículo 34 de la Ley 24.240 de Defensa del Consumidor y la normativa vigente
            para comercio electrónico, el usuario tiene derecho a revocar la compra dentro de los{" "}
            <strong>10 (diez) días corridos</strong> desde que recibe el producto, sin costo ni necesidad de
            justificar el motivo, siempre que el producto no haya sido usado y se conserve en su embalaje
            original. Para ejercer este derecho, debe contactarse por los medios indicados en la sección{" "}
            <Link href="/contacto" className="underline">Contacto</Link>.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-[var(--color-ink)]">7. Cambios y devoluciones</h2>
          <p>
            Fuera del derecho de arrepentimiento, los cambios por fallas de fabricación se coordinan
            directamente con {settings.businessName} dentro de los plazos y condiciones que se informen al
            momento de la compra.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-[var(--color-ink)]">8. Propiedad intelectual</h2>
          <p>
            Las imágenes, textos, logos y contenidos del Sitio son propiedad de {settings.businessName} o de
            terceros que autorizaron su uso, y no pueden reproducirse sin autorización.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-[var(--color-ink)]">9. Modificaciones</h2>
          <p>
            {settings.businessName} puede modificar estos Términos en cualquier momento. Los cambios rigen
            desde su publicación en el Sitio.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-[var(--color-ink)]">10. Jurisdicción</h2>
          <p>
            Estos Términos se rigen por las leyes de la República Argentina. Ante cualquier controversia,
            las partes se someten a los tribunales ordinarios competentes de{" "}
            <span className="bg-[var(--color-warn-soft)] px-1">[JURISDICCIÓN A COMPLETAR]</span>, sin
            perjuicio de las normas de protección al consumidor que resulten aplicables.
          </p>
        </section>
      </div>
    </div>
  );
}
