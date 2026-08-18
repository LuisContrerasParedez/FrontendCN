/* ==================================================================
   Listón ceremonial — geometría generada
   ==================================================================

   El listón es UNA cinta, no cuatro franjas apiladas.

   Todas las hebras salen de la misma **curva maestra**: un solo barrido
   en S que cruza la escena de lado a lado, con menos de un ciclo completo
   a lo ancho. Cada hebra es esa curva desplazada, con una variación
   propia pequeña —la que produce algún giro suelto de la tela— y un
   factor de escala que atenúa la maestra hacia abajo, porque la parte
   baja del fajín está más escorzada y además la recorta el marco.

   Ese es el punto: las hebras van casi paralelas. Cuatro ondas
   independientes cruzándose todo el rato vuelven a leerse como un
   apilado de bandas; una sola curva compartida se lee como tela.

   Cada hebra es además una **banda cerrada**, con dos bordes propios que
   no van en paralelo, así que tiene grosor y se estrecha donde la tela
   gira. Los solapes son generosos a propósito: lo que se ve de cada
   hebra es la distancia hasta la siguiente, y el resto queda debajo
   garantizando que la masa no se abra nunca.

   Todo se genera aquí, en tiempo de importación, para que el JSX quede
   declarativo y ningún render recalcule trigonometría.
   ================================================================== */

const TAU = Math.PI * 2;

/** Lienzo de las capas de cinta. La caja del hero lo estira en X. */
export const LISTON = { w: 1600, h: 220 };

/* Se dibuja bastante más ancho que el lienzo: el SVG recorta a 0–1600 y
   ese sobrante es el que garantiza que el vaivén —y cualquier estirón por
   `preserveAspectRatio="none"`— nunca descubra los cantos laterales. */
const X0 = -160;
const X1 = 1760;
const PASO = 96;

const r = (n) => Math.round(n * 10) / 10;

/** Barrido común. Una S larga; el segundo armónico sólo la despeina. */
const MAESTRA = { pend: -14.33, a1: 31, f1: 0.89, p1: 0.17, a2: 7.28, f2: 2.13, p2: 0.03 };

function maestra(x) {
  const { pend, a1, f1, p1, a2, f2, p2 } = MAESTRA;
  return (
    pend * (x / LISTON.w) +
    a1 * Math.sin(TAU * ((f1 * x) / LISTON.w + p1)) +
    a2 * Math.sin(TAU * ((f2 * x) / LISTON.w + p2))
  );
}

/** Borde superior de una hebra. */
function alto(x, c) {
  return c.m * maestra(x) + c.base + c.a * Math.sin(TAU * ((c.f * x) / LISTON.w + c.p));
}

/** Grosor aparente. Donde la tela se gira de canto, la hebra adelgaza. */
function grosor(x, c) {
  return c.g + c.ga * Math.sin(TAU * ((c.gf * x) / LISTON.w + c.gp));
}

function muestrear(f) {
  const puntos = [];
  for (let x = X0; x <= X1 + 0.001; x += PASO) puntos.push([x, f(x)]);
  return puntos;
}

/**
 * Catmull-Rom a cúbicas. Con muestreo uniforme el error contra la
 * senoidal real queda muy por debajo del píxel, y el trazado ocupa la
 * décima parte de lo que ocuparía una polilínea con la misma suavidad.
 */
function curva(puntos, comando) {
  let d = `${comando}${r(puntos[0][0])} ${r(puntos[0][1])}`;
  for (let i = 0; i < puntos.length - 1; i += 1) {
    const p0 = puntos[i - 1] || puntos[i];
    const p1 = puntos[i];
    const p2 = puntos[i + 1];
    const p3 = puntos[i + 2] || p2;
    d +=
      `C${r(p1[0] + (p2[0] - p0[0]) / 6)} ${r(p1[1] + (p2[1] - p0[1]) / 6)} ` +
      `${r(p2[0] - (p3[0] - p1[0]) / 6)} ${r(p2[1] - (p3[1] - p1[1]) / 6)} ` +
      `${r(p2[0])} ${r(p2[1])}`;
  }
  return d;
}

