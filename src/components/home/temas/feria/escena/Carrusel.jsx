import { f } from './geometria';
import { COLOR_BOMBILLA } from './escenografia';
import Carpa from './Carpa';
import { Caballito, Persona } from './Figuras';

/*
 * Carrusel del extremo izquierdo. Su techo reutiliza <Carpa> sin muro, y la
 * altura del techo tapa a propósito las cabinas más bajas de la rueda,
 * que quedan detrás.
 */
export default function Carrusel({ uid }) {
  return (
    <g className="hfa-carrusel">
      <ellipse cx="184" cy="676" rx="150" ry="24" fill="#2a1d5c" />
      <ellipse cx="184" cy="668" rx="144" ry="20" fill="#3a2a72" />
      <ellipse cx="184" cy="620" rx="128" ry="26" fill={`url(#${uid}-charco)`} opacity=".55" />
      <rect x="176" y="546" width="16" height="120" fill="#f0d9a8" />
      {[96, 138, 232, 272].map((x, i) => (
        <g key={x}>
          <rect x={x} y="562" width="8" height="104" rx="4" fill="#f4d08a" />
          <path
            d={`M${x} 562 q8 12 8 22 t-8 22 t8 22 t-8 22 t8 20`}
            fill="none"
            stroke={i % 2 ? '#ff5fa5' : '#3fd8e8'}
            strokeWidth="2.6"
            opacity=".85"
          />
        </g>
      ))}
      <Carpa
        uid={uid}
        id="carrusel"
        cx={184}
        base={570}
        hw={128}
        alto={74}
        franjas={12}
        colorA="#e8443f"
        colorB="#fdf1dc"
        muro={0}
        banderin="#ffd54d"
      />
      <Caballito x={124} y={648} s={0.78} />
      <Caballito x={244} y={654} s={0.82} crin="#3fd8e8" montura="#e8443f" />
      <Persona x={126} y={626} s={0.52} variante={2} tono="#120b3d" />
      <Persona x={246} y={632} s={0.54} variante={0} tono="#120b3d" />
      {Array.from({ length: 12 }, (_, i) => (
        <circle
          key={i}
          className={`hfa-bombilla hfa-bombilla--${i % 3}`}
          cx={f(62 + i * 22)}
          cy={f(574 + Math.abs(5.5 - i) * 1.5)}
          r="3.2"
          fill={COLOR_BOMBILLA[i % COLOR_BOMBILLA.length]}
        />
      ))}
    </g>
  );
}
