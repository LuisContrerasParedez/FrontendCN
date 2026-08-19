import { MONJAS } from './escenografia';

/*
 * Monja blanca estilizada para ilustración editorial.
 *
 * La flor evita la simetría radial perfecta: los sépalos posteriores forman
 * la silueta general, mientras que los pétalos delanteros se cierran un poco
 * hacia el centro. El labelo y la columna concentran el detalle.
 *
 * Las hojas son anchas y arqueadas. Una mata compuesta únicamente por hojas
 * estrechas se lee como zacate; estas masas largas y carnosas diferencian
 * inmediatamente la orquídea del resto de la pradera.
 */

const SEPALO_SUPERIOR = `
  M0 1
  C-7 -4 -11 -14 -8 -24
  C-5 -33 4 -36 10 -29
  C16 -22 12 -10 5 -2
  C3 0 2 1 0 1
  Z
`;

const SEPALO_LATERAL = `
  M0 0
  C-7 -1 -16 -8 -19 -16
  C-22 -24 -17 -30 -10 -29
  C-1 -28 5 -19 7 -10
  C8 -6 6 -2 0 0
  Z
`;

const PETALO = `
  M0 0
  C-5 -3 -10 -10 -9 -17
  C-8 -24 -2 -28 4 -25
  C10 -22 11 -14 8 -8
  C6 -4 3 -1 0 0
  Z
`;

const LABELO = `
  M0 0
  C-4 -2 -7 -6 -7 -10
  C-8 -15 -4 -19 0 -19
  C5 -19 9 -15 8 -10
  C8 -5 4 -2 0 0
  Z
`;

/* --------------------------------------------------------------------------
   Hoja individual

   El path principal aporta masa y el segundo trazo funciona como nervadura.
   -------------------------------------------------------------------------- */

function Hoja({
  uid,
  d,
  nervio,
  opacity = 1
}) {
  return (
    <g opacity={opacity}>
      <path
        d={d}
        fill={`url(#${uid}-hojaMonja)`}
      />

      <path
        d={nervio}
        fill="none"
        stroke={`url(#${uid}-nervioHoja)`}
        strokeWidth="1.35"
        strokeLinecap="round"
        opacity="0.56"
      />
    </g>
  );
}

/* --------------------------------------------------------------------------
   Flor
   -------------------------------------------------------------------------- */

