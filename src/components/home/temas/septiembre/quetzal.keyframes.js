/**
 * Generador de los keyframes del quetzal.
 *
 * Produce tres reglas @keyframes:
 *   - sep-quetzal-vuelo   trayectoria (translate + rotate + scaleX)
 *   - sep-aleteo          ala cercana, frecuencia variable
 *   - sep-aleteo-lejos    ala lejana, desfasada
 *
 * Restricciones duras:
 *   - rotación acotada a [-10, 10] grados
 *   - scaleX siempre positivo (nunca cruza cero -> sin flip)
 *   - el fotograma 0 %, el de aterrizaje y el 100 % son idénticos
 */

const PERCHA = { x: 952, y: 372 };

/** Waypoints del circuito, en coordenadas de escena (1600x900). */
const RUTA = [
  [952, 372],   // percha
  [900, 368],
  [830, 342],
  [752, 300],
  [680, 250],
  [628, 206],
  [610, 180],   // apice
  [648, 162],
  [730, 152],
  [830, 158],
  [920, 178],
  [988, 214],
  [1012, 262],
  [1004, 316],
  [976, 352],
  [952, 372]    // vuelve a la percha
];

/* ---------------- Catmull-Rom muestreado por longitud de arco ------------- */

function catmull(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return [0, 1].map((i) =>
    0.5 *
    ((2 * p1[i]) +
      (-p0[i] + p2[i]) * t +
      (2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * t2 +
      (-p0[i] + 3 * p1[i] - 3 * p2[i] + p3[i]) * t3)
  );
}

function muestrear(ruta, porTramo = 220) {
  const en = (i) => ruta[Math.max(0, Math.min(ruta.length - 1, i))];
  const pts = [];
  for (let i = 0; i < ruta.length - 1; i += 1) {
    for (let j = 0; j < porTramo; j += 1) {
      pts.push(catmull(en(i - 1), en(i), en(i + 1), en(i + 2), j / porTramo));
    }
  }
  pts.push(ruta[ruta.length - 1]);
  return pts;
}

const PUNTOS = muestrear(RUTA);

const LARGOS = (() => {
  const l = [0];
  for (let i = 1; i < PUNTOS.length; i += 1) {
    const dx = PUNTOS[i][0] - PUNTOS[i - 1][0];
    const dy = PUNTOS[i][1] - PUNTOS[i - 1][1];
    l.push(l[i - 1] + Math.hypot(dx, dy));
  }
  return l;
})();

const TOTAL = LARGOS[LARGOS.length - 1];

/** Punto y tangente a la fracción `u` (0..1) de longitud de arco. */
function enArco(u) {
  const objetivo = Math.max(0, Math.min(1, u)) * TOTAL;
  let i = 1;
  while (i < LARGOS.length - 1 && LARGOS[i] < objetivo) i += 1;
  const t0 = LARGOS[i - 1];
  const t1 = LARGOS[i];
  const k = t1 === t0 ? 0 : (objetivo - t0) / (t1 - t0);
  const a = PUNTOS[i - 1];
  const b = PUNTOS[i];
  const p = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

  // Tangente con ventana amplia: alisa el ruido del muestreo.
  const j0 = Math.max(0, i - 14);
  const j1 = Math.min(PUNTOS.length - 1, i + 14);
  const d = [PUNTOS[j1][0] - PUNTOS[j0][0], PUNTOS[j1][1] - PUNTOS[j0][1]];
  const m = Math.hypot(d[0], d[1]) || 1;
  return { p, t: [d[0] / m, d[1] / m] };
}

/* ---------------- Perfil de velocidad --------------------------------------
 * Pares (tiempo % del ciclo, fracción de arco recorrida). Entre nodos se
 * interpola con suavizado, así el ave acelera al despegar, cruza a ritmo
 * constante, se demora en el ápice y frena en la aproximación.
 * -------------------------------------------------------------------------- */
const PERFIL = [
  [32, 0],
  [37, 0.06],
  [44, 0.22],
  [52, 0.4],
  [60, 0.55],
  [68, 0.68],
  [76, 0.82],
  [81, 0.91],
  [86, 1]
];

const suave = (t) => t * t * (3 - 2 * t);

function arcoEn(tiempo) {
  if (tiempo <= PERFIL[0][0]) return 0;
  if (tiempo >= PERFIL[PERFIL.length - 1][0]) return 1;
  for (let i = 1; i < PERFIL.length; i += 1) {
    const [t0, u0] = PERFIL[i - 1];
    const [t1, u1] = PERFIL[i];
    if (tiempo <= t1) {
      const k = (tiempo - t0) / (t1 - t0);
      return u0 + (u1 - u0) * suave(k);
    }
  }
  return 1;
}

/* ---------------- Actitud del cuerpo --------------------------------------- */

const acotar = (v, min, max) => Math.max(min, Math.min(max, v));
const r1 = (v) => Math.round(v * 10) / 10;
const r3 = (v) => Math.round(v * 1000) / 1000;

/**
 * El ave está dibujada mirando a la izquierda (la cabeza vive en x negativa),
 * así que una rotación positiva le levanta el pico. Se deriva de la componente
 * vertical del avance: subir = morro arriba, bajar = morro abajo.
 */
function rotacion(tangente) {
  return acotar(-15 * tangente[1], -10, 10);
}

/**
 * Escorzo. En el tramo alto el ave deriva hacia la derecha —de espaldas a su
 * propia silueta—, así que se estrecha un poco para leerse como un viraje que
 * se aleja. Nunca baja de 0.82 ni cambia de signo: no hay volteo.
 */
function escorzo(tangente) {
  return r3(1 - 0.18 * Math.max(0, tangente[0]));
}

/* ---------------- Trayectoria ---------------------------------------------- */

/** Media móvil: quita los quiebres que deja el muestreo de la tangente. */
function alisar(valores, radio) {
  return valores.map((_, i) => {
    let suma = 0;
    let n = 0;
    for (let j = -radio; j <= radio; j += 1) {
      const k = i + j;
      if (k < 0 || k >= valores.length) continue;
      suma += valores[k];
      n += 1;
    }
    return suma / n;
  });
}

function trayectoria() {
  const INI = 32;
  const FIN = 86;
  const fija = `translate(${PERCHA.x}px, ${PERCHA.y}px) rotate(0deg) scaleX(1)`;

  const tiempos = [];
  for (let t = INI + 1; t < FIN; t += 1) tiempos.push(t);

  const crudos = tiempos.map((t) => enArco(arcoEn(t)));
  const rot = alisar(crudos.map((c) => rotacion(c.t)), 2);
  const sx = alisar(crudos.map((c) => escorzo(c.t)), 2);

  const filas = [['0%', fija], [`${INI}%`, fija]];

  tiempos.forEach((t, i) => {
    // Cerca del posado la actitud vuelve a cero, para que el enganche con el
    // fotograma fijo del 86 % no se note como un tirón.
    const borde = Math.min((t - INI) / 3, (FIN - t) / 3, 1);
    const r = rot[i] * borde;
    const s = 1 + (sx[i] - 1) * borde;
    filas.push([
      `${t}%`,
      `translate(${r1(crudos[i].p[0])}px, ${r1(crudos[i].p[1])}px) rotate(${r1(r)}deg) scaleX(${r3(s)})`
    ]);
  });

  // Aterrizaje y reposo: exactamente el mismo fotograma que el 0 %.
  filas.push([`${FIN}%`, fija]);
  filas.push(['100%', fija]);
  return filas;
}

/* ---------------- Aleteo ----------------------------------------------------
 * Se emiten sólo los extremos del batido. La frecuencia varía por tramo, así
 * que basta con colocar cada extremo en su instante: dos keyframes por ciclo.
 * -------------------------------------------------------------------------- */

/** [inicio %, fin %, amplitud grados, frecuencia Hz] */
const BATIDO = [
  [27, 32, 46, 3.2],   // preparación y despegue: rápido y amplio
  [32, 46, 42, 2.6],   // ascenso
  [46, 60, 34, 2],     // crucero
  [60, 74, 13, 0.9],   // planeo del tramo alto
  [74, 83, 38, 2.4],   // frenada
  [83, 86, 28, 1.5]    // flare de aterrizaje
];

const CICLO = 17; // segundos del reloj maestro

function aleteo({ desfase = 0, amplitudK = 1, reposo = -34 }) {
  const filas = [['0%', reposo], ['26%', reposo]];
  let fase = desfase;

  for (const [ini, fin, amp, hz] of BATIDO) {
    // Un extremo cada medio ciclo del batido.
    const pasoPct = (100 * 0.5) / (hz * CICLO);
    for (let t = ini; t < fin - pasoPct * 0.5; t += pasoPct) {
      fase += 1;
      const arriba = fase % 2 === 0;
      filas.push([t, (arriba ? amp : -amp) * amplitudK]);
    }
  }

  filas.push([86.5, reposo]);
  filas.push([100, reposo]);

  // Normaliza, ordena y elimina instantes repetidos.
  const vistos = new Set();
  return filas
    .map(([t, v]) => [typeof t === 'string' ? parseFloat(t) : t, v])
    .sort((a, b) => a[0] - b[0])
    .filter(([t]) => {
      const k = t.toFixed(2);
      if (vistos.has(k)) return false;
      vistos.add(k);
      return true;
    });
}

/* ---------------- Salida ---------------------------------------------------- */

function regla(nombre, filas, formato) {
  const cuerpo = filas.map(formato).join('\n');
  return `@keyframes ${nombre} {\n${cuerpo}\n}`;
}

const salida = [
  regla('sep-quetzal-vuelo', trayectoria(), ([t, v]) => `  ${t} { transform: ${v}; }`),
  '',
  regla(
    'sep-aleteo',
    aleteo({ desfase: 0 }),
    ([t, v]) => `  ${r1(t)}% { transform: rotate(${r1(v)}deg) scaleY(${r3(0.86 + Math.abs(v) / 260)}); }`
  ),
  '',
  regla(
    'sep-aleteo-lejos',
    aleteo({ desfase: 1, amplitudK: 0.84, reposo: -28 }),
    ([t, v]) => `  ${r1(t)}% { transform: rotate(${r1(v)}deg) scaleY(${r3(0.82 + Math.abs(v) / 300)}); }`
  )
].join('\n');

console.log(salida);

/* ---------------- Comprobaciones -------------------------------------------- */

const t = trayectoria();
const errores = [];
if (t[0][1] !== t[t.length - 1][1]) errores.push('el ciclo no cierra en la misma pose');
for (const [tiempo, v] of t) {
  const rot = parseFloat(v.match(/rotate\((-?[\d.]+)deg\)/)[1]);
  const sx = parseFloat(v.match(/scaleX\((-?[\d.]+)\)/)[1]);
  if (Math.abs(rot) > 10.001) errores.push(`rotación fuera de rango en ${tiempo}: ${rot}`);
  if (sx <= 0.5) errores.push(`escorzo demasiado agresivo en ${tiempo}: ${sx}`);
}
console.error(errores.length ? `FALLOS:\n${errores.join('\n')}` : `OK · ${t.length} fotogramas · arco ${Math.round(TOTAL)}px`);
