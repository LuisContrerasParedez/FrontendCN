/* Iconos de los botones: SVG inline, sin librerías, sin fuentes de iconos y sin emojis. */

export function IconoFlecha() {
  return (
    <svg className="hfa__icono" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path
        d="M8 16 16 8M9.5 8H16v6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconoBus() {
  return (
    <svg className="hfa__icono" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6.2C4 4.9 5 4 6.3 4h11.4C19 4 20 4.9 20 6.2V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
        <path d="M4.4 8.6h15.2" />
        <path d="M4.4 13.2h15.2" />
        <path d="M9.6 8.8v4.2M14.4 8.8v4.2" />
        <path d="M7 18v1.6M17 18v1.6" />
      </g>
      <circle cx="7.4" cy="15.6" r="1.05" fill="currentColor" />
      <circle cx="16.6" cy="15.6" r="1.05" fill="currentColor" />
    </svg>
  );
}
