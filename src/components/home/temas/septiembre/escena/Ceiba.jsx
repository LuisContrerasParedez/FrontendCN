import {
  COPA_SILUETA,
  COPA_MEDIA,
  COPA_SOMBRA,
  COPA_CLARA,
  COPA_BRILLO,
  RAMILLETES,
  TRONCO,
  GAMBAS,
  CORTEZA,
  RAMAS
} from './escenografia';

/**
 * La ceiba. Se construye por volumen, no por contorno.
 *
 * El orden de pintado es lo que da la profundidad, y está pensado para que las
 * ramas se entiendan como parte del árbol y no como piezas apoyadas encima:
 *
 *   1. Ramas de fondo      se meten en la copa; sólo asoma su tramo bajo.
 *   2. Follaje de fondo    silueta profunda de la copa: tapa esas puntas.
 *   3. Ramas principales   por delante de la masa oscura, por detrás de las
 *                          hojas iluminadas, así que entran y salen del follaje.
 *   4. Tronco y raíces     se pintan DESPUÉS que las ramas y cubren todos sus
 *                          arranques: es lo que hace que nazcan de la madera.
 *   5. Follaje frontal     racimos iluminados, que vuelven a comerse las puntas.
 *
 * Las pasadas tonales de la copa no son copias reducidas de la silueta —eso
 * produce islas concéntricas que se leen como camuflaje— sino conjuntos propios
 * de lóbulos sesgados hacia la luz clave.
 */

/** Grupos de balanceo del ramillete: tres fases sin animar hoja por hoja. */
const FASE = ['a', 'b', 'c'];

const TONO_RAMILLETE = ['media', 'clara', 'brillo'];

