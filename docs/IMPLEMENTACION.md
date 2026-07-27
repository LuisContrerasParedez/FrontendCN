# Arquitectura del frontend

## Separación de responsabilidades

`FrontendPaginaCN` es una aplicación cliente React/Vite. No contiene controladores, consultas SQL, credenciales, conexión a base de datos ni endpoints propios. Toda lectura dinámica se delega a `WsPaginaCN` mediante HTTP.

- `src/pages`: rutas y composición de pantallas.
- `src/components`: interfaz reutilizable.
- `src/services`: cliente HTTP y adaptación del contrato público de `WsPaginaCN` al modelo visual existente.
- `src/hooks`: estado y actualización periódica del cliente.
- `src/theme`: aplicación segura del tema devuelto por la API.

## Contrato con WsPaginaCN

`apiClient.js` acepta respuestas JSON directas y errores NestJS con `message`. También admite respuestas `204 No Content`, necesarias cuando no hay un tema configurado.

Los endpoints de colección son la única fuente de contenido dinámico. Como la API no ofrece rutas de detalle, el frontend busca por código dentro de las colecciones en caché. Locales solicita explícitamente el límite máximo público de 100 registros.

El antiguo endpoint de versión de contenido no existe en `WsPaginaCN`. En su lugar, el cliente actualiza los datos cada 60 segundos mientras la pestaña está visible y existe conexión; la caché local evita solicitudes repetidas durante 45 segundos.

## Contenido estático

La configuración institucional, navegación, textos editoriales y enlaces que no existen en el contrato público permanecen como constantes del frontend. No constituyen lógica de servidor y no acceden a recursos privados.

## Despliegue

Vite genera un paquete estático. En desarrollo, su proxy envía `/api` a NestJS en el puerto 3000. En producción, esa misma ruta debe resolverse mediante el proxy inverso de la infraestructura antes del fallback de React Router.
