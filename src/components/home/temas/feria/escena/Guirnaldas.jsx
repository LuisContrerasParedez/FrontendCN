import { f } from './geometria';
import { COLOR_BOMBILLA, GUIRNALDAS } from './escenografia';

/* Cables de bombillas tendidos entre carpas y árboles. */
export default function Guirnaldas() {
  return (
    <g className="hfa-guirnaldas">
      {GUIRNALDAS.map((g) => (
        <g key={g.key}>
          <path d={g.d} fill="none" stroke="#2f3a86" strokeWidth="2" />
          {/* Nudo en cada extremo: deja ver de dónde cuelga el cable */}
          <circle cx={g.a.x} cy={g.a.y} r="3" fill="#f4d08a" />
          <circle cx={g.b.x} cy={g.b.y} r="3" fill="#f4d08a" />
          {g.bombillas.map((b, i) => (
            <g key={i}>
              <line x1={b.x} y1={b.y} x2={b.x} y2={f(b.y + 7)} stroke="#2f3a86" strokeWidth="1.5" />
              <circle
                className={`hfa-bombilla hfa-bombilla--${b.grupo}`}
                cx={b.x}
                cy={f(b.y + 11)}
                r="4.2"
                fill={COLOR_BOMBILLA[i % COLOR_BOMBILLA.length]}
              />
            </g>
          ))}
        </g>
      ))}
    </g>
  );
}
