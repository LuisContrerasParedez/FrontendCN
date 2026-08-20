import { ACERA, ARBOLES, BUS_CERCANO, CALLE, CAMINANTES, EJE_CALLE, FAROLAS, GENTE, HORIZONTE, PALMERAS, RAYAS, VB } from './escenografia';
import { Arbol, Bus, Farola, Palmera, Persona } from './Figuras';

/* Suelo, calzada y acera. Va antes que los edificios para que ellos apoyen
   encima y sus sombras caigan sobre este plano, no al revés. */
export function Suelo({ uid }) {
  return (
    <g className="instEsc__suelo">
      <rect x="0" y={HORIZONTE} width={VB.w} height={VB.h - HORIZONTE} fill={`url(#${uid}-suelo)`} />
      <rect className="instEsc__calzada" x="0" y={CALLE.arriba} width={VB.w} height={CALLE.abajo - CALLE.arriba} />
      <rect className="instEsc__bordillo" x="0" y={CALLE.arriba} width={VB.w} height="4" />

      <g className="instEsc__rayas">
        {RAYAS.map((x) => (
          <rect key={x} x={x} y={EJE_CALLE - 3} width="62" height="6" rx="3" />
        ))}
      </g>

      <rect className="instEsc__acera" x="0" y={ACERA} width={VB.w} height={VB.h - ACERA} />
      <rect className="instEsc__bordillo" x="0" y={ACERA} width={VB.w} height="5" />
    </g>
  );
}

/*
 * Primer plano: vegetación, farolas, gente y el bus que cruza.
 *
 * El bus va solo. Dos vehículos moviéndose a la vez convierten el hero en un
 * anuncio y le quitan el sitio al titular, que es lo que hay que leer.
 */
export default function Plaza() {
  return (
    <g className="instPlaza">
      {ARBOLES.map((a, i) => <Arbol key={a.x} {...a} ritmo={i % 2} />)}
      {PALMERAS.map((p, i) => <Palmera key={p.x} {...p} ritmo={i % 2} />)}

      {/* Dos envoltorios: el de fuera lleva el recorrido y el de dentro el
          balanceo. Un `transform` animado por CSS sustituye al atributo del
          mismo elemento, así que la colocación del bus tiene que quedar por
          debajo de las dos animaciones, nunca compartiendo elemento con ellas. */}
      <g className="instBus--cercano">
        <g className="instBus__vaiven">
          <Bus x={0} base={BUS_CERCANO.base} escala={BUS_CERCANO.escala} faros />
        </g>
      </g>

      {FAROLAS.map((f) => <Farola key={f.x} {...f} />)}

      <g className="instEsc__multitud">
        {GENTE.map((p) => <Persona key={p.x} {...p} />)}
        {CAMINANTES.map((p) => (
          <g key={p.x} className={`instFig__camina instFig__camina--${p.sentido > 0 ? 'ida' : 'vuelta'}`}>
            <Persona x={p.x} base={p.base} escala={p.escala} className="instFig__anda" />
          </g>
        ))}
      </g>
    </g>
  );
}
