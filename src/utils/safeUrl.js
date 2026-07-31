const PUBLIC_IMAGES_ORIGIN = (import.meta.env.VITE_IMAGES_BASE_URL || window.location.origin).replace(/\/+$/, '');

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
    const publicOrigin = new URL(PUBLIC_IMAGES_ORIGIN);
    const isManagedImage = /^\/imagenes(?:\/|$)/i.test(parsed.pathname);
    const isPublicHostFamily = parsed.hostname === publicOrigin.hostname
      || parsed.hostname.endsWith(`.${publicOrigin.hostname}`);

    // Las URLs administradas pueden haber sido guardadas con un subdominio
    // anterior. El origen publico configurado decide siempre donde servirlas.
    if (isManagedImage && isPublicHostFamily) {
      return new URL(`${parsed.pathname}${parsed.search}${parsed.hash}`, `${publicOrigin.origin}/`).toString();
    }
    return isAllowedProtocol(parsed.protocol) ? parsed.toString() : '';
  } catch {
    return '';
  }
}
