import { MONJAS } from './escenografia';

/**
 * Monja blanca (Lycaste skinneri var. alba), flor nacional.
 * Tres flores en toda la escena: son un acento, no un motivo.
 * Estructura botánica real: tres sépalos exteriores, dos pétalos interiores y
 * un labelo frontal con la garganta amarilla y el rubor magenta.
 */

const SEPALO = 'M0 0C-6.5 -4 -9 -11.5 -5.5 -16.5C-3 -20 3 -20 5.5 -16.5C9 -11.5 6.5 -4 0 0Z';
const PETALO = 'M0 0C-4.5 -3 -6.5 -8.5 -4.5 -12.5C-2.5 -15 2.5 -15 4.5 -12.5C6.5 -8.5 4.5 -3 0 0Z';
const LABELO = 'M0 0C-5 -2 -7.5 -7 -6 -11.5C-4.5 -15 4.5 -15 6 -11.5C7.5 -7 5 -2 0 0Z';

function Flor({ uid }) {
  return (
    <g className="sepMonja__flor">
      <g fill={`url(#${uid}-sepalo)`}>
        <path d={SEPALO} transform="rotate(0)" />
        <path d={SEPALO} transform="rotate(120)" />
        <path d={SEPALO} transform="rotate(240)" />
      </g>
      <g fill={`url(#${uid}-petalo)`}>
        <path d={PETALO} transform="rotate(62)" />
        <path d={PETALO} transform="rotate(-62)" />
      </g>
      <path d={LABELO} transform="rotate(180)" fill={`url(#${uid}-labelo)`} />
      <ellipse cx="0" cy="3.4" rx="2.6" ry="3.6" fill="#f1c64c" />
      <circle cx="0" cy="0" r="2.2" fill="#fbf6e6" />
    </g>
  );
}

export default function MonjasBlancas({ uid }) {
  return (
    <g>
      <defs>
        <radialGradient id={`${uid}-sepalo`} cx="0.5" cy="0.72" r="0.72">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.62" stopColor="#f7fafb" />
          <stop offset="1" stopColor="#dbe6ea" />
        </radialGradient>
        <radialGradient id={`${uid}-petalo`} cx="0.5" cy="0.75" r="0.7">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e8f0f3" />
        </radialGradient>
        <radialGradient id={`${uid}-labelo`} cx="0.5" cy="0.86" r="0.8">
          <stop offset="0" stopColor="#c8437f" stopOpacity="0.82" />
          <stop offset="0.42" stopColor="#e9a4c4" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffffff" />
        </radialGradient>
        <linearGradient id={`${uid}-hojaMonja`} gradientUnits="objectBoundingBox" x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#5f9a4a" />
          <stop offset="1" stopColor="#3a6b34" />
        </linearGradient>
      </defs>

      {MONJAS.map((m) => (
        // El grupo exterior sitúa la mata; el interior es el que se mece, para
        // que la propiedad CSS `transform` no sustituya al atributo.
        <g key={m.id} transform={`translate(${m.x} ${m.y}) scale(${m.escala})`}>
          <g className="sepMonja" style={{ '--monja-retraso': `${m.retraso}s` }}>
            <g fill={`url(#${uid}-hojaMonja)`}>
              <path d="M0 0C-16 -24 -25 -54 -22 -84C-15 -58 -5 -28 4 -4Z" />
              <path d="M0 0C7 -28 20 -56 38 -76C27 -48 14 -22 5 -2Z" opacity="0.92" />
              <path d="M0 0C-3 -30 2 -62 13 -90C11 -60 8 -30 4 -4Z" opacity="0.86" />
            </g>
            <ellipse cx="0" cy="-4" rx="11" ry="7" fill="#5b8f42" />

            {m.flores.map((f, i) => (
              <g key={i}>
                <path
                  d={`M2 -8C${2 + f.dx * 0.25} ${-8 + f.dy * 0.4} ${2 + f.dx * 0.7} ${-8 + f.dy * 0.72} ${f.dx} ${f.dy}`}
                  fill="none"
                  stroke="#537f3c"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />
                <g transform={`translate(${f.dx} ${f.dy}) rotate(${f.giro}) scale(${f.s})`}>
                  <Flor uid={uid} />
                </g>
              </g>
            ))}
          </g>
        </g>
      ))}
    </g>
  );
}