function Flor({
  uid,
  variante = 0
}) {
  /*
   * Variaciones diminutas entre flores.
   * No cambian la estructura: solamente impiden que todas parezcan clones.
   */
  const variaciones = [
    {
      rotIzq: -108,
      rotDer: 108,
      petaloIzq: -44,
      petaloDer: 48
    },
    {
      rotIzq: -112,
      rotDer: 104,
      petaloIzq: -47,
      petaloDer: 44
    },
    {
      rotIzq: -104,
      rotDer: 112,
      petaloIzq: -42,
      petaloDer: 51
    }
  ];

  const v = variaciones[variante % variaciones.length];

  return (
    <g className="sepMonja__flor">
      {/* --------------------------------------------------------------
          Sombra general detrás de la flor
          -------------------------------------------------------------- */}

      <ellipse
        cx="1"
        cy="-7"
        rx="18"
        ry="12"
        fill="#557365"
        opacity="0.08"
        transform="rotate(-7)"
      />

      {/* --------------------------------------------------------------
          Sépalos posteriores
          -------------------------------------------------------------- */}

      <g>
        {/* Superior */}
        <path
          d={SEPALO_SUPERIOR}
          fill={`url(#${uid}-sepaloPosterior)`}
          transform="rotate(-3)"
        />

        {/* Lateral izquierdo */}
        <path
          d={SEPALO_LATERAL}
          fill={`url(#${uid}-sepaloPosterior)`}
          transform={`rotate(${v.rotIzq}) scale(1.05 0.96)`}
        />

        {/* Lateral derecho */}
        <path
          d={SEPALO_LATERAL}
          fill={`url(#${uid}-sepaloPosterior)`}
          transform={`rotate(${v.rotDer}) scale(1.02 0.94)`}
        />
      </g>

      {/* Sombras internas de sépalos */}
      <g
        fill="none"
        stroke="#b8cdd1"
        strokeLinecap="round"
        opacity="0.24"
      >
        <path
          d="M1 -2C3 -10 5 -18 6 -27"
          strokeWidth="0.8"
        />

        <path
          d="M-1 0C-7 -7 -12 -13 -14 -19"
          strokeWidth="0.7"
        />

        <path
          d="M2 0C9 -6 13 -12 15 -18"
          strokeWidth="0.7"
        />
      </g>

      {/* --------------------------------------------------------------
          Pétalos delanteros

          Están ligeramente cerrados hacia la columna para crear la
          profundidad propia de una flor, evitando la forma de estrella.
          -------------------------------------------------------------- */}

      <path
        d={PETALO}
        fill={`url(#${uid}-petalo)`}
        transform={`rotate(${v.petaloIzq}) translate(-1 -1) scale(1.05)`}
      />

      <path
        d={PETALO}
        fill={`url(#${uid}-petalo)`}
        transform={`rotate(${v.petaloDer}) translate(1 -1) scale(1.03)`}
      />

      {/* Luz en pétalos */}
      <path
        d="
          M-2 -2
          C-6 -7 -8 -13 -6 -18
          C-5 -21 -2 -23 1 -23
        "
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.15"
        strokeLinecap="round"
        opacity="0.64"
        transform={`rotate(${v.petaloIzq})`}
      />

      <path
        d="
          M2 -2
          C6 -7 8 -13 6 -18
          C5 -21 2 -23 -1 -23
        "
        fill="none"
        stroke="#ffffff"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.48"
        transform={`rotate(${v.petaloDer})`}
      />

      {/* --------------------------------------------------------------
          Labelo

          Mucho menor que los sépalos y con el color concentrado hacia
          la garganta.
          -------------------------------------------------------------- */}

      <g transform="translate(0 -19)">
        <path
          d={LABELO}
          transform="translate(0 3) rotate(180) scale(0.92 1)"
          fill={`url(#${uid}-labelo)`}
        />

        {/* Pliegues del labelo */}
        <g
          fill="none"
          stroke="#bd5d89"
          strokeWidth="0.52"
          strokeLinecap="round"
          opacity="0.38"
        >
          <path d="M0 4C-1 8 -2 11 -2 14" />
          <path d="M0 4C1 8 2 11 2 14" />
        </g>

        {/* --------------------------------------------------------------
            Columna de la orquídea
            -------------------------------------------------------------- */}

        <ellipse
          cx="0"
          cy="0.7"
          rx="3.4"
          ry="4.5"
          fill={`url(#${uid}-columna)`}
        />

        <ellipse
          cx="-0.45"
          cy="-0.4"
          rx="1.5"
          ry="2.2"
          fill="#fffdf6"
          opacity="0.86"
        />

        <ellipse
          cx="0"
          cy="1.7"
          rx="1.45"
          ry="1.85"
          fill="#e6b94a"
        />

        <circle
          cx="-0.1"
          cy="1.15"
          r="0.6"
          fill="#f9df81"
          opacity="0.92"
        />

        {/* Punto mínimo de sombra en la garganta */}
        <ellipse
          cx="0.55"
          cy="3.2"
          rx="1.1"
          ry="0.65"
          fill="#a45877"
          opacity="0.28"
        />
      </g>
    </g>
  );
}

/* --------------------------------------------------------------------------
   Botón floral
   -------------------------------------------------------------------------- */

function Boton({ uid }) {
  return (
    <g>
      <path
        d="
          M0 0
          C-4 -4 -5 -10 -2 -14
          C1 -18 7 -17 9 -12
          C11 -7 7 -2 0 0
          Z
        "
        fill={`url(#${uid}-botonFlor)`}
      />

      <path
        d="M1 -1C2 -6 4 -10 6 -13"
        fill="none"
        stroke="#ffffff"
        strokeWidth="0.7"
        strokeLinecap="round"
        opacity="0.52"
      />
    </g>
  );
}

/* --------------------------------------------------------------------------
   Mata completa
   -------------------------------------------------------------------------- */

