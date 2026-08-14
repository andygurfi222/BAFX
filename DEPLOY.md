# Guía de despliegue

Esta guía cubre lo que falta para pasar de "corriendo en tu compu" a "publicado en internet". Los pasos que requieren crear una cuenta o ingresar credenciales los tenés que hacer vos — no es algo que pueda hacer por vos un asistente de IA.

## 1. Subir el código a GitHub

```bash
git add .
git commit -m "BAFX — plataforma nueva"
```

Creá un repositorio en [github.com/new](https://github.com/new) (puede ser privado) y seguí las instrucciones para conectar este repo local:

```bash
git remote add origin https://github.com/TU-USUARIO/bafx.git
git branch -M main
git push -u origin main
```

## 2. Base de datos: pasar de SQLite a Postgres

En desarrollo usamos SQLite (cero configuración). En producción hace falta Postgres — cualquiera de estas opciones tiene plan gratuito y anda bien con este proyecto:

- **Vercel Postgres** (más simple si ya vas a hostear en Vercel — se conecta solo)
- **Neon** (neon.tech)
- **Supabase** (supabase.com)

Pasos:

1. Creá la base en el proveedor que elijas y copiá la `DATABASE_URL` que te dan (con formato `postgresql://...`).
2. En `prisma/schema.prisma`, cambiá:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
   por:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Corré las migraciones contra la base nueva:
   ```bash
   npx prisma migrate deploy
   ```
4. Cargá los datos reales del catálogo:
   ```bash
   npx tsx prisma/seed.ts
   # o, si querés el catálogo completo de 1550 productos:
   node scripts/import-full-catalog.mjs
   ```

## 3. Storage de imágenes

En local, las imágenes subidas desde `/admin` se guardan en `public/uploads/`. En un hosting serverless como Vercel el filesystem no persiste entre despliegues, así que hace falta storage real. El código ya está preparado para **Vercel Blob** (`src/lib/upload.ts`) — solo hace falta:

1. En el dashboard de Vercel, dentro del proyecto: **Storage → Create Database → Blob**.
2. Eso genera automáticamente la variable de entorno `BLOB_READ_WRITE_TOKEN` en el proyecto — no hay que hacer nada más de código.

Nota: las 1.550 fotos del catálogo migrado (`public/uploads/scraped/`) sí viajan como parte del deploy porque están en el repo — esas andan bien tal cual. Blob es solo para lo que se suba nuevo desde el admin después.

## 4. Variables de entorno en producción

Configurar en el dashboard de Vercel (Settings → Environment Variables):

| Variable | Valor |
|---|---|
| `DATABASE_URL` | la de Postgres del paso 2 |
| `SESSION_SECRET` | una cadena random nueva (`openssl rand -base64 32`) — **no reutilizar la de desarrollo** |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | solo se usan para el seed inicial; una vez creado el usuario admin real desde la base, no hace falta mantenerlas |
| `NEXT_PUBLIC_SITE_URL` | `https://www.bafx.com.ar` (el dominio real) |
| `MERCADOPAGO_ACCESS_TOKEN` | credencial real (o de test) desde el panel de Mercado Pago |
| `MERCADOPAGO_WEBHOOK_SECRET` | secreto de firma del webhook, mismo panel |
| `BLOB_READ_WRITE_TOKEN` | la genera Vercel solo al crear el Blob Store (paso 3) |

## 5. Desplegar en Vercel

1. Entrá a [vercel.com/new](https://vercel.com/new) e importá el repositorio de GitHub del paso 1.
2. Vercel detecta que es Next.js automáticamente — no hace falta tocar nada del build.
3. Cargá las variables de entorno del paso 4 antes de darle a "Deploy".

## 6. Dominio propio

Una vez desplegado, en el proyecto de Vercel: **Settings → Domains** → agregar `bafx.com.ar` y `www.bafx.com.ar`. Vercel te da los registros DNS exactos que hay que cargar donde esté registrado el dominio hoy.

## 7. Mercado Pago

1. Entrá a [mercadopago.com.ar/developers/panel](https://www.mercadopago.com.ar/developers/panel) con la cuenta de Mercado Pago de BAFX.
2. Creá una aplicación → copiá el **Access Token de producción** (o el de test, para probar antes de ir en vivo) → pegalo en `MERCADOPAGO_ACCESS_TOKEN`.
3. En la misma app, sección **Webhooks**, agregá la URL `https://www.bafx.com.ar/api/webhooks/mercadopago` y copiá la **clave secreta** a `MERCADOPAGO_WEBHOOK_SECRET`.
4. Probá una compra real (o con una tarjeta de test si usás credenciales de test) antes de anunciar el sitio.

## 8. Antes de anunciar el lanzamiento

- [ ] Cambiar `ADMIN_PASSWORD` por una contraseña real y fuerte (hoy es `Bafx2026!`, la de desarrollo).
- [ ] Revisar `/terminos` y `/privacidad` con un abogado/contador y completar los datos societarios marcados.
- [ ] Cargar el stock real de al menos los productos más vendidos (hoy todos arrancan en 10 unidades de forma pareja).
- [ ] Hacer una compra de prueba de punta a punta en producción.
- [ ] Confirmar que las redirecciones desde las URLs viejas de bafx.com.ar funcionan (`/32pXXXX-...`, `/32cXX-...`).
