import { azar, bombillasGuirnalda, curvaGuirnalda, f, rango } from './geometria';

/*
 * Escenografía: todas las medidas y posiciones de la feria en un solo sitio.
 * Mover algo de la composición se hace aquí, no dentro de los componentes.
 */

export const VB = { w: 1600, h: 770 };
export const HORIZONTE = 566; // base de la ciudad y arranque del suelo

// La rueda se alza lo suficiente para que las doce cabinas queden por encima
// de las carpas, como en la referencia; solo la más baja entra al andén.
export const RUEDA = { cx: 400, cy: 282, r: 216 };
export const RADIO_PIVOTE = RUEDA.r + 30;
export const RADIO_ANILLO_INT = 120;
export const TOTAL_CABINAS = 12;

export const COLORES_CABINA = ['#3fd8e8', '#ff5fa5', '#ffa23d', '#6f8dff', '#ffd84d', '#4fe39a'];
export const COLOR_BOMBILLA = ['#ffd76a', '#ff8f5a', '#7ee3ff', '#ff6fa8'];

export const FECHAS_POR_DEFECTO = [
  '15 SEPT', '31 OCT', '27 NOV', '1 AGO', '15 AGO', '31 OCT',
  '15 SEPT', '15 SEPT', '8 AGO', '8 AGO', '27 NOV', '1 AGO'
];

/* ---------------- Cielo ---------------- */

export const ESTRELLAS = Array.from({ length: 48 }, (_, i) => ({
  cx: f(rango(i, 16, 1590, 1)),
  cy: f(rango(i, 18, 436, 2)),
  r: f(rango(i, 0.9, 2.4, 3)),
  o: f(rango(i, 0.24, 0.9, 4)),
  grupo: i % 3
}));

export const NUBES = [
  { x: 148, y: 92, s: 1.15, o: 0.5, deriva: 'a' },
  { x: 612, y: 66, s: 0.82, o: 0.36, deriva: 'b' },
  { x: 1198, y: 118, s: 1, o: 0.3, deriva: 'c' },
  { x: 348, y: 186, s: 0.66, o: 0.34, deriva: 'b' },
  { x: 1452, y: 246, s: 0.74, o: 0.24, deriva: 'a' }
];

/* ---------------- Ciudad ---------------- */

export const EDIFICIOS = [
  { x: -14, w: 94, h: 150 }, { x: 64, w: 62, h: 214 }, { x: 118, w: 88, h: 126 },
  { x: 196, w: 50, h: 178 }, { x: 238, w: 72, h: 104 },
  { x: 596, w: 70, h: 118 }, { x: 656, w: 96, h: 164 }, { x: 742, w: 58, h: 208 },
  { x: 792, w: 78, h: 132 }, { x: 862, w: 64, h: 98 },
  { x: 1148, w: 78, h: 152 }, { x: 1214, w: 98, h: 196 }, { x: 1304, w: 60, h: 124 },
  { x: 1356, w: 88, h: 224 }, { x: 1436, w: 70, h: 158 }, { x: 1498, w: 92, h: 128 },
  { x: 1578, w: 44, h: 172 }
];

// Solo se dibujan las ventanas encendidas para no saturar el árbol SVG.
export const VENTANAS = EDIFICIOS.flatMap((ed, e) => {
  const cols = Math.max(2, Math.floor(ed.w / 24));
  const filas = Math.max(2, Math.floor(ed.h / 32));
  const pasoX = ed.w / (cols + 1);
  const pasoY = ed.h / (filas + 1);
  const puntos = [];
  for (let c = 0; c < cols; c += 1) {
    for (let r = 0; r < filas; r += 1) {
      const semilla = e * 97 + c * 13 + r;
      if (azar(semilla, 5) < 0.46) continue;
      puntos.push({
        key: `${e}-${c}-${r}`,
        x: f(ed.x + pasoX * (c + 1) - 3),
        y: f(HORIZONTE - ed.h + pasoY * (r + 1) - 4),
        calido: azar(semilla, 6) > 0.35
      });
    }
  }
  return puntos;
});

/* ---------------- Arboleda ---------------- */

function trazoArboleda(base, semilla) {
  let d = `M-20 ${base}`;
  for (let x = -20; x < VB.w + 40; x += 76) {
    const alto = rango(x, 22, 54, semilla);
    d += ` q 38 ${f(-alto)} 76 0`;
  }
  return `${d} L${VB.w + 40} ${VB.h} L-20 ${VB.h} Z`;
}

export const ARBOLEDA_LEJANA = trazoArboleda(HORIZONTE - 16, 11);
export const ARBOLEDA_CERCA = trazoArboleda(HORIZONTE + 6, 21);

/* ---------------- Montaña rusa ---------------- */

