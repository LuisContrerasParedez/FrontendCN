import { PERCHA } from './escenografia';

const COLA_POSADA = [
  `
    M10 2
    C13 31 16 62 15 91
    C14 122 9 151 1 177
    C-5 198 -14 218 -23 235
    C-27 243 -29 251 -27 256
    C-22 248 -17 239 -12 230
    C-2 211 7 191 13 170
    C21 143 25 116 25 89
    C24 56 20 27 16 1
    Z
  `,
  `
    M17 1
    C24 29 30 59 33 90
    C36 120 34 150 29 179
    C25 204 18 228 12 247
    C9 257 9 265 11 271
    C15 263 19 254 22 245
    C30 222 37 198 41 174
    C46 145 47 116 44 87
    C41 55 34 27 23 0
    Z
  `,
];

const COLA_VUELO = [
  `
    M11 -4
    C45 -3 83 2 119 10
    C155 18 188 30 216 45
    C233 54 247 64 258 75
    C244 67 228 59 211 52
    C181 40 149 31 115 25
    C78 18 42 13 8 7
    Z
  `,
  `
    M10 4
    C42 12 76 24 108 39
    C139 54 168 72 192 91
    C208 104 221 118 229 130
    C216 119 202 109 187 99
    C161 82 133 68 103 56
    C70 43 37 31 6 15
    Z
  `,
];

const COBERTORAS = [
  `
    M-5 -33
    C7 -38 21 -36 32 -29
    C25 -25 15 -21 2 -20
    C-4 -23 -7 -28 -5 -33
    Z
  `,
  `
    M1 -28
    C14 -31 28 -27 38 -19
    C28 -17 17 -13 6 -11
    C1 -16 -1 -22 1 -28
    Z
  `,
  `
    M7 -20
    C20 -21 34 -16 43 -8
    C33 -7 22 -4 12 0
    C8 -6 6 -13 7 -20
    Z
  `,
  `
    M12 -12
    C25 -11 38 -6 45 2
    C34 1 25 4 17 8
    C14 3 12 -4 12 -12
    Z
  `,
];

const PRIMARIAS = [
  `
    M26 -29
    C40 -38 59 -42 78 -38
    C61 -31 47 -25 32 -19
    Z
  `,
  `
    M29 -23
    C47 -28 65 -27 82 -21
    C64 -18 49 -14 34 -9
    Z
  `,
  `
    M30 -16
    C48 -18 65 -14 79 -7
    C62 -7 48 -5 33 0
    Z
  `,
  `
    M29 -9
    C45 -8 59 -3 70 5
    C56 2 44 3 31 7
    Z
  `,
  `
    M27 -2
    C40 1 51 7 60 14
    C49 10 39 10 28 13
    Z
  `,
];

