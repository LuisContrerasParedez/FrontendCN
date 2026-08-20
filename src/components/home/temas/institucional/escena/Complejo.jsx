import { ALERO, CENTRO, PLANTA_BAJA, PLATAFORMA, PORTAL, ROMBO, TOTEM, VENTANA, VENTANAS } from './escenografia';

/*
 * El centro comercial y el tótem de la plaza.
 *
 * Es arquitectura, así que es casi toda recta: la personalidad la ponen tres
 * gestos y no el detalle. El alero que vuela por los dos costados —para que el
 * bloque no se lea como una caja apoyada en el suelo—, el atrio acristalado de
 * triple altura que parte la fachada justo sobre la entrada, y el tótem, que
 * es el único punto vertical del cuadro y lo que identifica el lugar.
 */

const OFFSET_ROMBO = (ROMBO.lado + ROMBO.hueco) / 2;

// Mismo reparto que `.brand-symbol` en la cabecera: azules en una diagonal,
// rojos en la otra. Si la marca cambia, cambia en los dos sitios.
const CUADROS = [
  { dx: -OFFSET_ROMBO, dy: -OFFSET_ROMBO, clase: 'instEsc__marcaAzul' },
  { dx: OFFSET_ROMBO, dy: -OFFSET_ROMBO, clase: 'instEsc__marcaRoja' },
  { dx: -OFFSET_ROMBO, dy: OFFSET_ROMBO, clase: 'instEsc__marcaRoja' },
  { dx: OFFSET_ROMBO, dy: OFFSET_ROMBO, clase: 'instEsc__marcaAzul' }
];

function Totem() {
  const altoPanel = TOTEM.base - TOTEM.y - 20;
  return (
    <g className="instTotem">
      <rect className="instEsc__obra--oscura" x={TOTEM.x - 12} y={TOTEM.base - 24} width={TOTEM.w + 24} height="24" rx="4" />
      <rect className="instEsc__panel" x={TOTEM.x} y={TOTEM.y} width={TOTEM.w} height={altoPanel} rx="10" />
      <rect className="instEsc__rojo" x={TOTEM.x + 15} y={TOTEM.y + 110} width={TOTEM.w - 30} height={altoPanel - 130} rx="4" />

      <g transform={`rotate(45 ${ROMBO.cx} ${ROMBO.cy})`}>
        {CUADROS.map(({ dx, dy, clase }, i) => (
          <rect
            key={i}
            className={clase}
            x={ROMBO.cx + dx - ROMBO.lado / 2}
            y={ROMBO.cy + dy - ROMBO.lado / 2}
            width={ROMBO.lado}
            height={ROMBO.lado}
            rx="2.4"
          />
        ))}
      </g>
    </g>
  );
}

export default function Complejo({ uid }) {
  return (
    <g className="instComplejo">
      {/* Cuerpo */}
      <rect className="instEsc__obra" x={CENTRO.x} y={CENTRO.y} width={CENTRO.w} height={CENTRO.alto} />

      {/* Antepechos: las tres bandas horizontales que hacen leer el muro cortina. */}
      {[428, 500, 572].map((y) => (
        <rect key={y} className="instEsc__obra--oscura" x={CENTRO.x + 12} y={y} width={CENTRO.w - 24} height="58" />
      ))}

      <g className="instEsc__ventanas">
        {VENTANAS.map((v, i) => (
          <rect
            key={i}
            className={`instEsc__vidrio${v.encendida ? ' is-encendida' : ''} instEsc__vidrio--g${v.grupo}`}
            x={v.x}
            y={v.y}
            width={VENTANA.w}
            height={VENTANA.alto}
            rx="2"
          />
        ))}
      </g>

      {/* Atrio de triple altura sobre la entrada: parte la fachada y es lo que
          justifica que el portal esté donde está. */}
      <rect className="instEsc__atrio" x={PORTAL.x} y={CENTRO.y + 14} width={PORTAL.w} height={PLATAFORMA - CENTRO.y - 14} rx="3" />
      <rect className="instEsc__atrioLuz" x={PORTAL.x} y={CENTRO.y + 14} width={PORTAL.w} height={PLATAFORMA - CENTRO.y - 14} fill={`url(#${uid}-atrio)`} />
      {[0.34, 0.66].map((t) => (
        <rect key={t} className="instEsc__montante" x={PORTAL.x + PORTAL.w * t} y={CENTRO.y + 14} width="4" height={PLATAFORMA - CENTRO.y - 14} />
      ))}

      {/* Planta baja: vidriera continua, más clara que los pisos de arriba. */}
      <rect className="instEsc__zocalo" x={CENTRO.x} y={PLANTA_BAJA.y} width={CENTRO.w} height={PLANTA_BAJA.alto} />
      <rect className="instEsc__portal" x={PORTAL.x + 18} y={PORTAL.y} width={PORTAL.w - 36} height={PORTAL.alto} rx="4" />

      {/* Alero. La franja roja de su canto es el único acento de marca en todo
          el bloque; con más, la fachada se vuelve un anuncio. */}
      <rect className="instEsc__alero" x={ALERO.x} y={ALERO.y} width={ALERO.w} height={ALERO.alto} rx="4" />
      <rect className="instEsc__rojo" x={ALERO.x} y={ALERO.y + ALERO.alto} width={ALERO.w} height="5" />

      {/* Casetas de instalaciones en la cubierta: rompen la horizontal perfecta. */}
      <rect className="instEsc__obra--oscura" x={CENTRO.x + 260} y={ALERO.y - 26} width={64} height="26" rx="3" />
      <rect className="instEsc__obra--oscura" x={CENTRO.x + 420} y={ALERO.y - 17} width={44} height="17" rx="3" />

      <Totem />

      {/* Luz que se derrama del portal sobre la plataforma. */}
      <ellipse className="instEsc__charco" cx={PORTAL.x + PORTAL.w / 2} cy={PLATAFORMA + 4} rx="132" ry="18" />
    </g>
  );
}
