import { apiPost } from './apiClient';


export async function obtenerFormularios() {
  return [];
}

export async function enviarMensajeContacto(mensaje, options = {}) {
  return apiPost('/contacto', mensaje, options);
}
