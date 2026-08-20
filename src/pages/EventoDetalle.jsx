import { Link, useOutletContext, useParams } from 'react-router';
import useApi from '../hooks/useApi';
import { obtenerEvento } from '../services/eventosService';
import DetailNavigation from '../components/ui/DetailNavigation';
import ResponsiveImage from '../components/ui/ResponsiveImage';
import Icon from '../components/ui/Icon';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/ContentStates';
import Seo from '../components/ui/Seo';
import { sanitizeHtml } from '../utils/sanitizeHtml';
import { safeUrl } from '../utils/safeUrl';
import { formatearFecha, formatearHora, formatearRango } from '../utils/fechas';

function hora(value) {
  const valor = formatearHora(value);
  return valor ? <span className="detail-fact__time">{valor}</span> : null;
}

const ESTADOS = {
  PROXIMO: 'Próximamente',
  EN_CURSO: 'En curso',
  FINALIZADO: 'Ya terminó'
};

export default function EventoDetalle() {
  const { codigo } = useParams();
  const { refreshToken, config } = useOutletContext();
  const state = useApi(() => obtenerEvento(codigo), [codigo, refreshToken]);
  const event = state.data;

  const navigationItems = (currentLabel) => [{ label: 'Inicio', to: '/' }, { label: 'Eventos', to: '/eventos' }, { label: currentLabel }];

  if (state.loading) return (
    <div className="detail-page">
      <DetailNavigation backTo="/eventos" backLabel="Volver a eventos" items={navigationItems('Cargando evento')} />
      <div className="section container"><LoadingState label="Cargando información del evento" /></div>
    </div>
  );
  if (state.error) return (
    <div className="detail-page">
      <DetailNavigation backTo="/eventos" backLabel="Volver a eventos" items={navigationItems('Evento')} />
      <div className="section container"><ErrorState message="No pudimos cargar este evento." onRetry={state.refetch} /></div>
    </div>
  );
  if (!event) return (
    <div className="detail-page">
      <DetailNavigation backTo="/eventos" backLabel="Volver a eventos" items={navigationItems('Evento no encontrado')} />
      <div className="section container">
        <Seo title="Evento no encontrado" config={config} noIndex />
        <EmptyState title="Este evento no está disponible." message="Consulta la agenda para ver otras actividades." />
      </div>
    </div>
  );

  const image = safeUrl(event.ImagenPrincipalUrl);
  const fecha = formatearRango(event.FechaInicio, event.FechaFin);
  const past = event.Finalizado === true;
  const estado = ESTADOS[event.EstadoEvento] || (past ? ESTADOS.FINALIZADO : '');
  const descripcion = event.Descripcion ? sanitizeHtml(event.Descripcion, '') : '';

  return (
    <article className={`detail-page detail-page--event${past ? ' detail-page--past' : ''}`}>
      <Seo title={event.Titulo} description={event.Resumen || `${event.Titulo} en Centra Norte.`} image={event.ImagenPrincipalUrl} config={config} />
      <DetailNavigation backTo="/eventos" backLabel="Volver a eventos" items={navigationItems(event.Titulo)} />

      <div className="detail-hero">
        <div className="container detail-hero__inner">
          <div className="detail-hero__media">
            <ResponsiveImage
              src={image}
              alt={`Vista de ${event.Titulo}`}
              className="detail-hero__image"
              sizes="(max-width: 719px) 100vw, (max-width: 1179px) 50vw, 42vw"
              fallbackIcon="calendar"
              fallbackLabel="Evento sin imagen"
              eager
            />
            {past ? <span className="detail-hero__badge">Evento finalizado</span> : null}
          </div>

          <div className="detail-hero__body">
            {fecha ? <p className="eyebrow detail-hero__eyebrow"><Icon name="calendar" size={15} />{fecha}</p> : null}
            <h1>{event.Titulo}</h1>

            {descripcion ? <div className="rich-content" dangerouslySetInnerHTML={{ __html: descripcion }} /> : null}

            <dl className="detail-facts detail-facts--grid">
              {event.FechaInicio ? (
                <div className="detail-fact">
                  <dt><span className="detail-fact__icon" aria-hidden="true"><Icon name="calendar" size={17} /></span>Inicia</dt>
                  <dd>{formatearFecha(event.FechaInicio)}{hora(event.FechaInicio)}</dd>
                </div>
              ) : null}
              {event.FechaFin ? (
                <div className="detail-fact">
                  <dt><span className="detail-fact__icon" aria-hidden="true"><Icon name="clock" size={17} /></span>Termina</dt>
                  <dd>{formatearFecha(event.FechaFin)}{hora(event.FechaFin)}</dd>
                </div>
              ) : null}
              {estado ? (
                <div className="detail-fact">
                  <dt><span className="detail-fact__icon" aria-hidden="true"><Icon name="sparkles" size={17} /></span>Estado</dt>
                  <dd>{estado}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>
      </div>

      <div className="container detail-cta">
        <div className="detail-cta__copy">
          <p className="eyebrow">Sigue explorando</p>
          <h2>{past ? 'Lo próximo ya está en la agenda' : 'Aprovecha tu visita'}</h2>
          <p>Revisa el resto de actividades y las promociones vigentes de nuestros locales.</p>
        </div>
        <div className="detail-cta__actions">
          <Link className="button button--primary" to="/eventos">Ver todos los eventos</Link>
          <Link className="button button--outline" to="/promociones">Ver promociones</Link>
        </div>
      </div>
    </article>
  );
}
