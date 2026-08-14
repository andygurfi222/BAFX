import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/checkout", "/pedido"] },
    ],
    sitemap: "https://www.bafx.com.ar/sitemap.xml",
  };
}
