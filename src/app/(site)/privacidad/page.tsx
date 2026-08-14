import type { Metadata } from "next";
import { LegalDisclaimer } from "@/components/site/legal-disclaimer";
import { getSettings } from "@/lib/queries";

export const metadata: Metadata = { title: "Política de Privacidad" };

export default async function PrivacidadPage() {
  const settings = await getSettings();

  return (
    <div className="container-page max-w-2xl py-16">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-faint)]">Legal</span>
      <h1 className="mt-2 font-display text-3xl font-bold">Política de Privacidad</h1>

      <div className="mt-6">
        <LegalDisclaimer />
      </div>

      <div className="flex flex-col gap-8 text-sm leading-relaxed text-[var(--color-ink-soft)]">
        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-[var(--color-ink)]">1. Responsable</h2>
          <p>
            <strong>{settings.businessName}</strong>,{" "}
            <span className="bg-[var(--color-warn-soft)] px-1">[RAZÓN SOCIAL / CUIT A COMPLETAR]</span>, es
            responsable del tratamiento de los datos personales que se recaban a través de este sitio, en
            los términos de la Ley 25.326 de Protección de los Datos Personales.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-[var(--color-ink)]">2. Qué datos recabamos</h2>
          <p>
            Al realizar un pedido pedimos nombre, apellido, email, teléfono y, si corresponde, dirección de
            envío, ciudad, código postal y DNI. No pedimos datos de tarjetas ni información bancaria a
            través del Sitio.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-[var(--color-ink)]">3. Para qué los usamos</h2>
          <ul className="list-disc pl-5">
            <li>Procesar y coordinar el pedido (confirmación, pago, entrega).</li>
            <li>Comunicarnos por email, teléfono o WhatsApp sobre el estado de la compra.</li>
            <li>Cumplir obligaciones legales e impositivas.</li>
            <li>Mejorar el catálogo y la atención al cliente.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-[var(--color-ink)]">4. Con quién los compartimos</h2>
          <p>
            No vendemos ni cedemos datos personales a terceros con fines comerciales. Solo se comparten con
            proveedores estrictamente necesarios para operar (por ejemplo, un servicio de envíos o una
            pasarela de pago), y únicamente los datos indispensables para esa tarea.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-[var(--color-ink)]">
            5. Derechos de acceso, rectificación y supresión
          </h2>
          <p>
            El titular de los datos tiene derecho a acceder, rectificar, actualizar o solicitar la
            supresión de sus datos personales, conforme al artículo 14 de la Ley 25.326. Para ejercer estos
            derechos puede escribir a{" "}
            <a href={`mailto:${settings.email}`} className="underline">{settings.email}</a>. La Agencia de
            Acceso a la Información Pública, Órgano de Control de la Ley 25.326, tiene la atribución de
            atender denuncias y reclamos que interpongan quienes resulten afectados en sus derechos.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-[var(--color-ink)]">6. Cookies</h2>
          <p>
            El Sitio usa cookies técnicas indispensables para el funcionamiento del carrito de compras. No
            usamos cookies de seguimiento publicitario de terceros{" "}
            <span className="bg-[var(--color-warn-soft)] px-1">
              [actualizar si se agrega Google Analytics / Meta Pixel u otro servicio de medición]
            </span>.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-[var(--color-ink)]">7. Seguridad</h2>
          <p>
            Tomamos medidas razonables para proteger los datos personales contra pérdida, uso indebido o
            acceso no autorizado. Las contraseñas del panel administrativo se almacenan encriptadas.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-[var(--color-ink)]">8. Contacto</h2>
          <p>
            Ante cualquier consulta sobre esta política, escribinos a{" "}
            <a href={`mailto:${settings.email}`} className="underline">{settings.email}</a> o por WhatsApp
            al {settings.whatsapp}.
          </p>
        </section>
      </div>
    </div>
  );
}
