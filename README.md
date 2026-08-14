# BAFX — plataforma nueva

E-commerce real (Next.js 16 · TypeScript · Tailwind v4 · Prisma) construido desde cero para reemplazar el sitio actual de bafx.com.ar. Ver el documento de Fase 0 para el detalle de la auditoría y la arquitectura.

## Levantar el proyecto

```bash
npm install
npm run db:seed   # crea la base SQLite, categorías, productos reales y el usuario admin
npm run dev
```

Sitio: http://localhost:3000
Admin: http://localhost:3000/admin/login

Credenciales de admin (definidas en `.env`, cambiarlas antes de producción):

```
ADMIN_EMAIL=admin@bafx.com.ar
ADMIN_PASSWORD=Bafx2026!
```

## Decisiones técnicas a confirmar antes de producción

- **Base de datos**: SQLite en desarrollo (cero dependencias externas). El esquema es Postgres-compatible: para producción, cambiar `provider` en `prisma/schema.prisma` a `postgresql` y `DATABASE_URL` en `.env`.
- **Imágenes**: los productos migrados desde el sitio actual usan un placeholder generado (el sitio viejo solo tenía miniaturas de ~150px). Las imágenes subidas desde `/admin` se guardan en `public/uploads/` — funciona en desarrollo, pero en un host serverless (Vercel, etc.) el filesystem es efímero. Antes de desplegar a producción, reemplazar `saveProductImage` en `src/lib/upload.ts` por un proveedor real (S3, Cloudinary, Vercel Blob).
- **Pago**: el checkout genera un pedido real en la base de datos con método "transferencia" o "efectivo", igual que el flujo actual de BAFX (sin pasarela online). Queda preparado para integrar Mercado Pago u otra pasarela como un método de pago adicional.
- **Catálogo semilla**: `prisma/seed.ts` contiene ~100 productos reales relevados del sitio actual, reorganizados en la nueva taxonomía. Es una muestra representativa, no el catálogo completo — se puede seguir cargando desde `/admin/productos/nuevo` o ampliando el seed.

## Estructura

```
src/app/(site)     rutas públicas (home, catálogo, producto, carrito, checkout)
src/app/admin       panel de administración (protegido)
src/lib/actions     server actions (mutaciones reales a la base de datos)
src/lib/queries     lecturas de base de datos para el sitio público y el admin
prisma/schema.prisma  modelo de datos
prisma/seed.ts        datos reales de arranque
```
