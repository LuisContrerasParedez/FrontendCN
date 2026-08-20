/*
 * Escenografía de la temática institucional.
 *
 * Aquí vive TODA la geometría de la escena —líneas maestras, medidas y
 * trazados—; los componentes de `escena/` se limitan a dibujarla. El color no
 * está en este archivo a propósito: cada pieza sale con una clase y la paleta
 * entera se resuelve en el CSS, que es quien conoce la franja horaria (día,
 * tarde o noche). Mover la composición se hace aquí; recolorearla, en
 * `HeroInstitucional.css`.
 */

export const VB = { w: 1600, h: 900 };

/* Líneas maestras, de arriba abajo. Todo lo demás se cuelga de ellas. */
export const HORIZONTE = 580;   // base de la cordillera
export const PLATAFORMA = 676;  // suelo del complejo
export const CALLE = { arriba: 682, abajo: 792 };
export const ACERA = 792;       // primer plano peatonal

const f = (n) => Math.round(n * 100) / 100;

// Ruido determinista: la escena se dibuja igual en cada render y en cada
// recarga, así nada salta al volver a montar el hero.
function azar(i, sal = 0) {
  const v = Math.sin(i * 12.9898 + sal * 78.233 + 17.31) * 43758.5453;
  return v - Math.floor(v);
}

const rango = (i, min, max, sal = 0) => min + azar(i, sal) * (max - min);

/* ============================ Cielo ============================ */

// Un solo disco para las tres franjas: cambia de color y de halo, no de sitio.
// Moverlo obligaría a tres composiciones distintas para un detalle de 46 px.
export const DISCO = { cx: 1216, cy: 178, r: 46 };

export const ESTRELLAS = Array.from({ length: 56 }, (_, i) => ({
  cx: f(rango(i, 8, 1592, 1)),
  cy: f(rango(i, 28, 438, 2)),
  r: f(rango(i, 0.9, 2.3, 3)),
  o: f(rango(i, 0.3, 1, 4)),
  grupo: i % 3
}));

export const NUBES = [
  { x: 214, y: 126, s: 1.2, o: 0.52, deriva: 'a' },
  { x: 694, y: 86, s: 0.86, o: 0.38, deriva: 'b' },
  { x: 1298, y: 152, s: 1.05, o: 0.3, deriva: 'c' },
  { x: 432, y: 252, s: 0.7, o: 0.34, deriva: 'b' },
  { x: 1058, y: 302, s: 0.62, o: 0.24, deriva: 'a' }
];

/* ============================ Valle ============================ */

/*
 * Dos conos y dos crestas. La cordillera se dibuja de lejos a cerca y cada
 * plano baja un paso de tono: la profundidad la da el escalonado, no el
 * detalle. Los pies de los volcanes quedan tapados por la cresta cercana, que
 * es como se ven de verdad desde el valle.
 */
export const CRESTA_LEJANA =
  'M0 580 L0 512 L104 462 L196 500 L286 446 L372 492 L470 452 L566 504 L664 466 '
  + 'L768 508 L872 470 L980 512 L1092 476 L1204 518 L1320 482 L1442 522 L1560 486 '
  + 'L1600 508 L1600 580 Z';

export const VOLCAN_MAYOR = 'M132 580 Q322 548 400 396 L434 352 L468 396 Q548 548 742 580 Z';

export const VOLCAN_MENOR = 'M556 580 Q676 560 716 470 L738 440 L760 470 Q802 560 926 580 Z';

export const CRESTA_CERCANA =
  'M0 580 L0 548 L118 522 L246 552 L360 526 L498 556 L640 530 L790 560 L940 534 '
  + 'L1092 562 L1250 538 L1410 566 L1600 542 L1600 580 Z';

// Luces del valle: solo a la izquierda del complejo, que es el único tramo de
// horizonte que queda a la vista.
export const LUCES_VALLE = Array.from({ length: 68 }, (_, i) => ({
  cx: f(rango(i, 12, 986, 5)),
  cy: f(rango(i, 548, 574, 6)),
  r: f(rango(i, 0.8, 1.8, 7)),
  o: f(rango(i, 0.35, 1, 8)),
  grupo: i % 3
}));

/* ====================== Centro comercial ======================= */