export default function Quetzal({ uid, ave }) {
  return (
    <g
      ref={ave}
      className="sepQuetzal__vuelo"
      data-fase="posado"
      data-pose="posada"
      style={{ transform: `translate(${PERCHA.x}px, ${PERCHA.y}px)` }}
    >
      <defs>
        <linearGradient id={`${uid}-qVerde`} gradientUnits="userSpaceOnUse" x1="-42" y1="-55" x2="36" y2="16">
          <stop offset="0" stopColor="#43e0a0" />
          <stop offset="0.28" stopColor="#16b584" />
          <stop offset="0.58" stopColor="#07876d" />
          <stop offset="1" stopColor="#034839" />
        </linearGradient>

        <linearGradient id={`${uid}-qCabeza`} gradientUnits="userSpaceOnUse" x1="-52" y1="-62" x2="-10" y2="-20">
          <stop offset="0" stopColor="#71e56e" />
          <stop offset="0.28" stopColor="#22c77c" />
          <stop offset="0.62" stopColor="#069c79" />
          <stop offset="1" stopColor="#075448" />
        </linearGradient>

        <linearGradient id={`${uid}-qCuello`} gradientUnits="userSpaceOnUse" x1="-41" y1="-39" x2="-8" y2="-5">
          <stop offset="0" stopColor="#36e1c2" />
          <stop offset="0.45" stopColor="#10baa9" />
          <stop offset="1" stopColor="#087b83" />
        </linearGradient>

        <linearGradient id={`${uid}-qAla`} gradientUnits="userSpaceOnUse" x1="-5" y1="-38" x2="48" y2="8">
          <stop offset="0" stopColor="#45dda1" />
          <stop offset="0.35" stopColor="#16a978" />
          <stop offset="0.72" stopColor="#087157" />
          <stop offset="1" stopColor="#034434" />
        </linearGradient>

        <linearGradient id={`${uid}-qAlaLejos`} gradientUnits="userSpaceOnUse" x1="-5" y1="-40" x2="72" y2="-5">
          <stop offset="0" stopColor="#105f50" />
          <stop offset="0.5" stopColor="#073e37" />
          <stop offset="1" stopColor="#021e1c" />
        </linearGradient>

        <linearGradient id={`${uid}-qOscuro`} gradientUnits="userSpaceOnUse" x1="20" y1="-35" x2="75" y2="15">
          <stop offset="0" stopColor="#173e3a" />
          <stop offset="0.45" stopColor="#092925" />
          <stop offset="1" stopColor="#031513" />
        </linearGradient>

        <linearGradient id={`${uid}-qCola`} gradientUnits="userSpaceOnUse" x1="10" y1="-10" x2="170" y2="150">
          <stop offset="0" stopColor="#46ddb1" />
          <stop offset="0.27" stopColor="#18b89d" />
          <stop offset="0.56" stopColor="#068f83" />
          <stop offset="0.8" stopColor="#087269" />
          <stop offset="1" stopColor="#034f48" />
        </linearGradient>

        <linearGradient id={`${uid}-qRojo`} gradientUnits="userSpaceOnUse" x1="-30" y1="-10" x2="22" y2="25">
          <stop offset="0" stopColor="#f04f59" />
          <stop offset="0.35" stopColor="#db2637" />
          <stop offset="0.72" stopColor="#b8162c" />
          <stop offset="1" stopColor="#790e23" />
        </linearGradient>

        <linearGradient id={`${uid}-qPico`} gradientUnits="userSpaceOnUse" x1="-60" y1="-42" x2="-40" y2="-30">
          <stop offset="0" stopColor="#ffe776" />
          <stop offset="0.5" stopColor="#f4b931" />
          <stop offset="1" stopColor="#c98212" />
        </linearGradient>
      </defs>

      <g className="sepQuetzal__cuerpo">
        <g className="sepQuetzal__respiro">
          <g className="sepQuetzal__arte" transform="translate(0 -8) scale(1.3)">
            {/* Cola posada */}
            <g className="sepQuetzal__cola sepQuetzal__cola--posada">
              {COLA_POSADA.map((d, i) => (
                <g
                  key={`cola-posada-${i}`}
                  className="sepQuetzal__pluma"
                  style={{ '--pluma': i }}
                >
                  <path d={d} fill={`url(#${uid}-qCola)`} opacity={i === 0 ? 1 : 0.94} />
                </g>
              ))}

              <path
                fill="none"
                stroke="#77ead1"
                strokeWidth="1.3"
                strokeLinecap="round"
                opacity="0.3"
                d="
                  M14 8
                  C18 57 19 103 12 145
                  C8 175 0 202 -14 229
                "
              />

              <path
                fill="none"
                stroke="#42d8cb"
                strokeWidth="1.1"
                strokeLinecap="round"
                opacity="0.25"
                d="
                  M21 8
                  C31 55 37 102 35 144
                  C34 183 26 217 17 243
                "
              />
            </g>

            {/* Cola en vuelo */}
            <g className="sepQuetzal__cola sepQuetzal__cola--vuelo">
              {COLA_VUELO.map((d, i) => (
                <g
                  key={`cola-vuelo-${i}`}
                  className="sepQuetzal__pluma"
                  style={{ '--pluma': i }}
                >
                  <path d={d} fill={`url(#${uid}-qCola)`} opacity={i === 0 ? 1 : 0.94} />
                </g>
              ))}

              <path
                fill="none"
                stroke="#6ce8cf"
                strokeWidth="1.3"
                strokeLinecap="round"
                opacity="0.28"
                d="
                  M17 2
                  C75 8 130 20 177 38
                  C207 49 230 61 249 72
                "
              />

              <path
                fill="none"
                stroke="#39cdd0"
                strokeWidth="1.1"
                strokeLinecap="round"
                opacity="0.24"
                d="
                  M17 10
                  C67 26 113 46 153 68
                  C181 84 204 104 219 121
                "
              />
            </g>

            {/* Ala lejana */}
            <g className="sepQuetzal__ala sepQuetzal__ala--lejos">
              <path
                fill={`url(#${uid}-qAlaLejos)`}
                d="
                  M-4 -30
                  C8 -46 33 -53 57 -46
                  C73 -41 82 -30 76 -21
                  C61 -12 29 -13 3 -20
                  Z
                "
              />

              <path
                fill="#031c1a"
                opacity="0.9"
                d="
                  M30 -36
                  C47 -42 64 -40 76 -31
                  C61 -29 48 -25 34 -20
                  Z
                "
              />
            </g>

            {/* Cuerpo */}
            <path
              fill={`url(#${uid}-qVerde)`}
              d="
                M-34 -31
                C-25 -39 -11 -41 3 -37
                C18 -33 30 -24 35 -12
                C41 2 35 14 23 20
                C12 25 -3 22 -16 15
                C-27 9 -35 -1 -38 -13
                C-41 -21 -39 -27 -34 -31
                Z
              "
            />

            {/* Cuello */}
            <path
              fill={`url(#${uid}-qCuello)`}
              d="
                M-38 -31
                C-34 -39 -23 -42 -15 -37
                C-7 -32 -5 -22 -10 -13
                C-16 -6 -27 -6 -34 -13
                C-39 -18 -41 -25 -38 -31
                Z
              "
              opacity="0.96"
            />

            {/* Pecho y abdomen */}
            <path
              fill={`url(#${uid}-qRojo)`}
              d="
                M-31 -11
                C-24 -7 -16 -4 -7 -2
                C3 0 14 1 24 -1
                C29 5 29 12 24 18
                C17 24 5 25 -7 21
                C-18 18 -27 11 -31 3
                C-34 -2 -34 -7 -31 -11
                Z
              "
            />

            {/* Infracobertoras */}
            <g fill="#f5f7f4">
              <path
                opacity="0.9"
                d="
                  M13 14
                  C19 12 25 13 29 16
                  C25 19 19 20 13 18
                  Z
                "
              />
              <path
                opacity="0.65"
                d="
                  M18 17
                  C24 16 30 17 33 20
                  C28 22 23 22 18 20
                  Z
                "
              />
            </g>

            {/* Rectrices */}
            <g className="sepQuetzal__rectrices">
              <path
                fill="#182a28"
                d="
                  M11 8
                  C20 12 29 18 35 26
                  L27 52
                  C22 39 16 26 9 16
                  Z
                "
              />

              <path
                fill="#f4f5ef"
                d="
                  M17 10
                  C23 14 29 19 33 25
                  L30 43
                  C25 33 20 23 14 15
                  Z
                "
              />
            </g>

            {/* Cobertoras */}
            <g fill={`url(#${uid}-qAla)`} opacity="0.98">
              {COBERTORAS.map((d, i) => (
                <path key={`cobertora-${i}`} d={d} />
              ))}
            </g>

            {/* Tornasol del lomo */}
            <path
              fill="none"
              stroke="#a4f5d1"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.52"
              d="M-27 -32C-14 -39 3 -38 18 -31"
            />

            <path
              fill="none"
              stroke="#41d9d0"
              strokeWidth="1.4"
              strokeLinecap="round"
              opacity="0.38"
              d="M-22 -27C-9 -31 4 -29 15 -23"
            />

            {/* Patas */}
            <g
              className="sepQuetzal__patas"
              stroke="#75654e"
              strokeWidth="2.3"
              strokeLinecap="round"
              fill="none"
            >
              <path d="M-5 18C-5 21 -5 24 -4 26" />
              <path d="M7 18C7 21 7 24 8 26" />

              <path
                strokeWidth="1.8"
                d="
                  M-4 26C-8 26 -11 25 -13 23
                  M-4 26C-2 28 1 29 4 27
                "
              />

              <path
                strokeWidth="1.8"
                d="
                  M8 26C4 26 1 25 -1 23
                  M8 26C10 28 13 28 15 26
                "
              />
            </g>

            {/* Ala plegada */}
            <g className="sepQuetzal__alaPlegada">
              <path
                fill={`url(#${uid}-qOscuro)`}
                d="
                  M-10 -29
                  C5 -35 24 -27 35 -13
                  C42 -4 41 6 34 11
                  C25 15 11 8 -1 -2
                  C-9 -10 -13 -20 -10 -29
                  Z
                "
              />

              <path
                fill={`url(#${uid}-qAla)`}
                d="
                  M-12 -29
                  C1 -35 18 -30 29 -20
                  C21 -18 12 -14 3 -9
                  C-4 -14 -10 -21 -12 -29
                  Z
                "
              />

              <path
                fill="#35c991"
                opacity="0.72"
                d="
                  M-7 -26
                  C4 -29 17 -24 25 -17
                  C16 -18 7 -15 0 -11
                  C-4 -16 -6 -21 -7 -26
                  Z
                "
              />

              <g
                fill="none"
                stroke="#3f625d"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.6"
              >
                <path d="M5 -10C15 -4 23 2 29 8" />
                <path d="M10 -14C21 -8 29 -1 34 5" />
                <path d="M15 -18C25 -12 32 -7 37 -1" />
              </g>
            </g>

            {/* Ala extendida */}
            <g className="sepQuetzal__ala sepQuetzal__ala--cerca">
              <path
                fill={`url(#${uid}-qAla)`}
                d="
                  M-8 -30
                  C6 -45 31 -52 55 -46
                  C68 -43 78 -36 81 -28
                  C68 -22 55 -18 42 -13
                  C25 -10 10 -14 -2 -21
                  Z
                "
              />

              <g fill={`url(#${uid}-qOscuro)`}>
                {PRIMARIAS.map((d, i) => (
                  <path key={`primaria-${i}`} d={d} />
                ))}
              </g>

              <path
                fill="#23b784"
                opacity="0.88"
                d="
                  M-2 -31
                  C13 -40 33 -44 50 -39
                  C39 -35 28 -31 17 -25
                  C9 -25 3 -27 -2 -31
                  Z
                "
              />

              <path
                fill="none"
                stroke="#76edc5"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.48"
                d="M0 -32C16 -40 34 -41 49 -36"
              />
            </g>

            {/* Cabeza */}
            <g className="sepQuetzal__cabeza">
              {/* Pico */}
              <path
                fill={`url(#${uid}-qPico)`}
                d="
                  M-45 -39
                  C-52 -40 -59 -37 -64 -33
                  C-58 -30 -52 -29 -45 -31
                  L-39 -35
                  Z
                "
              />

              <path
                fill="#9c6210"
                opacity="0.65"
                d="
                  M-62 -33
                  C-55 -33 -49 -33 -43 -34
                  C-49 -31 -55 -30 -60 -31
                  Z
                "
              />

              <path
                fill={`url(#${uid}-qCabeza)`}
                d="
                  M-44 -34
                  C-49 -41 -47 -49 -41 -54
                  C-36 -60 -28 -62 -20 -58
                  C-14 -61 -7 -58 -4 -52
                  C1 -45 0 -36 -6 -29
                  C-13 -22 -24 -19 -34 -23
                  C-39 -25 -42 -29 -44 -34
                  Z
                "
              />

              {/* Cresta */}
              <g fill={`url(#${uid}-qCabeza)`}>
                <path
                  d="
                    M-42 -51
                    C-46 -59 -42 -65 -34 -66
                    C-35 -60 -33 -56 -29 -52
                    Z
                  "
                />
                <path
                  d="
                    M-35 -56
                    C-36 -65 -30 -70 -22 -68
                    C-26 -62 -25 -57 -21 -52
                    Z
                  "
                />
                <path
                  d="
                    M-27 -57
                    C-25 -66 -18 -70 -10 -66
                    C-16 -62 -17 -57 -15 -52
                    Z
                  "
                />
                <path
                  d="
                    M-19 -54
                    C-14 -62 -7 -63 -1 -58
                    C-8 -56 -10 -51 -10 -47
                    Z
                  "
                />
                <path
                  d="
                    M-12 -49
                    C-6 -55 1 -53 4 -47
                    C-3 -48 -6 -44 -8 -40
                    Z
                  "
                />
              </g>

              <g fill="#24b87a" opacity="0.8">
                <path
                  d="
                    M-40 -48
                    C-36 -53 -31 -54 -27 -51
                    C-31 -49 -35 -46 -38 -42
                    Z
                  "
                />
                <path
                  d="
                    M-30 -53
                    C-25 -56 -19 -55 -16 -51
                    C-21 -50 -25 -48 -29 -44
                    Z
                  "
                />
              </g>

              {/* Tornasol de la cabeza */}
              <path
                fill="#59e6bc"
                opacity="0.32"
                d="
                  M-42 -39
                  C-40 -49 -32 -55 -23 -55
                  C-16 -55 -11 -51 -8 -46
                  C-17 -50 -26 -48 -33 -43
                  C-37 -41 -40 -39 -42 -39
                  Z
                "
              />

              <path
                fill="#2ad0c5"
                opacity="0.38"
                d="
                  M-37 -31
                  C-30 -37 -21 -38 -13 -33
                  C-18 -28 -25 -25 -33 -25
                  Z
                "
              />

              {/* Ojo */}
              <circle cx="-31" cy="-41" r="3.15" fill="#071914" />
              <circle cx="-32" cy="-42" r="0.95" fill="#ffffff" opacity="0.88" />

              <path
                fill="none"
                stroke="#0a5c48"
                strokeWidth="1"
                opacity="0.75"
                d="M-36 -41C-34 -45 -28 -46 -25 -42"
              />
            </g>
          </g>
        </g>
      </g>
    </g>
  );
}