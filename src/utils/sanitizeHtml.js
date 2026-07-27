const BLOCKED_TAGS = ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'base'];

function sanitizeNodeTree(root) {
  BLOCKED_TAGS.forEach((tagName) => {
    root.querySelectorAll(tagName).forEach((node) => node.remove());
  });

  root.querySelectorAll('*').forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();

      if (name.startsWith('on') || name === 'style') {
        element.removeAttribute(attribute.name);
        return;
      }

      if ((name === 'href' || name === 'src') && !/^(https?:|\/|mailto:|tel:|#)/i.test(value)) {
        element.removeAttribute(attribute.name);
      }
    });
  });
}

export function sanitizeHtml(html, fallback = '<p>Sin contenido disponible.</p>') {
  if (!html) {
    return fallback;
  }

  const parser = new DOMParser();
  const documentNode = parser.parseFromString(html, 'text/html');
  sanitizeNodeTree(documentNode.body);
  return documentNode.body.innerHTML || fallback;
}

export function sanitizeIframeHtml(html) {
  if (!html) {
    return '';
  }

  const parser = new DOMParser();
  const documentNode = parser.parseFromString(html, 'text/html');
  const iframe = documentNode.body.querySelector('iframe');

  if (!iframe) {
    return '';
  }

  Array.from(documentNode.body.children).forEach((child) => {
    if (child !== iframe) {
      child.remove();
    }
  });

  Array.from(iframe.attributes).forEach((attribute) => {
    const name = attribute.name.toLowerCase();
    if (name.startsWith('on')) {
      iframe.removeAttribute(attribute.name);
    }
  });

  const src = iframe.getAttribute('src') || '';
  if (!/^https:\/\/(www\.)?(google\.com|maps\.google\.com)\//i.test(src)) {
    return '';
  }

  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
  return iframe.outerHTML;
}
