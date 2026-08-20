/* Iconos del hero: SVG inline, sin librerías, sin fuentes de iconos y sin emojis. */

export function IconoFlecha() {
  return (
    <svg className="instHero__icono" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path d="M4 12h14M13 6.5 18.5 12 13 17.5" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconoTienda() {
  return (
    <svg className="instHero__icono" viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.4 9h17.2l-1.9-5H5.3L3.4 9Z" />
        <path d="M5.2 9v10.6h13.6V9" />
        <path d="M9.4 19.6v-5.4h5.2v5.4" />
        <path d="M3.4 9a2.8 2.8 0 0 0 5.6 0 2.8 2.8 0 0 0 5.6 0 2.8 2.8 0 0 0 5.6 0" />
      </g>
    </svg>
  );
}

export function IconoBus() {
  return (
    <svg className="instHero__icono" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6.2C4 4.9 5 4 6.3 4h11.4C19 4 20 4.9 20 6.2V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
        <path d="M4.4 8.6h15.2M4.4 13.2h15.2M9.6 8.8v4.2M14.4 8.8v4.2M7 18v1.6M17 18v1.6" />
      </g>
      <circle cx="7.4" cy="15.6" r="1.05" fill="currentColor" />
      <circle cx="16.6" cy="15.6" r="1.05" fill="currentColor" />
    </svg>
  );
}

export function IconoCalendario() {
  return (
    <svg className="instHero__icono" viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.4" y="5" width="17.2" height="15.6" rx="2.4" />
        <path d="M3.4 10h17.2M8.4 3.2v3.6M15.6 3.2v3.6" />
      </g>
      <circle cx="8.6" cy="14.4" r="1.15" fill="currentColor" />
      <circle cx="12.6" cy="14.4" r="1.15" fill="currentColor" />
    </svg>
  );
}