export default function MonjasBlancas({ uid }) {
  return (
    <g>
      <defs>
        {/* ============================================================
            FLOR
            ============================================================ */}

        <radialGradient
          id={`${uid}-sepaloPosterior`}
          cx="0.34"
          cy="0.24"
          r="0.86"
        >
          <stop
            offset="0"
            stopColor="#ffffff"
          />

          <stop
            offset="0.42"
            stopColor="#fbfdfd"
          />

          <stop
            offset="0.72"
            stopColor="#edf3f3"
          />

          <stop
            offset="1"
            stopColor="#ceddde"
          />
        </radialGradient>

        <radialGradient
          id={`${uid}-petalo`}
          cx="0.3"
          cy="0.2"
          r="0.82"
        >
          <stop
            offset="0"
            stopColor="#ffffff"
          />

          <stop
            offset="0.48"
            stopColor="#fffefe"
          />

          <stop
            offset="0.8"
            stopColor="#edf3f2"
          />

          <stop
            offset="1"
            stopColor="#d5e2e2"
          />
        </radialGradient>

        <radialGradient
          id={`${uid}-labelo`}
          cx="0.5"
          cy="0.26"
          r="0.82"
        >
          <stop
            offset="0"
            stopColor="#fffdfb"
          />

          <stop
            offset="0.25"
            stopColor="#f6dce8"
          />

          <stop
            offset="0.55"
            stopColor="#dc8daf"
          />

          <stop
            offset="0.78"
            stopColor="#b9507d"
          />

          <stop
            offset="1"
            stopColor="#91365f"
          />
        </radialGradient>

        <radialGradient
          id={`${uid}-columna`}
          cx="0.35"
          cy="0.24"
          r="0.74"
        >
          <stop
            offset="0"
            stopColor="#ffffff"
          />

          <stop
            offset="0.58"
            stopColor="#f7f1dc"
          />

          <stop
            offset="1"
            stopColor="#d7bd70"
          />
        </radialGradient>

        <linearGradient
          id={`${uid}-botonFlor`}
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop
            offset="0"
            stopColor="#ffffff"
          />

          <stop
            offset="0.55"
            stopColor="#edf3ee"
          />

          <stop
            offset="1"
            stopColor="#b8cfbd"
          />
        </linearGradient>

        {/* ============================================================
            HOJAS
            ============================================================ */}

        <linearGradient
          id={`${uid}-hojaMonja`}
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop
            offset="0"
            stopColor="#789f59"
          />

          <stop
            offset="0.3"
            stopColor="#638b4d"
          />

          <stop
            offset="0.68"
            stopColor="#4d783f"
          />

          <stop
            offset="1"
            stopColor="#345d35"
          />
        </linearGradient>

        <linearGradient
          id={`${uid}-nervioHoja`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0"
            stopColor="#c1d79a"
            stopOpacity="0.7"
          />

          <stop
            offset="1"
            stopColor="#6f9656"
            stopOpacity="0"
          />
        </linearGradient>

        <linearGradient
          id={`${uid}-talloMonja`}
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          <stop
            offset="0"
            stopColor="#355e33"
          />

          <stop
            offset="0.4"
            stopColor="#64864a"
          />

          <stop
            offset="0.68"
            stopColor="#759752"
          />

          <stop
            offset="1"
            stopColor="#3c6637"
          />
        </linearGradient>

        <radialGradient
          id={`${uid}-baseMonja`}
          cx="0.42"
          cy="0.28"
          r="0.75"
        >
          <stop
            offset="0"
            stopColor="#71964f"
          />

          <stop
            offset="0.7"
            stopColor="#456d3b"
          />

          <stop
            offset="1"
            stopColor="#345b34"
          />
        </radialGradient>

        {/* Sombra suave debajo de cada mata */}
        <radialGradient
          id={`${uid}-sombraMonja`}
          cx="0.5"
          cy="0.5"
          r="0.5"
        >
          <stop
            offset="0"
            stopColor="#223f27"
            stopOpacity="0.22"
          />

          <stop
            offset="1"
            stopColor="#223f27"
            stopOpacity="0"
          />
        </radialGradient>
      </defs>

      {MONJAS.map((m, indiceMata) => (
        /*
         * El grupo exterior posiciona la mata.
         * El grupo interior mantiene la animación independiente para no
         * sobrescribir transformaciones SVG.
         */
        <g
          key={m.id}
          transform={`translate(${m.x} ${m.y}) scale(${m.escala})`}
        >
          {/* Sombra de contacto */}
          <ellipse
            cx="3"
            cy="2"
            rx="39"
            ry="8"
            fill={`url(#${uid}-sombraMonja)`}
          />

          <g
            className="sepMonja"
            style={{
              '--monja-retraso': `${m.retraso}s`
            }}
          >
            {/* ========================================================
                HOJAS TRASERAS
                ======================================================== */}

            <Hoja
              uid={uid}
              opacity="0.82"
              d="
                M-1 0
                C-21 -24 -37 -52 -41 -82
                C-42 -96 -37 -101 -31 -91
                C-15 -66 -4 -34 4 -4
                Z
              "
              nervio="
                M-1 -3
                C-13 -34 -25 -61 -34 -88
              "
            />

            <Hoja
              uid={uid}
              opacity="0.88"
              d="
                M2 0
                C15 -32 32 -64 53 -83
                C62 -91 65 -85 59 -74
                C45 -47 27 -21 7 -2
                Z
              "
              nervio="
                M5 -3
                C22 -29 39 -56 56 -78
              "
            />

            {/* ========================================================
                HOJAS PRINCIPALES
                ======================================================== */}

            <Hoja
              uid={uid}
              d="
                M0 1
                C-12 -32 -15 -66 -7 -96
                C-4 -108 2 -111 5 -98
                C12 -69 11 -35 5 -3
                Z
              "
              nervio="
                M2 -3
                C2 -33 0 -65 0 -96
              "
            />

            <Hoja
              uid={uid}
              opacity="0.94"
              d="
                M1 0
                C11 -26 26 -49 43 -62
                C53 -69 56 -63 49 -53
                C34 -31 20 -14 6 -2
                Z
              "
              nervio="
                M5 -3
                C18 -22 32 -42 46 -57
              "
            />

            <Hoja
              uid={uid}
              opacity="0.9"
              d="
                M0 0
                C-8 -21 -21 -40 -37 -52
                C-45 -59 -49 -54 -44 -45
                C-32 -25 -19 -11 -4 -2
                Z
              "
              nervio="
                M-3 -3
                C-15 -19 -27 -35 -40 -48
              "
            />

            {/* Base compacta */}
            <ellipse
              cx="1"
              cy="-3"
              rx="15"
              ry="8"
              fill={`url(#${uid}-baseMonja)`}
            />

            {/* ========================================================
                TALLOS Y FLORES
                ======================================================== */}

            {m.flores.map((f, i) => {
              const inicioX = i % 2 === 0 ? -1.5 : 2;

              return (
                <g key={i}>
                  {/* Sombra del tallo */}
                  <path
                    d={`
                      M${inicioX + 1.2} -8
                      C${inicioX + f.dx * 0.28 + 1.2}
                       ${-8 + f.dy * 0.38}

                       ${f.dx * 0.72 + 1.2}
                       ${f.dy * 0.76}

                       ${f.dx + 1.2}
                       ${f.dy}
                    `}
                    fill="none"
                    stroke="#294e2f"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    opacity="0.18"
                  />

                  {/* Tallo principal */}
                  <path
                    d={`
                      M${inicioX} -8
                      C${inicioX + f.dx * 0.28}
                       ${-8 + f.dy * 0.38}

                       ${f.dx * 0.72}
                       ${f.dy * 0.76}

                       ${f.dx}
                       ${f.dy}
                    `}
                    fill="none"
                    stroke={`url(#${uid}-talloMonja)`}
                    strokeWidth="2.7"
                    strokeLinecap="round"
                  />

                  {/* Pequeña bráctea bajo la flor */}
                  <path
                    d={`
                      M${f.dx} ${f.dy + 1}
                      C${f.dx - 4} ${f.dy + 6}
                       ${f.dx - 6} ${f.dy + 8}
                       ${f.dx - 7} ${f.dy + 12}

                      C${f.dx - 2} ${f.dy + 10}
                       ${f.dx + 1} ${f.dy + 6}
                       ${f.dx} ${f.dy + 1}
                      Z
                    `}
                    fill="#6e934f"
                    opacity="0.74"
                  />

                  <g
                    transform={`
                      translate(${f.dx} ${f.dy})
                      rotate(${f.giro})
                      scale(${f.s})
                    `}
                  >
                    <Flor
                      uid={uid}
                      variante={i + indiceMata}
                    />
                  </g>
                </g>
              );
            })}

            {/* ========================================================
                BOTÓN FLORAL

                Solo algunas matas reciben uno para romper la repetición.
                ======================================================== */}

            {indiceMata % 2 === 0 && (
              <g>
                <path
                  d="
                    M4 -8
                    C13 -25 20 -40 27 -55
                  "
                  fill="none"
                  stroke={`url(#${uid}-talloMonja)`}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />

                <g
                  transform="
                    translate(27 -55)
                    rotate(19)
                    scale(0.68)
                  "
                >
                  <Boton uid={uid} />
                </g>
              </g>
            )}
          </g>
        </g>
      ))}
    </g>
  );
}
