export function LegalDisclaimer() {
  return (
    <div className="mb-10 rounded-xl border border-[var(--color-warn)] bg-[var(--color-warn-soft)] px-5 py-4 text-sm text-[var(--color-ink)]">
      <strong className="block">Borrador — falta revisión legal.</strong>
      <p className="mt-1 text-[var(--color-ink-soft)]">
        Este texto es una base general de e-commerce en Argentina, no reemplaza el asesoramiento de un
        abogado o contador. Antes de publicar el sitio, hay que completar los datos societarios (razón
        social, CUIT, domicilio legal) marcados abajo y pedirle a un profesional que lo revise.
      </p>
    </div>
  );
}
