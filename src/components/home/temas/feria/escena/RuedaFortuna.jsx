import { f, polar } from './geometria';
import {
  COLORES_CABINA,
  COLOR_BOMBILLA,
  RADIO_ANILLO_INT,
  RADIO_PIVOTE,
  RUEDA,
  TOTAL_CABINAS
} from './escenografia';

// Cada cabina cuelga de un pivote sobre la llanta y muestra la fecha de un evento.
function calcularCabinas(fechas) {
  return Array.from({ length: TOTAL_CABINAS }, (_, i) => {
    const angulo = -90 + i * (360 / TOTAL_CABINAS);
    const etiqueta = String(fechas[i % fechas.length] || '').trim();
    const corte = etiqueta.indexOf(' ');
    return {
      i,
      llanta: polar(RUEDA.cx, RUEDA.cy, RUEDA.r, angulo),
      pivote: polar(RUEDA.cx, RUEDA.cy, RADIO_PIVOTE, angulo),
      color: COLORES_CABINA[i % COLORES_CABINA.length],
      dia: corte > 0 ? etiqueta.slice(0, corte) : etiqueta,
      mes: corte > 0 ? etiqueta.slice(corte + 1) : ''
    };
  });
}

/*
 * La corona gira sin parar y cada cabina contrarrota con los mismos keyframes
 * en `reverse`, de modo que nunca se inclina (ver CSS .hfa-rueda__giro).
 */
