import useDragMarquee from '../../hooks/useDragMarquee';
import LocalCard from '../locales/LocalCard';

/** Tarjetas mínimas para que la fila infinita no muestre huecos al desplazarse. */
const MINIMO_PARA_DESPLAZAR = 8;

function LocalGroup({ locals, duplicate = false }) {
  return (
    <ul
      className="locals-marquee__group"
      aria-hidden={duplicate || undefined}
      aria-label={duplicate ? undefined : 'Locales para descubrir'}
    >
      {locals.map((local, index) => (
        <li key={local.CodigoLocal} style={{ '--local-card-index': index }}>
          <LocalCard
            local={local}
            headingLevel={3}
            className="locals-marquee__card"
            linkTabIndex={duplicate ? -1 : undefined}
          />
        </li>
      ))}
    </ul>
  );
}

/**
 * Fila de locales del inicio. La API decide qué locales llegan (destacados o
 * una muestra aleatoria) y aquí no se repite ninguno: cuando no alcanzan para
 * llenar la fila se muestran una sola vez, quietos y centrados.
 */
export default function LocalsMarquee({ locals = [] }) {
  const desplaza = locals.length >= MINIMO_PARA_DESPLAZAR;
  const duration = Math.max(64, locals.length * 8);
  const { viewportRef, trackRef, interactive } = useDragMarquee(duration, desplaza);

  if (!locals.length) return null;

  return (
    <div
      ref={viewportRef}
      className={`locals-marquee${desplaza ? '' : ' locals-marquee--static'}${interactive ? ' locals-marquee--draggable' : ''}`}
      style={desplaza ? { '--locals-marquee-duration': `${duration}s` } : undefined}
    >
      <div ref={trackRef} className="locals-marquee__track">
        <LocalGroup locals={locals} />
        {/* El segundo grupo es el mismo contenido: da continuidad al bucle y
            queda oculto para lectores de pantalla. */}
        {desplaza ? <LocalGroup locals={locals} duplicate /> : null}
      </div>
    </div>
  );
}
