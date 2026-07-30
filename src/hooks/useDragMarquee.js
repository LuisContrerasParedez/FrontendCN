import { useEffect, useRef, useState } from 'react';

const DRAG_THRESHOLD = 6;      // px antes de considerar que fue arrastre y no un tap
const MAX_VELOCITY = 2600;     // px/s, tope para que un fling no dispare la fila
const RELEASE_TAU = 0.45;      // s, suavidad con la que la inercia vuelve a la velocidad automática
const VELOCITY_SMOOTHING = .6; // mezcla entre la velocidad previa y la muestra nueva

/**
 * Marquee infinito arrastrable con el dedo (pantallas táctiles).
 *
 * En puntero fino la animación sigue siendo 100% CSS: este hook sólo toma el control
 * cuando `(pointer: coarse)`, porque ahí `:hover` se queda pegado tras un tap y la fila
 * se detiene para siempre.
 *
 * Modelo: un único `offset` en px aplicado como `translate3d`, con módulo sobre la mitad
 * del track (los dos grupos son idénticos, así el salto es invisible). La velocidad relaja
 * exponencialmente hacia la velocidad automática, de modo que al soltar el dedo la inercia
 * se funde sola con el desplazamiento continuo.
 *
 * @param {number} duration Segundos que tarda el track en recorrer medio ancho (igual que el CSS).
 * @param {boolean} enabled Falso cuando la fila no se desplaza (pocos locales): sin dos grupos
 *                          idénticos el arrastre no tendría dónde repetirse.
 */
export default function useDragMarquee(duration, enabled = true) {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;

    const coarse = window.matchMedia('(pointer: coarse)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setInteractive(enabled && coarse.matches && !reduced.matches);

    sync();
    coarse.addEventListener('change', sync);
    reduced.addEventListener('change', sync);
    return () => {
      coarse.removeEventListener('change', sync);
      reduced.removeEventListener('change', sync);
    };
  }, [enabled]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!interactive || !viewport || !track) return undefined;

    let half = track.scrollWidth / 2;
    let offset = 0;
    let velocity = 0;
    let dragging = false;
    let paused = false;
    let moved = false;
    let suppressClick = false;
    let pointerId = null;
    let startX = 0;
    let lastX = 0;
    let lastMove = 0;
    let last = window.performance.now();
    let frame = 0;

    const autoSpeed = () => (half > 0 ? half / duration : 0);

    const apply = () => {
      if (half > 0) offset = ((offset % half) + half) % half;
      track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    };

    const tick = (now) => {
      const dt = Math.min(.05, (now - last) / 1000);
      last = now;

      if (!dragging) {
        const target = paused ? 0 : autoSpeed();
        velocity += (target - velocity) * (1 - Math.exp(-dt / RELEASE_TAU));
        if (Math.abs(velocity - target) < .5) velocity = target;
        offset += velocity * dt;
        apply();
      }

      frame = window.requestAnimationFrame(tick);
    };

    const onPointerDown = (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      dragging = true;
      moved = false;
      suppressClick = false;
      velocity = 0;
      pointerId = event.pointerId;
      startX = lastX = event.clientX;
      lastMove = window.performance.now();
    };

    const onPointerMove = (event) => {
      if (!dragging || event.pointerId !== pointerId) return;

      const now = window.performance.now();
      const dx = event.clientX - lastX;
      const dt = Math.max(.001, (now - lastMove) / 1000);
      lastX = event.clientX;
      lastMove = now;

      // El offset crece hacia la izquierda: arrastrar el dedo a la izquierda lo aumenta.
      offset -= dx;
      const sample = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, -dx / dt));
      velocity = velocity * VELOCITY_SMOOTHING + sample * (1 - VELOCITY_SMOOTHING);

      if (!moved && Math.abs(event.clientX - startX) > DRAG_THRESHOLD) {
        moved = true;
        // Ya es un arrastre real: capturamos el puntero para no perderlo si el dedo
        // se sale de la fila. Un tap simple nunca llega aquí y navega normal.
        viewport.setPointerCapture?.(event.pointerId);
      }
      apply();
    };

    const endDrag = (event) => {
      if (!dragging || (event && event.pointerId !== pointerId)) return;
      dragging = false;
      suppressClick = moved;
      if (pointerId !== null && viewport.hasPointerCapture?.(pointerId)) {
        viewport.releasePointerCapture(pointerId);
      }
      pointerId = null;
      // Si el dedo se quedó quieto antes de soltar, no heredamos una inercia fantasma.
      if (window.performance.now() - lastMove > 90) velocity = 0;
    };

    // Un arrastre no debe abrir la ficha del local que quedó bajo el dedo.
    const onClickCapture = (event) => {
      if (!suppressClick) return;
      suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    };

    const onFocusIn = () => { paused = true; };
    const onFocusOut = () => { paused = false; };
    const measure = () => { half = track.scrollWidth / 2; apply(); };

    apply();
    viewport.addEventListener('pointerdown', onPointerDown);
    viewport.addEventListener('pointermove', onPointerMove);
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);
    viewport.addEventListener('pointerleave', endDrag);
    viewport.addEventListener('click', onClickCapture, true);
    viewport.addEventListener('focusin', onFocusIn);
    viewport.addEventListener('focusout', onFocusOut);

    const observer = 'ResizeObserver' in window ? new window.ResizeObserver(measure) : null;
    observer?.observe(track);
    if (!observer) window.addEventListener('resize', measure);

    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
      viewport.removeEventListener('pointerdown', onPointerDown);
      viewport.removeEventListener('pointermove', onPointerMove);
      viewport.removeEventListener('pointerup', endDrag);
      viewport.removeEventListener('pointercancel', endDrag);
      viewport.removeEventListener('pointerleave', endDrag);
      viewport.removeEventListener('click', onClickCapture, true);
      viewport.removeEventListener('focusin', onFocusIn);
      viewport.removeEventListener('focusout', onFocusOut);
      observer?.disconnect();
      if (!observer) window.removeEventListener('resize', measure);
      track.style.transform = '';
    };
  }, [interactive, duration]);

  return { viewportRef, trackRef, interactive };
}
