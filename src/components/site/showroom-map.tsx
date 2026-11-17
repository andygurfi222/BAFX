/**
 * Mapa del showroom. Se arma con la dirección cargada en Configuración del
 * admin, así que si la dirección cambia, el mapa cambia solo. Al tocarlo se
 * abre esa dirección en Google Maps (en el celular, en la app de mapas).
 */
export function ShowroomMap({ address, city }: { address: string; city: string }) {
  // "Jerónimo Salguero 1166 (entre Av. Córdoba y Cabrera)" -> sin la aclaración entre paréntesis
  const street = address.replace(/\s*\([^)]*\)/g, "").trim();
  const query = `${street}, ${city}`;
  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed&hl=es`;
  const linkUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  return (
    <div className="relative mt-4 h-52 overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-sunken)]">
      <iframe
        src={embedUrl}
        title="Mapa del showroom de BAFX"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full w-full border-0"
      />
      {/* capa clickeable: todo el mapa lleva a Google Maps */}
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Abrir la dirección del showroom en Google Maps"
        className="absolute inset-0 flex items-end justify-end p-3"
      >
        <span className="rounded-full bg-[var(--color-ink)] px-3.5 py-1.5 text-xs font-semibold text-[var(--color-paper)] shadow-md">
          Abrir en Google Maps ↗
        </span>
      </a>
    </div>
  );
}
