import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // las fotos de producto se re-procesan a buena calidad (ver
    // scripts/enhance-images.mjs) — permitimos que next/image las sirva
    // sin degradarlas con la compresión por defecto (75).
    qualities: [75, 90],
    // fotos subidas desde /admin cuando el storage es Vercel Blob (ver src/lib/upload.ts)
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;
