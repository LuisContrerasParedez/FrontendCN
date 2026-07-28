import { f } from './geometria';
import { HORIZONTE, POSTES_RUSA, VIA_RUSA } from './escenografia';

/*
 * Montaña rusa del fondo derecho. El vagón recorre la vía con `offset-path`
 * (ver .hfa-rusa__vagon en el CSS), así que no se duplica el trazado.
 */
export default function MontanaRusa() {
  return (
    <g className="hfa-rusa">
      {POSTES_RUSA.map((p, i) => (
        <g key={i}>
          <line x1={p.x} y1={p.y} x2={p.x} y2={HORIZONTE + 76} stroke="#0d1650" strokeWidth="5" />
          <line x1={p.x - 13} y1={f(p.y + 40)} x2={p.x + 13} y2={f(p.y + 74)} stroke="#0d1650" strokeWidth="3" />
          <line x1={p.x + 13} y1={f(p.y + 40)} x2={p.x - 13} y2={f(p.y + 74)} stroke="#0d1650" strokeWidth="3" />
        </g>
      ))}
      <path d={VIA_RUSA} fill="none" stroke="#0b1350" strokeWidth="9" strokeLinecap="round" />
      <path d={VIA_RUSA} fill="none" stroke="#3846a8" strokeWidth="2.6" strokeLinecap="round" opacity=".85" />
      <circle cx="1362" cy="470" r="44" fill="none" stroke="#0b1350" strokeWidth="8" />
      <circle cx="1362" cy="470" r="44" fill="none" stroke="#3846a8" strokeWidth="2.2" opacity=".75" />
      <g className="hfa-rusa__vagon" style={{ offsetPath: `path("${VIA_RUSA}")` }}>
        <rect x="-26" y="-11" width="22" height="13" rx="4" fill="#ff5b45" />
        <rect x="-2" y="-11" width="22" height="13" rx="4" fill="#ffd54d" />
        <circle cx="-20" cy="4" r="3" fill="#0b1350" />
        <circle cx="-8" cy="4" r="3" fill="#0b1350" />
        <circle cx="4" cy="4" r="3" fill="#0b1350" />
        <circle cx="16" cy="4" r="3" fill="#0b1350" />
      </g>
    </g>
  );
}
