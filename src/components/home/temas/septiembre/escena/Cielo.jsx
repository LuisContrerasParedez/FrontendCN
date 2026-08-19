import { mancha, NUBES, BANDADA, VB } from './escenografia';

/**
 * Cielo de mañana clara.
 *
 * Se construye con varias capas atmosféricas:
 *  - azul profundo y limpio en la parte alta;
 *  - ligera pérdida de saturación hacia el horizonte;
 *  - halo solar localizado;
 *  - bruma horizontal;
 *  - nubes con luz superior, cuerpo y sombra inferior.
 *
 * El cielo debe acompañar a la escena, no competir con la ceiba ni el quetzal.
 */
export default function Cielo({ uid }) {
  return (
    <g>
      <defs>
        {/* ============================================================
            CIELO
            ============================================================ */}

        <linearGradient
          id={`${uid}-cielo`}
          x1="0"
          y1="0"
          x2="0.08"
          y2="1"
        >
          <stop offset="0" stopColor="#8fc3e8" />
          <stop offset="0.22" stopColor="#aed4ef" />
          <stop offset="0.48" stopColor="#cce3f3" />
          <stop offset="0.7" stopColor="#e5eef3" />
          <stop offset="0.86" stopColor="#f0f1ed" />
          <stop offset="1" stopColor="#f3efe5" />
        </linearGradient>

        {/* Gradiente que enfría ligeramente la parte superior derecha.
            Evita que todo el cielo tenga exactamente el mismo azul. */}
        <linearGradient
          id={`${uid}-cieloProfundidad`}
          x1="0"
          y1="0"
          x2="1"
          y2="0.4"
        >
          <stop
            offset="0"
            stopColor="#ffffff"
            stopOpacity="0"
          />

          <stop
            offset="0.58"
            stopColor="#8ebddd"
            stopOpacity="0.02"
          />

          <stop
            offset="1"
            stopColor="#598eb9"
            stopOpacity="0.14"
          />
        </linearGradient>

        {/* ============================================================
            SOL Y ATMÓSFERA
            ============================================================ */}

        <radialGradient
          id={`${uid}-haloSolar`}
          cx="0.5"
          cy="0.5"
          r="0.5"
        >
          <stop
            offset="0"
            stopColor="#fffdf2"
            stopOpacity="0.94"
          />

          <stop
            offset="0.12"
            stopColor="#fff8dc"
            stopOpacity="0.78"
          />

          <stop
            offset="0.32"
            stopColor="#fff0bf"
            stopOpacity="0.36"
          />

          <stop
            offset="0.64"
            stopColor="#ffedbd"
            stopOpacity="0.12"
          />

          <stop
            offset="1"
            stopColor="#fff2c8"
            stopOpacity="0"
          />
        </radialGradient>

        <radialGradient
          id={`${uid}-nucleoSolar`}
          cx="0.5"
          cy="0.5"
          r="0.5"
        >
          <stop
            offset="0"
            stopColor="#fffef7"
            stopOpacity="0.96"
          />

          <stop
            offset="0.58"
            stopColor="#fff9df"
            stopOpacity="0.68"
          />

          <stop
            offset="1"
            stopColor="#fff4c9"
            stopOpacity="0"
          />
        </radialGradient>

        {/* Luz extendida horizontalmente.
            Simula dispersión atmosférica sin dibujar rayos. */}
        <radialGradient
          id={`${uid}-luzAtmosfera`}
          cx="0.3"
          cy="0.45"
          r="0.7"
        >
          <stop
            offset="0"
            stopColor="#fff9e5"
            stopOpacity="0.28"
          />

          <stop
            offset="0.38"
            stopColor="#fff8e1"
            stopOpacity="0.11"
          />

          <stop
            offset="1"
            stopColor="#ffffff"
            stopOpacity="0"
          />
        </radialGradient>

        {/* ============================================================
            HORIZONTE
            ============================================================ */}

        <linearGradient
          id={`${uid}-brumaHorizonte`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0"
            stopColor="#ffffff"
            stopOpacity="0"
          />

          <stop
            offset="0.48"
            stopColor="#f7f5ee"
            stopOpacity="0.16"
          />

          <stop
            offset="0.78"
            stopColor="#faf8f0"
            stopOpacity="0.5"
          />

          <stop
            offset="1"
            stopColor="#fffaf0"
            stopOpacity="0.7"
          />
        </linearGradient>

        {/* ============================================================
            NUBES
            ============================================================ */}

        {/* Masa general */}
        <radialGradient
          id={`${uid}-nubeCuerpo`}
          cx="0.44"
          cy="0.34"
          r="0.72"
        >
          <stop
            offset="0"
            stopColor="#ffffff"
            stopOpacity="0.98"
          />

          <stop
            offset="0.38"
            stopColor="#fbfdff"
            stopOpacity="0.91"
          />

          <stop
            offset="0.68"
            stopColor="#eef4f7"
            stopOpacity="0.62"
          />

          <stop
            offset="1"
            stopColor="#dce8ef"
            stopOpacity="0"
          />
        </radialGradient>

        {/* Luz de la zona superior izquierda */}
        <radialGradient
          id={`${uid}-nubeLuz`}
          cx="0.3"
          cy="0.2"
          r="0.67"
        >
          <stop
            offset="0"
            stopColor="#ffffff"
            stopOpacity="1"
          />

          <stop
            offset="0.45"
            stopColor="#ffffff"
            stopOpacity="0.66"
          />

          <stop
            offset="1"
            stopColor="#ffffff"
            stopOpacity="0"
          />
        </radialGradient>

        {/* Sombra inferior.
            Es azulada, nunca gris/negra, porque recibe luz del cielo. */}
        <radialGradient
          id={`${uid}-nubeSombra`}
          cx="0.5"
          cy="0.74"
          r="0.64"
        >
          <stop
            offset="0"
            stopColor="#abc5d7"
            stopOpacity="0.34"
          />

          <stop
            offset="0.5"
            stopColor="#bcd1df"
            stopOpacity="0.18"
          />

          <stop
            offset="1"
            stopColor="#d9e6ee"
            stopOpacity="0"
          />
        </radialGradient>

        {/* ============================================================
            FILTROS
            ============================================================ */}

        <filter
          id={`${uid}-suavizarNube`}
          x="-20%"
          y="-30%"
          width="140%"
          height="160%"
        >
          <feGaussianBlur stdDeviation="0.65" />
        </filter>

        <filter
          id={`${uid}-suavizarAtmosfera`}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>

      {/* ==============================================================
          BASE DEL CIELO
          ============================================================== */}

      <rect
        width={VB.w}
        height={VB.h}
        fill={`url(#${uid}-cielo)`}
      />

      <rect
        width={VB.w}
        height={VB.h}
        fill={`url(#${uid}-cieloProfundidad)`}
      />

      {/* ==============================================================
          LUZ SOLAR

          El halo permanece grande, pero el núcleo queda mucho más localizado.
          ============================================================== */}

      <g
        className="sepEsc__sol"
        pointerEvents="none"
      >
        <circle
          cx="386"
          cy="82"
          r="330"
          fill={`url(#${uid}-haloSolar)`}
          opacity="0.84"
        />

        <circle
          cx="386"
          cy="82"
          r="112"
          fill={`url(#${uid}-nucleoSolar)`}
          opacity="0.7"
        />
      </g>

      {/* Luz dispersa que conecta visualmente cielo y montañas */}
      <ellipse
        cx="470"
        cy="286"
        rx="610"
        ry="335"
        fill={`url(#${uid}-luzAtmosfera)`}
        filter={`url(#${uid}-suavizarAtmosfera)`}
      />

      {/* ==============================================================
          NUBES

          Cada nube está compuesta por tres masas:
            1. sombra inferior;
            2. cuerpo;
            3. iluminación superior.

          Las tres comparten exactamente la misma animación porque pertenecen
          al mismo grupo.
          ============================================================== */}

      {NUBES.map((n) => {
        const cuerpo = mancha(
          n.x,
          n.y,
          n.rx,
          n.ry,
          {
            puntos: 16,
            irregular: 0.2,
            semilla: n.semilla
          }
        );

        const sombra = mancha(
          n.x + n.rx * 0.05,
          n.y + n.ry * 0.2,
          n.rx * 0.94,
          n.ry * 0.72,
          {
            puntos: 14,
            irregular: 0.22,
            semilla: n.semilla + 20
          }
        );

        const luz = mancha(
          n.x - n.rx * 0.18,
          n.y - n.ry * 0.31,
          n.rx * 0.66,
          n.ry * 0.7,
          {
            puntos: 12,
            irregular: 0.22,
            semilla: n.semilla + 40
          }
        );

        return (
          <g
            key={n.id}
            className="sepEsc__nube"
            opacity={n.opacidad}
            style={{
              '--nube-duracion': `${n.duracion}s`,
              '--nube-retraso': `${n.retraso}s`,
              '--nube-deriva': `${n.deriva}px`
            }}
          >
            {/* Sombra inferior */}
            <path
              d={sombra}
              fill={`url(#${uid}-nubeSombra)`}
              filter={`url(#${uid}-suavizarNube)`}
            />

            {/* Volumen principal */}
            <path
              d={cuerpo}
              fill={`url(#${uid}-nubeCuerpo)`}
            />

            {/* Luz de borde superior */}
            <path
              d={luz}
              fill={`url(#${uid}-nubeLuz)`}
            />

            {/* Pequeño cúmulo secundario que rompe la silueta */}
            <path
              d={mancha(
                n.x + n.rx * 0.23,
                n.y - n.ry * 0.2,
                n.rx * 0.42,
                n.ry * 0.48,
                {
                  puntos: 10,
                  irregular: 0.18,
                  semilla: n.semilla + 72
                }
              )}
              fill={`url(#${uid}-nubeCuerpo)`}
              opacity="0.68"
            />
          </g>
        );
      })}

      {/* ==============================================================
          BRUMA DEL HORIZONTE

          En lugar de terminar directamente en el paisaje, el cielo pierde
          contraste progresivamente.
          ============================================================== */}

      <rect
        x="0"
        y="350"
        width={VB.w}
        height="280"
        fill={`url(#${uid}-brumaHorizonte)`}
      />

      {/* ==============================================================
          BANDADA

          Muy tenue: debe aportar escala y profundidad, no convertirse
          en otro elemento protagonista.
          ============================================================== */}

      <g
        className="sepEsc__bandada"
        fill="none"
        stroke="#607f9b"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.58"
      >
        {BANDADA.map((ave, i) => (
          <g
            key={i}
            transform={`translate(${ave.x} ${ave.y})`}
          >
            <g
              className="sepEsc__ave"
              style={{
                '--ave-retraso': `${ave.retraso}s`
              }}
            >
              <g transform={`scale(${ave.s})`}>
                <path
                  d="
                    M-7 0
                    C-4.5 -3.2 -1.7 -3.3 0 -1.1
                    C1.8 -3.3 4.4 -3.1 7 0
                  "
                />
              </g>
            </g>
          </g>
        ))}
      </g>
    </g>
  );
}