import { f } from './geometria';

/*
 * Carpa de feria: lona a franjas radiales recortada con clipPath, festón inferior,
 * muro con entrada y banderín. Con `muro={0}` sirve también de techo de carrusel.
 */
export default function Carpa({
  uid,
  id,
  cx,
  base,
  hw,
  alto,
  franjas = 9,
  colorA,
  colorB,
  muro = 46,
  banderin = '#ff5b45'
}) {
  const cima = base - alto;
  const paso = (hw * 2) / franjas;
  const clipId = `${uid}-carpa-${id}`;
  const lona =
    `M${f(cx - hw)} ${base} ` +
    `C${f(cx - hw * 0.94)} ${f(base - alto * 0.4)}, ${f(cx - hw * 0.46)} ${f(base - alto * 0.84)}, ${cx} ${f(cima)} ` +
    `C${f(cx + hw * 0.46)} ${f(base - alto * 0.84)}, ${f(cx + hw * 0.94)} ${f(base - alto * 0.4)}, ${f(cx + hw)} ${base} Z`;

  let festón = `M${f(cx - hw)} ${base}`;
  for (let i = 0; i < franjas; i += 1) festón += ` q${f(paso / 2)} 15 ${f(paso)} 0`;

  const muroBase = base + muro;

  return (
    <g className="hfa-carpa">
      <defs>
        <clipPath id={clipId}><path d={lona} /></clipPath>
      </defs>

      {/* Muro con franjas verticales */}
      {muro > 0 ? (
        <g>
          <rect x={f(cx - hw * 0.9)} y={base - 4} width={f(hw * 1.8)} height={muro + 4} fill={colorB} />
          {Array.from({ length: franjas }, (_, i) => (i % 2 === 0 ? (
            <rect
              key={i}
              x={f(cx - hw * 0.9 + (i * hw * 1.8) / franjas)}
              y={base - 4}
              width={f((hw * 1.8) / franjas)}
              height={muro + 4}
              fill={colorA}
            />
          ) : null))}
          <path
            d={`M${f(cx - hw * 0.28)} ${muroBase} L${f(cx - hw * 0.28)} ${f(base + muro * 0.36)} Q${cx} ${f(base + muro * 0.02)} ${f(cx + hw * 0.28)} ${f(base + muro * 0.36)} L${f(cx + hw * 0.28)} ${muroBase} Z`}
            fill="#170f3d"
          />
          <path
            d={`M${f(cx - hw * 0.28)} ${muroBase} L${f(cx - hw * 0.28)} ${f(base + muro * 0.36)} Q${cx} ${f(base + muro * 0.02)} ${f(cx + hw * 0.28)} ${f(base + muro * 0.36)} L${f(cx + hw * 0.28)} ${muroBase}`}
            fill="none"
            stroke="#ffca55"
            strokeWidth="2.5"
            opacity=".65"
          />
        </g>
      ) : null}

      {/* Lona a franjas radiales */}
      <g clipPath={`url(#${clipId})`}>
        <rect x={f(cx - hw - 4)} y={f(cima - 4)} width={f(hw * 2 + 8)} height={alto + 12} fill={colorB} />
        {Array.from({ length: franjas }, (_, i) => (i % 2 === 0 ? (
          <path
            key={i}
            d={`M${cx} ${f(cima)} L${f(cx - hw + i * paso)} ${base + 8} L${f(cx - hw + (i + 1) * paso)} ${base + 8} Z`}
            fill={colorA}
          />
        ) : null))}
        <path d={lona} fill={`url(#${uid}-lonaSombra)`} />
      </g>

      <path d={lona} fill="none" stroke="#0e1440" strokeWidth="2" opacity=".45" />
      <path d={festón} fill={colorA} stroke="#ffca55" strokeWidth="2" strokeOpacity=".55" />

      {/* Mástil y banderín */}
      <line x1={cx} y1={f(cima)} x2={cx} y2={f(cima - 34)} stroke="#f4d08a" strokeWidth="3" />
      <path
        className="hfa-banderin"
        d={`M${cx} ${f(cima - 34)} L${f(cx + 30)} ${f(cima - 26)} L${cx} ${f(cima - 17)} Z`}
        fill={banderin}
        style={{ transformOrigin: `${cx}px ${f(cima - 30)}px` }}
      />
      <circle cx={cx} cy={f(cima - 36)} r="3.6" fill="#ffd76a" />
    </g>
  );
}