export default function RuedaFortuna({ uid, fechas }) {
  const cabinas = calcularCabinas(fechas);

  return (
    <g className="hfa-rueda">
      {/* Estructura fija */}
      <g stroke={`url(#${uid}-acero)`} strokeLinecap="round">
        <line x1="378" y1="304" x2="216" y2="652" strokeWidth="11" />
        <line x1="378" y1="304" x2="344" y2="652" strokeWidth="8" />
        <line x1="422" y1="304" x2="584" y2="652" strokeWidth="11" />
        <line x1="422" y1="304" x2="456" y2="652" strokeWidth="8" />
        <line x1="252" y1="574" x2="352" y2="574" strokeWidth="5" />
        <line x1="448" y1="574" x2="548" y2="574" strokeWidth="5" />
        <line x1="289" y1="496" x2="352" y2="574" strokeWidth="4" />
        <line x1="359" y1="496" x2="252" y2="574" strokeWidth="4" />
        <line x1="511" y1="496" x2="448" y2="574" strokeWidth="4" />
        <line x1="441" y1="496" x2="548" y2="574" strokeWidth="4" />
      </g>

      {/* Corona giratoria */}
      <g className="hfa-rueda__giro" style={{ transformOrigin: `${RUEDA.cx}px ${RUEDA.cy}px` }}>
        <circle cx={RUEDA.cx} cy={RUEDA.cy} r={RUEDA.r} fill="none" stroke={`url(#${uid}-llanta)`} strokeWidth="6" />
        <circle
          cx={RUEDA.cx}
          cy={RUEDA.cy}
          r={RUEDA.r - 13}
          fill="none"
          stroke={`url(#${uid}-llanta)`}
          strokeWidth="3"
          opacity=".8"
        />
        <circle cx={RUEDA.cx} cy={RUEDA.cy} r={RADIO_ANILLO_INT} fill="none" stroke="#4a56c8" strokeWidth="4" />
        <circle cx={RUEDA.cx} cy={RUEDA.cy} r={RADIO_ANILLO_INT - 13} fill="none" stroke="#4a56c8" strokeWidth="2.4" opacity=".7" />

        {/* Celosía en zigzag entre los dos anillos */}
        <path
          d={Array.from({ length: 25 }, (_, i) => {
            const p = polar(RUEDA.cx, RUEDA.cy, i % 2 === 0 ? RADIO_ANILLO_INT : RUEDA.r - 13, i * 14.4);
            return `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`;
          }).join(' ')}
          fill="none"
          stroke="#4a56c8"
          strokeWidth="2"
          opacity=".7"
        />

        {/* Radios */}
        {Array.from({ length: TOTAL_CABINAS }, (_, i) => {
          const a = -90 + i * (360 / TOTAL_CABINAS);
          const p = polar(RUEDA.cx, RUEDA.cy, RUEDA.r - 13, a);
          const q = polar(RUEDA.cx, RUEDA.cy, 30, a);
          return <line key={i} x1={q.x} y1={q.y} x2={p.x} y2={p.y} stroke={`url(#${uid}-llanta)`} strokeWidth="3.2" />;
        })}

        {/* Bombillas de la llanta */}
        {Array.from({ length: 36 }, (_, i) => {
          const p = polar(RUEDA.cx, RUEDA.cy, RUEDA.r, i * 10);
          return (
            <circle
              key={i}
              className={`hfa-bombilla hfa-bombilla--${i % 3}`}
              cx={p.x}
              cy={p.y}
              r="3.6"
              fill={i % 2 ? '#fff3c4' : '#ffc44d'}
            />
          );
        })}

        {/* Cabinas */}
        {cabinas.map((c) => (
          <g key={c.i} className="hfa-cabina">
            <line
              x1={c.llanta.x}
              y1={c.llanta.y}
              x2={c.pivote.x}
              y2={c.pivote.y}
              stroke={`url(#${uid}-llanta)`}
              strokeWidth="3"
            />
            <g className="hfa-cabina__pivote" style={{ transformOrigin: `${c.pivote.x}px ${c.pivote.y}px` }}>
              <circle cx={c.pivote.x} cy={c.pivote.y} r="4.4" fill="#ffd76a" />
              <line
                x1={f(c.pivote.x - 17)}
                y1={f(c.pivote.y + 10)}
                x2={c.pivote.x}
                y2={c.pivote.y}
                stroke={c.color}
                strokeWidth="2.4"
              />
              <line
                x1={f(c.pivote.x + 17)}
                y1={f(c.pivote.y + 10)}
                x2={c.pivote.x}
                y2={c.pivote.y}
                stroke={c.color}
                strokeWidth="2.4"
              />
              <rect
                x={f(c.pivote.x - 32)}
                y={f(c.pivote.y + 9)}
                width="64"
                height="60"
                rx="17"
                fill="none"
                stroke={c.color}
                strokeWidth="9"
                opacity=".22"
              />
              <rect
                x={f(c.pivote.x - 32)}
                y={f(c.pivote.y + 9)}
                width="64"
                height="60"
                rx="17"
                fill="#0c1240"
                stroke={c.color}
                strokeWidth="3.2"
              />
              <text className="hfa-cabina__dia" x={c.pivote.x} y={f(c.pivote.y + 36)} textAnchor="middle" fill={c.color}>
                {c.dia}
              </text>
              <text className="hfa-cabina__mes" x={c.pivote.x} y={f(c.pivote.y + 55)} textAnchor="middle" fill={c.color}>
                {c.mes}
              </text>
            </g>
          </g>
        ))}

        {/* Núcleo */}
        <circle cx={RUEDA.cx} cy={RUEDA.cy} r="52" fill="none" stroke="#4a56c8" strokeWidth="3" />
        <circle cx={RUEDA.cx} cy={RUEDA.cy} r="42" fill={`url(#${uid}-nucleo)`} />
        <circle cx={RUEDA.cx} cy={RUEDA.cy} r="20" fill="#fff2c4" opacity=".9" />
      </g>

      {/* Andén de embarque, escalera y viga base */}
      <g>
        <rect x="196" y="640" width="408" height="18" rx="9" fill="#191f63" />
        <rect x="308" y="602" width="184" height="14" rx="7" fill="#2a1a63" />
        <rect x="308" y="602" width="184" height="4" rx="2" fill="#ff5fa5" opacity=".8" />
        <path d="M356 650 L370 612 L430 612 L444 650 Z" fill="#241559" />
        {Array.from({ length: 4 }, (_, i) => (
          <rect
            key={i}
            x={f(358 + i * 3.4)}
            y={f(640 - i * 9)}
            width={f(84 - i * 6.8)}
            height="6"
            rx="3"
            fill={`url(#${uid}-escalera)`}
            opacity={f(0.55 + i * 0.11)}
          />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <circle
            key={i}
            className={`hfa-bombilla hfa-bombilla--${i % 3}`}
            cx={f(212 + i * 46)}
            cy="637"
            r="3.4"
            fill={COLOR_BOMBILLA[i % COLOR_BOMBILLA.length]}
          />
        ))}
      </g>
    </g>
  );
}