export const CENTRO = { x: 1006, y: 404, w: 626, alto: PLATAFORMA - 404 };

// El alero vuela por los dos costados: es el gesto que impide que el bloque se
// lea como una caja apoyada en el suelo.
export const ALERO = { x: 978, y: 390, w: 668, alto: 24 };

export const VENTANA = { w: 30, alto: 46, paso: 46 };
const PISOS = [434, 506, 578];
const COLUMNAS_VENTANA = 13;

export const VENTANAS = PISOS.flatMap((y, piso) => (
  Array.from({ length: COLUMNAS_VENTANA }, (_, col) => ({
    x: f(CENTRO.x + 24 + col * VENTANA.paso),
    y,
    encendida: azar(piso * 31 + col, 9) > 0.34,
    grupo: (piso + col) % 3
  }))
));

export const PLANTA_BAJA = { y: 632, alto: PLATAFORMA - 632 };
export const PORTAL = { x: 1076, w: 150, y: 614, alto: PLATAFORMA - 614 };

/* ============================ Tótem ============================ */

/*
 * El rombo de cuatro cuadros es el símbolo de la marca —los mismos dos azules
 * y dos rojos de la cabecera—. Es lo único que identifica el lugar dentro de
 * la ilustración: ni una letra que haya que traducir ni un logotipo que
 * mantener sincronizado con el que sirve el CMS.
 */
export const TOTEM = { x: 948, w: 58, y: 344, base: PLATAFORMA };
export const ROMBO = { cx: 977, cy: 392, lado: 15, hueco: 3.4 };

/* ==================== Marquesina de la terminal ================= */

export const MARQUESINA = { x: 424, x2: 936, y: 524, vuelo: 30, modulos: 4, canto: 12 };

export const COLUMNAS = Array.from({ length: MARQUESINA.modulos + 1 }, (_, i) => (
  f(MARQUESINA.x + (i * (MARQUESINA.x2 - MARQUESINA.x)) / MARQUESINA.modulos)
));

export const ANDEN = { x: 398, w: 590, y: 660, alto: 16 };

export const BUSES_ANDEN = [
  { x: 448, base: 668, escala: 0.5 },
  { x: 626, base: 668, escala: 0.5 },
  { x: 804, base: 668, escala: 0.5 }
];

/* ============================ Calle ============================ */

export const EJE_CALLE = f((CALLE.arriba + CALLE.abajo) / 2);
export const RAYAS = Array.from({ length: 14 }, (_, i) => f(-60 + i * 128));

// El bus cercano es la pieza viva de la escena y la que cuenta qué es este
// sitio. Va solo: dos vehículos cruzando convierten el hero en un anuncio.
export const BUS_CERCANO = { base: CALLE.abajo, escala: 0.86 };

/* ========================= Primer plano ========================= */

export const FAROLAS = [
  { x: 268, base: 812, alto: 148 },
  { x: 742, base: 804, alto: 140 },
  { x: 1198, base: 818, alto: 152 },
  { x: 1548, base: 800, alto: 136 }
];

export const PALMERAS = [
  { x: 176, base: 806, escala: 1.1, giro: -4 },
  { x: 1052, base: 796, escala: 0.86, giro: -6 },
  { x: 1332, base: 816, escala: 1.24, giro: 5 }
];

export const ARBOLES = [
  { x: 60, base: 796, escala: 0.74 },
  { x: 352, base: 790, escala: 0.82 },
  { x: 618, base: 794, escala: 0.7 },
  { x: 1444, base: 800, escala: 0.95 }
];

export const GENTE = [
  { x: 214, base: 822, escala: 1.04 },
  { x: 244, base: 826, escala: 0.92 },
  { x: 470, base: 812, escala: 0.88 },
  { x: 900, base: 830, escala: 1.1 },
  { x: 932, base: 832, escala: 0.96 },
  { x: 1266, base: 820, escala: 1 },
  { x: 1494, base: 828, escala: 1.06 }
];

// Dos siluetas cruzan la acera. El resto queda quieto para que el movimiento
// se lea como un detalle y no como un desfile.
export const CAMINANTES = [
  { x: 596, base: 834, escala: 1.12, sentido: 1 },
  { x: 1132, base: 814, escala: 0.9, sentido: -1 }
];
