const PALETTES = [
  ["#0A0A0A", "#EEEEEF"],
  ["#3F3F46", "#F4F4F5"],
  ["#0A0A0A", "#E4E4E7"],
  ["#52525B", "#F7F7F8"],
] as const;

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Arte de reemplazo, generado en el momento, para productos sin foto real
 * todavía. Deliberadamente no simula una fotografía — es un patrón
 * abstracto para que quede claro que falta cargar la imagen definitiva
 * desde el panel admin.
 */
export function PlaceholderArt({ seed, label }: { seed: string; label: string }) {
  const hash = hashSeed(seed);
  const [fg, bg] = PALETTES[hash % PALETTES.length];
  const dots = Array.from({ length: 6 }, (_, i) => {
    const a = (hash * (i + 3)) % 360;
    const r = 6 + ((hash >> i) % 10);
    const cx = 50 + Math.cos((a * Math.PI) / 180) * (20 + (i % 3) * 8);
    const cy = 50 + Math.sin((a * Math.PI) / 180) * (20 + (i % 3) * 8);
    return { cx, cy, r };
  });

  const initials = label
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={label}>
      <rect width="100" height="100" fill={bg} />
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={d.r / 3} fill={fg} opacity={0.5} />
      ))}
      <text
        x="50"
        y="56"
        textAnchor="middle"
        fontSize="22"
        fontWeight="700"
        fill={fg}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {initials}
      </text>
    </svg>
  );
}
