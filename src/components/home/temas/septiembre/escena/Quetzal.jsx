/**
 * Quetzal resplandeciente.
 *
 * El ave se dibuja alrededor del origen local (0, 0), que corresponde al centro
 * de su cuerpo, y **mira siempre hacia la izquierda**. Como el circuito entero
 * va de derecha a izquierda, nunca hace falta voltearla: no hay ningún
 * `scaleX(-1)` en juego, y por tanto tampoco alas invertidas, saltos de
 * posición ni cambios de escala. La dirección la dan la trayectoria, el aleteo
 * y la inclinación del cuerpo.
 *
 * Cuatro grupos anidados, cada uno con un único cometido, para que el ave no
 * parezca una estampa arrastrándose por la pantalla:
 *
 *   1. `__vuelo`   posición y actitud sobre la escena. Lo escribe
 *                  `useVueloQuetzal` desde rAF, y publica `data-fase` y
 *                  `data-pose`, de los que cuelga todo lo demás en el CSS;
 *   2. `__cuerpo`  flexión: se agacha antes de impulsarse y amortigua al
 *                  posarse;
 *   3. `__respiro` respiración mientras está posado;
 *   4. `__arte`    la escala del dibujo, que no cambia nunca.
 *
 * Hay dos juegos de alas y dos de cola —posado y en vuelo— que se cruzan por
 * opacidad en el despegue y el aterrizaje. Rotar una sola versión abarataría el
 * resultado: un ave posada pliega el ala y deja caer las plumas caudales, y en
 * vuelo las extiende. Son formas distintas, no la misma girada.
 *
 * Cada ala es su propio grupo con su propio `transform-origin` en el hombro, y
 * cada pluma caudal lleva su desfase: la cola nunca se mueve como una pieza
 * rígida.
 */

import { PERCHA } from './escenografia';

/** Plumas caudales del ave posada: cuelgan y se abren muy poco. */
const COLA_POSADA = [
  'M6 -4C10 26 14 62 15 104C15 128 11 148 6 158C6 146 8 128 8 104C8 62 4 26 0 -2Z',
  'M10 -6C18 22 26 58 30 100C32 124 29 145 24 156C23 144 24 126 22 102C19 60 13 24 4 -4Z',
  'M15 -8C26 18 37 52 44 92C48 114 46 133 41 145C40 133 41 117 38 95C33 55 24 21 9 -6Z'
];

/** Plumas caudales en vuelo: se tienden hacia atrás y flamean. */
const COLA_VUELO = [
  'M12 -10C44 -7 88 1 130 7C152 10 168 15 178 19C166 18 150 16 128 14C86 10 42 2 6 -5Z',
  'M10 -4C40 4 82 16 122 26C144 32 160 39 170 45C158 43 142 39 120 35C80 27 38 15 4 2Z',
  'M8 2C36 12 76 26 112 40C132 48 146 55 154 61C144 58 130 53 110 46C74 34 34 20 2 8Z'
];

/** Plumas cobertoras verdes que caen sobre el ala y el lomo. */
const COBERTORAS = [
  'M-10 -32C6 -32 22 -23 33 -8C26 -15 13 -24 -3 -26Z',
  'M-8 -25C8 -23 24 -14 33 -1C24 -10 8 -17 -5 -19Z',
  'M-3 -18C11 -14 24 -6 31 5C22 -2 9 -9 -3 -12Z'
];

/** Primarias del ala extendida, de la más larga a la más corta. */
const PRIMARIAS = [
  'M33 -32C45 -34 57 -33 65 -30C57 -28 45 -28 34 -29Z',
  'M31 -26C44 -27 56 -26 65 -24C56 -22 44 -22 32 -23Z',
  'M28 -21C40 -22 52 -21 61 -19C52 -17 40 -17 29 -18Z',
  'M24 -16C35 -17 46 -16 54 -14C46 -12 35 -12 25 -13Z'
];

