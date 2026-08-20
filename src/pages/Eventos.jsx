import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router';
import useApi from '../hooks/useApi';
import { obtenerEventos, obtenerEventosPasados } from '../services/eventosService';
import EventCard from '../components/eventos/EventoCard';
import PageHero from '../components/ui/PageHero';
import SectionHeading from '../components/ui/SectionHeading';
import Icon from '../components/ui/Icon';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/ContentStates';
import Seo from '../components/ui/Seo';
import useReveal from '../hooks/useReveal';

export default function Eventos() {
  const { refreshToken, config, pages } = useOutletContext();
  const state = useApi(() => obtenerEventos(), [refreshToken]);
  const [paginaArchivo, setPaginaArchivo] = useState(1);
  // El archivo es historia y no cambia de un minuto a otro, así que queda fuera
  // del refresco periódico: si entrara, cada minuto descartaría las tandas que
  // el visitante ya abrió y lo devolvería a las diez primeras.
  const archivo = useApi(() => obtenerEventosPasados({ pagina: paginaArchivo }), [paginaArchivo]);
  const [pasados, setPasados] = useState([]);
  const content = pages.find((page) => page.TipoPagina === 'EVENTOS');

  // Cada tanda se suma a las anteriores en lugar de reemplazarlas; el filtro
  // por código evita repetir tarjetas si una página se vuelve a pedir.
  useEffect(() => {
    const datos = archivo.data?.datos;
    if (!datos?.length) return;
    setPasados((previos) => {
      const vistos = new Set(previos.map((evento) => evento.CodigoEvento));
      return [...previos, ...datos.filter((evento) => !vistos.has(evento.CodigoEvento))];
    });
  }, [archivo.data]);

  useReveal([state.data, pasados.length]);

  const hayMasPasados = archivo.data?.paginacion?.TienePaginaSiguiente === true;
  const cargandoMasPasados = archivo.loading && paginaArchivo > 1;

  return (
    <div className="page motion-page events-page">
      <Seo title={content?.MetaTitulo || 'Eventos'} description={content?.MetaDescripcion || content?.Resumen} config={config} />
      <PageHero title={content?.Titulo || 'Eventos'} description={content?.Resumen || 'Consulta los eventos de este mes.'} />
      <section className="section container events-section">
        {state.loading ? <LoadingState label="Cargando eventos" /> : null}
        {state.error ? <ErrorState message="No pudimos consultar los eventos en este momento." onRetry={state.refetch} /> : null}
        {!state.loading && !state.error && !(state.data || []).length ? <EmptyState title="No hay eventos publicados por el momento." message="Cuando tengamos nuevas actividades, aparecerán en esta sección." /> : null}
        {!state.loading && !state.error && state.data?.length ? <div className="mosaic motion-grid reveal">{state.data.map((event) => <EventCard key={event.CodigoEvento} event={event} />)}</div> : null}
      </section>
      {pasados.length ? (
        <section className="section events-archive">
          <div className="container">
            <SectionHeading
              eyebrow="Ya pasaron"
              title="Lo que te has perdido"
              description="Un vistazo a las últimas actividades que celebramos en Centra Norte."
              action={hayMasPasados ? (
                <button
                  type="button"
                  className="text-button events-archive__more"
                  onClick={() => setPaginaArchivo((pagina) => pagina + 1)}
                  disabled={cargandoMasPasados}
                >
                  {cargandoMasPasados ? 'Cargando…' : 'Ver más'}
                  <Icon name="chevronDown" size={16} strokeWidth={2.4} />
                </button>
              ) : null}
            />
            <div className="mosaic events-archive__grid motion-grid reveal">
              {pasados.map((event) => <EventCard key={event.CodigoEvento} event={event} headingLevel={3} />)}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
