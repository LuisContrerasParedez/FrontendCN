import { ApiError, apiGet } from './apiClient';

/** Tarjetas por página del directorio; coincide con el diseño del mosaico. */
export const LOCALES_POR_PAGINA = 12;

/** Tarjetas del carrusel de inicio; el backend no admite más de 24. */
export const LOCALES_CARRUSEL = 12;

/** Todos los locales de la fila están destacados. */
export const CARRUSEL_DESTACADOS = 'DESTACADOS';
/** Los destacados encabezan y el resto se completó con un sorteo. */
export const CARRUSEL_MIXTO = 'MIXTO';
/** No había ningún destacado: la muestra completa se sorteó. */
export const CARRUSEL_ALEATORIOS = 'ALEATORIOS';

const ORIGENES = [CARRUSEL_DESTACADOS, CARRUSEL_MIXTO, CARRUSEL_ALEATORIOS];

const PAGINACION_VACIA = {
  PaginaActual: 1,
  Limite: LOCALES_POR_PAGINA,
  TotalRegistros: 0,
  TotalPaginas: 0,
  TienePaginaAnterior: false,
  TienePaginaSiguiente: false
};

function mapLocal(local) {
  return {
    CodigoLocal: local.codigo,
    CodigoCategoriaLocal: local.categoria?.codigo,
    Categoria: local.categoria?.nombre || '',
    Nombre: local.nombre,
    Descripcion: local.descripcion,
    ImagenUrl: local.imagenUrl,
    Ubicacion: local.ubicacion,
    Horario: local.horario,
    Destacado: local.destacado === true
  };
}

function mapLocales(datos) {
  return Array.isArray(datos) ? datos.map(mapLocal) : [];
}

function mapPaginacion(paginacion, pagina, limite) {
  if (!paginacion) return { ...PAGINACION_VACIA, PaginaActual: pagina, Limite: limite };
  return {
    PaginaActual: Number(paginacion.paginaActual) || pagina,
    Limite: Number(paginacion.limite) || limite,
    TotalRegistros: Number(paginacion.totalRegistros) || 0,
    TotalPaginas: Number(paginacion.totalPaginas) || 0,
    TienePaginaAnterior: paginacion.tienePaginaAnterior === true,
    TienePaginaSiguiente: paginacion.tienePaginaSiguiente === true
  };
}

/** Devuelve el identificador solo cuando es un entero positivo; si no, null. */
function normalizarCodigo(codigo) {
  return /^[1-9][0-9]{0,9}$/.test(String(codigo ?? '').trim()) ? String(codigo).trim() : null;
}

/**
 * Página del directorio. El backend ordena (destacados primero), filtra y
 * recorta; aquí no se vuelve a paginar ni a buscar.
 */
export async function obtenerLocales({
  pagina = 1,
  limite = LOCALES_POR_PAGINA,
  categoria,
  busqueda,
  ordenarPor,
  direccion
} = {}) {
  const data = await apiGet('/locales', {
    pagina,
    limite,
    categoria: categoria && categoria !== 'todos' ? categoria : undefined,
    busqueda: busqueda?.trim() || undefined,
    ordenarPor,
    direccion
  });

  return {
    datos: mapLocales(data?.datos),
    paginacion: mapPaginacion(data?.paginacion, pagina, limite)
  };
}

/**
 * Muestra del carrusel de inicio. `origen` indica si son los locales
 * destacados o una selección aleatoria hecha por el backend.
 */
export async function obtenerLocalesCarrusel(limite = LOCALES_CARRUSEL) {
  const data = await apiGet('/locales/carrusel', { limite });

  return {
    datos: mapLocales(data?.datos),
    origen: ORIGENES.includes(data?.origen) ? data.origen : CARRUSEL_ALEATORIOS
  };
}

/**
 * Ficha completa de un local desde su propio endpoint, sin depender del
 * listado ni del carrusel. Devuelve null cuando el código no es válido o el
 * local no existe; cualquier otra falla se propaga como error.
 */
export async function obtenerLocal(codigo) {
  const identificador = normalizarCodigo(codigo);
  if (identificador === null) return null;

  try {
    return mapLocal(await apiGet(`/locales/${identificador}`));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** Categorías publicadas, para el filtro del directorio. */
export async function obtenerCategoriasLocales() {
  const data = await apiGet('/categorias');
  return Array.isArray(data) ? data.map((categoria) => ({
    CodigoCategoriaLocal: categoria.codigo,
    Nombre: categoria.nombre,
    Descripcion: categoria.descripcion
  })) : [];
}
