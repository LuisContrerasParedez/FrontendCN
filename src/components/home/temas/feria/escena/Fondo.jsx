import { f } from './geometria';
import {
  ARBOLEDA_CERCA,
  ARBOLEDA_LEJANA,
  EDIFICIOS,
  HORIZONTE,
  VB,
  VENTANAS
} from './escenografia';

/* Silueta de ciudad, arboleda del horizonte y suelo del recinto. */
export default function Fondo({ uid }) {
  return (
    <g className="hfa-fondo">
      <g className="hfa-ciudad">
        {EDIFICIOS.map((ed, i) => (
          <g key={i}>
            <rect x={ed.x} y={HORIZONTE - ed.h} width={ed.w} height={ed.h} fill="#101a55" />
            <rect x={ed.x} y={HORIZONTE - ed.h} width={ed.w} height="5" fill="#182463" />
            {i % 3 === 0 ? (
              <g>
                <line
                  x1={f(ed.x + ed.w / 2)}
                  y1={HORIZONTE - ed.h}
                  x2={f(ed.x + ed.w / 2)}
                  y2={HORIZONTE - ed.h - 22}
                  stroke="#182463"
                  strokeWidth="3"
                />
                <circle
                  className={`hfa-bombilla hfa-bombilla--${i % 3}`}
                  cx={f(ed.x + ed.w / 2)}
                  cy={HORIZONTE - ed.h - 24}
                  r="2.8"
                  fill="#ff6f6f"
                />
              </g>
            ) : null}
          </g>
        ))}
        {VENTANAS.map((v) => (
          <rect
            key={v.key}
            x={v.x}
            y={v.y}
            width="6"
            height="9"
            rx="1.4"
            fill={v.calido ? '#ffce6a' : '#7fd3ff'}
            opacity={v.calido ? 0.75 : 0.5}
          />
        ))}
      </g>

      <path d={ARBOLEDA_LEJANA} fill="#0a1244" />
      <path d={ARBOLEDA_CERCA} fill="#070d33" />
      <rect x="0" y={HORIZONTE + 22} width={VB.w} height={VB.h - HORIZONTE - 22} fill={`url(#${uid}-suelo)`} />
      <ellipse cx="800" cy={HORIZONTE + 34} rx="900" ry="34" fill="#33236b" opacity=".55" />
    </g>
  );
}