export const VIA_RUSA =
  'M1074 572 C1104 462 1156 396 1214 404 C1268 412 1284 470 1300 508 ' +
  'C1314 540 1348 542 1362 512 C1378 478 1370 424 1412 414 ' +
  'C1456 404 1478 462 1500 496 C1518 524 1554 534 1600 528';

export const POSTES_RUSA = [
  { x: 1104, y: 470 }, { x: 1160, y: 412 }, { x: 1222, y: 406 }, { x: 1288, y: 488 },
  { x: 1362, y: 514 }, { x: 1414, y: 416 }, { x: 1478, y: 468 }, { x: 1540, y: 520 }
];

/* ---------------- Guirnaldas ---------------- */

/*
 * Cadenas continuas: el final de cada tramo es el principio del siguiente,
 * y todo extremo suelto muere en un punto que EXISTE (punta de mástil, esquina
 * de toldo o el borde del cuadro). No hay cables terminando en el aire.
 *
 *   izquierda:  fuera de cuadro → punta del carrusel
 *   derecha:    carpa A → carpa B → carpa C → puesto de juegos
 *
 * El hueco del centro es deliberado: la rueda barre con sus cabinas un anillo
 * de 255 a 315 px alrededor de (400, 282), y por dentro quedan los radios y el
 * andén. Cualquier cable tendido ahí lo cruzan las cabinas al girar, así que
 * la cadena rodea la rueda en vez de atravesarla.
 *
 * Al mover un tramo:
 *  - Punta de mástil de una carpa = (cx, base - alto - 34).
 *  - Sobre las lonas el cable pasa por encima, nunca cruzándolas.
 */
export const GUIRNALDAS = [
  { a: { x: -20, y: 508 }, b: { x: 184, y: 462 }, caida: 18, total: 6 },
  { a: { x: 666, y: 414 }, b: { x: 916, y: 388 }, caida: 30, total: 8 },
  { a: { x: 916, y: 388 }, b: { x: 1162, y: 426 }, caida: 30, total: 8 },
  { a: { x: 1162, y: 426 }, b: { x: 1290, y: 520 }, caida: 14, total: 5 }
].map((g, i) => ({
  ...g,
  key: i,
  d: curvaGuirnalda(g.a, g.b, g.caida).d,
  bombillas: bombillasGuirnalda(g.a, g.b, g.caida, g.total)
}));

/* ---------------- Carpas y puestos ---------------- */

export const CARPAS = [
  { id: 'a', cx: 666, base: 598, hw: 98, alto: 150, franjas: 9, colorA: '#e8443f', colorB: '#fdf1dc', muro: 56 },
  { id: 'b', cx: 916, base: 604, hw: 148, alto: 182, franjas: 11, colorA: '#e8443f', colorB: '#ffd54d', muro: 62, banderin: '#3fd8e8' },
  { id: 'c', cx: 1162, base: 600, hw: 92, alto: 140, franjas: 9, colorA: '#f2801f', colorB: '#fdf1dc', muro: 58, banderin: '#ff5fa5' }
];

export const PUESTOS = [
  { id: 1, x: 486, ancho: 94, techo: 582, base: 670, colorA: '#f2801f', colorB: '#fdf1dc', premios: false },
  { id: 2, x: 1288, ancho: 272, techo: 520, base: 672, colorA: '#e8443f', colorB: '#fdf1dc', atendiente: true }
];

export const CHARCOS = [188, 512, 666, 916, 1162, 1424];

/* ---------------- Personas ---------------- */

export const MULTITUD = [
  { x: 92, y: 726, s: 1.02, v: 0 }, { x: 138, y: 732, s: 0.66, v: 2 },
  { x: 246, y: 720, s: 0.96, v: 1 }, { x: 366, y: 736, s: 1.06, v: 3 },
  { x: 404, y: 738, s: 0.62, v: 2 }, { x: 512, y: 722, s: 0.92, v: 0 },
  { x: 596, y: 730, s: 1, v: 1 }, { x: 704, y: 742, s: 1.08, v: 3 },
  { x: 748, y: 744, s: 0.68, v: 2 }, { x: 860, y: 726, s: 0.94, v: 0 },
  { x: 962, y: 736, s: 1.02, v: 1 }, { x: 1088, y: 730, s: 0.98, v: 3 },
  { x: 1132, y: 734, s: 0.64, v: 2 }, { x: 1252, y: 742, s: 1.06, v: 0 },
  { x: 1372, y: 728, s: 0.95, v: 1 }, { x: 1496, y: 738, s: 1.04, v: 3 }
];

export const MULTITUD_FONDO = [
  { x: 470, y: 664, s: 0.5, v: 0 }, { x: 540, y: 668, s: 0.46, v: 1 },
  { x: 838, y: 662, s: 0.48, v: 1 }, { x: 1042, y: 666, s: 0.5, v: 0 },
  { x: 1188, y: 660, s: 0.44, v: 3 }, { x: 318, y: 668, s: 0.5, v: 1 }
];
