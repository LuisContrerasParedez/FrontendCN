import { CARPAS, CHARCOS, MULTITUD, MULTITUD_FONDO, PUESTOS, VB } from './escenografia';
import Carpa from './Carpa';
import Carrusel from './Carrusel';
import Cielo from './Cielo';
import Fondo from './Fondo';
import Guirnaldas from './Guirnaldas';
import MontanaRusa from './MontanaRusa';
import Puesto from './Puesto';
import RuedaFortuna from './RuedaFortuna';
import { Persona } from './Figuras';

/*
 * Escena de feria nocturna dibujada 100% con SVG inline + CSS.
 * No se usa ninguna imagen (ni <img>, ni background-image, ni base64, ni iconos
 * externos): cada carpa, cabina, persona y bombilla es geometría calculada.
 *
 * El orden de los grupos ES la profundidad: cielo → ciudad → atracciones del
 * fondo → rueda → carpas → guirnaldas → multitud en primer plano.
 */
export default function EscenaFeria({ uid, fechas }) {
  return (
    <svg
      className="hfa__svg"
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${uid}-cielo`} x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0%" stopColor="#050b33" />
          <stop offset="38%" stopColor="#0d1856" />
          <stop offset="72%" stopColor="#182169" />
          <stop offset="100%" stopColor="#241c6b" />
        </linearGradient>
        <linearGradient id={`${uid}-suelo`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a1d5c" />
          <stop offset="45%" stopColor="#1e1447" />
          <stop offset="100%" stopColor="#120c33" />
        </linearGradient>
        <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb347" stopOpacity=".34" />
          <stop offset="55%" stopColor="#ff7a3c" stopOpacity=".10" />
          <stop offset="100%" stopColor="#ff7a3c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-charco`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb45c" stopOpacity=".55" />
          <stop offset="100%" stopColor="#ffb45c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-nucleo`} cx="38%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#fff2c4" />
          <stop offset="45%" stopColor="#ffc44d" />
          <stop offset="100%" stopColor="#f2801f" />
        </radialGradient>
        <linearGradient id={`${uid}-acero`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4d5ac6" />
          <stop offset="100%" stopColor="#1a2170" />
        </linearGradient>
        <linearGradient id={`${uid}-llanta`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe28a" />
          <stop offset="50%" stopColor="#f5b731" />
          <stop offset="100%" stopColor="#ffd76a" />
        </linearGradient>
        <linearGradient id={`${uid}-lonaSombra`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".16" />
          <stop offset="55%" stopColor="#000022" stopOpacity="0" />
          <stop offset="100%" stopColor="#0b1140" stopOpacity=".34" />
        </linearGradient>
        <linearGradient id={`${uid}-escalera`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c46bff" />
          <stop offset="100%" stopColor="#ff5fa5" />
        </linearGradient>
      </defs>

      <Cielo uid={uid} />
      <Fondo uid={uid} />
      <MontanaRusa />
      <RuedaFortuna uid={uid} fechas={fechas} />
      <Carrusel uid={uid} />

      {PUESTOS.map((p) => <Puesto key={p.id} uid={uid} {...p} />)}
      {CARPAS.map((c) => <Carpa key={c.id} uid={uid} {...c} />)}

      <g className="hfa-multitud hfa-multitud--fondo">
        {MULTITUD_FONDO.map((p, i) => <Persona key={i} {...p} tono="#0d1240" />)}
      </g>

      <Guirnaldas />

      {/* Primer plano */}
      <g className="hfa-charcos">
        {CHARCOS.map((x) => (
          <ellipse key={x} cx={x} cy="700" rx="150" ry="34" fill={`url(#${uid}-charco)`} opacity=".28" />
        ))}
      </g>
      <g className="hfa-multitud">
        {MULTITUD.map((p, i) => <Persona key={i} {...p} />)}
      </g>
      <rect x="0" y={VB.h - 70} width={VB.w} height="70" fill="#0b0722" opacity=".55" />
    </svg>
  );
}
