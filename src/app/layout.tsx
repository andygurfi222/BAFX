import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bafx.com.ar"),
  title: {
    default: "BAFX — Cotillón, disfraces y fiesta",
    template: "%s · BAFX",
  },
  description:
    "BAFX, 30 años vistiendo tu fiesta: cotillón, disfraces, sombreros y accesorios para eventos. Comprá online, retirá en Palermo o recibí en todo el país.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${manrope.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
