import { apiGet } from './apiClient';

export async function obtenerRutasBus() {
  const data = await apiGet('/rutas');
  return Array.isArray(data) ? data.map((route) => {
    const companies = Array.isArray(route.empresas)
      ? route.empresas.map((company) => company.nombre).filter(Boolean)
      : [];

    return {
      CodigoRutaBus: route.codigo,
      Destino: route.nombreDestino,
      NombreRuta: route.destinoEspecifico,
      ImagenUrl: route.imagenUrl,
      EmpresasBus: companies,
      EmpresaBus: companies[0] || null
    };
  }) : [];
}

export async function obtenerRutaBus(codigo) {
  const rutas = await obtenerRutasBus();
  return rutas.find((route) => String(route.CodigoRutaBus) === String(codigo)) || null;
}
