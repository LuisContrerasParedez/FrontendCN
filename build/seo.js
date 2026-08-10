import { readFile, writeFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { URL } from 'node:url';

// Rutas estaticas del SPA. Cada una se publica como su propio documento HTML
// con canonical, titulo y descripcion propios, porque Googlebot indexa a partir
// del HTML crudo de la primera respuesta: el canonical que Seo.jsx escribe en el
// cliente llega demasiado tarde. Cuando todas las rutas compartian el mismo
// index.html, todas declaraban la portada como su canonica y Google las
// descartaba como duplicadas.
//
// Los titulos replican el formato que produce Seo.jsx (`${titulo} | Centra
// Norte`) para que el HTML servido y el que arma React coincidan. Son valores de
// respaldo: si la pagina trae MetaTitulo/MetaDescripcion en la base, Seo.jsx los
// sobreescribe al montar.
//
// Esta lista debe mantenerse sincronizada con las rutas de src/App.jsx y con el
// bloque de RewriteRule de .htaccess.
// `eyebrow`, `heading` e `intro` replican el PageHero de respaldo de cada pagina
// para que el HTML servido traiga un h1 y texto reales desde la primera
// respuesta. Sin esto el rastreador recibia un <body> vacio y dependia por
// completo de la cola de renderizado con JavaScript.
export const SITE_ROUTES = [
  {
    path: '/',
    file: 'index.html',
    title: 'Centra Norte | Centro comercial y punto de transporte',
    description: 'Centra Norte: comercios, restaurantes, servicios, eventos y opciones de transporte en zona 17, Ciudad de Guatemala.',
    heading: 'Centra Norte',
    intro: 'Comercios, restaurantes, servicios, eventos y opciones de transporte en zona 17, Ciudad de Guatemala.'
  },
  {
    path: '/quienes-somos',
    file: 'quienes-somos.html',
    title: 'Quiénes somos | Centra Norte',
    description: 'Conoce Centra Norte: un punto de encuentro para compras, servicios y transporte en zona 17, Ciudad de Guatemala.',
    eyebrow: 'Centra Norte',
    heading: 'Quiénes somos',
    intro: 'Un punto de encuentro para compras, servicios y transporte.'
  },
  {
    path: '/locales',
    file: 'locales.html',
    title: 'Locales | Centra Norte',
    description: 'Directorio de restaurantes, tiendas y servicios disponibles en Centra Norte.',
    eyebrow: 'Directorio comercial',
    heading: 'Locales',
    intro: 'Encuentra restaurantes, tiendas y servicios.'
  },
  {
    path: '/eventos',
    file: 'eventos.html',
    title: 'Eventos | Centra Norte',
    description: 'Consulta la agenda de eventos y actividades del mes en Centra Norte.',
    eyebrow: 'Agenda',
    heading: 'Eventos',
    intro: 'Consulta los eventos de este mes.'
  },
  {
    path: '/promociones',
    file: 'promociones.html',
    title: 'Promociones | Centra Norte',
    description: 'Descubre las promociones y beneficios vigentes en los locales de Centra Norte.',
    eyebrow: 'Beneficios vigentes',
    heading: 'Promociones',
    intro: 'Descubre las promociones disponibles en Centra Norte.'
  },
  {
    path: '/buses',
    file: 'buses.html',
    title: 'Buses | Centra Norte',
    description: 'Consulta rutas de bus, destinos y empresas de transporte que operan desde Centra Norte.',
    eyebrow: 'Punto de transporte',
    heading: 'Buses',
    intro: 'Encuentra el bus que te lleva a tu destino.'
  },
  {
    // La pagina emite noIndex en React (es un tramite interno para inquilinos),
    // asi que el HTML servido debe decir lo mismo y quedar fuera del sitemap.
    path: '/parqueos-inquilinos',
    file: 'parqueos-inquilinos.html',
    title: 'Parqueos para inquilinos | Centra Norte',
    description: 'Pago mensual y solicitud de tarjeta TAS para inquilinos de Centra Norte.',
    noIndex: true,
    eyebrow: 'Gestiones',
    heading: 'Parqueos para inquilinos',
    intro: 'Realiza el pago mensual o solicita tu tarjeta TAS desde el formulario correspondiente.'
  },
  {
    path: '/contacto',
    file: 'contacto.html',
    title: 'Contacto | Centra Norte',
    description: 'Ubicación, horarios y canales de contacto de Centra Norte, zona 17, Ciudad de Guatemala.',
    eyebrow: 'Visítanos',
    heading: 'Contacto',
    intro: 'Encuentra nuestra ubicación y canales de contacto.'
  }
];

// Rutas de detalle: el codigo es dinamico y no se puede generar un documento por
// cada uno en build. Se sirve spa.html, que va sin canonical para que Google use
// la propia URL como canonica en vez de heredar la de la portada.
export const DETAIL_ROUTE_SEGMENTS = ['locales', 'eventos', 'promociones', 'buses'];

// Origen de cada listado de fichas. El sitemap las incluye para que Google no
// dependa solo de rastrear los listados: `/rutas` alimenta las URL de `/buses`,
// que es como las nombra el router del SPA.
const DETAIL_SOURCES = [
  { segment: 'locales', endpoint: '/locales' },
  { segment: 'eventos', endpoint: '/eventos' },
  { segment: 'promociones', endpoint: '/promociones' },
  { segment: 'buses', endpoint: '/rutas' }
];

// El backend rechaza limites mayores; los listados paginados se recorren por
// bloques de este tamano.
const PAGE_SIZE = 100;
const MAX_PAGES = 50;
const FETCH_TIMEOUT_MS = 20000;

const SPA_FALLBACK = {
  file: 'spa.html',
  title: 'Centra Norte',
  description: 'Comercios, restaurantes, servicios, eventos y opciones de transporte en Centra Norte.',
  heading: 'Centra Norte',
  intro: 'Comercios, restaurantes, servicios, eventos y opciones de transporte en zona 17, Ciudad de Guatemala.'
};

const NOT_FOUND_DOCUMENT = {
  file: '404.html',
  title: 'Página no encontrada | Centra Norte',
  description: 'La página solicitada no está disponible.',
  noIndex: true,
  eyebrow: 'Error 404',
  heading: 'Esta página no está disponible.',
  intro: 'Revisa la dirección o vuelve al inicio para continuar navegando.'
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Un fallo silencioso aqui reintroduce justo el bug que este modulo existe para
// evitar, asi que cualquier etiqueta que no aparezca rompe el build.
function requireReplace(html, pattern, replacer, label) {
  if (!pattern.test(html)) {
    throw new Error(`index.html ya no contiene ${label}; actualiza build/seo.js antes de compilar.`);
  }
  return html.replace(pattern, replacer);
}

function metaTag(attribute, name) {
  return new RegExp(`<meta\\b[^>]*${attribute}="${name}"[^>]*>`, 'i');
}

const CANONICAL_TAG = /<link\b[^>]*rel="canonical"[^>]*>/i;

function setContent(html, pattern, value, label) {
  return requireReplace(
    html,
    pattern,
    (tag) => tag.replace(/content="[^"]*"/i, `content="${escapeHtml(value)}"`),
    label
  );
}

// Encabezado estatico que viaja en el HTML servido. Reutiliza las clases del
// PageHero real para que, mientras carga el bundle, el visitante vea el mismo
// encabezado en vez de una pantalla en blanco. main.jsx lo retira justo antes de
// montar React, que vuelve a dibujarlo con los datos de la API.
function fallbackMarkup({ eyebrow, heading, intro }) {
  if (!heading) {
    return '';
  }

  return [
    '<div id="seo-fallback">',
    '      <header class="page-hero page-hero--compact">',
    `        <div class="page-hero__awning" aria-hidden="true">${'<i></i>'.repeat(8)}</div>`,
    '        <div class="container page-hero__inner">',
    '          <div class="page-hero__copy">',
    eyebrow ? `            <p class="section-kicker">${escapeHtml(eyebrow)}</p>` : null,
    `            <h1>${escapeHtml(heading)}</h1>`,
    intro ? `            <p>${escapeHtml(intro)}</p>` : null,
    '          </div>',
    '        </div>',
    '      </header>',
    '    </div>',
    '    '
  ].filter((line) => line !== null).join('\n');
}

function buildDocument(template, { title, description, canonical, noIndex, eyebrow, heading, intro }) {
  let html = requireReplace(template, /<title>[\s\S]*?<\/title>/i, () => `<title>${escapeHtml(title)}</title>`, '<title>');

  html = setContent(html, metaTag('name', 'description'), description, 'meta name="description"');
  html = setContent(html, metaTag('property', 'og:title'), title, 'meta property="og:title"');
  html = setContent(html, metaTag('property', 'og:description'), description, 'meta property="og:description"');
  html = setContent(html, metaTag('name', 'twitter:title'), title, 'meta name="twitter:title"');
  html = setContent(html, metaTag('name', 'twitter:description'), description, 'meta name="twitter:description"');
  html = setContent(
    html,
    metaTag('name', 'robots'),
    noIndex ? 'noindex, follow' : 'index, follow, max-image-preview:large',
    'meta name="robots"'
  );

  if (canonical) {
    html = requireReplace(
      html,
      CANONICAL_TAG,
      (tag) => tag.replace(/href="[^"]*"/i, `href="${escapeHtml(canonical)}"`),
      'link rel="canonical"'
    );
    html = setContent(html, metaTag('property', 'og:url'), canonical, 'meta property="og:url"');
  } else {
    html = requireReplace(html, CANONICAL_TAG, () => '', 'link rel="canonical"');
    html = requireReplace(html, metaTag('property', 'og:url'), () => '', 'meta property="og:url"');
  }

  const fallback = fallbackMarkup({ eyebrow, heading, intro });
  if (fallback) {
    html = requireReplace(
      html,
      /<div id="root"><\/div>/,
      () => `${fallback}<div id="root"></div>`,
      '<div id="root"></div>'
    );
  }

  return html;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
  });
  if (!response.ok) {
    throw new Error(`${url} respondio ${response.status}`);
  }
  return response.json();
}

