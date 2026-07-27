import { useState } from 'react';
import { safeUrl } from '../../utils/safeUrl';
import Icon from './Icon';

function inferMimeType(url, providedType) {
  if (providedType) return providedType;
  const pathname = String(url || '').split(/[?#]/)[0].toLowerCase();
  if (pathname.endsWith('.avif')) return 'image/avif';
  if (pathname.endsWith('.webp')) return 'image/webp';
  if (pathname.endsWith('.png')) return 'image/png';
  if (pathname.endsWith('.svg')) return 'image/svg+xml';
  return 'image/jpeg';
}

export default function ResponsiveImage({
  src,
  mobileSrc,
  mimeType,
  mobileMimeType,
  alt,
  className = '',
  sizes = '100vw',
  width,
  height,
  eager = false,
  fallbackIcon = 'sparkles',
  fallbackLabel = 'Imagen no disponible',
  hideFallback = false,
  onLoad,
  onLoadError
}) {
  const [failedSource, setFailedSource] = useState('');
  const desktopUrl = safeUrl(src);
  const mobileUrl = safeUrl(mobileSrc);
  const sourceKey = `${desktopUrl}|${mobileUrl}`;
  const failed = failedSource === sourceKey;

  if ((!desktopUrl && !mobileUrl) || failed) {
    if (hideFallback) return null;
    const decorative = alt === '';
    return (
      <span
        className={`${className} responsive-image-fallback`}
        role={decorative ? undefined : 'img'}
        aria-label={decorative ? undefined : fallbackLabel}
        aria-hidden={decorative || undefined}
      >
        <Icon name={fallbackIcon} size={36} />
        <small>{fallbackLabel}</small>
      </span>
    );
  }

  const primaryUrl = desktopUrl || mobileUrl;
  const primaryWidth = Number(width) > 0 ? Number(width) : undefined;
  const primaryHeight = Number(height) > 0 ? Number(height) : undefined;

  return (
    <picture className="responsive-picture">
      {mobileUrl ? (
        <source
          media="(max-width: 640px)"
          srcSet={mobileUrl}
          type={inferMimeType(mobileUrl, mobileMimeType)}
        />
      ) : null}
      <source srcSet={primaryUrl} type={inferMimeType(primaryUrl, mimeType)} />
      <img
        className={className}
        src={primaryUrl}
        srcSet={primaryUrl}
        sizes={sizes}
        alt={alt || ''}
        width={primaryWidth}
        height={primaryHeight}
        loading={eager ? 'eager' : 'lazy'}
        fetchpriority={eager ? 'high' : 'auto'}
        decoding="async"
        onLoad={onLoad}
        onError={() => {
          setFailedSource(sourceKey);
          onLoadError?.();
        }}
      />
    </picture>
  );
}
