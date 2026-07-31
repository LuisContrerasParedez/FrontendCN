# Despliegue del frontend de Centra Norte

Este proyecto publica exclusivamente el build estático de React/Vite mediante OpenSSH. `WS_PaginaCN` es un servicio PHP independiente y no forma parte del paquete.

## Configuración local

- `.tools/deploy.local.ps1`: configuración real del destino; está ignorada.
- `.tools/deploy.local.example.ps1`: plantilla sin datos reales.
- `despliegueProduccion.ps1`: flujo independiente para publicar el dominio principal.
- `.tools/despliegueProduccion.local.ps1`: destino privado del flujo de producción; está ignorado.
- `.tools/despliegueProduccion.local.example.ps1`: plantilla del destino de producción.
- `deploy.ps1`: build, validación, respaldo, publicación y pruebas HTTP.
- `rollback.ps1`: restauración validada de respaldos remotos.

La clave SSH debe permanecer fuera del proyecto. No guardes su contenido ni su passphrase en ningún archivo del repositorio.

## Requisitos del servidor

1. El dominio debe tener un certificado TLS válido.
2. `WS_PaginaCN` debe estar publicado en el `public_html` independiente de `wspagina.centranorte.com.gt`.
3. La API debe permitir exclusivamente el origen definido por `VITE_SITE_URL` en `CORS_ORIGINS`.
4. La ruta pública configurada debe aceptar archivos estáticos y reglas de `.htaccess`.

La configuración, credenciales y proceso de la API se administran únicamente desde `WS_PaginaCN`.

El despliegue existente conserva sus archivos y su configuración. Para publicar
el frontend en el dominio principal se usa exclusivamente:

```powershell
.\despliegueProduccion.ps1 -DryRun
.\despliegueProduccion.ps1
```

También puede iniciarse con `publicar-produccion.cmd`. Este flujo utiliza rutas
temporales, estado y configuración separados de `deploy.ps1`. Durante la primera
publicación, `PersistentSourcePath` copia las imágenes administradas del sitio
actual al dominio principal sin modificar el origen; si ya existen archivos en
producción, estos tienen prioridad.

Antes de publicar el frontend, el despliegue existente de `WS_PaginaCN` debe
actualizar su configuración con ambos orígenes separados por coma:
`CORS_ORIGINS=https://paginabeta.centranorte.com.gt,https://centranorte.com.gt`.
El nuevo flujo comprueba el encabezado del dominio principal después de activar
el frontend y restaura automáticamente la versión anterior si la API no lo autoriza.

## Prueba sin publicar

```powershell
.\deploy.ps1 -DryRun
```

La prueba instala dependencias, audita paquetes, compila, valida `dist`, analiza secretos y crea un paquete que contiene solamente archivos estáticos y `.htaccess`.

Para reutilizar un build existente:

```powershell
.\deploy.ps1 -DryRun -SkipBuild
```

## Publicar

```powershell
.\deploy.ps1
```

El proceso crea un respaldo de la versión activa, prepara staging, conserva `imagenes`, activa la versión de manera atómica y comprueba rutas React y endpoints de `WS_PaginaCN`. Si una prueba falla, intenta restaurar automáticamente la versión anterior.

## Rollback

```powershell
.\rollback.ps1 -List
.\rollback.ps1
.\rollback.ps1 -Version 20260721-143000
```

Antes de reemplazar el sitio, rollback respalda la versión que se encuentra activa.

## Contenido del paquete

Se incluyen únicamente:

- `index.html` y `Default.html`;
- `assets`, `robots.txt`, `sitemap.xml`, favicon y otros archivos públicos de Vite;
- `.htaccess`.

No se incluyen `src`, `node_modules`, `.env*`, claves, scripts, una carpeta `api`, ejecutables de servidor ni configuración de base de datos. El único directorio remoto persistente del frontend es `imagenes`.

No hay archivos de ejecución del frontend que deban copiarse manualmente a una carpeta privada del servidor. El despliegue crea staging y respaldos fuera de `public_html`; `.env`, `.env.local`, `.tools/deploy.local.ps1` y la clave SSH permanecen solo en el equipo local. El build productivo lee únicamente `.env`, aunque `.env.local` exista en la estación de desarrollo.

## Diagnóstico

- Si las páginas cargan pero no muestran datos, comprueba que `/api/locales?limite=1` devuelva JSON desde `WS_PaginaCN`.
- Si aparece HTML como respuesta de la API, el fallback de la SPA está capturando `/api`; corrige el orden de las reglas del proxy.
- Si falla una ruta React al recargar, verifica que `.htaccess` esté activo.
- Si falla SSH, confirma la huella, la clave registrada y la ruta configurada.
