/**
 * Escenografía de la escena de septiembre.
 *
 * Todo el arte vive en un lienzo de 1600 × 900 (16:9). Las coordenadas de este
 * archivo son la única fuente de verdad: la trayectoria del quetzal en el CSS
 * (`sep-quetzal-vuelo`) está calculada sobre este mismo sistema, así que mover
 * la rama de descanso obliga a regenerar esos keyframes.
 */

export const VB = { w: 1600, h: 900 };

/** Línea de suelo: por debajo arranca el listón inferior. */
export const SUELO = 752;

/** Punto donde el quetzal apoya el cuerpo cuando está posado. */
export const PERCHA = { x: 952, y: 372 };

/**
 * Dirección de la luz clave, normalizada. Entra por el ángulo superior
 * izquierdo y gobierna hacia dónde se desplazan los tonos claros de todo el
 * follaje: es lo que mantiene coherente la iluminación de la escena.
 */
export const LUZ = [-0.58, -0.81];

/* ------------------------------------------------------------------ */
/* Utilidades geométricas                                              */
/* ------------------------------------------------------------------ */

/** PRNG determinista: la escena debe verse idéntica en cada render y en SSR. */
function aleatorio(semilla) {
  let a = semilla >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (v) => Math.round(v * 10) / 10;
const ent = (v) => Math.round(v);

/**
 * Cierra una lista de puntos con un spline Catmull-Rom convertido a Bézier.
 * Las coordenadas se redondean a entero: el trazado se emite como texto y a
 * este tamaño el decimal no aporta nada a la silueta, pero sí engorda mucho el
 * atributo `d` cuando hay cientos de contornos.
 */
function cerrar(p) {
  const en = (i) => p[(i + p.length * 2) % p.length];
  let d = `M${ent(p[0][0])} ${ent(p[0][1])}`;
  for (let i = 0; i < p.length; i += 1) {
    const p0 = en(i - 1);
    const p1 = en(i);
    const p2 = en(i + 1);
    const p3 = en(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${ent(c1[0])} ${ent(c1[1])} ${ent(c2[0])} ${ent(c2[1])} ${ent(p2[0])} ${ent(p2[1])}`;
  }
  return `${d}Z`;
}

/** Igual que `cerrar`, pero para una polilínea abierta y sin el `M` inicial. */
function suavizarAbierto(p) {
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

/** Muestrea un Catmull-Rom abierto que pasa por todos los puntos dados. */
function recorrido(puntos, porTramo = 16) {
  const en = (i) => puntos[Math.max(0, Math.min(puntos.length - 1, i))];
  const salida = [];
  for (let i = 0; i < puntos.length - 1; i += 1) {
    for (let j = 0; j < porTramo; j += 1) {
      const t = j / porTramo;
      const t2 = t * t;
      const t3 = t2 * t;
      const p0 = en(i - 1);
      const p1 = en(i);
      const p2 = en(i + 1);
      const p3 = en(i + 2);
      salida.push([0, 1].map((k) =>
        0.5 *
        (2 * p1[k] +
          (-p0[k] + p2[k]) * t +
          (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 +
          (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)
      ));
    }
  }
  salida.push(puntos[puntos.length - 1]);
  return salida;
}

/**
 * Rama: cinta de grosor variable a lo largo de una curva.
 *
 * Es el único modo de conseguir una rama que no parezca una lanza. Dibujar el
 * contorno como un polígono cuyos dos bordes se juntan en un vértice produce
 * siempre un triángulo afilado; aquí el trazo se construye desplazando la línea
 * central a un lado y a otro según un perfil de grosor, y la punta se cierra
 * con un casquete redondeado en vez de con un pico.
 *
 * Tres detalles hacen el trabajo:
 *
 *  · el perfil `(1 - t)^1.7` adelgaza rápido cerca del tronco y despacio al
 *    final, que es como se estrecha una rama de verdad —un afilado lineal se
 *    lee como un cono—;
 *  · el ensanche de la base (`flare`) abre la rama en su arranque para que
 *    salga del fuste con un cuello y no pegada de canto;
 *  · dos senoidales desfasadas modulan el grosor un 6 % y un 4 %, lo justo para
 *    que el borde no sea una curva perfecta.
 *
 * @param puntos     línea central, en coordenadas de escena
 * @param base       grosor en el arranque
 * @param punta      grosor en el extremo
 * @param flare      cuánto se ensancha el cuello de la base
 * @param semilla    fase de las irregularidades
 * @param escala     factor global de grosor (para las cintas de luz)
 * @param desplazar  desplazamiento del eje, en fracción del grosor local.
 *                   Negativo lo lleva hacia arriba, siempre en contra de la
 *                   gravedad y no del sentido de la curva, para que la cinta de
 *                   luz quede en el lomo tanto si la rama va a izquierda como a
 *                   derecha.
 */
export function rama(puntos, { base, punta, flare = 1.4, semilla = 1, escala = 1, desplazar = 0 } = {}) {
  const linea = recorrido(puntos);
  const n = linea.length - 1;
  const rnd = aleatorio(semilla);
  const f1 = rnd() * Math.PI * 2;
  const f2 = rnd() * Math.PI * 2;

  const izq = [];
  const der = [];
  let anchoPunta = punta;
  let ejePunta = linea[n];
  let tangentePunta = [1, 0];

  for (let i = 0; i <= n; i += 1) {
    const t = i / n;

    let w = punta + (base - punta) * Math.pow(1 - t, 1.7);
    if (t < 0.18) w *= 1 + flare * Math.pow(1 - t / 0.18, 2);
    w *= 1 + 0.06 * Math.sin(t * 9 + f1) + 0.04 * Math.sin(t * 17 + f2);
    w *= escala;

    // Tangente por diferencias centradas, con ventana para alisar el muestreo.
    const a = linea[Math.max(0, i - 3)];
    const b = linea[Math.min(n, i + 3)];
    let tx = b[0] - a[0];
    let ty = b[1] - a[1];
    const m = Math.hypot(tx, ty) || 1;
    tx /= m;
    ty /= m;

    // Normal, orientada siempre hacia arriba.
    let nx = ty;
    let ny = -tx;
    if (ny > 0) {
      nx = -nx;
      ny = -ny;
    }

    const cx = linea[i][0] + nx * w * desplazar;
    const cy = linea[i][1] + ny * w * desplazar;

    izq.push([cx + nx * w * 0.5, cy + ny * w * 0.5]);
    der.push([cx - nx * w * 0.5, cy - ny * w * 0.5]);

    if (i === n) {
      anchoPunta = w;
      ejePunta = [cx, cy];
      tangentePunta = [tx, ty];
    }
  }

  const r = anchoPunta * 0.5;
  const ex = ejePunta[0] + tangentePunta[0] * r * 1.34;
  const ey = ejePunta[1] + tangentePunta[1] * r * 1.34;
  const casquete =
    `C${r1(izq[n][0] + tangentePunta[0] * r * 0.9)} ${r1(izq[n][1] + tangentePunta[1] * r * 0.9)} ` +
    `${r1(ex)} ${r1(ey)} ${r1(ex)} ${r1(ey)}` +
    `C${r1(ex)} ${r1(ey)} ` +
    `${r1(der[n][0] + tangentePunta[0] * r * 0.9)} ${r1(der[n][1] + tangentePunta[1] * r * 0.9)} ` +
    `${r1(der[n][0])} ${r1(der[n][1])}`;

  return (
    `M${r1(izq[0][0])} ${r1(izq[0][1])}` +
    suavizarAbierto(izq) +
    casquete +
    suavizarAbierto(der.slice().reverse()) +
    'Z'
  );
}

/**
 * Mancha orgánica cerrada: elipse con el radio perturbado por ruido. Sirve para
 * las nubes, donde el contorno se quiere blando y sin estructura.
 */
export function mancha(cx, cy, rx, ry, { puntos = 13, irregular = 0.2, semilla = 1 } = {}) {
  const rnd = aleatorio(semilla);
  const p = [];
  for (let i = 0; i < puntos; i += 1) {
    const ang = (i / puntos) * Math.PI * 2;
    const k = 1 + (rnd() - 0.5) * 2 * irregular;
    p.push([cx + Math.cos(ang) * rx * k, cy + Math.sin(ang) * ry * k]);
  }
  return cerrar(p);
}

/**
 * Contorno lobulado. A diferencia de `mancha`, el radio se modula con dos
 * armónicos en vez de con ruido puro, así que produce entrantes y salientes
 * legibles —lóbulos— en lugar de un círculo abollado.
 *
 * Es la diferencia entre que una masa de follaje se lea como una copa de árbol
 * o como una burbuja verde.
 */
export function lobulo(cx, cy, rx, ry, { puntos = 26, semilla = 1, fuerza = 1 } = {}) {
  const rnd = aleatorio(semilla);
  const k1 = 3 + Math.floor(rnd() * 3); // 3-5 lóbulos mayores
  const k2 = 7 + Math.floor(rnd() * 4); // 7-10 mordidas menores
  const f1 = rnd() * Math.PI * 2;
  const f2 = rnd() * Math.PI * 2;
  const a1 = (0.13 + rnd() * 0.07) * fuerza;
  const a2 = (0.05 + rnd() * 0.04) * fuerza;

  const p = [];
  for (let i = 0; i < puntos; i += 1) {
    const ang = (i / puntos) * Math.PI * 2;
    const k = 1 + a1 * Math.cos(k1 * ang + f1) + a2 * Math.cos(k2 * ang + f2) + (rnd() - 0.5) * 0.05;
    p.push([cx + Math.cos(ang) * rx * k, cy + Math.sin(ang) * ry * k]);
  }
  return cerrar(p);
}

/** Foliolo lanceolado de longitud `largo`, con el pecíolo en el origen. */
export function foliolo(largo) {
  const a = largo * 0.19;
  const y = (t) => r1(-5 - largo * t);
  return [
    'M0 -5',
    `C${r1(-a)} ${y(0.22)} ${r1(-a * 1.26)} ${y(0.56)} ${r1(-a * 0.48)} ${y(0.85)}`,
    `C${r1(-a * 0.18)} ${y(0.95)} 0 ${y(1)} 0 ${y(1)}`,
    `C0 ${y(1)} ${r1(a * 0.18)} ${y(0.95)} ${r1(a * 0.48)} ${y(0.85)}`,
    `C${r1(a * 1.26)} ${y(0.56)} ${r1(a)} ${y(0.22)} 0 -5Z`
  ].join('');
}

/* ------------------------------------------------------------------ */
/* Cielo                                                               */
/* ------------------------------------------------------------------ */

export const NUBES = [
  { id: 'n1', x: 236, y: 128, rx: 132, ry: 34, semilla: 101, opacidad: 0.62, duracion: 58, retraso: -6, deriva: 46 },
  { id: 'n2', x: 612, y: 84, rx: 96, ry: 25, semilla: 102, opacidad: 0.42, duracion: 74, retraso: -28, deriva: 34 },
  { id: 'n3', x: 1104, y: 122, rx: 148, ry: 36, semilla: 103, opacidad: 0.5, duracion: 66, retraso: -14, deriva: -40 },
  { id: 'n4', x: 1442, y: 214, rx: 104, ry: 26, semilla: 104, opacidad: 0.34, duracion: 82, retraso: -44, deriva: 28 },
  { id: 'n5', x: 372, y: 292, rx: 118, ry: 22, semilla: 105, opacidad: 0.24, duracion: 92, retraso: -33, deriva: 52 }
];

/** Bandada lejana: da escala al cielo sin competir con el quetzal. */
export const BANDADA = [
  { x: 706, y: 126, s: 1, retraso: 0 },
  { x: 748, y: 140, s: 0.78, retraso: -0.5 },
  { x: 782, y: 118, s: 0.62, retraso: -1.1 }
];

/* ------------------------------------------------------------------ */
/* Ceiba                                                               */
/* ------------------------------------------------------------------ */

/**
 * Masas de follaje en tres pisos. Ancha y aplanada, que es la silueta que
 * distingue a una ceiba adulta de un árbol genérico.
 *
 * La copa va **centrada sobre el eje del fuste** (x = 1252): abarca de 1000 a
 * 1552, así que su centro cae en 1276 y sobresale 24 px hacia la derecha, lo
 * justo para que no se lea como un espejo. El reparto importa: una copa que
 * cuelga mucho más de un lado hace que el árbol parezca a punto de volcarse.
 *
 * El borde izquierdo no puede bajar de x ≈ 1000 porque ahí empieza el corredor
 * del quetzal: la percha está en 952 y el cuerpo del ave ocupa unos 74 px a su
 * izquierda. Por eso la copa se centra recortando el lado derecho y no
 * estirando el izquierdo.
 */
export const COPA = [
  // Piso alto
  { x: 1122, y: 324, rx: 120, ry: 64, semilla: 11, piso: 1 },
  { x: 1252, y: 292, rx: 134, ry: 72, semilla: 12, piso: 1 },
  { x: 1380, y: 304, rx: 124, ry: 66, semilla: 13, piso: 1 },
  { x: 1462, y: 344, rx: 84, ry: 54, semilla: 14, piso: 1 },
  // Piso medio
  { x: 1100, y: 402, rx: 100, ry: 58, semilla: 21, piso: 2 },
  { x: 1226, y: 380, rx: 136, ry: 70, semilla: 22, piso: 2 },
  { x: 1352, y: 392, rx: 126, ry: 66, semilla: 23, piso: 2 },
  { x: 1448, y: 420, rx: 86, ry: 54, semilla: 24, piso: 2 },
  // Faldón. Baja hasta y ≈ 515 a propósito: es lo que cubre el horquillado y
  // el arranque de todas las ramas, de modo que lo único que queda al aire es
  // el brazo de la percha. Una ceiba con el ramaje entero expuesto entre el
  // fuste y la copa se lee como un esqueleto con hojas encima.
  { x: 1112, y: 466, rx: 92, ry: 48, semilla: 31, piso: 3 },
  { x: 1234, y: 454, rx: 120, ry: 56, semilla: 32, piso: 3 },
  { x: 1352, y: 464, rx: 108, ry: 52, semilla: 33, piso: 3 },
  { x: 1452, y: 482, rx: 84, ry: 44, semilla: 34, piso: 3 },
  { x: 1500, y: 442, rx: 52, ry: 40, semilla: 35, piso: 3 }
];

/** Silueta completa de la copa, en el tono más profundo. */
export const COPA_SILUETA = COPA.map((m) =>
  lobulo(m.x, m.y, m.rx, m.ry, { puntos: 26, semilla: m.semilla, fuerza: 1 })
).join('');

/**
 * Cúmulos de luz.
 *
 * El volumen NO se construye apilando copias de la silueta reducidas y
 * desplazadas: eso genera islas concéntricas que se leen como manchas de
 * camuflaje. Cada nivel tonal es un conjunto propio de lóbulos pequeños,
 * repartidos dentro de la masa y sesgados hacia la luz clave, que es como se
 * pinta realmente una copa: racimos de hojas que reciben el sol, no anillos.
 */
/**
 * `hacia` es lo que decide si la copa parece un árbol o un uniforme de
 * camuflaje. Repartir los tonos claros por toda la masa produce manchas sueltas
 * sin forma; concentrarlos en el cuadrante por donde entra la luz —y dejar el
 * resto en el tono base— construye el volumen del racimo. Por eso cada nivel
 * más claro tiene un `hacia` mayor y una `extension` menor: cuanto más brillante
 * el tono, más apretado contra el hombro iluminado.
 */
const NIVELES = {
  media: { cantidad: 10, extension: 0.7, hacia: 0.05, radio: 0.3, semilla: 3301 },
  // Bolsas de sombra: mismo mecanismo, pero sesgadas en contra de la luz. Son
  // los huecos entre racimos, y sin ellas la copa se aplana por mucho tono
  // claro que se le ponga encima.
  sombra: { cantidad: 6, extension: 0.62, hacia: -0.3, radio: 0.26, semilla: 3389 },
  clara: { cantidad: 8, extension: 0.42, hacia: 0.38, radio: 0.2, semilla: 3467 },
  brillo: { cantidad: 5, extension: 0.3, hacia: 0.55, radio: 0.13, semilla: 3613 }
};

function cumulos(nivel) {
  const cfg = NIVELES[nivel];
  const rnd = aleatorio(cfg.semilla);
  const trazos = [];

  COPA.forEach((m, iM) => {
    // El faldón recibe menos luz directa: se le quita un cúmulo por masa.
    const cantidad = m.piso === 3 && cfg.hacia > 0 ? Math.max(1, cfg.cantidad - 2) : cfg.cantidad;

    for (let i = 0; i < cantidad; i += 1) {
      const ang = rnd() * Math.PI * 2;
      const rad = Math.sqrt(rnd()) * cfg.extension;
      let ux = Math.cos(ang) * rad + LUZ[0] * cfg.hacia;
      let uy = Math.sin(ang) * rad + LUZ[1] * cfg.hacia;

      // Nada se sale de la masa que lo aloja.
      const largo = Math.hypot(ux, uy);
      if (largo > 0.88) {
        ux = (ux / largo) * 0.88;
        uy = (uy / largo) * 0.88;
      }

      // Varianza alta de tamaño a propósito: racimos todos iguales se leen como
      // un patrón, y un patrón nunca parece follaje.
      const k = cfg.radio * (0.5 + rnd() * rnd() * 1.6);
      trazos.push(
        lobulo(m.x + ux * m.rx, m.y + uy * m.ry, m.rx * k, m.ry * k * (0.82 + rnd() * 0.42), {
          puntos: 12,
          semilla: iM * 31 + i * 7 + cfg.semilla,
          fuerza: 1.6
        })
      );
    }
  });

  return trazos.join('');
}

export const COPA_MEDIA = cumulos('media');
export const COPA_SOMBRA = cumulos('sombra');
export const COPA_CLARA = cumulos('clara');
export const COPA_BRILLO = cumulos('brillo');

/** Centro visual de la copa: define qué lado de cada masa mira hacia fuera. */
const COPA_CENTRO = { x: 1276, y: 375 };

/**
 * Ramilletes palmados en el contorno. Rompen la silueta para que las masas no
 * se lean como manchas: la hoja palmada de cinco foliolos es la firma botánica
 * de la ceiba.
 */
export const RAMILLETES = (() => {
  const rnd = aleatorio(7717);
  const lista = [];
  COPA.forEach((c, indice) => {
    const cantidad = c.piso === 1 ? 4 : 3;
    for (let i = 0; i < cantidad; i += 1) {
      // Ángulo dentro del semiplano que mira hacia fuera de la copa
      const haciaFuera = Math.atan2(c.y - COPA_CENTRO.y, c.x - COPA_CENTRO.x);
      const ang = haciaFuera + (rnd() - 0.5) * 2.5;
      const k = 0.96 + rnd() * 0.14;
      lista.push({
        id: `${indice}-${i}`,
        x: r1(c.x + Math.cos(ang) * c.rx * k),
        y: r1(c.y + Math.sin(ang) * c.ry * k),
        giro: r1((ang * 180) / Math.PI + 90 + (rnd() - 0.5) * 46),
        escala: r1(0.62 + rnd() * 0.5),
        tono: i % 3,
        retraso: -r1(rnd() * 5.4)
      });
    }
  });
  return lista;
})();

/**
 * Perfil del tronco, de la base al horquillado. 212 px de diámetro al pie y 100
 * en la horquilla: la desproporción es deliberada, un fuste que no engorda
 * hacia abajo no lee como ceiba vieja.
 */
export const TRONCO = `M1146 ${SUELO + 4}C1152 700 1166 640 1186 566C1196 536 1203 496 1201 458
L1301 452C1301 492 1309 534 1321 566C1343 640 1353 700 1359 ${SUELO + 4}Z`;

/**
 * Raíces tabulares (gambas). Se abren de 1040 a 1462 —422 px de base contra los
 * 212 del fuste— porque el contrafuerte es lo que da la sensación de peso y de
 * edad; sin él, un tronco ancho sólo parece un cilindro grueso.
 */
export const GAMBAS = [
  { d: `M1040 ${SUELO + 4}C1090 748 1140 706 1170 630C1180 602 1188 578 1192 560L1216 572C1206 606 1193 646 1185 686C1177 720 1173 742 1173 ${SUELO + 4}Z`, tono: 0 },
  { d: `M1108 ${SUELO + 4}C1146 746 1178 714 1196 656L1218 666C1206 700 1196 730 1194 ${SUELO + 4}Z`, tono: 1 },
  { d: `M1462 ${SUELO + 4}C1414 748 1366 708 1338 634C1328 606 1320 580 1316 562L1292 574C1302 608 1315 648 1323 688C1331 720 1335 742 1335 ${SUELO + 4}Z`, tono: 0 },
  { d: `M1394 ${SUELO + 4}C1358 746 1328 714 1312 658L1292 668C1304 702 1313 730 1315 ${SUELO + 4}Z`, tono: 1 },
  { d: `M1230 ${SUELO + 4}C1236 720 1248 686 1262 656C1276 686 1288 720 1294 ${SUELO + 4}Z`, tono: 2 }
];

/**
 * Fisuras de la corteza. Ninguna recorre el fuste entero: una línea que va del
 * suelo a la horquilla convierte el tronco en un tablón. Van escalonadas, de
 * largos distintos y sin coincidir en los extremos.
 */
export const CORTEZA = [
  'M1180 726C1188 684 1200 640 1212 596',
  'M1206 736C1212 700 1220 662 1230 622',
  'M1226 618C1232 578 1238 534 1240 492',
  'M1238 742C1242 708 1248 674 1254 640',
  'M1258 606C1264 566 1270 524 1272 486',
  'M1272 736C1270 704 1272 672 1278 640',
  'M1296 700C1292 668 1290 638 1292 610',
  'M1168 706C1176 676 1184 650 1192 626',
  'M1318 724C1310 694 1304 664 1302 638',
  'M1210 546C1214 516 1218 490 1220 470'
];

/**
 * Ramas principales. Se dibujan por debajo del follaje: sólo asoman en los
 * huecos de cielo entre pisos, que es lo que da profundidad a la copa.
 */
/**
 * Ramas.
 *
 * Seis trazos en total, no una corona de radios. Cada línea central arranca
 * DENTRO del fuste —el tronco se pinta después y tapa el arranque—, así que la
 * rama parece nacer de la madera en lugar de estar apoyada encima.
 *
 * `capa` decide el orden y el tono:
 *   'fondo'     se pintan DETRÁS de la silueta de la copa, así que quedan
 *               ocultas por completo. Siguen dibujadas porque son las que
 *               sostienen la estructura del árbol si la copa vuelve a subir;
 *   'principal' entre la masa oscura y las hojas iluminadas.
 *
 * Con el faldón bajado hasta y ≈ 515, lo único que asoma es el brazo de la
 * percha: el ramaje visible entre fuste y copa hacía que el árbol se leyera
 * como un esqueleto con hojas encima.
 */
const TRAZOS = [
  // Izquierda: sostiene al quetzal. Baja del horquillado, se tiende casi en
  // horizontal y remonta al final para ofrecer la punta como posadero.
  {
    clave: 'izquierda',
    capa: 'principal',
    percha: true,
    luz: true,
    base: 48,
    punta: 9,
    semilla: 5,
    puntos: [
      [1262, 528],
      [1214, 512],
      [1160, 494],
      [1092, 466],
      [1032, 428],
      [988, 398],
      [952, 372]
    ]
  },
  // Bifurcación de la izquierda: sube hacia la copa y desaparece en el faldón.
  {
    clave: 'izquierda-alta',
    capa: 'principal',
    percha: true,
    base: 17,
    punta: 6,
    flare: 0.9,
    semilla: 11,
    puntos: [
      [1102, 470],
      [1076, 448],
      [1050, 424],
      [1028, 402]
    ]
  },
  // Derecha: la más larga. Remonta en curva y se pierde bajo las hojas sin
  // enseñar la punta.
  {
    clave: 'derecha',
    capa: 'fondo',
    base: 44,
    punta: 13,
    semilla: 23,
    puntos: [
      [1248, 520],
      [1300, 504],
      [1356, 482],
      [1412, 452],
      [1458, 418],
      [1492, 388]
    ]
  },
  // Bifurcación de la derecha.
  {
    clave: 'derecha-alta',
    capa: 'fondo',
    base: 18,
    punta: 7,
    flare: 0.9,
    semilla: 31,
    puntos: [
      [1398, 462],
      [1408, 436],
      [1418, 412],
      [1430, 392]
    ]
  },
  // Centrales: nacen del horquillado y se meten en la copa casi de inmediato.
  // Van en la capa de fondo para que no se lean como palos subiendo del tronco.
  {
    clave: 'centro-izquierda',
    capa: 'fondo',
    base: 32,
    punta: 11,
    semilla: 43,
    puntos: [
      [1228, 500],
      [1210, 460],
      [1192, 424],
      [1174, 392]
    ]
  },
  {
    clave: 'centro-derecha',
    capa: 'fondo',
    base: 30,
    punta: 10,
    semilla: 57,
    puntos: [
      [1274, 498],
      [1292, 458],
      [1308, 424],
      [1322, 394]
    ]
  }
];

export const RAMAS = TRAZOS.map((t) => ({
  clave: t.clave,
  capa: t.capa,
  percha: Boolean(t.percha),
  d: rama(t.puntos, {
    base: t.base,
    punta: t.punta,
    flare: t.flare,
    semilla: t.semilla
  }),
  // Cinta de luz sobre el lomo, sólo en las dos ramas gruesas: en las finas no
  // cabe y sólo ensuciaría el borde.
  luz: t.luz
    ? rama(t.puntos, {
        base: t.base,
        punta: t.punta,
        flare: t.flare,
        semilla: t.semilla,
        escala: 0.34,
        desplazar: -0.28
      })
    : null
}));

/* ------------------------------------------------------------------ */
/* Suelo y flora                                                       */
/* ------------------------------------------------------------------ */

/** Monjas blancas: dos matas, tres flores en total. */
export const MONJAS = [
  {
    id: 'm1',
    x: 1372,
    y: SUELO - 2,
    escala: 1,
    retraso: -1.4,
    flores: [
      { dx: 0, dy: -74, giro: -6, s: 1 },
      { dx: 34, dy: -46, giro: 12, s: 0.78 }
    ]
  },
  { id: 'm2', x: 1520, y: SUELO - 8, escala: 0.9, retraso: -3.1, flores: [{ dx: -6, dy: -62, giro: 8, s: 0.94 }] }
];

/** Hojas que descienden desde la copa. */
export const HOJAS_AL_VIENTO = [
  { x: 1150, y: 350, giro: -18, s: 0.92, duracion: 15.5, retraso: -2.1 },
  { x: 1300, y: 320, giro: 24, s: 0.74, duracion: 18.2, retraso: -9.4 },
  { x: 1420, y: 406, giro: -6, s: 1.02, duracion: 16.4, retraso: -5.6 },
  { x: 1050, y: 444, giro: 40, s: 0.68, duracion: 19.8, retraso: -13.2 },
  { x: 1490, y: 496, giro: -34, s: 0.82, duracion: 17.6, retraso: -4.1 },
  { x: 1220, y: 528, giro: 12, s: 0.6, duracion: 21.4, retraso: -16.3 },
  { x: 1370, y: 562, giro: -24, s: 0.7, duracion: 20.2, retraso: -8.8 }
];

/** Motas de luz suspendidas: sólo atmósfera, nunca protagonismo. */
export const MOTAS = [
  { x: 1062, y: 488, r: 3.2, duracion: 9.5, retraso: -1.2 },
  { x: 1266, y: 524, r: 2.4, duracion: 11.2, retraso: -4.6 },
  { x: 1424, y: 556, r: 3.6, duracion: 10.4, retraso: -7.1 },
  { x: 1186, y: 604, r: 2.2, duracion: 12.6, retraso: -2.9 },
  { x: 1498, y: 470, r: 2.8, duracion: 13.4, retraso: -9.8 }
];

/* ------------------------------------------------------------------ */
/* Listón inferior                                                     */
/* ------------------------------------------------------------------ */

/**
 * Ondas senoidales exactas. Cada trazo cubre tres anchos de escena con periodo
 * divisor de 1600, así que desplazarlo 1600 px reinicia la forma sin costura.
 */
export const ONDA_CRESTA =
  'M-1600 66C-1466.67 78.04 -1333.33 89 -1200 89C-1066.67 89 -933.33 78.04 -800 66C-666.67 53.96 -533.33 43 -400 43C-266.67 43 -133.33 53.96 0 66C133.33 78.04 266.67 89 400 89C533.33 89 666.67 78.04 800 66C933.33 53.96 1066.67 43 1200 43C1333.33 43 1466.67 53.96 1600 66C1733.33 78.04 1866.67 89 2000 89C2133.33 89 2266.67 78.04 2400 66C2533.33 53.96 2666.67 43 2800 43C2933.33 43 3066.67 53.96 3200 66L3200 210L-1600 210Z';

export const ONDA_BLANCA =
  'M-1600 91.73C-1466.67 101.95 -1333.33 107.57 -1200 103.53C-1066.67 99.48 -933.33 86.49 -800 76.27C-666.67 66.05 -533.33 60.43 -400 64.47C-266.67 68.52 -133.33 81.51 0 91.73C133.33 101.95 266.67 107.57 400 103.53C533.33 99.48 666.67 86.49 800 76.27C933.33 66.05 1066.67 60.43 1200 64.47C1333.33 68.52 1466.67 81.51 1600 91.73C1733.33 101.95 1866.67 107.57 2000 103.53C2133.33 99.48 2266.67 86.49 2400 76.27C2533.33 66.05 2666.67 60.43 2800 64.47C2933.33 68.52 3066.67 81.51 3200 91.73L3200 210L-1600 210Z';

export const ONDA_ORO =
  'M-1600 111.75C-1466.67 119.82 -1333.33 121.09 -1200 114.41C-1066.67 107.74 -933.33 94.32 -800 86.25C-666.67 78.18 -533.33 76.91 -400 83.59C-266.67 90.26 -133.33 103.68 0 111.75C133.33 119.82 266.67 121.09 400 114.41C533.33 107.74 666.67 94.32 800 86.25C933.33 78.18 1066.67 76.91 1200 83.59C1333.33 90.26 1466.67 103.68 1600 111.75C1733.33 119.82 1866.67 121.09 2000 114.41C2133.33 107.74 2266.67 94.32 2400 86.25C2533.33 78.18 2666.67 76.91 2800 83.59C2933.33 90.26 3066.67 103.68 3200 111.75L3200 210L-1600 210Z';

export const ONDA_MEDIA =
  'M-1600 121.64C-1466.67 127.98 -1333.33 126.78 -1200 119.11C-1066.67 111.45 -933.33 98.7 -800 92.36C-666.67 86.02 -533.33 87.22 -400 94.89C-266.67 102.55 -133.33 115.3 0 121.64C133.33 127.98 266.67 126.78 400 119.11C533.33 111.45 666.67 98.7 800 92.36C933.33 86.02 1066.67 87.22 1200 94.89C1333.33 102.55 1466.67 115.3 1600 121.64C1733.33 127.98 1866.67 126.78 2000 119.11C2133.33 111.45 2266.67 98.7 2400 92.36C2533.33 86.02 2666.67 87.22 2800 94.89C2933.33 102.55 3066.67 115.3 3200 121.64L3200 210L-1600 210Z';

export const ONDA_FONDO =
  'M-1600 154.26C-1533.33 148.3 -1466.67 139.89 -1400 136.61C-1333.33 133.33 -1266.67 135.77 -1200 141.74C-1133.33 147.7 -1066.67 156.11 -1000 159.39C-933.33 162.67 -866.67 160.23 -800 154.26C-733.33 148.3 -666.67 139.89 -600 136.61C-533.33 133.33 -466.67 135.77 -400 141.74C-333.33 147.7 -266.67 156.11 -200 159.39C-133.33 162.67 -66.67 160.23 0 154.26C66.67 148.3 133.33 139.89 200 136.61C266.67 133.33 333.33 135.77 400 141.74C466.67 147.7 533.33 156.11 600 159.39C666.67 162.67 733.33 160.23 800 154.26C866.67 148.3 933.33 139.89 1000 136.61C1066.67 133.33 1133.33 135.77 1200 141.74C1266.67 147.7 1333.33 156.11 1400 159.39C1466.67 162.67 1533.33 160.23 1600 154.26C1666.67 148.3 1733.33 139.89 1800 136.61C1866.67 133.33 1933.33 135.77 2000 141.74C2066.67 147.7 2133.33 156.11 2200 159.39C2266.67 162.67 2333.33 160.23 2400 154.26C2466.67 148.3 2533.33 139.89 2600 136.61C2666.67 133.33 2733.33 135.77 2800 141.74C2866.67 147.7 2933.33 156.11 3000 159.39C3066.67 162.67 3133.33 160.23 3200 154.26L3200 210L-1600 210Z';
