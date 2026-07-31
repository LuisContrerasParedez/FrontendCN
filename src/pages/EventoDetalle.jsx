import { useOutletContext, useParams } from 'react-router';
import useApi from '../hooks/useApi';
import { obtenerEvento } from '../services/eventosService';
import DetailNavigation from '../components/ui/DetailNavigation';
import ResponsiveImage from '../components/ui/ResponsiveImage';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/ContentStates';
import Seo from '../components/ui/Seo';
import { sanitizeHtml } from '../utils/sanitizeHtml';
import { safeUrl } from '../utils/safeUrl';

function formatDate(value) {
  if (!value) return '';
  const date = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-GT', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

function formatRange(start, end) {
  const from = formatDate(start);
  const to = formatDate(end);
  if (from && to && from !== to) return `Del ${from} al ${to}`;
  return from || to || '';
}

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
  const fecha = formatRange(event.FechaInicio, event.FechaFin);

  return (
    <article className="detail-page">
      <Seo title={event.Titulo} description={event.Resumen || `${event.Titulo} en Centra Norte.`} image={event.ImagenPrincipalUrl} config={config} />
      <DetailNavigation backTo="/eventos" backLabel="Volver a eventos" items={navigationItems(event.Titulo)} />
      <div className="container detail-page__grid">
        {image ? (
          <div className="detail-page__media">
            <ResponsiveImage src={image} alt={`Vista de ${event.Titulo}`} className="detail-page__image" sizes="(max-width: 719px) 100vw, 45vw" fallbackIcon="calendar" />
          </div>
        ) : null}
        <div className="detail-card">
          {fecha ? <p className="eyebrow">{fecha}</p> : null}
          <h1>{event.Titulo}</h1>
          {event.Descripcion ? (
            <div className="rich-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.Descripcion, '') }} />
          ) : event.Resumen ? (
            <p className="detail-card__lead">{event.Resumen}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