/**
 * Codigos publicados de un listado. Acepta las dos formas que devuelve la API:
 * un arreglo plano y un objeto `{ datos, paginacion }`, del que se recorren
 * todas las paginas.
 */
async function collectCodes(apiBaseUrl, endpoint) {
  const codes = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const url = new URL(`${apiBaseUrl}${endpoint}`);
    url.searchParams.set('limite', String(PAGE_SIZE));
    url.searchParams.set('pagina', String(page));
    const payload = await fetchJson(url.toString());

    const items = Array.isArray(payload) ? payload : (payload?.datos || []);
    for (const item of items) {
      if (Number.isInteger(item?.codigo) && item.codigo > 0) {
        codes.push(item.codigo);
      }
    }

    if (Array.isArray(payload) || payload?.paginacion?.tienePaginaSiguiente !== true) {
      break;
    }
  }

  return codes;
}

// Una API caida no debe impedir publicar: en ese caso el sitemap sale solo con
// las rutas estaticas y el aviso queda en el log del build. Google seguira
// descubriendo las fichas rastreando los listados.
async function collectDetailPaths(apiBaseUrl) {
  if (!apiBaseUrl || !/^https?:\/\//i.test(apiBaseUrl)) {
    return [];
  }

  const paths = [];
  for (const source of DETAIL_SOURCES) {
    try {
      const codes = await collectCodes(apiBaseUrl.replace(/\/$/, ''), source.endpoint);
      paths.push(...codes.map((code) => `/${source.segment}/${code}`));
    } catch (error) {
      console.warn(`AVISO: no se pudieron listar las fichas de ${source.segment} para el sitemap: ${error.message}`);
    }
  }
  return paths;
}

