import { HOJAS_AL_VIENTO, MOTAS } from './escenografia';

/**
 * Atmósfera: siete hojas que descienden de la copa y cinco motas de luz.
 * Cada elemento lleva su propia duración y desfase para que el conjunto nunca
 * caiga en un pulso común, que es lo que delata una animación barata.
 */
export default function Particulas({ uid }) {
  return (
    <g>
      <defs>
        <radialGradient id={`${uid}-mota`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff6d4" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffe9a8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {HOJAS_AL_VIENTO.map((h, i) => (
        <g
          key={i}
          className="sepEsc__hoja"
          style={{ '--hoja-duracion': `${h.duracion}s`, '--hoja-retraso': `${h.retraso}s` }}
        >
          <use
            href={`#${uid}-palmada`}
            fill={`url(#${uid}-copa-media)`}
            opacity="0.85"
            transform={`translate(${h.x} ${h.y}) rotate(${h.giro}) scale(${h.s * 0.5})`}
          />
        </g>
      ))}

      {MOTAS.map((m, i) => (
        <circle
          key={i}
          className="sepEsc__mota"
          cx={m.x}
          cy={m.y}
          r={m.r * 3}
          fill={`url(#${uid}-mota)`}
          style={{ '--mota-duracion': `${m.duracion}s`, '--mota-retraso': `${m.retraso}s` }}
        />
      ))}
    </g>
  );
}
