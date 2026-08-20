import { Link } from 'react-router';
import ResponsiveImage from '../ui/ResponsiveImage';
import Icon from '../ui/Icon';
import { safeUrl } from '../../utils/safeUrl';
import { formatearFecha, obtenerTalonFecha } from '../../utils/fechas';

export default function EventCard({ event, headingLevel = 2, className = '', variant, imageSizes = '(max-width: 680px) 100vw, (max-width: 1024px) 50vw, 33vw' }) {
  const image = safeUrl(event.ImagenPrincipalUrl);
  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  const stub = variant === 'ticket' ? obtenerTalonFecha(event.FechaInicio) : null;
  // Un evento terminado conserva tarjeta y enlace: cambia el tono, no el acceso.
  const past = event.Finalizado === true;
  return (
    <article className={`content-card event-card${past ? ' event-card--past' : ''}${className ? ` ${className}` : ''}`}>
      <Link className="content-card__link" to={'/eventos/' + event.CodigoEvento}>
        <span className="content-card__media" aria-hidden="true">
          {image ? <ResponsiveImage src={image} alt="" className="content-card__image" sizes={imageSizes} fallbackIcon="calendar" /> : <span className="media-fallback"><Icon name="calendar" size={32} /><small>Evento sin imagen</small></span>}
          {stub ? (
            <span className="event-ticket-stub">
              <span className="event-ticket-stub__day">{stub.day}</span>
              <span className="event-ticket-stub__month">{stub.month}</span>
            </span>
          ) : null}
          {past ? <span className="event-card__badge">Finalizado</span> : null}
        </span>
        <span className="content-card__body">
          {event.FechaInicio ? <span className="card-kicker">{formatearFecha(event.FechaInicio)}</span> : null}
          <Heading>{event.Titulo}</Heading>
          {event.Resumen ? <span className="card-summary">{event.Resumen}</span> : null}
          {event.Ubicacion ? <span className="card-meta">{event.Ubicacion}</span> : null}
          <span className="text-link">{past ? 'Ver lo que pasó' : 'Ver evento'} <span aria-hidden="true">→</span></span>
        </span>
      </Link>
    </article>
  );
}
