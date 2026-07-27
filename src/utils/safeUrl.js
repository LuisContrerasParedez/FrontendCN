function isAllowedProtocol(protocol) {
  return protocol === 'http:' || protocol === 'https:';
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
