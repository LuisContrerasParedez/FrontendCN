import { apiGet } from './apiClient';

export async function obtenerPromociones() {
  const data = await apiGet('/promociones');
  return Array.isArray(data) ? data.map((promotion) => ({
    CodigoPromocion: promotion.codigo,
    CodigoLocal: promotion.local?.codigo ?? null,
    NombreLocal: promotion.local?.nombre || null,
    Titulo: promotion.nombre,
    Descripcion: promotion.descripcion,
    ImagenPrincipalUrl: promotion.imagenUrl,
    FechaInicio: promotion.fechaInicio,
    FechaFin: promotion.fechaFin
  })) : [];
}

export async function obtenerPromocion(codigo) {
  const promociones = await obtenerPromociones();
  return promociones.find((promotion) => String(promotion.CodigoPromocion) === String(codigo)) || null;
}
