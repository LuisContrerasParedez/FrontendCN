import Cielo from './Cielo';
import Paisaje from './Paisaje';
import Ceiba from './Ceiba';
import MonjasBlancas from './MonjasBlancas';
import Quetzal from './Quetzal';
import Particulas from './Particulas';
import Palmada from './Palmada';
import { VB } from './escenografia';

/**
 * Ilustración completa en un único SVG de 1600 × 900.
 *
 * El orden de pintado es el orden de profundidad, y cada plano vive en su
 * propio grupo `sepEsc__capa` para que el parallax de puntero pueda moverlos a
 * distinta velocidad. Esos grupos no llevan ninguna otra animación a propósito:
 * si compartieran nodo con el balanceo de la copa, la propiedad CSS `transform`
 * del parallax sustituiría a la del vaivén en vez de sumarse.
 *
 * `preserveAspectRatio="xMaxYMid slice"`:
 *
 *  · En escritorio el recorte sólo puede ser vertical, y va centrado. Anclarlo
 *    abajo se comería la copa entera en cuanto la ventana es más baja que un
 *    16:9, que es el caso corriente en portátiles.
 *  · En vertical el recorte es sólo horizontal —la banda inferior es más alta
 *    que ancha respecto al lienzo—, así que el ancla `xMax` mantiene a la vista
 *    el lado derecho, que es donde vive la ceiba, y el eje Y da igual.
 *
 * Un único valor sirve para las dos composiciones porque cada una recorta por
 * un eje distinto.
 */
export default function EscenaIndependencia({ uid }) {
  return (
    <svg
      className="sepEsc"
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      preserveAspectRatio="xMaxYMid slice"
      role="presentation"
      focusable="false"
    >
      <defs>
        <Palmada id={`${uid}-palmada`} />
      </defs>

      <g className="sepEsc__capa sepEsc__capa--fondo">
        <Cielo uid={uid} />
      </g>

      <g className="sepEsc__capa sepEsc__capa--medio">
        <Paisaje uid={uid} />
      </g>

      <g className="sepEsc__capa sepEsc__capa--frente">
        <Ceiba uid={uid} />
        <MonjasBlancas uid={uid} />
        <Particulas uid={uid} />
      </g>

      {/* El quetzal es el único que cruza planos, así que va en su propia capa
          y por delante de todo. */}
      <g className="sepEsc__capa sepEsc__capa--aire">
        <Quetzal uid={uid} />
      </g>
    </svg>
  );
}
