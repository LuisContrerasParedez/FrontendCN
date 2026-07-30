const PUBLIC_IMAGES_ORIGIN = (import.meta.env.VITE_IMAGES_BASE_URL || 'https://centranorte.com.gt').replace(/\/+$/, '');

function isAllowedProtocol(protocol) {
  return protocol === 'http:' || protocol === 'https:';
}

function publicImageUrl(path) {
  try {
    const origin = new URL(PUBLIC_IMAGES_ORIGIN);
    if (!isAllowedProtocol(origin.protocol)) {
      return '';
    }
    return new URL(path, `${origin.origin}/`).toString();
  } catch {
    return '';
  }
}

export function safeUrl(value) {
  if (!value || typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if (trimmed.startsWith('//')) {
    return '';
  }

  if (/^\/imagenes(?:\/|$)/i.test(trimmed)) {
    return publicImageUrl(trimmed);
  }

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed, window.location.origin);
    return isAllowedProtocol(parsed.protocol) ? parsed.toString() : '';
  } catch {
    return '';
  }
}
