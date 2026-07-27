const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const responseCache = new Map();
const CACHE_TTL = 45000;

function buildUrl(path, params) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${cleanPath}`, window.location.origin);

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
  const cached = responseCache.get(url);
  if (!options.fresh && cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.payload;

  const response = await fetch(url, {
    method: 'GET',
    cache: options.fresh ? 'no-store' : 'default',
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
    throw new Error(message);
  }

  if (response.status !== 204 && !contentType.includes('application/json')) {
    throw new Error('La API devolvio un formato de respuesta inesperado.');
  }

  if (!options.fresh) responseCache.set(url, { payload, timestamp: Date.now() });
  return payload;
}

export { API_BASE_URL };
