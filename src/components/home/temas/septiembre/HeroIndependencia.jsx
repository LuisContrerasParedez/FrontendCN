import { useEffect, useId, useRef } from 'react';
import EscenaIndependencia from './escena/EscenaIndependencia';
import { IconoBus, IconoCalendario, IconoFlecha } from './iconos';
import './HeroIndependencia.css';

const RESPALDO = {
  etiqueta: 'Septiembre',
  titulo: '¡Celebremos\nnuestra\nindependencia!',
  descripcion:
    'Un mes para honrar nuestras raíces, disfrutar en familia y celebrar con orgullo lo que nos une como guatemaltecos.',
  accionPrimaria: { texto: 'Ver eventos', href: '/eventos' },
  accionSecundaria: { texto: 'Horarios de buses', href: '/buses' }
};

// Un campo vacío en la BD cuenta como "no vino nada", no como texto válido.
const oRespaldo = (valor, respaldo) => String(valor ?? '').trim() || respaldo;

const accion = (valor, respaldo) => ({
  texto: oRespaldo(valor?.texto, respaldo.texto),
  href: oRespaldo(valor?.href, respaldo.href)
});

/**
 * El título se compone por líneas para poder escalonar su entrada. Los saltos
 * son parte de la dirección de arte —la escalera "¡Celebremos / nuestra /
 * independencia!" es la que abre el hueco donde entra la copa de la ceiba—, así
 * que se respetan los `\n` que vengan del CMS en vez de reflujar el texto.
 */
function lineas(titulo) {
  return String(titulo)
    .split('\n')
    .map((linea) => linea.trim())
    .filter(Boolean);
}

/**
 * Parallax de puntero.
 *
 * Escribe dos custom properties normalizadas a [-1, 1] en la sección y deja que
 * el CSS decida cuánto se desplaza cada plano. No hay estado de React de por
 * medio: un `setState` por evento de ratón volvería a renderizar el árbol
 * entero sesenta veces por segundo para mover la escena cuatro píxeles.
 *
 * La lectura del rectángulo vive dentro del rAF, así que ocurre como mucho una
 * vez por fotograma y siempre antes de escribir: mover el ratón no provoca
 * reflows en cadena.
 */
function useParallaxPuntero(referencia) {
  useEffect(() => {
    const nodo = referencia.current;
    if (!nodo || typeof window.matchMedia !== 'function') return undefined;

    const fino = window.matchMedia('(hover: hover) and (pointer: fine)');
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!fino.matches) return undefined;

    let cuadro = 0;
    let clienteX = 0;
    let clienteY = 0;
    let centrar = false;

    const pintar = () => {
      cuadro = 0;

      if (centrar || quieto.matches) {
        nodo.style.setProperty('--sep-px', '0');
        nodo.style.setProperty('--sep-py', '0');
        return;
      }

      const caja = nodo.getBoundingClientRect();
      if (!caja.width || !caja.height) return;

      const px = ((clienteX - caja.left) / caja.width) * 2 - 1;
      const py = ((clienteY - caja.top) / caja.height) * 2 - 1;
      nodo.style.setProperty('--sep-px', Math.max(-1, Math.min(1, px)).toFixed(3));
      nodo.style.setProperty('--sep-py', Math.max(-1, Math.min(1, py)).toFixed(3));
    };

    const encolar = () => {
      if (!cuadro) cuadro = window.requestAnimationFrame(pintar);
    };

    const mover = (evento) => {
      clienteX = evento.clientX;
      clienteY = evento.clientY;
      centrar = false;
      encolar();
    };

    const salir = () => {
      centrar = true;
      encolar();
    };

    nodo.addEventListener('pointermove', mover, { passive: true });
    nodo.addEventListener('pointerleave', salir, { passive: true });

    return () => {
      nodo.removeEventListener('pointermove', mover);
      nodo.removeEventListener('pointerleave', salir);
      if (cuadro) window.cancelAnimationFrame(cuadro);
      nodo.style.removeProperty('--sep-px');
      nodo.style.removeProperty('--sep-py');
    };
  }, [referencia]);
}

export default function HeroIndependencia({
  etiqueta,
  titulo,
  descripcion,
  accionPrimaria,
  accionSecundaria,
  nivelTitulo = 'h1',
  id = 'septiembre-independencia',
  className = '',
  // Permite inyectar el enlace del router (SmartLink, Link…) sin que la carpeta
  // dependa de él. Por defecto es un ancla nativa.
  Enlace = 'a'
}) {
  // Identificador único por instancia: dos heros en la misma página no pueden
  // compartir gradientes ni clipPaths.
  const uid = `sep${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const seccion = useRef(null);
  useParallaxPuntero(seccion);

  const Titulo = nivelTitulo === 'h2' ? 'h2' : 'h1';

  const textoEtiqueta = oRespaldo(etiqueta, RESPALDO.etiqueta);
  const lineasTitulo = lineas(oRespaldo(titulo, RESPALDO.titulo));
  const textoDescripcion = oRespaldo(descripcion, RESPALDO.descripcion);
  const primaria = accion(accionPrimaria, RESPALDO.accionPrimaria);
  const secundaria = accion(accionSecundaria, RESPALDO.accionSecundaria);

  return (
    <section ref={seccion} className={`sepHero ${className}`.trim()} aria-labelledby={`${id}-titulo`}>
      <div className="sepHero__escena">
        <EscenaIndependencia uid={uid} />
      </div>

      <div className="sepHero__velo" aria-hidden="true" />

      <div className="sepHero__marco">
        <div className="sepHero__contenido">
          <p className="sepHero__etiqueta">
            <span className="sepHero__etiquetaFilete" aria-hidden="true" />
            {textoEtiqueta}
          </p>

          <Titulo className="sepHero__titulo" id={`${id}-titulo`} data-page-title tabIndex="-1">
            {lineasTitulo.map((linea, i) => (
              // El índice forma parte de la clave porque un título del CMS puede
              // repetir una línea, y dos claves iguales romperían el escalonado.
              <span key={`${i}-${linea}`} className="sepHero__linea" style={{ '--linea': i }}>
                {linea}
              </span>
            ))}
          </Titulo>

          {textoDescripcion ? <p className="sepHero__descripcion">{textoDescripcion}</p> : null}

          <div className="sepHero__acciones">
            <Enlace className="sepHero__boton sepHero__boton--primario" href={primaria.href}>
              <span className="sepHero__botonBrillo" aria-hidden="true" />
              <IconoCalendario />
              <span className="sepHero__botonTexto">{primaria.texto}</span>
              <IconoFlecha />
            </Enlace>

            <Enlace className="sepHero__boton sepHero__boton--secundario" href={secundaria.href}>
              <span className="sepHero__botonBrillo" aria-hidden="true" />
              <IconoBus />
              <span className="sepHero__botonTexto">{secundaria.texto}</span>
              <IconoFlecha />
            </Enlace>
          </div>
        </div>
      </div>
    </section>
  );
}
