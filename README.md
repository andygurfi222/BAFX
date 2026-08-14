# BAFX — plataforma nueva

E-commerce real (Next.js 16 · TypeScript · Tailwind v4 · Prisma + Postgres) construido desde cero para reemplazar el sitio actual de bafx.com.ar. Ver `DEPLOY.md` para la guía de despliegue.

## Levantar el proyecto en local

```bash
npm install
npm run dev
```

`.env` ya apunta a la base de datos Postgres real (Neon, vía Vercel Storage) — local y producción comparten los mismos datos por ahora.

Sitio: http://localhost:3000
Admin: http://localhost:3000/admin/login

Credenciales de admin (cambiarlas en `.env` / en la base antes de que el sitio sea público de verdad):

```
ADMIN_EMAIL=admin@bafx.com.ar
ADMIN_PASSWORD=Bafx2026!
```

Para volver a cargar el catálogo completo desde cero (borra y recrea todo):

```bash
node scripts/import-full-catalog.mjs
```

## Qué tiene

- **Catálogo real**: 1.550 productos migrados de bafx.com.ar (nombre, precio, descripción y foto real de cada uno — ver `scripts/scrape-bafx.mjs`), reorganizados en una taxonomía nueva de 6 familias / 29 categorías.
- **Carrito y checkout reales**, con Mercado Pago (Checkout Pro) como método de pago además de transferencia/efectivo — ver `src/lib/actions/orders.ts` y `src/app/api/webhooks/mercadopago/route.ts`.
- **Panel admin** (`/admin`) con login real: productos, categorías, pedidos y configuración del negocio, todo con CRUD real contra la base.
- **Redirecciones 301** de las URLs viejas de bafx.com.ar a las nuevas (`src/lib/legacy-redirects.ts`).
- `/terminos` y `/privacidad`: borrador legal — falta revisión de un abogado/contador antes de publicar (hay un cartel de aviso en cada página).

## Decisiones técnicas

- **Imágenes**: las 1.550 fotos del catálogo migrado viven en `public/uploads/scraped/` (versionadas en git). Las que se suban nuevas desde `/admin` van a Vercel Blob en producción, o a disco local en desarrollo — ver `src/lib/upload.ts`.
- **Storage de archivos nuevos**: si `BLOB_READ_WRITE_TOKEN` está configurado (Vercel Storage → Blob), se usa automáticamente.

## Estructura

```
src/app/(site)      rutas públicas (home, catálogo, producto, carrito, checkout)
src/app/admin        panel de administración (protegido)
src/app/api/webhooks Mercado Pago
src/lib/actions      server actions (mutaciones reales a la base de datos)
src/lib/queries      lecturas de base de datos para el sitio público y el admin
prisma/schema.prisma  modelo de datos (Postgres)
scripts/              scraping, importación del catálogo, mejora de imágenes
```
