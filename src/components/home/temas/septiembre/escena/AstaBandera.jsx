import { useState } from 'react';
import Escudo from '../Escudo';
import { SUELO } from './escenografia';

/**
 * Asta con el pabellón nacional, plantada en la pradera.
 *
 * Sustituye al listón ceremonial que cerraba el hero por abajo. La diferencia
 * no es de estilo sino de categoría: el listón era decoración pegada sobre la
 * ilustración —una franja que no existía dentro del paisaje— y la bandera
 * quedaba forzosamente encima, como un sello. Aquí la bandera es **un objeto
 * más de la escena**: tiene asta, apoya en el suelo, proyecta sombra, se ordena
 * en profundidad con la ceiba y se mueve con el mismo aire que mueve la copa.
 *
 * Colocación (lienzo 1600 × 900):
 *
 *  · el asta va en x = 900, el único corredor libre de la composición —a la
 *    izquierda queda la columna de texto, que no pasa del 52 %, y a la derecha
 *    empieza la copa en x = 1000—, así que no tapa ni una cosa ni la otra;
 *  · el paño vuela hacia la derecha y **cruza por delante del piso alto de la
 *    copa**. Es a propósito: el celeste y el blanco del pabellón sobre un cielo
 *    pálido se lavan, y el verde oscuro del follaje es el único fondo de la
 *    escena que los sostiene. La mitad izquierda del paño queda contra el
 *    cielo y la derecha contra la copa, que es lo que le da profundidad;
 *  · el pie queda en x = 900 sobre la línea de suelo, a la izquierda del
 *    contrafuerte de raíces (que arranca en 1040), para que asta y árbol se
 *    lean a la misma distancia sin tocarse.
 */

/* ------------------------------------------------------------------ */
/* Geometría del paño                                                  */
/* ------------------------------------------------------------------ */

/**
 * El paño no es un rectángulo deformado: se genera muestreando una onda.
 *
 * `amplitud` crece con `t^1.25` —cero en la driza, máxima en el batiente—
 * porque la tela está sujeta por un lado: una onda de amplitud constante hace
 * que el paño parezca una serpentina flotando suelta. 1.3 ciclos a lo ancho es
 * el número que produce dos crestas y un valle; con dos ciclos o más la tela se
 * lee como una chapa corrugada.
 *
 * Proporción 1.6 : 1 (5 : 8), la del pabellón. Aquí sí puede respetarse porque
 * la bandera ya no está escorzada dentro de nada.
 */
const PANO = {
  x: 901,
  y: 216,
  largo: 246,
  alto: 152,
  ciclos: 1.3,
  amplitud: 24
};

const ASTA = {
  x: 900,
  pie: SUELO + 8,
  cima: 190
};

const r1 = (v) => Math.round(v * 10) / 10;

const fase = (t) => t * PANO.ciclos * Math.PI * 2;
const ex = (t) => PANO.x + PANO.largo * t;
const arriba = (t) => PANO.y + PANO.amplitud * Math.pow(t, 1.25) * Math.sin(fase(t));
/* El alto también respira: la tela se acorta donde gira y se abre en el
   batiente. Sin esa modulación el canto inferior copia exactamente al superior
   y el paño se ve como una cinta de grosor constante. */
const alto = (t) => PANO.alto * (1 + 0.055 * Math.cos(fase(t)) + 0.055 * t);
const abajo = (t) => arriba(t) + alto(t);