export default function Quetzal({ uid, ave }) {
  return (
    <g
      ref={ave}
      className="sepQuetzal__vuelo"
      // Estado inicial: posada en su rama. Es lo que se ve sin JS, en SSR y con
      // `prefers-reduced-motion`, y evita que el ave aparezca en la esquina
      // superior izquierda de la escena antes de la primera medición.
      data-fase="posado"
      data-pose="posada"
      style={{ transform: `translate(${PERCHA.x}px, ${PERCHA.y}px)` }}
    >
      <defs>
        <linearGradient id={`${uid}-qVerde`} gradientUnits="userSpaceOnUse" x1="-44" y1="-56" x2="36" y2="16">
          <stop offset="0" stopColor="#3fd09a" />
          <stop offset="0.42" stopColor="#15a175" />
          <stop offset="1" stopColor="#0a5540" />
        </linearGradient>
        <linearGradient id={`${uid}-qCabeza`} gradientUnits="userSpaceOnUse" x1="-50" y1="-58" x2="-6" y2="-18">
          <stop offset="0" stopColor="#6ad477" />
          <stop offset="0.46" stopColor="#25a25c" />
          <stop offset="1" stopColor="#0f6b46" />
        </linearGradient>
        {/* Garganta turquesa: la transición entre la cabeza verde y el pecho. */}
        <linearGradient id={`${uid}-qCuello`} gradientUnits="userSpaceOnUse" x1="-40" y1="-34" x2="-16" y2="-6">
          <stop offset="0" stopColor="#38c9b4" />
          <stop offset="1" stopColor="#12907e" />
        </linearGradient>
        <linearGradient id={`${uid}-qAla`} gradientUnits="userSpaceOnUse" x1="-10" y1="-40" x2="66" y2="-12">
          <stop offset="0" stopColor="#27ac82" />
          <stop offset="0.55" stopColor="#0f7a5c" />
          <stop offset="1" stopColor="#06412f" />
        </linearGradient>
        <linearGradient id={`${uid}-qAlaLejos`} gradientUnits="userSpaceOnUse" x1="-8" y1="-38" x2="58" y2="-14">
          <stop offset="0" stopColor="#127359" />
          <stop offset="1" stopColor="#053426" />
        </linearGradient>
        <linearGradient id={`${uid}-qCola`} gradientUnits="userSpaceOnUse" x1="4" y1="-8" x2="120" y2="120">
          <stop offset="0" stopColor="#2bb98a" />
          <stop offset="0.5" stopColor="#128567" />
          <stop offset="1" stopColor="#0a5b46" />
        </linearGradient>
        <linearGradient id={`${uid}-qRojo`} gradientUnits="userSpaceOnUse" x1="-40" y1="-26" x2="16" y2="16">
          <stop offset="0" stopColor="#e84a5f" />
          <stop offset="0.4" stopColor="#c81f37" />
          <stop offset="1" stopColor="#870f26" />
        </linearGradient>
        <linearGradient id={`${uid}-qPico`} gradientUnits="userSpaceOnUse" x1="-56" y1="-40" x2="-40" y2="-27">
          <stop offset="0" stopColor="#fbd970" />
          <stop offset="1" stopColor="#cd8f1c" />
        </linearGradient>
      </defs>

      {/* El escalado vive aquí y no en la trayectoria: el motor de vuelo
          traslada el origen en coordenadas de escena y no debe tocar el tamaño.
          Flexión y respiración van en grupos propios porque las tres son
          animaciones de `transform` y en un mismo nodo se pisarían. */}
      <g className="sepQuetzal__cuerpo">
        <g className="sepQuetzal__respiro">
          <g className="sepQuetzal__arte" transform="translate(0 -8) scale(1.3)">
            {/* ---------- Cola: plumas caudales ---------- */}
            <g className="sepQuetzal__cola sepQuetzal__cola--posada">
              {COLA_POSADA.map((d, i) => (
                <g key={d} className="sepQuetzal__pluma" style={{ '--pluma': i }}>
                  <path fill={`url(#${uid}-qCola)`} opacity={0.92 + i * 0.04} d={d} />
                </g>
              ))}
              <path fill="#7fe8c2" opacity="0.28" d="M8 0C16 26 24 58 28 96C24 60 16 28 4 2Z" />
            </g>

            <g className="sepQuetzal__cola sepQuetzal__cola--vuelo">
              {COLA_VUELO.map((d, i) => (
                <g key={d} className="sepQuetzal__pluma" style={{ '--pluma': i }}>
                  <path fill={`url(#${uid}-qCola)`} opacity={0.92 + i * 0.04} d={d} />
                </g>
              ))}
              <path fill="#7fe8c2" opacity="0.26" d="M10 -2C42 6 84 16 122 26C84 18 42 10 6 3Z" />
            </g>

            {/* ---------- Ala del lado opuesto: detrás del cuerpo ---------- */}
            <g className="sepQuetzal__ala sepQuetzal__ala--lejos">
              <path
                fill={`url(#${uid}-qAlaLejos)`}
                d="M-4 -30C6 -41 28 -47 50 -42C64 -39 70 -31 65 -26C50 -17 18 -17 -2 -22Z"
              />
              <g fill="#04382a">
                <path d="M32 -33C44 -35 55 -34 63 -31C55 -29 44 -29 33 -30Z" />
                <path d="M29 -27C41 -28 52 -27 60 -25C52 -23 41 -23 30 -24Z" />
              </g>
            </g>

            {/* ---------- Cuerpo ---------- */}
            <path
              fill={`url(#${uid}-qVerde)`}
              d="M-32 -30C-17 -37 3 -34 16 -27C31 -19 37 -7 34 3C32 12 23 15 12 14C-3 13 -20 7 -29 -3C-36 -10 -37 -24 -32 -30Z"
            />

            {/* Garganta turquesa */}
            <path
              fill={`url(#${uid}-qCuello)`}
              d="M-34 -28C-30 -34 -22 -35 -16 -31C-11 -27 -10 -19 -14 -13C-20 -8 -29 -11 -33 -18Z"
              opacity="0.9"
            />

            {/* Pecho y vientre carmesí */}
            <path
              fill={`url(#${uid}-qRojo)`}
              d="M-33 -25C-34 -12 -26 0 -13 6C0 11 12 14 22 13C24 7 21 2 15 1C0 0 -13 -5 -21 -12C-27 -18 -30 -24 -33 -25Z"
            />

            {/* Infracobertoras blancas bajo la cola */}
            <g fill="#f6fbf8">
              <path opacity="0.95" d="M11 3C20 1 30 3 32 9C27 13 16 14 9 11Z" />
              <path opacity="0.7" d="M6 8C14 7 22 9 24 13C19 16 10 16 5 14Z" />
            </g>

            {/* Cobertoras verdes sobre el lomo */}
            <g fill={`url(#${uid}-qAla)`} opacity="0.95">
              {COBERTORAS.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>

            {/* Tornasol del lomo */}
            <path
              fill="none"
              stroke="#8af0c8"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.45"
              d="M-26 -30C-13 -35 5 -33 18 -26"
            />

            {/* ---------- Patas ---------- */}
            <g className="sepQuetzal__patas" stroke="#8a7454" strokeWidth="2.6" strokeLinecap="round" fill="none">
              <path d="M-5 12C-5 17 -4 21 -3 23" />
              <path d="M6 12C6 17 6 21 7 23" />
              <path d="M-3 23C-7 23 -10 22 -12 20M-3 23C-2 25 0 26 3 25" strokeWidth="2.2" />
              <path d="M7 23C4 23 1 22 -1 21M7 23C9 25 11 25 13 24" strokeWidth="2.2" />
            </g>

            {/* ---------- Ala plegada (posado) ---------- */}
            <g className="sepQuetzal__alaPlegada">
              <path
                fill={`url(#${uid}-qAla)`}
                d="M-14 -28C2 -32 20 -22 30 -6C34 1 30 7 23 5C11 3 -5 -7 -14 -19Z"
              />
              <g fill="none" stroke="#06412f" strokeWidth="1.3" strokeLinecap="round" opacity="0.5">
                <path d="M-7 -23C4 -19 16 -10 24 0" />
                <path d="M-2 -26C9 -21 20 -12 28 -3" />
              </g>
              <path fill="#63dcae" opacity="0.3" d="M-12 -27C0 -30 14 -23 23 -11C13 -20 0 -25 -12 -25Z" />
            </g>

            {/* ---------- Ala extendida (vuelo) ---------- */}
            <g className="sepQuetzal__ala sepQuetzal__ala--cerca">
              <path
                fill={`url(#${uid}-qAla)`}
                d="M-8 -28C4 -40 28 -46 50 -41C64 -38 70 -30 65 -25C51 -16 20 -16 -2 -21Z"
              />
              <g fill="#0b6349">
                {PRIMARIAS.map((d) => (
                  <path key={d} d={d} />
                ))}
              </g>
              <path
                fill="#6ee6b6"
                opacity="0.38"
                d="M-6 -29C6 -37 26 -41 45 -37C29 -37 12 -34 -1 -27Z"
              />
            </g>

            {/* ---------- Cabeza ---------- */}
            <g className="sepQuetzal__cabeza">
              <path
                fill={`url(#${uid}-qPico)`}
                d="M-43 -38C-53 -37 -57 -32 -52 -29C-48 -27 -43 -32 -40 -35Z"
              />
              <path
                fill={`url(#${uid}-qCabeza)`}
                d="M-43 -33C-47 -42 -43 -50 -35 -52C-31 -55 -25 -53 -22 -50C-18 -53 -12 -51 -9 -46C-4 -39 -6 -30 -14 -25C-25 -20 -38 -25 -43 -33Z"
              />
              {/* Cresta erizada */}
              <g fill="none" stroke="#1c9053" strokeWidth="2.1" strokeLinecap="round">
                <path d="M-39 -49C-41 -55 -37 -58 -33 -58" />
                <path d="M-31 -52C-32 -58 -28 -61 -23 -59" />
                <path d="M-23 -50C-23 -56 -19 -59 -14 -57" />
                <path d="M-16 -47C-15 -53 -11 -54 -7 -52" />
              </g>
              {/* Tornasol de la coronilla */}
              <path
                fill="#8ceaae"
                opacity="0.4"
                d="M-41 -40C-43 -47 -38 -51 -32 -52C-25 -53 -19 -50 -15 -45C-21 -49 -30 -49 -35 -45C-38 -43 -40 -41 -41 -40Z"
              />
              <circle cx="-32" cy="-40" r="3.6" fill="#10241a" />
              <circle cx="-33.3" cy="-41.3" r="1.2" fill="#ffffff" opacity="0.85" />
            </g>
          </g>
        </g>
      </g>
    </g>
  );
}
