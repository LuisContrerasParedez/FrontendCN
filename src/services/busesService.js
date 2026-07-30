import { apiGet } from './apiClient';

export async function obtenerRutasBus() {
  const data = await apiGet('/rutas');
  return Array.isArray(data) ? data.map(normalizarRuta) : [];
}

export async function obtenerRutaBus(codigo) {
  const rutas = await obtenerRutasBus();
  return rutas.find((route) => String(route.CodigoRutaBus) === String(codigo)) || null;
}

function normalizarRuta(route) {
  const destinos = Array.isArray(route.destinos)
    ? route.destinos.map((destination) => ({
        CodigoRutaBusDestino: destination.codigo,
        NombreDestino: destination.nombre,
        Empresas: Array.isArray(destination.empresas)
          ? destination.empresas.map((company) => ({
              CodigoRutaBusDestinoEmpresa: company.codigoRelacion,
              CodigoEmpresaBus: company.codigo,
              Nombre: company.nombre,
              OrdenFila: company.ordenFila
            }))
          : []
      }))
    : [];

  return {
    CodigoRutaBus: route.codigo,
    NombreRuta: route.nombre,
    ImagenUrl: route.imagenUrl,
    OrdenVisualizacion: route.ordenVisualizacion,
    Destinos: destinos
  };
}
