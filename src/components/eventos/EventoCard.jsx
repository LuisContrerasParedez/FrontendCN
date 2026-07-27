import { Link } from 'react-router';
import ResponsiveImage from '../ui/ResponsiveImage';
import Icon from '../ui/Icon';
import { safeUrl } from '../../utils/safeUrl';

function formatDate(value) {
  if (!value) return '';
  const date = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-GT', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

function getDateStub(value) {
  if (!value) return null;
  const date = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return null;
  return {
    day: new Intl.DateTimeFormat('es-GT', { day: 'numeric' }).format(date),
    month: new Intl.DateTimeFormat('es-GT', { month: 'short' }).format(date).replace('.', '')
  };
}

export default function EventCard({ event, headingLevel = 2, className = '', variant, imageSizes = '(max-width: 680px) 100vw, (max-width: 1024px) 50vw, 33vw' }) {
  const image = safeUrl(event.ImagenPrincipalUrl);
  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  const stub = variant === 'ticket' ? getDateStub(event.FechaInicio) : null;
  return (
    <article className={`content-card event-card${className ? ` ${className}` : ''}`}>
      <Link className="content-card__link" to={'/eventos/' + event.CodigoEvento}>
        <span className="content-card__media" aria-hidden="true">
          {image ? <ResponsiveImage src={image} alt="" className="content-card__image" sizes={imageSizes} fallbackIcon="calendar" /> : <span className="media-fallback"><Icon name="calendar" size={32} /><small>Evento sin imagen</small></span>}
          {stub ? (
            <span className="event-ticket-stub">
              <span className="event-ticket-stub__day">{stub.day}</span>
              <span className="event-ticket-stub__month">{stub.month}</span>
            </span>
          ) : null}
        </span>
        <span className="content-card__body">
          {event.FechaInicio ? <span className="card-kicker">{formatDate(event.FechaInicio)}</span> : null}
          <Heading>{event.Titulo}</Heading>
          {event.Resumen ? <span className="card-summary">{event.Resumen}</span> : null}
          {event.Ubicacion ? <span className="card-meta">{event.Ubicacion}</span> : null}
          <span className="text-link">Ver evento <span aria-hidden="true">→</span></span>
        </span>
      </Link>
    </article>
  );
}
