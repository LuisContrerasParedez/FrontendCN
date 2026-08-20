import { useEffect, useId, useRef } from 'react';
import SmartLink from '../../../ui/SmartLink';
import EscenaInstitucional from './escena/EscenaInstitucional';
import useFranjaHoraria from './escena/useFranjaHoraria';
import { IconoBus, IconoCalendario, IconoFlecha, IconoTienda } from './iconos';
import './HeroInstitucional.css';

/*
 * Temática institucional — el respaldo permanente de la portada.
 *
 * Es la que se monta cuando la BD no trae temática, cuando la que trae está
 * fuera de vigencia o cuando su nombre no corresponde a ninguna campaña
 * registrada. Por eso no puede depender de ningún dato: con todos los campos
 * vacíos tiene que verse igual de terminada que una campaña montada a mano,
 * porque ese es exactamente el día en que se va a ver.
 *
 * Al no ser de temporada, lo que la mantiene viva es la hora de quien mira:
 * la escena amanece, atardece y anochece con el visitante.
 */

const RESPALDO = {
  etiqueta: 'Centra Norte',
  titulo: 'Todo lo que necesitas,\nen un mismo lugar',
  acento: 'un mismo lugar',
  descripcion:
    'Comercios, restaurantes, servicios y terminal de buses reunidos en un mismo punto de la ciudad.',
  accionPrimaria: { texto: 'Descubrir los locales', href: '/locales' },
  accionSecundaria: { texto: 'Consultar buses', href: '/buses' }
};

// Los pilares no son enlaces a propósito: con dos botones justo encima, cinco
// destinos en el mismo bloque dejan de ser una jerarquía y pasan a ser un menú.
const PILARES = [
  { Icono: IconoTienda, texto: 'Locales y restaurantes' },
  { Icono: IconoBus, texto: 'Terminal de buses' },
  { Icono: IconoCalendario, texto: 'Eventos y promociones' }
];

// Un campo vacío en la BD cuenta como "no vino nada", no como texto válido.
const oRespaldo = (valor, respaldo) => String(valor ?? '').trim() || respaldo;

const accion = (valor, respaldo) => ({
  texto: oRespaldo(valor?.texto, respaldo.texto),
  href: oRespaldo(valor?.href, respaldo.href)
});

/*
 * El título se compone por líneas para poder escalonar su entrada, y los `\n`
 * que vengan del CMS se respetan en vez de reflujar el texto: el salto es parte
 * de la composición —es lo que deja el titular en dos bloques macizos en vez de
 * en una tira que cruza media pantalla—.
 */
function lineas(titulo) {
  return String(titulo).split('\n').map((linea) => linea.trim()).filter(Boolean);
}

/*
 * El resalte se busca dentro de cada línea porque el título llega del CMS como
 * una sola cadena. Si la palabra no aparece —título propio, otra redacción— la
 * línea se pinta plana, en vez de partirse por un índice que no existe.
 */
function partir(linea, clave) {
  if (!clave) return { antes: linea, resalte: '', despues: '' };
  const posicion = linea.toLowerCase().indexOf(clave.toLowerCase());
  if (posicion < 0) return { antes: linea, resalte: '', despues: '' };
  return {
    antes: linea.slice(0, posicion),
    resalte: linea.slice(posicion, posicion + clave.length),
    despues: linea.slice(posicion + clave.length)
  };
}

