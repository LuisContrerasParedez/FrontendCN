import { ApiError, apiGet } from './apiClient';

/** Tarjetas por tanda del archivo "Lo que te has perdido"; cada "Ver más" trae otra. */
export const EVENTOS_PASADOS = 10;

/** El backend marca así los eventos cuya fecha de fin ya pasó. */
export const ESTADO_FINALIZADO = 'FINALIZADO';

const PAGINACION_VACIA = {
  PaginaActual: 1,
  Limite: EVENTOS_PASADOS,
  TotalRegistros: 0,
  TotalPaginas: 0,
  TienePaginaAnterior: false,
  TienePaginaSiguiente: false
};

function mapEvento(event) {
  return {
    CodigoEvento: event.codigo,
    Titulo: event.nombre,
    Descripcion: event.descripcion,
    ImagenPrincipalUrl: event.imagenUrl,
    FechaInicio: event.fechaInicio,
    FechaFin: event.fechaFin,
    EstadoEvento: event.estado,
    // La vista nunca deduce el estado por fecha: el backend ya decidió en qué
    // lista cae cada evento y las dos deben contar la misma historia.
    Finalizado: event.estado === ESTADO_FINALIZADO
  };
}

function mapEventos(data) {
  return Array.isArray(data) ? data.map(mapEvento) : [];
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

/** Agenda vigente: eventos en curso y próximos. */
export async function obtenerEventos() {
  return mapEventos(await apiGet('/eventos'));
}

/**
 * Tanda del archivo de eventos terminados. El backend ordena y recorta; aquí
 * no se vuelve a paginar. `paginacion.TienePaginaSiguiente` es lo que decide
 * si la sección sigue ofreciendo "Ver más".
 */
export async function obtenerEventosPasados({ pagina = 1, limite = EVENTOS_PASADOS } = {}) {
  const data = await apiGet('/eventos/pasados', { pagina, limite });

  return {
    datos: mapEventos(data?.datos),
    paginacion: mapPaginacion(data?.paginacion, pagina, limite)
  };
}

/**
 * Ficha completa de un evento desde su propio endpoint. Resuelve igual un
 * evento vigente que uno ya archivado, sin depender de en qué tanda del
 * archivo cayó. Devuelve null cuando el código no es válido o el evento no
 * existe; cualquier otra falla se propaga como error.
 */
export async function obtenerEvento(codigo) {
  const identificador = normalizarCodigo(codigo);
  if (identificador === null) return null;

  try {
    return mapEvento(await apiGet(`/eventos/${identificador}`));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
