import { apiGet } from './apiClient';

export async function obtenerLocales(params = {}) {
  const data = await apiGet('/locales', { limite: 100, ...params });
  return Array.isArray(data) ? data.map((local) => ({
    CodigoLocal: local.codigo,
    CodigoCategoriaLocal: local.categoria?.codigo,
    Categoria: local.categoria?.nombre || '',
    Nombre: local.nombre,
    Descripcion: local.descripcion,
    ImagenUrl: local.imagenUrl,
    Ubicacion: local.ubicacion,
    Horario: local.horario
  })) : [];
}

export async function obtenerLocal(codigo) {
  const locales = await obtenerLocales();
  return locales.find((local) => String(local.CodigoLocal) === String(codigo)) || null;
}