/*
 * Parallax de puntero.
 *
 * Escribe dos custom properties normalizadas a [-1, 1] en la sección y deja que
 * el CSS decida cuánto se desplaza cada plano. No hay estado de React de por
 * medio: un `setState` por evento de ratón volvería a renderizar el árbol entero
 * sesenta veces por segundo para mover la escena cuatro píxeles.
 *
 * La lectura del rectángulo vive dentro del rAF, así que ocurre como mucho una
 * vez por fotograma y siempre antes de escribir: mover el ratón no encadena
 * reflows.
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
        nodo.style.setProperty('--inst-px', '0');
        nodo.style.setProperty('--inst-py', '0');
        return;
      }

      const caja = nodo.getBoundingClientRect();
      if (!caja.width || !caja.height) return;

      const px = ((clienteX - caja.left) / caja.width) * 2 - 1;
      const py = ((clienteY - caja.top) / caja.height) * 2 - 1;
      nodo.style.setProperty('--inst-px', Math.max(-1, Math.min(1, px)).toFixed(3));
      nodo.style.setProperty('--inst-py', Math.max(-1, Math.min(1, py)).toFixed(3));
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
      nodo.style.removeProperty('--inst-px');
      nodo.style.removeProperty('--inst-py');
    };
  }, [referencia]);
}

export default function HeroInstitucional({
  etiqueta,
  titulo,
  acento = RESPALDO.acento,
  descripcion,
  accionPrimaria,
  accionSecundaria,
  nivelTitulo = 'h1',
  id = 'centra-norte-institucional',
  className = '',
  // Permite inyectar el enlace del router sin que la carpeta dependa de él.
  // Por defecto usa el del sitio, para que los botones naveguen sin recargar.
  Enlace = SmartLink
}) {
  // Identificador único por instancia: dos heros en la misma página no pueden
  // compartir degradados.
  const uid = `inst${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const seccion = useRef(null);
  const franja = useFranjaHoraria();
  useParallaxPuntero(seccion);

  const Titulo = nivelTitulo === 'h2' ? 'h2' : 'h1';
  const textoEtiqueta = oRespaldo(etiqueta, RESPALDO.etiqueta);
  const lineasTitulo = lineas(oRespaldo(titulo, RESPALDO.titulo));
  const textoDescripcion = oRespaldo(descripcion, RESPALDO.descripcion);
  const claveAcento = String(acento || '').trim();
  const primaria = accion(accionPrimaria, RESPALDO.accionPrimaria);
  const secundaria = accion(accionSecundaria, RESPALDO.accionSecundaria);

  return (
    <section
      ref={seccion}
      className={`instHero instHero--${franja} ${className}`.trim()}
      aria-labelledby={`${id}-titulo`}
    >
      <div className="instHero__escena">
        <EscenaInstitucional uid={uid} />
      </div>

      <div className="instHero__velo" aria-hidden="true" />

      <div className="instHero__marco">
        <div className="instHero__contenido">
          <p className="instHero__etiqueta">
            <span className="instHero__etiquetaFilete" aria-hidden="true" />
            {textoEtiqueta}
          </p>

          <Titulo className="instHero__titulo" id={`${id}-titulo`} data-page-title tabIndex="-1">
            {lineasTitulo.map((linea, i) => {
              const { antes, resalte, despues } = partir(linea, claveAcento);
              return (
                // El índice forma parte de la clave porque un título del CMS
                // puede repetir una línea, y dos claves iguales romperían el
                // escalonado de entrada.
                <span key={`${i}-${linea}`} className="instHero__linea" style={{ '--linea': i }}>
                  {antes}
                  {resalte ? <span className="instHero__acento">{resalte}</span> : null}
                  {despues}
                </span>
              );
            })}
          </Titulo>

          {textoDescripcion ? <p className="instHero__descripcion">{textoDescripcion}</p> : null}

          <div className="instHero__acciones">
            <Enlace className="instHero__boton instHero__boton--primario" href={primaria.href}>
              <span className="instHero__botonTexto">{primaria.texto}</span>
              <IconoFlecha />
            </Enlace>

            <Enlace className="instHero__boton instHero__boton--secundario" href={secundaria.href}>
              <IconoBus />
              <span className="instHero__botonTexto">{secundaria.texto}</span>
            </Enlace>
          </div>

          <ul className="instHero__pilares">
            {PILARES.map(({ Icono, texto }) => (
              <li key={texto} className="instHero__pilar">
                <Icono />
                {texto}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
