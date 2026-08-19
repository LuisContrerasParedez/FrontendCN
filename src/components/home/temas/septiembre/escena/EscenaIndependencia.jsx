import { useRef } from 'react';
import Cielo from './Cielo';
import Paisaje from './Paisaje';
import Ceiba from './Ceiba';
import MonjasBlancas from './MonjasBlancas';
import Quetzal from './Quetzal';
import Particulas from './Particulas';
import Palmada from './Palmada';
import useVueloQuetzal from './useVueloQuetzal';
import { VB } from './escenografia';

export default function EscenaIndependencia({ uid }) {
  const escena = useRef(null);
  const ave = useRef(null);
  const ancla = useRef(null);
  useVueloQuetzal({ escena, ave, ancla });

  return (
    <svg
      ref={escena}
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
        <Ceiba uid={uid} ancla={ancla} />
        <MonjasBlancas uid={uid} />
        <Particulas uid={uid} />
      </g>

      {/* El quetzal es el único que cruza planos, así que va en su propia capa
          y por delante de todo. */}
      <g className="sepEsc__capa sepEsc__capa--aire">
        <Quetzal uid={uid} ave={ave} />
      </g>
    </svg>
  );
}
