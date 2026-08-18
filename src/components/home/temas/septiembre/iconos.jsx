/**
 * Íconos del hero. Un solo sistema: rejilla de 24, trazo de 1.7, remates
 * redondeados y ningún relleno salvo los acentos deliberados.
 */

const BASE = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: 'false'
};

export function IconoCalendario() {
  return (
    <svg className="sepHero__icono" {...BASE}>
      <rect x="3.25" y="5" width="17.5" height="15.75" rx="3.25" />
      <path d="M8 3.25v3.5M16 3.25v3.5M3.4 10h17.2" />
      <path d="M8.6 14.4h2.1" strokeWidth="2.6" />
    </svg>
  );
}

export function IconoBus() {
  return (
    <svg className="sepHero__icono" {...BASE}>
      <path d="M5.25 4h13.5A2.25 2.25 0 0 1 21 6.25v9A2.25 2.25 0 0 1 18.75 17.5H5.25A2.25 2.25 0 0 1 3 15.25v-9A2.25 2.25 0 0 1 5.25 4Z" />
      <path d="M3.2 9.5h17.6M12 4v5.5M7 17.5V20M17 17.5V20" />
      <path d="M6.9 13.6h.01M17.1 13.6h.01" strokeWidth="2.6" />
    </svg>
  );
}

export function IconoFlecha() {
  return (
    <svg className="sepHero__icono sepHero__icono--flecha" {...BASE}>
      <path d="M4.5 12h14M13 6.5l5.5 5.5L13 17.5" />
    </svg>
  );
}
