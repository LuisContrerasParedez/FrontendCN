/**
 * Estado vacío de la agenda: ni eventos de este mes, ni próximos, ni archivo.
 * Es lo único que queda en la página, así que en lugar de una caja con texto
 * se dibuja el boleto de la marca esperando su fecha.
 *
 * El dibujo es decorativo —`aria-hidden`— y toda su animación vive en el
 * bloque `prefers-reduced-motion: no-preference` de la hoja: quien pide menos
 * movimiento recibe la misma escena, quieta.
 */
export default function AgendaVacia() {
  return (
    <div className="agenda-empty" role="status">
      <div className="agenda-empty__stage" aria-hidden="true">
        <span className="agenda-empty__halo" />
        <svg className="agenda-empty__ticket" viewBox="0 0 240 148" role="presentation" focusable="false">
          <g className="agenda-empty__ticket-body">
            <rect x="20" y="30" width="200" height="92" rx="16" fill="var(--fair-blue)" />
            {/* El troquel del boleto: la línea punteada y las dos muescas que
                la rematan contra los bordes superior e inferior. */}
            <path d="M92 44v64" stroke="rgba(255,255,255,.42)" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 9" />
            <circle cx="92" cy="30" r="8" fill="var(--fair-paper)" />
            <circle cx="92" cy="122" r="8" fill="var(--fair-paper)" />
            {/* Talón: la casilla del día que todavía no tiene número. */}
            <rect x="38" y="56" width="36" height="40" rx="8" fill="rgba(255,255,255,.12)" />
            <path d="M38 68h36" stroke="var(--fair-yellow)" strokeWidth="4" strokeLinecap="round" />
            <path d="M48 50v10M64 50v10" stroke="var(--fair-yellow)" strokeWidth="4" strokeLinecap="round" />
            {/* Renglones en blanco donde iría el nombre del evento. */}
            <path d="M112 62h84" stroke="var(--brand-accent-on-dark)" strokeWidth="7" strokeLinecap="round" />
            <path d="M112 82h64" stroke="rgba(255,255,255,.34)" strokeWidth="7" strokeLinecap="round" />
            <path d="M112 100h40" stroke="rgba(255,255,255,.2)" strokeWidth="7" strokeLinecap="round" />
          </g>
          <path
            className="agenda-empty__shine"
            d="M20 30h200v92H20z"
            fill="url(#agenda-empty-shine)"
          />
          <defs>
            <linearGradient id="agenda-empty-shine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset=".5" stopColor="#fff" stopOpacity=".16" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        <span className="agenda-empty__spark agenda-empty__spark--1" />
        <span className="agenda-empty__spark agenda-empty__spark--2" />
        <span className="agenda-empty__spark agenda-empty__spark--3" />
      </div>
      <div className="agenda-empty__copy">
        <p className="agenda-empty__eyebrow">Agenda en blanco</p>
        <h2>Todavía no hay eventos publicados</h2>
        <p>Estamos preparando las próximas actividades de Centra Norte. Vuelve pronto: en cuanto tengan fecha, aparecerán aquí.</p>
      </div>
    </div>
  );
}
