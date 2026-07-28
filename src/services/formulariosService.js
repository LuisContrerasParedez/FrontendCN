import { apiPost } from './apiClient';

// Los enlaces a formularios (carga de facturas y TAS) son estáticos en el
// frontend, así que este servicio devuelve una lista vacía.
export async function obtenerFormularios() {
  return [];
}

export async function enviarMensajeContacto(mensaje, options = {}) {
  return apiPost('/contacto', mensaje, options);
}
