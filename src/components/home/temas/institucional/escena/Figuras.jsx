/*
 * Piezas reutilizables de la escena: bus, persona, palmera, árbol, farola y
 * nube. Todas se dibujan con el punto de contacto con el suelo en (0, 0) y
 * crecen hacia arriba, así colocarlas es un `translate` a la línea de suelo que
 * les toque, sin restar alturas a mano en la escenografía.
 *
 * Ninguna trae color: salen con clases y la paleta la resuelve el CSS según la
 * franja horaria.
 */

/* Unidad del bus: 296 de largo por 106 de alto, mirando a la derecha. */
export function Bus({ x = 0, base = 0, escala = 1, className = '', faros = false }) {
  return (
    <g className={`instBus ${className}`.trim()} transform={`translate(${x} ${base}) scale(${escala})`}>
      <ellipse className="instEsc__sombra" cx="148" cy="2" rx="150" ry="9" />

      {faros ? <path className="instEsc__haz" d="M292 -40 L470 -76 L470 4 L292 -30 Z" /> : null}

      <rect className="instEsc__carroceria" x="4" y="-106" width="292" height="88" rx="16" />
      <rect className="instEsc__filo" x="16" y="-105" width="268" height="5" rx="2.5" />

      <rect className="instEsc__vidrio" x="22" y="-96" width="196" height="34" rx="7" />
      <rect className="instEsc__vidrio" x="266" y="-98" width="24" height="42" rx="8" />
      <rect className="instEsc__puerta" x="230" y="-96" width="32" height="60" rx="6" />

      {[71, 120, 169].map((sx) => (
        <rect key={sx} className="instEsc__montante" x={sx} y="-96" width="4" height="34" />
      ))}

      <rect className="instEsc__rojo" x="4" y="-48" width="292" height="11" />
      <rect className="instEsc__faro" x="278" y="-40" width="14" height="10" rx="4" />
      <rect className="instEsc__faro instEsc__faro--rojo" x="8" y="-40" width="11" height="10" rx="4" />

      {[68, 244].map((cx) => (
        <g key={cx}>
          <circle className="instEsc__llanta" cx={cx} cy="-18" r="18" />
          <circle className="instEsc__rin" cx={cx} cy="-18" r="7.5" />
        </g>
      ))}
    </g>
  );
}

/* Silueta de pie: 40 de alto. Las piernas van en su propio grupo para que la
   variante que camina pueda animarlas sin tocar el resto del cuerpo. */
export function Persona({ x = 0, base = 0, escala = 1, className = '' }) {
  return (
    <g className={`instEsc__gente ${className}`.trim()} transform={`translate(${x} ${base}) scale(${escala})`}>
      <circle cx="0" cy="-34" r="5.4" />
      <path d="M-6.2 -28 Q0 -31.4 6.2 -28 L5 -13 L-5 -13 Z" />
      <g className="instFig__pierna instFig__pierna--a">
        <rect x="-4.6" y="-13.5" width="3.7" height="13.5" rx="1.7" />
      </g>
      <g className="instFig__pierna instFig__pierna--b">
        <rect x="0.9" y="-13.5" width="3.7" height="13.5" rx="1.7" />
      </g>
    </g>
  );
}

// Fronda: lente de dos curvas. Un trazo con punta cerrada en vértice daría una
// lanza; la segunda curva es la que le devuelve el grosor a la hoja.
function fronda(dx, dy) {
  return `M0 0 Q${dx * 0.55} ${dy * 0.55 - 17} ${dx} ${dy} Q${dx * 0.5} ${dy * 0.5 + 9} 0 0 Z`;
}

const FRONDAS = [[-66, -16], [-54, 24], [-22, -42], [20, -44], [58, -12], [48, 28], [6, 36]];

export function Palmera({ x = 0, base = 0, escala = 1, giro = 0, ritmo = 0 }) {
  return (
    <g className={`instPalmera instPalmera--r${ritmo}`} transform={`translate(${x} ${base}) scale(${escala}) rotate(${giro})`}>
      <ellipse className="instEsc__sombra" cx="4" cy="1" rx="26" ry="5" />
      <path className="instEsc__tronco" d="M-5 0 Q-2 -60 5 -104 L14 -102 Q4 -58 4 0 Z" />
      {/* La colocación va en el grupo de fuera y el cabeceo en el de dentro: un
          `transform` animado por CSS sustituye al atributo del mismo elemento,
          así que compartirlo dejaría la corona en el origen del dibujo. */}
      <g transform="translate(9 -104)">
        <g className="instPalmera__corona instEsc__fronda">
          {FRONDAS.map(([dx, dy], i) => (
            <path key={i} d={fronda(dx, dy)} />
          ))}
          <circle className="instEsc__coco" cx="0" cy="2" r="4" />
        </g>
      </g>
    </g>
  );
}

export function Arbol({ x = 0, base = 0, escala = 1, ritmo = 0 }) {
  return (
    <g className={`instArbol instArbol--r${ritmo}`} transform={`translate(${x} ${base}) scale(${escala})`}>
      <ellipse className="instEsc__sombra" cx="0" cy="1" rx="30" ry="6" />
      <path className="instEsc__tronco" d="M-4.5 0 L-3 -48 L3 -48 L4.5 0 Z" />
      <g className="instArbol__copa instEsc__follaje">
        <circle cx="0" cy="-74" r="33" />
        <circle cx="-25" cy="-56" r="24" />
        <circle cx="26" cy="-58" r="26" />
        <circle cx="2" cy="-46" r="25" />
      </g>
    </g>
  );
}

export function Farola({ x = 0, base = 0, alto = 140 }) {
  const cabeza = -alto;
  return (
    <g className="instFarola" transform={`translate(${x} ${base})`}>
      <ellipse className="instEsc__charco" cx="16" cy="0" rx="72" ry="14" />
      <path className="instEsc__haz" d={`M20 ${cabeza + 8} L64 6 L-32 6 Z`} />
      <rect className="instEsc__poste" x="-3.5" y={cabeza} width="7" height={alto} rx="3" />
      <path className="instEsc__poste" d={`M0 ${cabeza + 2} Q0 ${cabeza - 12} 16 ${cabeza - 12} L22 ${cabeza - 12} L22 ${cabeza - 6} L16 ${cabeza - 6} Q6 ${cabeza - 6} 6 ${cabeza + 2} Z`} />
      <rect className="instEsc__lampara" x="12" y={cabeza - 8} width="16" height="7" rx="3" />
      <ellipse className="instEsc__brillo" cx="20" cy={cabeza - 2} rx="13" ry="7" />
    </g>
  );
}

// Misma separación que en la palmera: la deriva se anima en el grupo de fuera
// y la colocación vive en el de dentro, porque un `transform` de CSS pisa al
// atributo del mismo elemento y la nube saltaría al origen del dibujo.
export function Nube({ x, y, s, o, deriva }) {
  return (
    <g className={`instEsc__nube instEsc__nube--${deriva}`} opacity={o}>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <ellipse cx="0" cy="7" rx="70" ry="17" />
        <ellipse cx="-32" cy="0" rx="35" ry="19" />
        <ellipse cx="7" cy="-10" rx="42" ry="25" />
        <ellipse cx="47" cy="0" rx="31" ry="17" />
      </g>
    </g>
  );
}
