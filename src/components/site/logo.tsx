import Image from "next/image";

/** Isologo real de BAFX (placa oscura, cuadrados en diagonal y wordmark). */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo.jpg"
      alt="BAFX"
      width={size}
      height={size}
      className={`rounded-[22%] ${className ?? ""}`}
      style={{ width: size, height: size }}
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
