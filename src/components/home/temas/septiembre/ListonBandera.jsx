import { useId, useState } from 'react';
import Escudo from './Escudo';
import { CINTA_TRAS, CINTA_BLANCA, CINTA_CELESTE, CINTA_FRENTE, FILO_ORO, LISTON, SOMBRA_SUELO } from './cintas';

/**
 * Contorno del paño.
 *
 * Lados casi rectos, borde superior levemente combado y borde inferior
 * ondulado, que es por donde la tela suelta cae. La perspectiva la da la
 * asimetría de los cantos —86 u de alto a la izquierda contra 77 a la
 * derecha—, no una deformación del conjunto.
 *
 * Proporción 164 × 86 ≈ 1.9 : 1. NO es el 1.6 : 1 del pabellón: la
 * bandera está integrada en el fajín y se ve escorzada, igual que en la
 * referencia. Dibujarla con la proporción exacta la levanta por encima
 * del listón y vuelve a parecer una imagen pegada encima.
 */
const PANO =
  'M22 28C64 22 124 24 184 19' +
  'C187 38 188 76 186 96' +
  'C158 109 132 99 104 106C76 113 46 107 20 114' +
  'C18 86 18 44 22 28Z';

/* Los cortes entre franjas siguen la caída de la tela, no el eje vertical:
   una divisoria recta delata el rectángulo plano por debajo del contorno. */
const FRANJA_IZQ = 'M-20 -20L72 -20C75 40 75 80 78 150L-20 150Z';
const FRANJA_BLANCA = 'M72 -20C75 40 75 80 78 150L134 150C131 80 131 40 128 -20Z';
const FRANJA_DER = 'M128 -20C131 40 131 80 134 150L240 150L240 -20Z';

/* Tres pliegues largos, muy suaves: la tela cuelga, no está arrugada. */
const PLIEGUES = 'M50 26C54 52 53 82 56 110M103 24C107 52 106 82 109 108M155 21C159 46 158 74 161 100';

/**
 * El doblez blanco que cruza por delante de la esquina superior izquierda
 * del paño y se pierde a los lados dentro del listón.
 *
 * Es lo que hace que la bandera se lea como una parte más de la cinta
 * —un tramo que se dobla y cuelga— en lugar de como un rectángulo puesto
 * encima. Cruza en diagonal a propósito: entra tapando el canto izquierdo
 * del paño y se despega antes de llegar al centro. Sobresale poco por los
 * lados; un doblez largo cruza el listón en un ángulo distinto al de la
 * cinta y se lee como un error de montaje.
 */
const DOBLEZ =
  'M-18 26C20 14 70 6 122 2C166 -1 196 -2 226 -6' +
  'L226 18C196 22 166 23 122 26C70 30 20 38 -18 50Z';

const DOBLEZ_ORO_ALTO =
  'M-18 26C20 14 70 6 122 2C166 -1 196 -2 226 -6' +
  'L226 -8.5C196 -4.5 166 -3.5 122 -0.5C70 3.5 20 11.5 -18 23.5Z';

const DOBLEZ_ORO_BAJO =
  'M-18 47.5C20 35.5 70 27.5 122 23.5C166 20.5 196 19.5 226 15.5' +
  'L226 18C196 22 166 23 122 26C70 30 20 38 -18 50Z';

/* Sombra que el doblez proyecta sobre el propio paño */
const DOBLEZ_SOMBRA =
  'M-18 50C20 38 70 30 122 26C166 23 196 22 226 18' +
  'L226 32C196 36 166 37 122 40C70 44 20 52 -18 64Z';

/**
 * Una hebra del listón: cuerpo, sombra propia contra el canto inferior,
 * dos juegos de pliegues cruzados y el filo iluminado del borde superior.
 * Ese orden es el que da el volumen; cambiarlo aplana la tela.
 */
function Cinta({ clase, cinta, relleno, sombra, pliegue, grosorPliegue = 7, luz = 0.3, children }) {
  return (
    <g className={`sepListon__cinta ${clase}`}>
      <path d={cinta.cuerpo} fill={relleno} />

      {cinta.sombras.map((s, i) => (
        <path key={i} d={s.d} fill={sombra} opacity={s.opacidad} />
      ))}

      <path
        d={cinta.pliegues}
        fill="none"
        stroke={pliegue}
        strokeWidth={grosorPliegue}
        strokeOpacity="0.07"
        strokeLinecap="round"
      />
      <path
        d={cinta.contraluz}
        fill="none"
        stroke="#ffffff"
        strokeWidth={grosorPliegue * 0.55}
        strokeOpacity="0.09"
        strokeLinecap="round"
      />

      <path d={cinta.luz} fill="#ffffff" opacity={luz} />

      {children}
    </g>
  );
}

