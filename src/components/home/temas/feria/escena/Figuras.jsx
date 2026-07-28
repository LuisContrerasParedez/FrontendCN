/* Figuras vivas de la feria: visitantes y caballitos del carrusel. */

export function Persona({ x, y, s = 1, variante = 0, tono = '#070d30' }) {
  const brazos = variante === 3
    ? <path d="M-12 -40 -22 -18 -17 -16 -8 -34Z M12 -40 24 -22 19 -18 8 -34Z" />
    : <path d="M-12 -40 -18 -14 -13 -12 -6 -34Z M12 -40 18 -14 13 -12 6 -34Z" />;
  const piernas = variante === 1
    ? <path d="M-10 -14 -20 16 -11 17 -2 -12Z M2 -12 12 16 21 15 10 -14Z" />
    : <path d="M-10 -14 -12 16 -3 16 -1 -12Z M1 -12 3 16 12 16 10 -14Z" />;
  return (
    <g className="hfa-persona" transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse className="hfa-persona__sombra" cx="0" cy="18" rx="17" ry="4" />
      <g fill={tono}>
        <circle cx="0" cy="-52" r="9.5" />
        <path d="M-12 -42 Q0 -47 12 -42 L15 -13 Q0 -8 -15 -13Z" />
        {brazos}
        {piernas}
        {variante === 3 ? <rect x="18" y="-24" width="13" height="16" rx="2.5" /> : null}
      </g>
      <path className="hfa-persona__luz" d="M-12 -42 Q0 -47 12 -42" />
      <path className="hfa-persona__luz" d="M-8.5 -57 Q0 -62 8.5 -57" />
    </g>
  );
}

export function Caballito({ x, y, s = 1, cuerpo = '#fdf1dc', crin = '#ff6fa8', montura = '#5b8cff' }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* La barra atraviesa el caballo, así que va detrás del cuerpo */}
      <line x1="0" y1="-104" x2="0" y2="30" stroke="#f4d08a" strokeWidth="4" />
      {/* Cola y crin, por detrás */}
      <path d="M-28 -14 Q-52 -16 -54 10 Q-46 -2 -34 0 Q-38 12 -30 18 Q-26 4 -24 -6 Z" fill={crin} />
      <path d="M12 -22 Q30 -34 30 -58 Q40 -52 38 -34 Q36 -20 24 -10 Z" fill={crin} />
      <g fill={cuerpo}>
        {/* Patas: dos traseras flexionadas y dos delanteras estiradas */}
        <path d="M-24 0 Q-34 12 -32 30 L-22 30 Q-24 14 -14 4 Z" />
        <path d="M-14 4 Q-22 16 -20 30 L-10 30 Q-12 16 -4 6 Z" />
        <path d="M16 2 Q26 14 24 30 L14 30 Q16 16 8 6 Z" />
        <path d="M24 -2 Q36 10 34 28 L26 28 Q28 12 18 2 Z" />
        {/* Tronco, cuello y cabeza */}
        <ellipse cx="-2" cy="-8" rx="32" ry="19" />
        <path d="M14 -20 Q28 -32 28 -54 L44 -52 Q44 -30 32 -12 Z" />
        <path d="M28 -54 Q30 -66 42 -68 L58 -60 Q58 -50 46 -48 L36 -46 Z" />
        <path d="M30 -66 L32 -76 41 -68 Z" />
      </g>
      {/* Montura y riendas */}
      <path d="M-18 -22 Q-2 -30 16 -22 L13 -6 Q-2 0 -16 -6 Z" fill={montura} />
      <path d="M-18 -22 Q-2 -30 16 -22" fill="none" stroke="#ffd76a" strokeWidth="2" />
      <path d="M30 -58 Q40 -48 52 -56" fill="none" stroke="#ffd76a" strokeWidth="1.8" />
      <circle cx="46" cy="-60" r="2.4" fill="#1b1049" />
    </g>
  );
}
