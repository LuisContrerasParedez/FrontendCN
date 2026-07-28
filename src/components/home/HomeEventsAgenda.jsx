import { Link } from 'react-router';
import ResponsiveImage from '../ui/ResponsiveImage';
import Icon from '../ui/Icon';

function parseEventDate(value) {
  if (!value) return null;
  const date = new Date(String(value).replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateParts(value) {
  const date = parseEventDate(value);
  if (!date) return null;

  return {
    iso: date.toISOString(),
    day: new Intl.DateTimeFormat('es-GT', { day: '2-digit' }).format(date),
    month: new Intl.DateTimeFormat('es-GT', { month: 'short' })
      .format(date)
      .replace('.', '')
      .toUpperCase(),
    weekday: new Intl.DateTimeFormat('es-GT', { weekday: 'long' }).format(date)
  };
}

function plainText(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function HomeEventsAgenda({ events = [], loading = false }) {
  const featuredEvents = events.slice(0, 4);

  if (!loading && featuredEvents.length === 0) return null;

  return (
    <section className="home-events-agenda reveal" aria-labelledby="home-events-agenda-title">
      <div className="container home-events-agenda__inner">
        <header className="home-events-agenda__header">
          <div>
            <span className="home-events-agenda__eyebrow">
              <Icon name="calendar" size={17} />
              Agenda Centra Norte
            </span>
            <h2 id="home-events-agenda-title">Próximos eventos</h2>
          </div>
          <Link className="home-events-agenda__all" to="/eventos">
            Ver agenda completa
            <Icon name="arrow" size={18} />
          </Link>
        </header>

        <div className="home-events-agenda__list" aria-busy={loading || undefined}>
          {loading && featuredEvents.length === 0
            ? Array.from({ length: 4 }, (_, index) => (
                <div className="home-events-agenda__card home-events-agenda__card--loading" key={index} aria-hidden="true">
                  <span />
                  <i />
                </div>
              ))
            : featuredEvents.map((event, index) => {
                const date = dateParts(event.FechaInicio);
                const description = plainText(event.Descripcion);
                const eventUrl = `/eventos/${encodeURIComponent(String(event.CodigoEvento))}`;

                return (
                  <article className="home-events-agenda__item" key={event.CodigoEvento || `${event.Titulo}-${index}`}>
                    <Link className="home-events-agenda__card" to={eventUrl}>
                      <div className="home-events-agenda__media">
                        <ResponsiveImage
                          src={event.ImagenPrincipalUrl}
                          alt=""
                          className="home-events-agenda__image"
                          sizes="(max-width: 719px) 84vw, (max-width: 1023px) 44vw, 390px"
                          fallbackIcon="calendar"
                        />
                        <span className="home-events-agenda__media-shade" aria-hidden="true" />
                        {date ? (
                          <time className="home-events-agenda__date" dateTime={date.iso}>
                            <strong>{date.day}</strong>
                            <span>{date.month}</span>
                          </time>
                        ) : (
                          <span className="home-events-agenda__date home-events-agenda__date--pending">
                            <Icon name="calendar" size={20} />
                          </span>
                        )}
                      </div>

                      <div className="home-events-agenda__content">
                        <div className="home-events-agenda__copy">
                          {date ? <small>{date.weekday}</small> : <small>Próximamente</small>}
                          <h3>{event.Titulo || 'Evento en Centra Norte'}</h3>
                          {description ? <p>{description}</p> : null}
                        </div>
                        <span className="home-events-agenda__action">
                          Ver evento
                          <Icon name="arrowUpRight" size={18} />
                        </span>
                      </div>
                    </Link>
                  </article>
                );
              })}
        </div>
      </div>
    </section>
  );
}