/**
 * Listón ceremonial del pie del hero.
 *
 * Son **tres planos en el DOM**, no uno: hebras traseras → bandera →
 * hebra frontal. Hacen falta tres porque la cinta de delante tiene que
 * pasar por encima del canto inferior de la bandera —es lo que la mete
 * dentro del listón en vez de dejarla apoyada encima—, y eso no se
 * consigue con `z-index` dentro de un mismo SVG mientras la bandera
 * necesite conservar su proporción.
 *
 * Las capas de cinta se estiran con `preserveAspectRatio="none"`, que es
 * lo que las hace sangrar de canto a canto a cualquier ancho. La bandera
 * no puede permitírselo —se deformaría—, así que vive en su propio SVG
 * proporcional, centrado y dimensionado contra el alto del listón para
 * que la relación entre paño y cinta sea la misma en todas las
 * resoluciones.
 */
export default function ListonBandera({ escudoSrc }) {
  const reactId = useId();
  const uid = `lis${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [falloEscudo, setFalloEscudo] = useState(false);
  const caja = `0 0 ${LISTON.w} ${LISTON.h}`;

  return (
    <div className="sepListon" aria-hidden="true">
      <svg className="sepListon__capa sepListon__capa--tras" viewBox={caja} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`${uid}-tras`} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0" stopColor="#7fb2da" />
            <stop offset="0.55" stopColor="#5390c5" />
            <stop offset="1" stopColor="#3b78ae" />
          </linearGradient>
          <linearGradient id={`${uid}-blanca`} x1="0" y1="0" x2="0.28" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.62" stopColor="#f4f9fd" />
            <stop offset="1" stopColor="#dde9f4" />
          </linearGradient>
          <linearGradient id={`${uid}-celeste`} x1="0" y1="0" x2="0.32" y2="1">
            <stop offset="0" stopColor="#a8d3ee" />
            <stop offset="0.55" stopColor="#77b0da" />
            <stop offset="1" stopColor="#5591c5" />
          </linearGradient>
          {/* Hilo de oro. Se recorre en diagonal para que no sea una línea
              de un solo tono a lo largo de metro y medio de cinta. */}
          <linearGradient id={`${uid}-oro`} x1="0" y1="0" x2="1" y2="0.6">
            <stop offset="0" stopColor="#c9a03a" />
            <stop offset="0.28" stopColor="#f2dc9a" />
            <stop offset="0.55" stopColor="#cda23c" />
            <stop offset="0.8" stopColor="#efd68f" />
            <stop offset="1" stopColor="#bd922d" />
          </linearGradient>
        </defs>

        {/* Sombra proyectada sobre la pradera. Es lo que borra el corte
            entre el paisaje y la decoración: tres contornos anidados
            siguiendo el filo del listón, de menos a más cerca del
            contacto. */}
        <g className="sepListon__cinta sepListon__cinta--suelo">
          {SOMBRA_SUELO.map((s, i) => (
            <path key={i} d={s.d} fill="#123f52" opacity={s.opacidad} />
          ))}
        </g>

        <Cinta
          clase="sepListon__cinta--tras"
          cinta={CINTA_TRAS}
          relleno={`url(#${uid}-tras)`}
          sombra="#2a5f92"
          pliegue="#1e5388"
          grosorPliegue={8}
          luz={0.28}
        />

        <Cinta
          clase="sepListon__cinta--blanca"
          cinta={CINTA_BLANCA}
          relleno={`url(#${uid}-blanca)`}
          sombra="#8fb0cc"
          pliegue="#7ea3c2"
          grosorPliegue={7}
          luz={0.4}
        >
          {/* Los dos hilos de oro, uno por canto de la blanca */}
          <path d={FILO_ORO.bajo} fill={`url(#${uid}-oro)`} />
          <path d={FILO_ORO.brillo} fill="#fdf3cd" opacity="0.6" />
        </Cinta>

        <Cinta
          clase="sepListon__cinta--celeste"
          cinta={CINTA_CELESTE}
          relleno={`url(#${uid}-celeste)`}
          sombra="#33689c"
          pliegue="#2f6394"
          grosorPliegue={7}
          luz={0.3}
        />

        {/* El hilo alto va con la celeste y no con la blanca a propósito:
            así queda pintado por encima del filo iluminado de la blanca,
            que si no se lo comería. */}
        <g className="sepListon__cinta sepListon__cinta--blanca">
          <path d={FILO_ORO.alto} fill={`url(#${uid}-oro)`} />
        </g>
      </svg>

      <div className="sepListon__bandera">
        <svg viewBox="0 0 208 128" role="presentation" focusable="false">
          <defs>
            <clipPath id={`${uid}-pano`}>
              <path d={PANO} />
            </clipPath>
            <linearGradient id={`${uid}-azul`} x1="0" y1="0" x2="0.25" y2="1">
              <stop offset="0" stopColor="#a5d6ef" />
              <stop offset="0.5" stopColor="#7ebde3" />
              <stop offset="1" stopColor="#5fa3d2" />
            </linearGradient>
            {/* Ondulación de la tela: claros y oscuros alternos a lo ancho.
                Es el degradado el que curva el paño; los trazos de pliegue
                sólo marcan los quiebres. Los saltos son suaves a
                propósito: a este tamaño un contraste alto se lee como
                suciedad, no como tela. */}
            <linearGradient id={`${uid}-pliegues`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#0b3d68" stopOpacity="0.22" />
              <stop offset="0.14" stopColor="#0b3d68" stopOpacity="0.04" />
              <stop offset="0.28" stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="0.44" stopColor="#0b3d68" stopOpacity="0.1" />
              <stop offset="0.6" stopColor="#ffffff" stopOpacity="0.18" />
              <stop offset="0.78" stopColor="#0b3d68" stopOpacity="0.09" />
              <stop offset="1" stopColor="#0b3d68" stopOpacity="0.24" />
            </linearGradient>
            {/* Cara superior a la luz y vuelta inferior en sombra: la que
                da el bombeo del paño. En unidades de usuario, no de caja:
                el contorno es irregular y una caja normalizada lo
                desalinearía. */}
            <linearGradient id={`${uid}-bombeo`} gradientUnits="userSpaceOnUse" x1="0" y1="19" x2="0" y2="116">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.34" />
              <stop offset="0.32" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="0.62" stopColor="#06203f" stopOpacity="0" />
              <stop offset="1" stopColor="#06203f" stopOpacity="0.34" />
            </linearGradient>
            <linearGradient id={`${uid}-brillo`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.34" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`${uid}-doblez`} x1="0" y1="0" x2="0.2" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.6" stopColor="#f2f8fc" />
              <stop offset="1" stopColor="#d8e6f2" />
            </linearGradient>
            <linearGradient id={`${uid}-oroPano`} x1="0" y1="0" x2="1" y2="0.5">
              <stop offset="0" stopColor="#c9a03a" />
              <stop offset="0.35" stopColor="#f2dc9a" />
              <stop offset="0.7" stopColor="#cda23c" />
              <stop offset="1" stopColor="#efd68f" />
            </linearGradient>
            <linearGradient id={`${uid}-sombraDoblez`} gradientUnits="userSpaceOnUse" x1="0" y1="22" x2="0" y2="62">
              <stop offset="0" stopColor="#0b3d68" stopOpacity="0.3" />
              <stop offset="1" stopColor="#0b3d68" stopOpacity="0" />
            </linearGradient>
          </defs>

          <g clipPath={`url(#${uid}-pano)`}>
            <path d={FRANJA_IZQ} fill={`url(#${uid}-azul)`} />
            <path d={FRANJA_BLANCA} fill="#ffffff" />
            <path d={FRANJA_DER} fill={`url(#${uid}-azul)`} />

            <rect x="-20" y="-20" width="280" height="170" fill={`url(#${uid}-pliegues)`} />

            <path
              d={PLIEGUES}
              fill="none"
              stroke="#0b3d68"
              strokeOpacity="0.09"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <g transform="translate(5 0)">
              <path
                d={PLIEGUES}
                fill="none"
                stroke="#ffffff"
                strokeOpacity="0.2"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </g>

            <rect x="-20" y="-20" width="280" height="170" fill={`url(#${uid}-bombeo)`} />
            <rect className="sepListon__brillo" x="-140" y="-20" width="110" height="170" fill={`url(#${uid}-brillo)`} />

            {/* Sombra que el doblez proyecta sobre el propio paño */}
            <path d={DOBLEZ_SOMBRA} fill={`url(#${uid}-sombraDoblez)`} />
          </g>

          <g transform="translate(103 65) rotate(-1.5) scale(0.44) translate(-50 -50)">
            {escudoSrc && !falloEscudo ? (
              <image
                href={escudoSrc}
                width="100"
                height="100"
                preserveAspectRatio="xMidYMid meet"
                onError={() => setFalloEscudo(true)}
              />
            ) : (
              <Escudo />
            )}
          </g>

          {/* El doblez, ya fuera del recorte: cruza por delante del paño y
              sigue hacia fuera del viewBox —el SVG lleva `overflow:
              visible`— hasta perderse dentro del listón. */}
          <path d={DOBLEZ} fill={`url(#${uid}-doblez)`} />
          <path d={DOBLEZ_ORO_ALTO} fill={`url(#${uid}-oroPano)`} />
          <path d={DOBLEZ_ORO_BAJO} fill={`url(#${uid}-oroPano)`} />
        </svg>
      </div>

      <svg className="sepListon__capa sepListon__capa--frente" viewBox={caja} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`${uid}-frente`} x1="0" y1="0" x2="0.22" y2="1">
            <stop offset="0" stopColor="#5b93c6" />
            <stop offset="0.45" stopColor="#3d76ad" />
            <stop offset="1" stopColor="#255a8e" />
          </linearGradient>
        </defs>

        <Cinta
          clase="sepListon__cinta--frente"
          cinta={CINTA_FRENTE}
          relleno={`url(#${uid}-frente)`}
          sombra="#1b4676"
          pliegue="#17406d"
          grosorPliegue={8}
          luz={0.22}
        />
      </svg>
    </div>
  );
}
