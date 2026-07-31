const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const PRODUCTION_API_URL = import.meta.env.PROD
  ? new URL(API_BASE_URL, window.location.origin)
  : null;

/**
 * Error de una respuesta de la API. Conserva el código para que la vista pueda
 * distinguir un recurso inexistente (404) de una falla real del servicio.
 */
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function buildUrl(path, params) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${cleanPath}`, window.location.origin);

  const productionApiPath = PRODUCTION_API_URL?.pathname.replace(/\/$/, '');
  if (import.meta.env.PROD && (
    url.protocol !== 'https:'
    || url.origin !== PRODUCTION_API_URL.origin
    || (url.pathname !== productionApiPath && !url.pathname.startsWith(`${productionApiPath}/`))
  )) {
    throw new Error('La API de produccion debe utilizar el subdominio HTTPS autorizado.');
  }

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

export async function apiGet(path, params, options = {}) {
  const url = buildUrl(path, params);

  const response = await fetch(url, {
    method: 'GET',
    // El servidor conserva su cache y ETag, pero el navegador debe revalidar:
    // una URL de imagen reemplazada no puede quedar hasta diez minutos en un
    // listado mientras el detalle ya entrega la nueva.
    cache: options.fresh ? 'no-store' : 'no-cache',
    credentials: 'omit',
    redirect: 'error',
    referrerPolicy: 'strict-origin-when-cross-origin',
    signal: options.signal,
    headers: {
      Accept: 'application/json'
    }
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = response.status !== 204 && contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    const apiMessage = Array.isArray(payload?.message)
      ? payload.message.join(' ')
      : payload?.message;
    const message = apiMessage || 'No fue posible completar la solicitud.';
    throw new ApiError(message, response.status);
  }

  if (response.status !== 204 && !contentType.includes('application/json')) {
    throw new ApiError('La API devolvio un formato de respuesta inesperado.', response.status);
  }

  return payload;
}

export async function apiPost(path, body, options = {}) {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    cache: 'no-store',
    credentials: 'omit',
    redirect: 'error',
    referrerPolicy: 'strict-origin-when-cross-origin',
    signal: options.signal,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = response.status !== 204 && contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    const apiMessage = Array.isArray(payload?.message)
      ? payload.message.join(' ')
      : payload?.message;
    throw new ApiError(apiMessage || 'No fue posible completar la solicitud.', response.status);
  }

  if (response.status !== 204 && !contentType.includes('application/json')) {
    throw new ApiError('La API devolvio un formato de respuesta inesperado.', response.status);
  }

  return payload;
}

export { API_BASE_URL };
