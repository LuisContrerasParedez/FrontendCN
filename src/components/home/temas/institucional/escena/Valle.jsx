import { CRESTA_CERCANA, CRESTA_LEJANA, LUCES_VALLE, VOLCAN_MAYOR, VOLCAN_MENOR } from './escenografia';

/*
 * El valle: dos crestas, dos conos y las luces del fondo.
 *
 * La profundidad la da el escalonado de tono, no el detalle: cada plano baja
 * un paso y ninguno lleva textura. Los pies de los volcanes quedan tapados por
 * la cresta cercana, que es exactamente como se ven desde el valle.
 */
export default function Valle({ uid }) {
  return (
    <g className="instEsc__valle">
      <path className="instEsc__monte instEsc__monte--lejos" d={CRESTA_LEJANA} />
      <path className="instEsc__monte instEsc__monte--medio" d={VOLCAN_MAYOR} />
      <path className="instEsc__monte instEsc__monte--medio" d={VOLCAN_MENOR} />

      {/* Neblina entre planos: sin ella los dos conos se recortan como calcomanías. */}
      <rect x="0" y="486" width="1600" height="104" fill={`url(#${uid}-bruma)`} />

      <path className="instEsc__monte instEsc__monte--cerca" d={CRESTA_CERCANA} />

      <g className="instEsc__lucesValle">
        {LUCES_VALLE.map((l, i) => (
          <circle
            key={i}
            className={`instEsc__luzLejana instEsc__luzLejana--${l.grupo}`}
            cx={l.cx}
            cy={l.cy}
            r={l.r}
            fillOpacity={l.o}
          />
        ))}
      </g>
    </g>
  );
}
