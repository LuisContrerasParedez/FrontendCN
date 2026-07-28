import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router';

const STORAGE_KEY = 'centranorte:scroll';

/* Al volver atrás el listado se vuelve a pedir al backend: el documento nace
   corto (solo el encabezado y el indicador de carga) y crece cuando llegan las
   tarjetas. Por eso la posición no se aplica una vez, se reintenta hasta que el
   documento tenga altura suficiente. El tope evita quedar reencuadrando para
   siempre si el contenido nunca vuelve a esa altura (una búsqueda que ahora
   devuelve menos resultados, una promoción vencida). */
const RESTORE_TIMEOUT_MS = 3000;

/* Fotogramas extra de confirmación una vez alcanzada la posición: el fundido de
   entrada de la página y las imágenes que resuelven tarde pueden reencuadrar el
   documento justo después del primer intento. */
const SETTLE_FRAMES = 2;

/* Cualquiera de estos gestos significa que el visitante ya tomó el control; a
   partir de ahí restaurar sería arrebatarle la página de las manos. */
const USER_INTERRUPTS = ['wheel', 'touchstart', 'pointerdown', 'keydown'];

function readStoredPositions() {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    /* Modo privado o almacenamiento bloqueado: se sigue con memoria volátil. */
    return {};
  }
}

function maxScrollTop() {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

function applyScrollTop(top) {
  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;
  /* El `scroll-behavior: smooth` de la hoja global convertiría cada reencuadre
     en un viaje animado y visible; aquí el salto tiene que ser instantáneo. */
  root.style.scrollBehavior = 'auto';
  root.scrollTop = top;
  document.body.scrollTop = top;
  window.scrollTo({ top, left: 0, behavior: 'auto' });
  root.style.scrollBehavior = previousBehavior;
}

/**
 * Restauración de la posición de lectura entre entradas del historial.
 *
 * - Atrás y adelante devuelven al visitante a donde estaba leyendo.
 * - Cambiar de ruta empieza arriba, con el foco en el título de la página nueva.
 * - Cambiar solo la query string (categoría, búsqueda y paginación del
 *   directorio) no mueve nada: son filtros, no una página distinta.
 *
 * @param {boolean} ready `false` mientras la pantalla de carga inicial tapa el
 *   sitio y bloquea el scroll; hasta entonces no se decide nada.
 */
export default function useScrollRestoration(ready) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const positions = useRef(null);
  if (positions.current === null) positions.current = readStoredPositions();

  const entryKey = useRef(location.key);
  const previousPathname = useRef(location.pathname);
  const handledEntry = useRef(null);
  const isAdjusting = useRef(false);

  useEffect(() => {
    const supportsManual = 'scrollRestoration' in window.history;
    const previousRestoration = supportsManual ? window.history.scrollRestoration : null;
    /* La restauración del navegador mide antes de que llegue el contenido del
       CMS y acaba dejando la página a medias; este hook la reemplaza entera. */
    if (supportsManual) window.history.scrollRestoration = 'manual';

    const remember = () => {
      if (isAdjusting.current) return;
      positions.current[entryKey.current] = window.scrollY;
    };

    /* En móvil el navegador puede descartar la pestaña en segundo plano y
       recargarla al volver: sin esto se perdería todo el historial de lectura. */
    const persist = () => {
      try {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions.current));
      } catch {
        /* Sin almacenamiento la restauración en memoria sigue funcionando. */
      }
    };

    window.addEventListener('scroll', remember, { passive: true });
    window.addEventListener('pagehide', persist);
    document.addEventListener('visibilitychange', persist);

    return () => {
      window.removeEventListener('scroll', remember);
      window.removeEventListener('pagehide', persist);
      document.removeEventListener('visibilitychange', persist);
      persist();
      if (supportsManual) window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    const entry = location.key;
    const isNewEntry = entryKey.current !== entry;
    /* Se apunta la entrada actual aunque todavía no toque decidir nada, para que
       el oyente de scroll guarde la posición bajo la clave correcta. */
    if (isNewEntry) entryKey.current = entry;

    if (!ready) return undefined;
    if (!isNewEntry && handledEntry.current === entry) return undefined;
    handledEntry.current = entry;

    const pathnameChanged = previousPathname.current !== location.pathname;
    previousPathname.current = location.pathname;

    const saved = positions.current[entry];
    const shouldRestore = navigationType === 'POP' && typeof saved === 'number' && saved > 0;
    if (!shouldRestore && !pathnameChanged) return undefined;

    const target = shouldRestore ? saved : 0;
    const deadline = window.performance.now() + (shouldRestore ? RESTORE_TIMEOUT_MS : 0);
    let frame = 0;
    let settle = SETTLE_FRAMES;
    let focused = !pathnameChanged;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      window.cancelAnimationFrame(frame);
      USER_INTERRUPTS.forEach((type) => window.removeEventListener(type, finish));
      isAdjusting.current = false;
      positions.current[entry] = window.scrollY;
    };

    const step = () => {
      applyScrollTop(Math.min(target, maxScrollTop()));

      if (!focused) {
        focused = true;
        /* Lectores de pantalla: la página nueva se anuncia desde su título. Con
           `preventScroll` el foco no arrastra la vista y el reencuadre manda. */
        const main = document.getElementById('contenido-principal');
        const title = main?.querySelector('[data-page-title], h1');
        const anchor = title || main;
        if (anchor && !anchor.hasAttribute('tabindex')) anchor.setAttribute('tabindex', '-1');
        anchor?.focus({ preventScroll: true });
      }

      if (maxScrollTop() >= target || window.performance.now() >= deadline) {
        settle -= 1;
        if (settle <= 0) {
          finish();
          return;
        }
      }

      frame = window.requestAnimationFrame(step);
    };

    isAdjusting.current = true;
    applyScrollTop(Math.min(target, maxScrollTop()));
    USER_INTERRUPTS.forEach((type) => window.addEventListener(type, finish, { passive: true }));
    frame = window.requestAnimationFrame(step);

    return finish;
  }, [location.key, location.pathname, navigationType, ready]);
}
