import { DISCO, ESTRELLAS, NUBES, VB } from './escenografia';
import { Nube } from './Figuras';

/*
 * Cielo: degradado, disco (sol o luna según la hora), halo, estrellas y nubes.
 *
 * El disco no cambia de sitio entre franjas —solo de color y de halo—: moverlo
 * obligaría a recomponer la escena entera tres veces para un detalle de 46 px.
 * Las estrellas y el resplandor cálido del horizonte se encienden y se apagan
 * desde el CSS, que es quien sabe si es de día, de tarde o de noche.
 */
export default function Cielo({ uid }) {
  return (
    <g className="instEsc__cielo">
      <rect x="0" y="0" width={VB.w} height={VB.h} fill={`url(#${uid}-cielo)`} />

      <g className="instEsc__estrellas">
        {ESTRELLAS.map((e, i) => (
          <circle
            key={i}
            className={`instEsc__estrella instEsc__estrella--${e.grupo}`}
            cx={e.cx}
            cy={e.cy}
            r={e.r}
            fillOpacity={e.o}
          />
        ))}
      </g>

      <g className="instEsc__astro">
        <circle cx={DISCO.cx} cy={DISCO.cy} r={DISCO.r * 6} fill={`url(#${uid}-halo)`} />
        <circle className="instEsc__disco" cx={DISCO.cx} cy={DISCO.cy} r={DISCO.r} />
        {/* Los mares de la luna van siempre dibujados y solo se ven en la franja
            nocturna: son tres círculos, sale más barato que montar otro astro. */}
        <g className="instEsc__mares">
          <circle cx={DISCO.cx - 14} cy={DISCO.cy - 12} r="9" />
          <circle cx={DISCO.cx + 13} cy={DISCO.cy + 4} r="6.5" />
          <circle cx={DISCO.cx - 4} cy={DISCO.cy + 17} r="5" />
        </g>
      </g>

      <g className="instEsc__nubes">
        {NUBES.map((n, i) => <Nube key={i} {...n} />)}
      </g>

      {/* Resplandor tendido sobre el horizonte: es lo que más carga la hora del
          día, así que se deja por delante de las nubes lejanas. */}
      <rect x="0" y="300" width={VB.w} height="300" fill={`url(#${uid}-resplandor)`} />
    </g>
  );
}
