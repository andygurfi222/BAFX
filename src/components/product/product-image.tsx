import Image from "next/image";
import { PlaceholderArt } from "@/components/product/placeholder-art";

export function ProductImage({
  url,
  alt,
  seed,
  sizes,
  fill = true,
  quality = 90,
  className,
}: {
  url?: string | null;
  alt: string;
  seed: string;
  sizes?: string;
  fill?: boolean;
  quality?: number;
  className?: string;
}) {
  if (!url || url.startsWith("placeholder:")) {
    return <PlaceholderArt seed={seed} label={alt} />;
  }
  return (
    <Image
      src={url}
      alt={alt}
      fill={fill}
      sizes={sizes}
      quality={quality}
      className={className ?? "object-cover"}
    />
  );
}
