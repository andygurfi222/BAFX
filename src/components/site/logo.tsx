import Image from "next/image";

/**
 * Isologo real de BAFX (archivo original en public/logo.jpg, 320x264).
 * `size` es el alto en px; el ancho se calcula solo para no deformarlo.
 */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo.jpg"
      alt="BAFX"
      width={320}
      height={264}
      quality={90}
      className={`rounded-[10%] ${className ?? ""}`}
      style={{ height: size, width: "auto" }}
      priority
    />
  );
}

export function Logo({ size = 32, className, withWordmark = true }: { size?: number; className?: string; withWordmark?: boolean }) {
  if (!withWordmark) return <LogoMark size={size} className={className} />;
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoMark size={size} />
      <span className="font-display text-xl font-extrabold tracking-tight">BAFX</span>
    </span>
  );
}
