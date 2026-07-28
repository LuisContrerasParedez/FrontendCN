import { ESTRELLAS, HORIZONTE, NUBES, RUEDA, VB } from './escenografia';

function Nube({ x, y, s, o, deriva }) {
  return (
    <g className={`hfa-nube hfa-nube--${deriva}`} transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <ellipse cx="0" cy="6" rx="66" ry="17" />
      <ellipse cx="-30" cy="0" rx="34" ry="19" />
      <ellipse cx="6" cy="-9" rx="40" ry="24" />
      <ellipse cx="44" cy="0" rx="30" ry="17" />
    </g>
  );
}

/* Fondo de noche: degradado, halos cálidos, estrellas y nubes a la deriva. */
export default function Cielo({ uid }) {
  return (
    <g className="hfa-cielo">
      <rect x="0" y="0" width={VB.w} height={VB.h} fill={`url(#${uid}-cielo)`} />
      <ellipse cx={RUEDA.cx} cy={RUEDA.cy} rx="560" ry="440" fill={`url(#${uid}-halo)`} />
      <ellipse cx="900" cy={HORIZONTE} rx="820" ry="180" fill={`url(#${uid}-halo)`} opacity=".7" />

      <g className="hfa-estrellas">
        {ESTRELLAS.map((e, i) => (
          <circle
            key={i}
            className={`hfa-estrella hfa-estrella--${e.grupo}`}
            cx={e.cx}
            cy={e.cy}
            r={e.r}
            fill="#ffffff"
            fillOpacity={e.o}
          />
        ))}
      </g>

      <g fill="#1e2a72">
        {NUBES.map((n, i) => <Nube key={i} {...n} />)}
      </g>
    </g>
  );
}
