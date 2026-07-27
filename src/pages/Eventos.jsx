import { useOutletContext } from 'react-router';
import useApi from '../hooks/useApi';
import { obtenerEventos } from '../services/eventosService';
import EventCard from '../components/eventos/EventoCard';
import PageHero from '../components/ui/PageHero';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/ContentStates';
import Seo from '../components/ui/Seo';

export default function Eventos() {
  const { refreshToken, config, pages } = useOutletContext();
  const state = useApi(() => obtenerEventos(), [refreshToken]);
  const content = pages.find((page) => page.TipoPagina === 'EVENTOS');
  return (
    <div className="page">
      <Seo title={content?.MetaTitulo || 'Eventos'} description={content?.MetaDescripcion || content?.Resumen} config={config} />
      <PageHero eyebrow="Agenda" title={content?.Titulo || 'Eventos'} description={content?.Resumen || 'Consulta los eventos de este mes.'} />
      <section className="section container events-section">
        {state.loading ? <LoadingState label="Cargando eventos" /> : null}
        {state.error ? <ErrorState message="No pudimos consultar los eventos en este momento." onRetry={state.refetch} /> : null}
        {!state.loading && !state.error && !(state.data || []).length ? <EmptyState title="No hay eventos publicados por el momento." message="Cuando tengamos nuevas actividades, aparecerán en esta sección." /> : null}
        {!state.loading && !state.error && state.data?.length ? <div className="mosaic">{state.data.map((event) => <EventCard key={event.CodigoEvento} event={event} />)}</div> : null}
      </section>
    </div>
  );
}