export default function Ceiba({ uid }) {
  const deCapa = (capa) => RAMAS.filter((r) => r.capa === capa);
  const percha = RAMAS.filter((r) => r.percha);
  const libres = deCapa('principal').filter((r) => !r.percha);

  /** Cuerpo de la rama más su cinta de luz, cuando la lleva. */
  const trazoRama = (r, relleno) => (
    <g key={r.clave}>
      <path d={r.d} fill={relleno} />
      {r.luz ? <path d={r.luz} fill={`url(#${uid}-ramaLuz)`} opacity="0.34" /> : null}
    </g>
  );

  return (
    <g className="sepCeiba">
      <defs>
        <linearGradient id={`${uid}-tronco`} gradientUnits="userSpaceOnUse" x1="1140" y1="600" x2="1366" y2="650">
          <stop offset="0" stopColor="#d3bb99" />
          <stop offset="0.2" stopColor="#b39a76" />
          <stop offset="0.5" stopColor="#836c53" />
          <stop offset="0.8" stopColor="#54462f" />
          <stop offset="1" stopColor="#6b6050" />
        </linearGradient>
        <linearGradient id={`${uid}-gamba`} gradientUnits="userSpaceOnUse" x1="1040" y1="690" x2="1462" y2="750">
          <stop offset="0" stopColor="#c8b08e" />
          <stop offset="0.38" stopColor="#9a8462" />
          <stop offset="0.74" stopColor="#6d5b41" />
          <stop offset="1" stopColor="#4a3d2c" />
        </linearGradient>

        {/* Tres tonos de rama, del fondo a la luz. La luz entra por arriba y a
            la izquierda, así que el degradado principal aclara hacia ese lado y
            las ramas que se van al interior de la copa arrancan más apagadas. */}
        <linearGradient id={`${uid}-ramaFondo`} gradientUnits="userSpaceOnUse" x1="1160" y1="380" x2="1360" y2="520">
          <stop offset="0" stopColor="#5c4c39" />
          <stop offset="1" stopColor="#3b3024" />
        </linearGradient>
        <linearGradient id={`${uid}-rama`} gradientUnits="userSpaceOnUse" x1="960" y1="360" x2="1420" y2="540">
          <stop offset="0" stopColor="#a68f70" />
          <stop offset="0.42" stopColor="#826c4f" />
          <stop offset="1" stopColor="#544433" />
        </linearGradient>
        <linearGradient id={`${uid}-ramaLuz`} gradientUnits="userSpaceOnUse" x1="960" y1="360" x2="1420" y2="540">
          <stop offset="0" stopColor="#e2cfae" />
          <stop offset="1" stopColor="#b49877" />
        </linearGradient>

        {/* Las cuatro pasadas comparten eje de degradado: la copa entera se
            aclara hacia el ángulo por donde entra la luz. */}
        <linearGradient id={`${uid}-copa-rim`} gradientUnits="userSpaceOnUse" x1="1000" y1="220" x2="1570" y2="530">
          <stop offset="0" stopColor="#c8e492" />
          <stop offset="1" stopColor="#8fb865" />
        </linearGradient>
        <linearGradient id={`${uid}-copa-profunda`} gradientUnits="userSpaceOnUse" x1="1000" y1="220" x2="1570" y2="530">
          <stop offset="0" stopColor="#17472c" />
          <stop offset="0.55" stopColor="#113522" />
          <stop offset="1" stopColor="#0d2718" />
        </linearGradient>
        <linearGradient id={`${uid}-copa-media`} gradientUnits="userSpaceOnUse" x1="1000" y1="220" x2="1570" y2="530">
          <stop offset="0" stopColor="#2c6b3e" />
          <stop offset="1" stopColor="#1a4529" />
        </linearGradient>
        <linearGradient id={`${uid}-copa-clara`} gradientUnits="userSpaceOnUse" x1="1000" y1="220" x2="1570" y2="530">
          <stop offset="0" stopColor="#437f47" />
          <stop offset="1" stopColor="#2b6038" />
        </linearGradient>
        <linearGradient id={`${uid}-copa-brillo`} gradientUnits="userSpaceOnUse" x1="1000" y1="220" x2="1570" y2="530">
          <stop offset="0" stopColor="#649c52" />
          <stop offset="1" stopColor="#4a8244" />
        </linearGradient>

        {/* La luz rasante del fuste se desvanece por arriba y por abajo. Con un
            relleno plano el canto izquierdo se recortaba como una cinta pegada
            al tronco. */}
        <linearGradient id={`${uid}-luzFuste`} gradientUnits="userSpaceOnUse" x1="1150" y1="452" x2="1150" y2="756">
          <stop offset="0" stopColor="#e6d3b2" stopOpacity="0" />
          <stop offset="0.32" stopColor="#e6d3b2" stopOpacity="0.52" />
          <stop offset="0.78" stopColor="#e6d3b2" stopOpacity="0.3" />
          <stop offset="1" stopColor="#e6d3b2" stopOpacity="0.06" />
        </linearGradient>
        <radialGradient id={`${uid}-copaLuz`} cx="0.42" cy="0.38" r="0.62">
          <stop offset="0" stopColor="#e8f6b4" stopOpacity="0.3" />
          <stop offset="0.55" stopColor="#cdea92" stopOpacity="0.13" />
          <stop offset="1" stopColor="#cdea92" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-copaOclusion`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#0e2c1b" stopOpacity="0.52" />
          <stop offset="1" stopColor="#0e2c1b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-sombraTronco`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#2a2015" stopOpacity="0.46" />
          <stop offset="1" stopColor="#2a2015" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ---- 1. Ramas de fondo ---- */}
      <g className="sepCeiba__ramas sepCeiba__ramas--fondo">
        {deCapa('fondo').map((r) => trazoRama(r, `url(#${uid}-ramaFondo)`))}
      </g>

      {/* ---- 2. Follaje de fondo ---- */}
      <g className="sepCeiba__follaje sepCeiba__follajeFondo">
        {/* Contraluz: la misma silueta desplazada hacia la luz y pintada detrás.
            Sólo asoma por el canto superior izquierdo, que es donde toca. */}
        <g className="sepCeiba__masa sepCeiba__masa--profunda">
          <path d={COPA_SILUETA} fill={`url(#${uid}-copa-rim)`} opacity="0.5" transform="translate(-7 -9)" />
          <path d={COPA_SILUETA} fill={`url(#${uid}-copa-profunda)`} />
        </g>
      </g>

      {/* ---- 3. Ramas principales ---- */}
      <g className="sepCeiba__ramas sepCeiba__ramas--principal">
        {libres.map((r) => trazoRama(r, `url(#${uid}-rama)`))}

        {/* Dos grupos: el exterior acusa el despegue y el aterrizaje del
            quetzal, el interior mantiene el vaivén continuo de la rama. */}
        <g className="sepCeiba__ramaPercha">
          <g className="sepCeiba__ramaPercha-vaiven">
            {percha.map((r) => trazoRama(r, `url(#${uid}-rama)`))}
            {/* Ramillete en la punta, tierra adentro del punto donde se posa el
                ave: el posadero tiene que quedar despejado. */}
            <g fill={`url(#${uid}-copa-media)`}>
              <use href={`#${uid}-palmada`} transform="translate(1036 418) rotate(-24) scale(0.78)" />
              <use href={`#${uid}-palmada`} transform="translate(1070 434) rotate(16) scale(0.66)" />
            </g>
          </g>
        </g>
      </g>

      {/* ---- 4. Tronco y raíces: cubren el arranque de todas las ramas ---- */}
      <g className="sepCeiba__tronco">
        {GAMBAS.map((g, i) => (
          <path key={i} d={g.d} fill={`url(#${uid}-gamba)`} opacity={g.tono === 1 ? 0.94 : 1} />
        ))}
        <path d={TRONCO} fill={`url(#${uid}-tronco)`} />
        <g stroke="#4b3d2d" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.28">
          {CORTEZA.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        {/* Luz rasante en el canto izquierdo del fuste */}
        <path
          d="M1150 744C1156 694 1170 640 1189 570C1198 538 1205 498 1203 460L1218 459C1219 498 1212 540 1201 576C1182 644 1168 696 1163 744Z"
          fill={`url(#${uid}-luzFuste)`}
        />
        {/* Sombra que la copa proyecta sobre el fuste */}
        <ellipse cx="1252" cy="556" rx="96" ry="56" fill={`url(#${uid}-sombraTronco)`} />
      </g>

      {/* ---- 5. Follaje frontal ---- */}
      <g className="sepCeiba__follaje sepCeiba__follajeFrontal">
        <g className="sepCeiba__masa sepCeiba__masa--media">
          <path d={COPA_MEDIA} fill={`url(#${uid}-copa-media)`} />
          {/* Bolsas de sombra entre racimos, sesgadas en contra de la luz */}
          <path d={COPA_SOMBRA} fill={`url(#${uid}-copa-profunda)`} opacity="0.4" />
        </g>
        {/* Los dos tonos claros van translúcidos a propósito: a plena opacidad
            cada racimo se recorta contra el de debajo y la copa se lee como un
            estampado de camuflaje en vez de como follaje. */}
        <g className="sepCeiba__masa sepCeiba__masa--clara">
          <path d={COPA_CLARA} fill={`url(#${uid}-copa-clara)`} opacity="0.82" />
        </g>
        <g className="sepCeiba__masa sepCeiba__masa--brillo">
          <path d={COPA_BRILLO} fill={`url(#${uid}-copa-brillo)`} opacity="0.6" />
        </g>

        {/* Velo cálido sobre el cuadrante por donde entra la luz. Une los
            racimos en una sola masa iluminada: sin él, cada cúmulo se sigue
            leyendo como una pieza suelta por muy bien colocada que esté. */}
        <ellipse cx="1185" cy="312" rx="315" ry="180" fill={`url(#${uid}-copaLuz)`} />

        {/* Oclusión bajo la masa: asienta la copa sobre el fuste y remata la
            entrada de las ramas en el follaje. */}
        <ellipse cx="1262" cy="498" rx="230" ry="60" fill={`url(#${uid}-copaOclusion)`} />

        {/* ---- Ramilletes en la silueta ---- */}
        {FASE.map((f, indice) => (
          <g key={f} className={`sepCeiba__ramillete sepCeiba__ramillete--${f}`}>
            {RAMILLETES.filter((r) => r.tono === indice).map((r) => (
              <use
                key={r.id}
                href={`#${uid}-palmada`}
                fill={`url(#${uid}-copa-${TONO_RAMILLETE[r.tono]})`}
                transform={`translate(${r.x} ${r.y}) rotate(${r.giro}) scale(${r.escala})`}
              />
            ))}
          </g>
        ))}
      </g>
    </g>
  );
}