function buildSitemap(siteUrl, detailPaths) {
  const paths = [
    ...SITE_ROUTES.filter((route) => !route.noIndex).map((route) => route.path),
    ...detailPaths
  ];

  const entries = paths
    .map((path) => `  <url><loc>${escapeHtml(new URL(path, siteUrl).toString())}</loc></url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

/**
 * Emite un documento HTML por ruta estatica, la plantilla para rutas de detalle,
 * el 404 real y un sitemap derivado de la misma lista de rutas.
 */
export function staticSeoDocuments(siteUrl, apiBaseUrl) {
  return {
    name: 'centranorte-static-seo-documents',
    apply: 'build',
    async closeBundle() {
      const outDir = resolve(process.cwd(), 'dist');
      const indexPath = resolve(outDir, 'index.html');
      const template = await readFile(indexPath, 'utf8');

      for (const route of SITE_ROUTES) {
        const html = buildDocument(template, {
          ...route,
          canonical: new URL(route.path, siteUrl).toString(),
          noIndex: route.noIndex === true
        });
        await writeFile(resolve(outDir, route.file), html, 'utf8');
      }

      for (const document of [SPA_FALLBACK, NOT_FOUND_DOCUMENT]) {
        const html = buildDocument(template, {
          ...document,
          canonical: null,
          noIndex: document.noIndex === true
        });
        await writeFile(resolve(outDir, document.file), html, 'utf8');
      }

      // SiteGround sirve Default.html como documento por defecto de la raiz.
      await writeFile(resolve(outDir, 'Default.html'), await readFile(indexPath, 'utf8'), 'utf8');

      // El sitemap se genera aqui y no se versiona en public/ para que no pueda
      // volver a listar una URL marcada como noIndex.
      await rm(resolve(outDir, 'sitemap.xml'), { force: true });
      const detailPaths = await collectDetailPaths(apiBaseUrl);
      await writeFile(resolve(outDir, 'sitemap.xml'), buildSitemap(siteUrl, detailPaths), 'utf8');
      console.log(`sitemap.xml generado con ${SITE_ROUTES.filter((route) => !route.noIndex).length} rutas y ${detailPaths.length} fichas.`);
    }
  };
}
