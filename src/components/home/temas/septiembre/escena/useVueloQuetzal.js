import { useEffect, useLayoutEffect } from 'react';

const V = {
  crucero: 185,
  entrada: 1.25,
  aproximacion: 1,
  despegue: 0.9,
  salida: 1.8
};

/** Fases que no dependen de una distancia, en milisegundos. */
const FIJAS = {
  posado: [3200, 4800],
  despegue: 850,
  espera: 1100
};

/** Geometría del circuito, en unidades de escena. */
const GEOM = {
  /** Holgura sobre la caja del ave para darla por fuera de cuadro. */
  margen: 48,
  /** Altura de crucero sobre la rama. */
  crucero: 178,
  /** Entra un poco por encima del crucero y se marcha remontando. */
  entradaAlta: 26,
  salidaAlta: 54,
  /** Último tramo antes de la rama: es donde frena. */
  aproxDx: 130,
  aproxDy: 78,
  /** Repecho antes de dejarse caer sobre la percha. */
  repecho: 30,
  /** Fracción del despegue que el ave pasa flexionada, sin avanzar todavía. */
  flexion: 0.45,
  /** Ángulo del impulso, grados sobre la horizontal. */
  anguloImpulso: 38,
  /** El vuelo no puede subir por encima de este colchón bajo el borde alto. */
  techo: 70
};

/** Ondulación vertical del vuelo: dos senoidales desfasadas, nunca una sola. */
const VAIVEN = [
  { amplitud: 12, hz: 0.42, fase: 0 },
  { amplitud: 4.5, hz: 1.15, fase: 1.7 }
];

/**
 * Inclinación del cuerpo. Sale del avance real salvo en el flare: ningún ave
 * se posa apuntando hacia abajo, así que en el último tramo de la aproximación
 * la actitud se lleva a morro arriba aunque siga descendiendo.
 */
const ACTITUD = { ganancia: 0.45, tope: 8, filtro: 6, flare: 6.5, desde: 0.74 };

const SIGUIENTE = {
  entrada: 'aproximacion',
  aproximacion: 'posado',
  posado: 'despegue',
  despegue: 'salida',
  salida: 'espera',
  espera: 'entrada'
};

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

const limitar = (v, min, max) => Math.max(min, Math.min(max, v));
const mezclar = (a, b, t) => a + (b - a) * t;
const suave = (t) => t * t * (3 - 2 * t);
const rad = Math.PI / 180;
const grados = 180 / Math.PI;


function hermite(p, v0, v1) {
  const a = v0 + v1 - 2;
  const b = 3 - 2 * v0 - v1;
  return ((a * p + b) * p + v0) * p;
}

const normalizar = (vIni, vFin) => [(2 * vIni) / (vIni + vFin), (2 * vFin) / (vIni + vFin)];
const aplicar = (m, x, y) => ({ x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f });
const entre = ([min, max]) => min + Math.random() * (max - min);

/* ------------------------------------------------------------------ */
/* Medición del circuito                                               */
/* ------------------------------------------------------------------ */

/**
 * Extensión del dibujo respecto a su propio origen. `getBBox` falla si el nodo
 * todavía no está renderizado (un ancestro con `display: none`, por ejemplo), y
 * en ese caso no hay nada que animar.
 */
function medirAve(nodo) {
  try {
    const b = nodo.getBBox();
    return b.width ? { x: b.x, ancho: b.width } : null;
  } catch {
    return null;
  }
}


