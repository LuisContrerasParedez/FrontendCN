import { f, rango } from './geometria';
import { COLOR_BOMBILLA } from './escenografia';
import { Persona } from './Figuras';

/*
 * Puesto de feria: trasera con estantes de premios, mostrador, toldo a franjas
 * con festón y bombillas. Con `atendiente` aparece un tendero tras el mostrador.
 */
export default function Puesto({
  uid,
  id,
  x,
  ancho,
  techo,
  base,
  colorA = '#e8443f',
  colorB = '#fdf1dc',
  premios = true,
  atendiente = false
}) {
  const franjas = Math.max(5, Math.round(ancho / 30));
  const paso = ancho / franjas;
  const cx = f(x + ancho / 2);

  return (
    <g className="hfa-puesto">
      <ellipse cx={cx} cy={base + 6} rx={f(ancho * 0.62)} ry="16" fill={`url(#${uid}-charco)`} opacity=".5" />

      {/* Trasera y estantes con premios */}
      <rect x={x + 8} y={techo + 18} width={ancho - 16} height={base - techo - 18} rx="6" fill="#241557" />
      {premios ? (
        <g>
          {/* Los estantes van en tono madera: sin ellos los premios se leían
              como bombillas sueltas flotando dentro del puesto. */}
          <rect x={x + 18} y={techo + 46} width={ancho - 36} height="5" rx="2.5" fill="#e8cfa0" />
          <rect x={x + 18} y={techo + 86} width={ancho - 36} height="5" rx="2.5" fill="#e8cfa0" />
          {Array.from({ length: 12 }, (_, i) => (
            <circle
              key={i}
              cx={f(x + 26 + (i % 6) * ((ancho - 52) / 5))}
              cy={f(techo + (i < 6 ? 38 : 78))}
              r={f(rango(i + id * 31, 5, 8.5, 7))}
              fill={COLOR_BOMBILLA[(i + id) % COLOR_BOMBILLA.length]}
              opacity=".85"
            />
          ))}
        </g>
      ) : null}

      {/* El tendero queda detrás del mostrador */}
      {atendiente ? <Persona x={f(cx - ancho * 0.18)} y={base - 26} s={0.82} variante={0} tono="#0b1038" /> : null}

      {/* Mostrador */}
      <rect x={x} y={base - 46} width={ancho} height="46" rx="5" fill="#1b1049" />
      <rect x={x} y={base - 46} width={ancho} height="9" rx="4.5" fill="#f0d9a8" />
      {Array.from({ length: franjas }, (_, i) => (i % 2 === 0 ? (
        <rect key={i} x={f(x + i * paso)} y={base - 37} width={f(paso)} height="37" fill="#2a1a63" />
      ) : null))}

      {/* Toldo a franjas con festón */}
      <g>
        <path
          d={`M${x - 10} ${techo} L${f(x + ancho + 10)} ${techo} L${f(x + ancho - 2)} ${techo + 26} L${x + 2} ${techo + 26} Z`}
          fill={colorB}
        />
        {Array.from({ length: franjas }, (_, i) => (i % 2 === 0 ? (
          <path
            key={i}
            d={`M${f(x - 10 + i * ((ancho + 20) / franjas))} ${techo} L${f(x - 10 + (i + 1) * ((ancho + 20) / franjas))} ${techo} L${f(x + 2 + (i + 1) * ((ancho - 4) / franjas))} ${techo + 26} L${f(x + 2 + i * ((ancho - 4) / franjas))} ${techo + 26} Z`}
            fill={colorA}
          />
        ) : null))}
        <path
          d={Array.from({ length: franjas }, (_, i) => `${i === 0 ? `M${x + 2} ${techo + 26}` : ''} q${f((ancho - 4) / franjas / 2)} 13 ${f((ancho - 4) / franjas)} 0`).join(' ')}
          fill={colorA}
          stroke="#ffca55"
          strokeWidth="1.8"
          strokeOpacity=".5"
        />
      </g>

      {/* Postes y bombillas del toldo */}
      <rect x={x + 2} y={techo + 20} width="6" height={base - techo - 20} rx="3" fill="#f0d9a8" />
      <rect x={f(x + ancho - 8)} y={techo + 20} width="6" height={base - techo - 20} rx="3" fill="#f0d9a8" />
      {Array.from({ length: franjas + 1 }, (_, i) => (
        <circle
          key={i}
          className={`hfa-bombilla hfa-bombilla--${i % 3}`}
          cx={f(x + 2 + i * ((ancho - 4) / franjas))}
          cy={techo + 34}
          r="3.4"
          fill={COLOR_BOMBILLA[i % COLOR_BOMBILLA.length]}
        />
      ))}
    </g>
  );
}
