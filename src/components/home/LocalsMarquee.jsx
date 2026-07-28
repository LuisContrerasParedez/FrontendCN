import useDragMarquee from '../../hooks/useDragMarquee';
import LocalCard from '../locales/LocalCard';

const MINIMUM_CARDS_PER_GROUP = 8;

function buildMarqueeGroup(locals) {
  if (!locals.length) return [];

  const repetitions = Math.max(1, Math.ceil(MINIMUM_CARDS_PER_GROUP / locals.length));
  return Array.from({ length: repetitions }, () => locals).flat();
}

function LocalGroup({ locals, duplicate = false }) {
  return (
    <ul
      className="locals-marquee__group"
      aria-hidden={duplicate || undefined}
      aria-label={duplicate ? undefined : 'Locales para descubrir'}
    >
      {locals.map((local, index) => (
        <li key={`${local.CodigoLocal}-${index}`} style={{ '--local-card-index': index }}>
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

export default function LocalsMarquee({ locals = [] }) {
  const marqueeLocals = buildMarqueeGroup(locals);
  const duration = Math.max(64, marqueeLocals.length * 8);
  const { viewportRef, trackRef, interactive } = useDragMarquee(duration);

  return (
    <div
      ref={viewportRef}
      className={`locals-marquee${interactive ? ' locals-marquee--draggable' : ''}`}
      style={{ '--locals-marquee-duration': `${duration}s` }}
    >
      <div ref={trackRef} className="locals-marquee__track">
        <LocalGroup locals={marqueeLocals} />
        <LocalGroup locals={marqueeLocals} duplicate />
      </div>
    </div>
  );
}