function medirCircuito(svg, ancla, caja) {
  const ctm = svg.getScreenCTM();
  const ctmAncla = ancla.getScreenCTM();
  if (!ctm || !ctmAncla) return null;

  const inv = ctm.inverse();
  const aEscena = (x, y) => aplicar(inv, x, y);

  const puntaPantalla = aplicar(ctmAncla, 0, 0);
  const percha = aEscena(puntaPantalla.x, puntaPantalla.y);


  const cajaSvg = svg.getBoundingClientRect();
  if (!cajaSvg.width || !cajaSvg.height) return null;
  const derecha = aEscena(Math.max(window.innerWidth, cajaSvg.right), cajaSvg.top).x;
  const izquierda = aEscena(Math.min(0, cajaSvg.left), cajaSvg.top).x;
  const alto = aEscena(cajaSvg.left, cajaSvg.top).y;

  const xEntrada = derecha + GEOM.margen - caja.x;
  const xSalida = izquierda - GEOM.margen - caja.x - caja.ancho;
  const yCrucero = Math.max(alto + GEOM.techo, percha.y - GEOM.crucero);
  const dImpulso =
    (V.despegue * V.crucero * (FIJAS.despegue / 1000) * (1 - GEOM.flexion)) / 2;

  const circuito = {
    percha,
    entrada: { x: xEntrada, y: yCrucero - GEOM.entradaAlta },
    aprox: { x: percha.x + GEOM.aproxDx, y: percha.y - GEOM.aproxDy },
    impulso: {
      x: percha.x - dImpulso * Math.cos(GEOM.anguloImpulso * rad),
      y: percha.y - dImpulso * Math.sin(GEOM.anguloImpulso * rad)
    },
    salida: { x: xSalida, y: yCrucero - GEOM.salidaAlta },
    vEntrada: normalizar(V.entrada, V.aproximacion),
    vSalida: normalizar(V.despegue, V.salida)
  };

  const largo = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
  const tramo = (d, vIni, vFin) => limitar((2 * d) / ((vIni + vFin) * V.crucero), 0.4, 12);

  circuito.duracion = {
    entrada: tramo(largo(circuito.entrada, circuito.aprox), V.entrada, V.aproximacion),
    aproximacion: tramo(largo(circuito.aprox, percha), V.aproximacion, 0),
    posado: 0, // se sortea al entrar en la fase
    despegue: FIJAS.despegue / 1000,
    salida: tramo(largo(circuito.impulso, circuito.salida), V.despegue, V.salida),
    espera: FIJAS.espera / 1000
  };

  return circuito;
}

/* ------------------------------------------------------------------ */
/* Trayectoria                                                         */
/* ------------------------------------------------------------------ */

/** Ondulación vertical del vuelo. Va del reloj absoluto, no del avance. */
function vaiven(reloj) {
  return VAIVEN.reduce((suma, o) => suma + o.amplitud * Math.sin(reloj * o.hz * 2 * Math.PI + o.fase), 0);
}

/**
 * Posición del ave, en coordenadas de escena, para el avance `p` de una fase.
 *
 * Cada fase gobierna sólo su tramo y termina exactamente donde arranca la
 * siguiente, así que el encadenado no necesita ningún ajuste.
 */
function posicion(fase, p, c, reloj) {
  switch (fase) {
    // Cruza desde fuera de cuadro perdiendo altura poco a poco. El vaivén se
    // apaga en el último tercio: se llega a la aproximación ya estabilizado.
    case 'entrada': {
      const e = hermite(p, c.vEntrada[0], c.vEntrada[1]);
      const ventana = 1 - suave(limitar((p - 0.62) / 0.38, 0, 1));
      return {
        x: mezclar(c.entrada.x, c.aprox.x, e),
        y: mezclar(c.entrada.y, c.aprox.y, suave(p)) + vaiven(reloj) * ventana
      };
    }

    // Frena hasta pararse sobre la rama. El repecho es la elevación que hace
    // cualquier ave antes de dejarse caer sobre la percha.
    case 'aproximacion': {
      const e = hermite(p, 2, 0);
      return {
        x: mezclar(c.aprox.x, c.percha.x, e),
        y: mezclar(c.aprox.y, c.percha.y, e) - GEOM.repecho * Math.sin(Math.PI * Math.min(1, p / 0.55))
      };
    }

    case 'posado':
      return { x: c.percha.x, y: c.percha.y };

    // La primera parte es flexión —la hace el CSS, aquí el ave no avanza— y la
    // segunda el empujón, acelerando desde cero.
    case 'despegue': {
      const q = limitar((p - GEOM.flexion) / (1 - GEOM.flexion), 0, 1);
      const e = q * q;
      return {
        x: mezclar(c.percha.x, c.impulso.x, e),
        y: mezclar(c.percha.y, c.impulso.y, e)
      };
    }

    // Remonta y se va acelerando hasta salir del todo por la izquierda.
    case 'salida': {
      const e = hermite(p, c.vSalida[0], c.vSalida[1]);
      const ventana = suave(limitar(p / 0.3, 0, 1));
      return {
        x: mezclar(c.impulso.x, c.salida.x, e),
        y: mezclar(c.impulso.y, c.salida.y, 1 - (1 - p) ** 2) + vaiven(reloj) * ventana
      };
    }

    // Aparcado fuera de cuadro por la derecha. El salto desde el borde
    // izquierdo ocurre aquí, y por eso no se ve.
    default:
      return { x: c.entrada.x, y: c.entrada.y };
  }
}

