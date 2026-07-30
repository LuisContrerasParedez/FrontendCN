# Centra Norte Web

Frontend público de Centra Norte construido con React 19, Vite 8 y React Router. Este proyecto contiene únicamente código cliente; no accede a bases de datos ni implementa endpoints.

Los datos dinámicos se obtienen de `WS_PaginaCN`, la API PHP ubicada como proyecto hermano.

## Requisitos

- Node.js 20.19+ (o una versión compatible posterior).
- PHP 8.1+ y `WS_PaginaCN` configurado para disponer de contenido dinámico.

## Desarrollo local

Inicia primero la API:

```powershell
Set-Location ..\WS_PaginaCN
php -S 127.0.0.1:8080 router.php
```

En otra terminal inicia el frontend:

```powershell
Set-Location ..\FrontendPaginaCN
npm.cmd ci
npm.cmd run dev
```

Vite abre el sitio en `http://127.0.0.1:5173` y redirige `/api` a la API PHP en `http://127.0.0.1:8080`.

## Variables de entorno

Los perfiles están separados de forma explícita:

- `.env`: configuración de producción usada por `npm run build`.
- `.env.local`: configuración privada de desarrollo usada por `npm run dev`.
- `.env.example` y `.env.local.example`: plantillas sin secretos.

Para preparar una instalación nueva:

```powershell
Copy-Item .env.example .env
Copy-Item .env.local.example .env.local
```

Variables disponibles:

- `VITE_API_PROXY_TARGET`: origen local de `WS_PaginaCN` usado por el proxy de desarrollo.
- `VITE_API_BASE_URL`: URL pública de la API. Producción usa `https://wspagina.centranorte.com.gt/api`.
- `VITE_SITE_URL`: origen canónico utilizado por SEO.

El cargador de Vite está configurado para que producción lea exclusivamente
`.env`; la presencia de `.env.local` en una estación de trabajo no puede
sobrescribir el build productivo. En desarrollo se toma `.env` como base y
`.env.local` aplica únicamente los valores locales.

Nunca se deben definir credenciales, secretos ni datos de conexión en variables `VITE_*`: Vite las incluye en el JavaScript público.

## Integración HTTP

Los servicios de `src/services` consumen estos recursos de `WS_PaginaCN`:

| Contenido | Endpoint |
| --- | --- |
| Directorio de locales | `GET /api/locales?pagina=1&limite=12` |
| Carrusel de locales | `GET /api/locales/carrusel?limite=12` |
| Detalle de un local | `GET /api/locales/{codigo}` |
| Categorías de locales | `GET /api/categorias` |
| Eventos | `GET /api/eventos` |
| Promociones | `GET /api/promociones` |
| Rutas principales, destinos y empresas de buses | `GET /api/rutas` |
| Tema de inicio | `GET /api/tema-inicio` |

La API devuelve objetos y arreglos JSON directamente. Los locales paginan en el servidor: la respuesta trae `datos` y `paginacion`, y la ficha de un local se pide a su propia ruta, así que abrir el enlace directo o recargar no depende del listado. Las demás fichas individuales todavía se resuelven en el cliente a partir de su listado porque la API pública no expone rutas de detalle para ellas.

## Validación

```powershell
npm.cmd run check
npm.cmd run security:scan
```

`security:scan` confirma, entre otras cosas, que no exista una carpeta `api`, archivos PHP/SQL ni referencias a configuración de base de datos dentro del frontend o de `dist`.

## Despliegue

El build genera solamente archivos estáticos:

```powershell
npm.cmd run build
```

En producción, `WS_PaginaCN` se publica en el `public_html` independiente de `wspagina.centranorte.com.gt`. El frontend se conecta por HTTPS y CORS; la API nunca se copia ni se conserva dentro del destino del frontend.

El flujo opcional de publicación SSH se documenta en [README-DESPLIEGUE.md](./README-DESPLIEGUE.md).