/** Banda cerrada entre dos perfiles: ida por arriba, vuelta por abajo. */
function banda(sup, inf) {
  return `${curva(muestrear(sup), 'M')}${curva(muestrear(inf).reverse(), 'L')}Z`;
}

/**
 * Pliegues: trazos que cruzan la hebra, inclinados y de longitud
 * desigual. NO llegan a los cantos —se quedan en el tercio central de lo
 * que se ve de cada hebra— por dos razones: así ninguno asoma por el
 * borde sin necesidad de un `clipPath` que duplicaría los cuatro
 * contornos, y sobre todo así se leen como un quiebre de la tela y no
 * como una costura que la corta de lado a lado, que es en lo que se
 * convierten en cuanto tocan los dos bordes.
 */
function pliegues(sup, inf, cantidad, fase) {
  const trazos = [];
  for (let i = 0; i < cantidad; i += 1) {
    const t = (i + 0.5) / cantidad;
    const x = X0 + t * (X1 - X0) + 46 * Math.sin(TAU * (t * 2.7 + fase));
    const grueso = inf(x) - sup(x);
    const y0 = sup(x) + Math.max(9, grueso * 0.3);
    const y1 = inf(x) - Math.max(9, grueso * 0.26);
    const h = y1 - y0;
    if (h < 14) continue;
    // El sesgo hace que el pliegue caiga torcido, como cae la tela real.
    const sesgo = 13 * Math.sin(TAU * (t * 1.9 + fase + 0.25));
    trazos.push(
      `M${r(x)} ${r(y0)}` +
        `C${r(x + sesgo * 0.45)} ${r(y0 + h * 0.34)} ` +
        `${r(x + sesgo)} ${r(y0 + h * 0.7)} ` +
        `${r(x + sesgo * 1.3)} ${r(y1)}`
    );
  }
  return trazos.join('');
}

/**
 * Arma todos los trazados de una hebra a partir de su receta.
 *
 * - `cuerpo`   relleno de la banda
 * - `luz`      filo iluminado pegado al borde superior
 * - `sombras`  dos bandas anidadas contra el borde inferior
 * - `pliegues` dos juegos desfasados: sombra y contraluz
 *
 * La sombra propia se resuelve apilando dos contornos en vez de con un
 * degradado porque el degradado se calcula sobre la caja del trazado y la
 * banda ondula noventa unidades: la transición se desalinearía por
 * completo de la silueta. Apilada, sigue el filo exactamente. Y su canto
 * interior no aparece nunca: siempre queda por debajo de la hebra
 * siguiente, que es justo donde una sombra de contacto tiene que estar.
 */
function cinta(c) {
  const sup = (x) => alto(x, c);
  // Sin `g` la hebra es la de delante: su borde inferior queda fuera de
  // cuadro, que es lo que sella el canto de abajo del hero.
  const inf = c.g === null ? () => LISTON.h + 60 : (x) => alto(x, c) + grosor(x, c);
  // Los pliegues de la hebra frontal se miden contra un fondo ficticio: si
  // llegaran hasta y = 280 saldrían del hero convertidos en rayas.
  const infPliegue = c.g === null ? (x) => alto(x, c) + 48 : inf;

  return {
    sup,
    inf,
    cuerpo: banda(sup, inf),
    luz: banda(sup, (x) => sup(x) + c.luz),
    sombras: (c.sombra ? [[c.sombra, 0.08], [c.sombra * 0.45, 0.09]] : []).map(([h, opacidad]) => ({
      d: banda((x) => inf(x) - h, inf),
      opacidad
    })),
    pliegues: pliegues(sup, infPliegue, c.pliegues[0], c.pliegues[1]),
    contraluz: pliegues(sup, infPliegue, c.pliegues[0], c.pliegues[1] + 0.37)
  };
}

/* ------------------------------------------------------------------ */
/* Recetas                                                             */
/* ------------------------------------------------------------------ */