/**
 * El ave pliega el ala en el tramo final del aterrizaje y la vuelve a abrir a
 * mitad del despegue: es donde el cruce de opacidad queda escondido por el
 * propio gesto.
 */
const vaPosada = (fase, p) =>
  fase === 'posado' ||
  (fase === 'aproximacion' && p > 0.82) ||
  (fase === 'despegue' && p < GEOM.flexion);

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

// En SSR no hay layout que medir y React avisa por consola; en el navegador sí
// hace falta colocar al ave antes del primer pintado, o se vería un fotograma
// posada en la rama justo antes de salir volando.
const useAntesDePintar = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Pone en marcha el circuito. Recibe referencias, no nodos: el hook vive en la
 * escena y no obliga a Ceiba ni a Quetzal a saber nada del vuelo.
 *
 * @param {object} refs
 * @param {import('react').RefObject} refs.escena  `<svg>` de la ilustración
 * @param {import('react').RefObject} refs.ave     grupo raíz del quetzal
 * @param {import('react').RefObject} refs.ancla   ancla en la punta de la rama
 */
export default function useVueloQuetzal({ escena, ave, ancla }) {
  useAntesDePintar(() => {
    const svg = escena.current;
    const nodo = ave.current;
    const punta = ancla.current;
    if (!svg || !nodo || !punta || typeof window.matchMedia !== 'function') return undefined;

    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Extensión del ave respecto a su origen. Sale del propio dibujo, así que
    // los márgenes de "fuera de cuadro" siguen siendo válidos si la anatomía
    // cambia de tamaño. Sin caja no hay circuito posible: el ave se queda en la
    // rama, que es la pose que ya trae puesta.
    const caja = medirAve(nodo);
    if (!caja) return undefined;

    let circuito = null;
    let fase = 'entrada';
    let duracion = 1;
    let avance = 0;
    let reloj = 0;
    let previo = null;
    let giro = 0;
    let pose = '';
    let avisado = false;
    let cuadro = 0;
    let ultimo = 0;
    let rebote = 0;

    const colocar = (x, y, angulo) => {
      nodo.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${angulo.toFixed(2)}deg)`;
    };

    const marcarPose = (nueva) => {
      if (pose === nueva) return;
      pose = nueva;
      nodo.dataset.pose = nueva;
    };

    // Acuse de recibo de la rama. Se quita y se vuelve a poner el atributo para
    // que la animación arranque de cero en cada aterrizaje y en cada despegue.
    const sacudirRama = (tipo) => {
      window.clearTimeout(rebote);
      delete svg.dataset.percha;
      window.requestAnimationFrame(() => {
        svg.dataset.percha = tipo;
      });
      rebote = window.setTimeout(() => {
        delete svg.dataset.percha;
      }, 1400);
    };

    const remedir = () => {
      const medido = medirCircuito(svg, punta, caja);
      if (medido) circuito = medido;
      return Boolean(circuito);
    };

    const entrarEn = (nueva) => {
      // Cada fase vuelve a medir: es lo que absorbe un cambio de tamaño, un
      // zoom o una barra de navegador que aparece a media travesía.
      if (!remedir()) return;
      fase = nueva;
      avance = 0;
      avisado = false;
      duracion = nueva === 'posado' ? entre(FIJAS.posado) / 1000 : circuito.duracion[nueva] || 1;
      nodo.dataset.fase = nueva;
      // El CSS necesita saber cuánto dura la fase para encajar la flexión del
      // despegue sin repetir la constante en dos sitios.
      nodo.style.setProperty('--q-fase', `${duracion.toFixed(2)}s`);
      // El reinicio invisible: el ave salta de un borde al otro sin transición
      // porque el filtro de velocidad se corta aquí.
      if (nueva === 'espera' || nueva === 'entrada') {
        previo = null;
        giro = 0;
      }
      if (nueva === 'posado') sacudirRama('aterriza');
    };

    const pintar = (ahora) => {
      cuadro = window.requestAnimationFrame(pintar);
      if (!circuito && !remedir()) return;

      // Con la pestaña en segundo plano o tras una pausa, el salto de reloj se
      // recorta: el ave continúa donde estaba en vez de teletransportarse.
      const dt = ultimo ? Math.min(0.05, (ahora - ultimo) / 1000) : 0;
      ultimo = ahora;
      reloj += dt;

      avance += duracion > 0 ? dt / duracion : 1;
      if (avance >= 1) entrarEn(SIGUIENTE[fase]);

      const p = limitar(avance, 0, 1);
      const punto = posicion(fase, p, circuito, reloj);

      // La inclinación sale de la velocidad real del fotograma, no de una tabla
      // aparte: así el vaivén también mece al ave. El dibujo mira a la
      // izquierda, de modo que el morro apunta hacia (-dx, -dy).
      if (previo && dt > 0) {
        const dx = punto.x - previo.x;
        const dy = punto.y - previo.y;
        let objetivo =
          dx || dy
            ? limitar(Math.atan2(-dy, -dx) * grados * ACTITUD.ganancia, -ACTITUD.tope, ACTITUD.tope)
            : 0;
        if (fase === 'aproximacion') {
          const flare = suave(limitar((p - ACTITUD.desde) / (1 - ACTITUD.desde), 0, 1));
          objetivo = mezclar(objetivo, ACTITUD.flare, flare);
        }
        giro += (objetivo - giro) * Math.min(1, dt * ACTITUD.filtro);
      }
      previo = punto;

      colocar(punto.x, punto.y, giro);
      marcarPose(vaPosada(fase, p) ? 'posada' : 'vuelo');

      if (!avisado && fase === 'despegue' && p >= GEOM.flexion) {
        avisado = true;
        sacudirRama('despega');
      }
    };

    /** Ave clavada en su rama: es lo que se ve sin animación. */
    const posar = () => {
      if (!remedir()) return;
      fase = 'posado';
      nodo.dataset.fase = 'posado';
      marcarPose('posada');
      colocar(circuito.percha.x, circuito.percha.y, 0);
    };

    const parar = () => {
      if (cuadro) window.cancelAnimationFrame(cuadro);
      cuadro = 0;
      ultimo = 0;
    };

    /** Reanuda donde se dejó: el hero fuera de pantalla no reinicia el ciclo. */
    const reanudar = () => {
      if (cuadro || quieto.matches) return;
      ultimo = 0;
      cuadro = window.requestAnimationFrame(pintar);
    };

    const iniciar = () => {
      if (quieto.matches) {
        posar();
        return;
      }
      if (!remedir()) return;
      entrarEn('entrada');
      const inicio = posicion('entrada', 0, circuito, 0);
      colocar(inicio.x, inicio.y, 0);
      marcarPose('vuelo');
      reanudar();
    };

    iniciar();

    // Un hero fuera de la ventana no tiene por qué gastar un rAF por fotograma.
    const observador =
      typeof window.IntersectionObserver === 'function'
        ? new window.IntersectionObserver(
            ([visible]) => {
              if (visible.isIntersecting) reanudar();
              else parar();
            },
            { rootMargin: '120px' }
          )
        : null;
    observador?.observe(svg);

    const medidor =
      typeof window.ResizeObserver === 'function' ? new window.ResizeObserver(() => remedir()) : null;
    medidor?.observe(svg);

    const cambioDeGusto = () => {
      parar();
      iniciar();
    };
    quieto.addEventListener('change', cambioDeGusto);

    return () => {
      parar();
      window.clearTimeout(rebote);
      observador?.disconnect();
      medidor?.disconnect();
      quieto.removeEventListener('change', cambioDeGusto);
      delete svg.dataset.percha;
      nodo.style.removeProperty('--q-fase');
    };
  }, [escena, ave, ancla]);
}