/** Catmull-Rom convertido a Bézier: pasa por todas las muestras. */
function curva(p) {
  let d = '';
  for (let i = 0; i < p.length - 1; i += 1) {
    const p0 = p[Math.max(0, i - 1)];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[Math.min(p.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d;
}

const MUESTRAS = Array.from({ length: 17 }, (_, i) => i / 16);
const CANTO_ALTO = MUESTRAS.map((t) => [ex(t), arriba(t)]);
const CANTO_BAJO = MUESTRAS.map((t) => [ex(t), abajo(t)]);

/* El batiente no se cierra con una recta: se abomba 7 u hacia fuera. Es el
   canto suelto de la tela, el único que no está sujeto por nada. */
const CONTORNO =
  `M${r1(CANTO_ALTO[0][0])} ${r1(CANTO_ALTO[0][1])}` +
  curva(CANTO_ALTO) +
  `Q${r1(ex(1) + 7)} ${r1((arriba(1) + abajo(1)) / 2)} ${r1(CANTO_BAJO[16][0])} ${r1(CANTO_BAJO[16][1])}` +
  curva(CANTO_BAJO.slice().reverse()) +
  'Z';

/**
 * Las franjas se pintan como bandas rectas y el contorno las recorta.
 *
 * Los cortes son verticales de verdad, no inclinados: la deformación del paño
 * es un desplazamiento en Y que depende sólo de X, así que las fibras
 * verticales de la tela siguen siendo verticales. Inclinarlas sería dibujar un
 * paño retorcido, que no es lo que hace la onda.
 */
const TOPE = 90;
const franja = (t0, t1) =>
  `M${r1(ex(t0))} ${PANO.y - TOPE}L${r1(ex(t1))} ${PANO.y - TOPE}` +
  `L${r1(ex(t1))} ${r1(PANO.y + PANO.alto + TOPE)}L${r1(ex(t0))} ${r1(PANO.y + PANO.alto + TOPE)}Z`;

const FRANJA_IZQ = franja(-0.06, 1 / 3);
const FRANJA_BLANCA = franja(1 / 3, 2 / 3);
const FRANJA_DER = franja(2 / 3, 1.06);

/* Escudo: centrado en la franja blanca y girado con la pendiente local de la
   tela. Ese giro es lo que lo mete dentro del paño; horizontal se despega y
   vuelve a parecer una calcomanía. */
const ESCUDO = {
  x: r1(ex(0.5)),
  y: r1(arriba(0.5) + alto(0.5) / 2),
  escala: 0.8,
  giro: -12
};

/* Vaina de la driza: el dobladillo por el que el paño abraza el asta. */
const VAINA =
  `M${r1(ex(0))} ${r1(arriba(0))}L${r1(ex(0.038))} ${r1(arriba(0.038))}` +
  `L${r1(ex(0.038))} ${r1(abajo(0.038))}L${r1(ex(0))} ${r1(abajo(0))}Z`;

export default function AstaBandera({ uid, escudoSrc }) {
  const [falloEscudo, setFalloEscudo] = useState(false);
  const id = `${uid}-asta`;

  return (
    <g className="sepAsta">
      <defs>
        <clipPath id={`${id}-pano`}>
          <path d={CONTORNO} />
        </clipPath>

        <linearGradient id={`${id}-celeste`} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#6cb4e4" />
          <stop offset="0.5" stopColor="#4a9bd8" />
          <stop offset="1" stopColor="#3684c2" />
        </linearGradient>

        {/* Pliegues. En unidades de usuario para que cada parada caiga sobre su
            punto de la onda y no sobre una caja normalizada que se mueve con el
            contorno. Alternan sombra y luz con el mismo periodo que la onda:
            valle oscuro, cresta clara. */}
        <linearGradient
          id={`${id}-pliegues`}
          gradientUnits="userSpaceOnUse"
          x1={PANO.x}
          y1="0"
          x2={PANO.x + PANO.largo}
          y2="0"
        >
          <stop offset="0" stopColor="#0b3d68" stopOpacity="0.26" />
          <stop offset="0.09" stopColor="#0b3d68" stopOpacity="0.04" />
          <stop offset="0.21" stopColor="#0b3d68" stopOpacity="0.18" />
          <stop offset="0.38" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="0.56" stopColor="#ffffff" stopOpacity="0.24" />
          <stop offset="0.72" stopColor="#0b3d68" stopOpacity="0.12" />
          <stop offset="0.88" stopColor="#0b3d68" stopOpacity="0.22" />
          <stop offset="1" stopColor="#0b3d68" stopOpacity="0.06" />
        </linearGradient>

        {/* Bombeo: cara alta a la luz, canto bajo girando en sombra. */}
        <linearGradient
          id={`${id}-bombeo`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={PANO.y - 16}
          x2="0"
          y2={PANO.y + PANO.alto + 26}
        >
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="0.34" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.66" stopColor="#06203f" stopOpacity="0" />
          <stop offset="1" stopColor="#06203f" stopOpacity="0.26" />
        </linearGradient>

        <linearGradient id={`${id}-brillo`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        <linearGradient id={`${id}-mastil`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8ea3b8" />
          <stop offset="0.28" stopColor="#f2f6fa" />
          <stop offset="0.62" stopColor="#c3d0dc" />
          <stop offset="1" stopColor="#6e8399" />
        </linearGradient>

        <linearGradient id={`${id}-oro`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f5e0a2" />
          <stop offset="0.42" stopColor="#dcae37" />
          <stop offset="1" stopColor="#a8801c" />
        </linearGradient>

        <radialGradient id={`${id}-sombraPie`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#2c4a24" stopOpacity="0.34" />
          <stop offset="0.62" stopColor="#2c4a24" stopOpacity="0.14" />
          <stop offset="1" stopColor="#2c4a24" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* La sombra va antes que nada: es lo que asienta el asta en la hierba en
          vez de dejarla apoyada encima. Desplazada a la derecha porque la luz
          clave entra por el ángulo superior izquierdo. */}
      <ellipse cx={ASTA.x + 16} cy={SUELO + 2} rx="46" ry="9" fill={`url(#${id}-sombraPie)`} />

      {/* Mástil. Se estrecha hacia arriba: un poste de grosor constante se lee
          como un tubo de andamio. */}
      <path
        d={`M${ASTA.x - 4.2} ${ASTA.pie}L${ASTA.x - 2.6} ${ASTA.cima}L${ASTA.x + 2.6} ${ASTA.cima}L${ASTA.x + 4.2} ${ASTA.pie}Z`}
        fill={`url(#${id}-mastil)`}
      />
      {/* Canto oscuro del lado en sombra: sin él el mástil desaparece contra un
          cielo pálido a media altura. */}
      <path
        d={`M${ASTA.x + 2.6} ${ASTA.pie}L${ASTA.x + 1.4} ${ASTA.cima}L${ASTA.x + 2.6} ${ASTA.cima}L${ASTA.x + 4.2} ${ASTA.pie}Z`}
        fill="#5d738a"
        opacity="0.55"
      />

      {/* Paño */}
      <g className="sepAsta__pano">
        <g clipPath={`url(#${id}-pano)`}>
          <path d={FRANJA_IZQ} fill={`url(#${id}-celeste)`} />
          <path d={FRANJA_BLANCA} fill="#ffffff" />
          <path d={FRANJA_DER} fill={`url(#${id}-celeste)`} />

          <path d={FRANJA_IZQ} fill={`url(#${id}-pliegues)`} />
          <path d={FRANJA_BLANCA} fill={`url(#${id}-pliegues)`} />
          <path d={FRANJA_DER} fill={`url(#${id}-pliegues)`} />

          <rect
            x={PANO.x - 10}
            y={PANO.y - TOPE}
            width={PANO.largo + 30}
            height={PANO.alto + TOPE * 2}
            fill={`url(#${id}-bombeo)`}
          />

          {/* Barrido de sol sobre la tela: el único movimiento que recorre el
              paño de lado a lado, y va lento a propósito. */}
          <rect
            className="sepAsta__brillo"
            x={PANO.x - 150}
            y={PANO.y - TOPE}
            width="86"
            height={PANO.alto + TOPE * 2}
            fill={`url(#${id}-brillo)`}
          />
        </g>

        <g transform={`translate(${ESCUDO.x} ${ESCUDO.y}) rotate(${ESCUDO.giro}) scale(${ESCUDO.escala}) translate(-50 -50)`}>
          {escudoSrc && !falloEscudo ? (
            <image
              href={escudoSrc}
              width="100"
              height="100"
              preserveAspectRatio="xMidYMid meet"
              onError={() => setFalloEscudo(true)}
            />
          ) : (
            <Escudo />
          )}
        </g>

        {/* Dobladillo de la driza y filo del contorno. El filo es una línea de
            1.2 u, no una sombra proyectada: una bandera no arroja sombra sobre
            el cielo, pero sí necesita un canto propio para recortarse contra
            él. */}
        <path d={VAINA} fill="#ffffff" opacity="0.5" />
        <path d={VAINA} fill="#0b3d68" opacity="0.12" />
        <path d={CONTORNO} fill="none" stroke="#0b3d68" strokeOpacity="0.18" strokeWidth="1.2" />
      </g>

      {/* Remate: esfera y moharra doradas, por delante del paño. */}
      <circle cx={ASTA.x} cy={ASTA.cima - 8} r="7" fill={`url(#${id}-oro)`} />
      <path
        d={`M${ASTA.x} ${ASTA.cima - 30}L${ASTA.x + 4.6} ${ASTA.cima - 14}L${ASTA.x} ${ASTA.cima - 11}L${ASTA.x - 4.6} ${ASTA.cima - 14}Z`}
        fill={`url(#${id}-oro)`}
      />

      {/* Cuatro matas al pie, del mismo trazo que el zacate del paisaje: son las
          que cierran el contacto entre el mástil y la hierba. */}
      <g stroke="#3f6c33" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.5">
        <path d={`M${ASTA.x - 22} ${SUELO + 4}C${ASTA.x - 24} ${SUELO - 10} ${ASTA.x - 26} ${SUELO - 20} ${ASTA.x - 30} ${SUELO - 30}`} />
        <path d={`M${ASTA.x - 12} ${SUELO + 4}C${ASTA.x - 12} ${SUELO - 10} ${ASTA.x - 10} ${SUELO - 20} ${ASTA.x - 8} ${SUELO - 32}`} />
        <path d={`M${ASTA.x + 12} ${SUELO + 4}C${ASTA.x + 14} ${SUELO - 8} ${ASTA.x + 18} ${SUELO - 18} ${ASTA.x + 24} ${SUELO - 26}`} />
        <path d={`M${ASTA.x + 26} ${SUELO + 2}C${ASTA.x + 27} ${SUELO - 11} ${ASTA.x + 30} ${SUELO - 20} ${ASTA.x + 34} ${SUELO - 28}`} />
      </g>
    </g>
  );
}