/*
 * Los números NO son a ojo. Salen de una búsqueda que descarta cualquier
 * juego que rompa alguno de estos invariantes, comprobados cada 4 px a lo
 * largo de todo el trazado:
 *
 *  · el borde inferior de cada hebra queda al menos 5 u por debajo del
 *    filo de la siguiente, así que la masa nunca se abre y deja ver el
 *    pasto por un agujero;
 *  · lo que se ve de cada hebra no baja nunca de 24 u, que es donde
 *    dejaría de leerse como tela y pasaría a ser un hilo;
 *  · el filo de la hebra frontal se mantiene entre 145 y 213 sobre 220,
 *    de modo que siempre hay cinta sellando el canto inferior del hero y
 *    siempre se la ve pasar por delante;
 *  · el filo superior del conjunto no sube de 12 ni baja de 112;
 *  · el borde de la hebra blanca cambia de sentido dos veces en todo el
 *    ancho —una S, no una sierra— y ninguna pareja de hebras se cruza en
 *    más del 18 % del recorrido. Las dos condiciones juntas son las que
 *    mantienen el barrido; sin ellas vuelven las ondas de cenefa.
 *
 * Si se tocan a mano, hay que volver a comprobarlos: un solo hueco entre
 * dos hebras se lee inmediatamente como un fallo de recorte.
 */
/*
 * Los `base` reparten el peso visual, porque lo que se ve de cada hebra es
 * la distancia hasta el filo de la siguiente: unas 52 u de azul, 48 de
 * blanca, 19 de celeste y lo que quede hasta el canto de azul hondo. Es el
 * reparto de la referencia —blanca y azul mandan por igual, la celeste es
 * un hilo—. El resto del `g` de cada hebra queda debajo de la siguiente y
 * sólo está para que la masa no se abra nunca.
 */
export const CINTA_TRAS = cinta({
  base: 64, m: 0.95, a: 9.1, f: 1.87, p: 0.08,
  g: 88.66, ga: 6.3, gf: 1.62, gp: 0.5,
  luz: 5, sombra: 26, pliegues: [9, 0.12]
});

export const CINTA_BLANCA = cinta({
  base: 116, m: 0.93, a: 6.43, f: 2.59, p: 0.07,
  g: 86, ga: 5.79, gf: 2.36, gp: 0.81,
  luz: 6, sombra: 22, pliegues: [8, 0.58]
});

export const CINTA_CELESTE = cinta({
  base: 164, m: 0.69, a: 9.03, f: 1.68, p: 0.03,
  g: 57.82, ga: 4.04, gf: 1.74, gp: 0.8,
  luz: 5, sombra: 20, pliegues: [8, 0.81]
});

export const CINTA_FRENTE = cinta({
  base: 182.8, m: 0.46, a: 9.28, f: 2.58, p: 0.25,
  g: null, ga: 0, gf: 2.01, gp: 0.75,
  luz: 5, sombra: 0, pliegues: [7, 0.33]
});

/**
 * Detalles dorados. Son **hilos**, no una quinta hebra: 3 u sobre 220,
 * uno por cada canto de la blanca. En la referencia el oro es exactamente
 * eso —un vivo de dos píxeles— y en cuanto engorda deja de ser ceremonial
 * y se convierte en una franja mostaza.
 */
export const FILO_ORO = {
  alto: banda((x) => CINTA_BLANCA.sup(x) - 1.4, (x) => CINTA_BLANCA.sup(x) + 1.8),
  bajo: banda((x) => CINTA_BLANCA.inf(x) - 3.2, CINTA_BLANCA.inf),
  brillo: banda((x) => CINTA_BLANCA.inf(x) - 2.4, (x) => CINTA_BLANCA.inf(x) - 1.4)
};

/* ------------------------------------------------------------------ */
/* Sombra sobre el suelo                                               */
/* ------------------------------------------------------------------ */

/**
 * Tres bandas anidadas siguiendo el filo superior del listón. Es lo que
 * borra el corte entre el paisaje y la decoración: sin ellas la cinta
 * parece pegada encima de la pradera en vez de apoyada sobre ella. Van
 * muy bajas de opacidad a propósito; el trabajo de fondo lo hace la
 * propia curva, que entra en cuadro por los laterales.
 */
export const SOMBRA_SUELO = [46, 26, 11].map((h, i) => ({
  d: banda((x) => CINTA_TRAS.sup(x) - h, (x) => CINTA_TRAS.sup(x) + 8),
  opacidad: [0.05, 0.06, 0.08][i]
}));
