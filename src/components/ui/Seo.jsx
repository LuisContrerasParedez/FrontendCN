import { useEffect } from 'react';
import { safeUrl } from '../../utils/safeUrl';

function ensureMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    document.head.appendChild(element);
  }
  return element;
}

export default function Seo({ title, description, image, config = {}, noIndex = false }) {
  useEffect(() => {
    const siteName = config.NombreSitio || 'Centra Norte';
    const fullTitle = title ? (title.includes(siteName) ? title : `${title} | ${siteName}`) : siteName;
    const canonicalUrl = new URL(window.location.pathname, import.meta.env.VITE_SITE_URL || window.location.origin).toString();
    document.title = fullTitle;

    const descriptionMeta = ensureMeta('meta[name="description"]', { name: 'description' });
    descriptionMeta.content = description || config.MetaDescripcion || '';
    const robotsMeta = ensureMeta('meta[name="robots"]', { name: 'robots' });
    robotsMeta.content = noIndex ? 'noindex,follow' : 'index,follow';
    const canonical = document.head.querySelector('link[rel="canonical"]') || document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = canonicalUrl;
    if (!canonical.parentNode) document.head.appendChild(canonical);

    const values = {
      'og:title': fullTitle,
      'og:description': description || config.MetaDescripcion || '',
      'og:url': canonicalUrl,
      'og:type': 'website'
    };
    const safeImage = safeUrl(image);
    if (safeImage) values['og:image'] = new URL(safeImage, window.location.origin).toString();
    Object.entries(values).forEach(([property, content]) => {
      const meta = ensureMeta(`meta[property="${property}"]`, { property });
      meta.content = content;
    });

    const structured = {
      '@context': 'https://schema.org',
      '@type': 'ShoppingCenter',
      name: siteName,
      url: (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, ''),
      ...(config.Telefono ? { telephone: config.Telefono } : {}),
      ...(config.Direccion ? { address: { '@type': 'PostalAddress', streetAddress: config.Direccion, addressCountry: 'GT' } } : {}),
      ...(safeUrl(config.LogoUrl) ? { logo: new URL(safeUrl(config.LogoUrl), window.location.origin).toString() } : {}),
      ...(Array.isArray(config.RedesSociales) && config.RedesSociales.length ? { sameAs: config.RedesSociales.map((item) => safeUrl(item.Url)).filter(Boolean) } : {})
    };
    let script = document.getElementById('site-structured-data');
    if (!script) {
      script = document.createElement('script');
      script.id = 'site-structured-data';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structured);
  }, [title, description, image, config, noIndex]);

  return null;
}
