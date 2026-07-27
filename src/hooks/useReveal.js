import { useEffect } from 'react';

/**
 * Scroll-reveal progresivo para elementos con la clase `.reveal`.
 * - No hace nada si el usuario prefiere motion reducido (el contenido queda visible).
 * - Reobserva en cada cambio de `deps` para captar tarjetas que llegan async desde el CMS.
 * - Sin IntersectionObserver, revela todo de inmediato (degradación limpia).
 */
export default function useReveal(deps = []) {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

    const pending = Array.from(document.querySelectorAll('.reveal:not(.is-visible)'));
    if (!pending.length) return undefined;

    if (!('IntersectionObserver' in window)) {
      pending.forEach((el) => el.classList.add('is-visible'));
      return undefined;
    }

    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    pending.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
