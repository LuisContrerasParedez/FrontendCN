import { ANDEN, BUSES_ANDEN, COLUMNAS, MARQUESINA, PLATAFORMA } from './escenografia';
import { Bus } from './Figuras';

/*
 * La terminal: marquesina de bóvedas, andén y los buses estacionados.
 *
 * La cubierta se construye por módulos y no como una losa recta: la bóveda es
 * la silueta que hace que se lea "terminal" y no "cobertizo", y repetirla
 * cuatro veces da la longitud sin dibujar un solo detalle más.
 */

// Cada módulo es una bóveda cerrada por su canto, así la cubierta tiene grosor
// visible desde abajo en vez de ser una línea.
function boveda(x1, x2) {
  const medio = (x1 + x2) / 2;
  const cima = MARQUESINA.y - MARQUESINA.vuelo * 1.9;
  return `M${x1} ${MARQUESINA.y} Q${medio} ${cima} ${x2} ${MARQUESINA.y} `
    + `L${x2} ${MARQUESINA.y + MARQUESINA.canto} Q${medio} ${cima + MARQUESINA.canto} ${x1} ${MARQUESINA.y + MARQUESINA.canto} Z`;
}

const CUBIERTA = COLUMNAS.slice(0, -1).map((x, i) => boveda(x, COLUMNAS[i + 1])).join(' ');
const BAJO_CUBIERTA = MARQUESINA.y + MARQUESINA.canto;

export default function Terminal() {
  return (
    <g className="instTerminal">
      {/* Cuerpo de la estación, detrás del pilar de columnas. */}
      <rect className="instEsc__obra--oscura" x="412" y="566" width="566" height={PLATAFORMA - 566} />
      <rect className="instEsc__zocalo" x="432" y="606" width="526" height="38" />

      {COLUMNAS.map((x) => (
        <g key={x} className="instEsc__columna">
          <rect x={x - 5} y={BAJO_CUBIERTA} width="10" height={PLATAFORMA - BAJO_CUBIERTA} />
          <path d={`M${x - 14} ${BAJO_CUBIERTA} L${x + 14} ${BAJO_CUBIERTA} L${x + 6} ${BAJO_CUBIERTA + 16} L${x - 6} ${BAJO_CUBIERTA + 16} Z`} />
        </g>
      ))}

      <path className="instEsc__cubierta" d={CUBIERTA} />

      {/* Luminarias colgadas del intradós: son las que explican de dónde sale la
          luz cálida del andén. */}
      {COLUMNAS.slice(0, -1).map((x, i) => {
        const cx = (x + COLUMNAS[i + 1]) / 2;
        return (
          <g key={cx} className={`instEsc__luminaria instEsc__luminaria--${i % 3}`}>
            <rect className="instEsc__poste" x={cx - 1.5} y={BAJO_CUBIERTA} width="3" height="16" />
            <ellipse className="instEsc__lampara" cx={cx} cy={BAJO_CUBIERTA + 19} rx="9" ry="4" />
            <ellipse className="instEsc__brillo" cx={cx} cy={BAJO_CUBIERTA + 21} rx="22" ry="12" />
          </g>
        );
      })}

      <rect className="instEsc__anden" x={ANDEN.x} y={ANDEN.y} width={ANDEN.w} height={ANDEN.alto} rx="3" />

      <g className="instEsc__flota">
        {BUSES_ANDEN.map((b) => <Bus key={b.x} {...b} />)}
      </g>
    </g>
  );
}
