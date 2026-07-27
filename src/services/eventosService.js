import { apiGet } from './apiClient';

export async function obtenerEventos() {
  const data = await apiGet('/eventos');
  return Array.isArray(data) ? data.map((event) => ({
    CodigoEvento: event.codigo,
    Titulo: event.nombre,
    Descripcion: event.descripcion,
    ImagenPrincipalUrl: event.imagenUrl,
    FechaInicio: event.fechaInicio,
    FechaFin: event.fechaFin,
    EstadoEvento: event.estado
  })) : [];
}

export async function obtenerEvento(codigo) {
  const eventos = await obtenerEventos();
  return eventos.find((event) => String(event.CodigoEvento) === String(codigo)) || null;
}
