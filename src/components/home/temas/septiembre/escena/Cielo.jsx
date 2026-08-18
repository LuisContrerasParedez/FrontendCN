import { mancha, NUBES, BANDADA, VB } from './escenografia';

/**
 * Cielo de mañana alta: degradado frío arriba, calidez en el horizonte y una
 * luz clave arriba a la izquierda que define la iluminación de toda la escena.
 */
export default function Cielo({ uid }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-cielo`} x1="0" y1="0" x2="0.12" y2="1">
          <stop offset="0" stopColor="#b3d8f4" />
          <stop offset="0.24" stopColor="#cfe6f9" />
          <stop offset="0.5" stopColor="#e6f2fc" />
          <stop offset="0.74" stopColor="#f6f6f1" />
          <stop offset="1" stopColor="#fdefdb" />
        </linearGradient>

        <radialGradient id={`${uid}-sol`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff8e2" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#fdf0cd" stopOpacity="0.42" />
          <stop offset="1" stopColor="#fdf0cd" stopOpacity="0" />
        </radialGradient>

        <radialGradient id={`${uid}-nubeBase`} cx="0.5" cy="0.56" r="0.52">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.58" stopColor="#ffffff" stopOpacity="0.62" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        <radialGradient id={`${uid}-nubeLuz`} cx="0.42" cy="0.4" r="0.55">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.98" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width={VB.w} height={VB.h} fill={`url(#${uid}-cielo)`} />

      <circle className="sepEsc__sol" cx="386" cy="82" r="460" fill={`url(#${uid}-sol)`} />

      {NUBES.map((n) => (
        <g
          key={n.id}
          className="sepEsc__nube"
          opacity={n.opacidad}
          style={{
            '--nube-duracion': `${n.duracion}s`,
            '--nube-retraso': `${n.retraso}s`,
            '--nube-deriva': `${n.deriva}px`
          }}
        >
          <path
            d={mancha(n.x, n.y, n.rx, n.ry, { puntos: 15, irregular: 0.26, semilla: n.semilla })}
            fill={`url(#${uid}-nubeBase)`}
          />
          <path
            d={mancha(n.x - n.rx * 0.2, n.y - n.ry * 0.44, n.rx * 0.58, n.ry * 0.82, {
              puntos: 11,
              irregular: 0.3,
              semilla: n.semilla + 40
            })}
            fill={`url(#${uid}-nubeLuz)`}
          />
        </g>
      ))}

      {/* El atributo `transform` posiciona; la clase anima. Separados, porque la
          propiedad CSS `transform` sustituiría al atributo por completo. */}
      <g className="sepEsc__bandada" fill="none" stroke="#7c9ab6" strokeWidth="1.6" strokeLinecap="round">
        {BANDADA.map((ave, i) => (
          <g key={i} transform={`translate(${ave.x} ${ave.y})`}>
            {/* La deriva va en la capa sin escalar: si compartiera nodo con el
                `scale`, cada ave avanzaría a distinta velocidad y la bandada
                se abriría en abanico. */}
            <g className="sepEsc__ave" style={{ '--ave-retraso': `${ave.retraso}s` }}>
              <g transform={`scale(${ave.s})`}>
                <path d="M-7 0C-4 -3.4 -1.6 -3.4 0 -1.2C1.6 -3.4 4 -3.4 7 0" opacity="0.5" />
              </g>
            </g>
          </g>
        ))}
      </g>
    </g>
  );
}
