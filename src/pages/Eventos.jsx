import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router';
import useApi from '../hooks/useApi';
import { obtenerEventos, obtenerEventosPasados } from '../services/eventosService';
import EventCard from '../components/eventos/EventoCard';
import SectionHeading from '../components/ui/SectionHeading';
import Icon from '../components/ui/Icon';
import { ErrorState, LoadingState } from '../components/ui/ContentStates';
import AgendaVacia from '../components/eventos/AgendaVacia';
import Seo from '../components/ui/Seo';
import useReveal from '../hooks/useReveal';
import { esDeMesPosterior } from '../utils/fechas';

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

  // La agenda vigente llega en una sola lista y aquí se parte en dos por el mes
  // de calendario: lo que ocurre en el mes en curso —incluido lo que empezó
  // antes y sigue corriendo— y lo que se prepara para los meses siguientes.
  // El corte es de presentación: el backend sigue decidiendo qué evento está
  // vigente y cuál ya pasó al archivo.
  const { delMes, proximos } = useMemo(() => {
    const vigentes = state.data || [];
    return {
      delMes: vigentes.filter((evento) => !esDeMesPosterior(evento.FechaInicio)),
      proximos: vigentes.filter((evento) => esDeMesPosterior(evento.FechaInicio))
    };
  }, [state.data]);

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
  // Cada tramo se dibuja solo si tiene tarjetas; ninguno anuncia su propio
  // vacío. Cuando los tres quedan vacíos no hay página que mostrar, y ese caso
  // lo cubre la escena de agenda en blanco.
  //
  // El archivo viaja en su propia petición, así que la página no puede
  // declararse vacía mientras esa primera tanda sigue en camino: hasta que
  // responde se mantiene el indicador de carga, o la escena de vacío
  // parpadearía justo antes de aparecer el archivo.
  const archivoPendiente = archivo.loading && archivo.data === null && !archivo.error;
  const sinVigentes = !delMes.length && !proximos.length;
  const cargando = !state.error && (state.loading || (sinVigentes && archivoPendiente));
  const agendaVacia = !cargando && !state.error && sinVigentes && !pasados.length;

  return (
    <div className="page motion-page events-page">
      <Seo title={content?.MetaTitulo || 'Eventos'} description={content?.MetaDescripcion || content?.Resumen} config={config} />
      {/* La página entra directo en la agenda: el encabezado de ruta se quitó
          porque la navegación sticky ya señala dónde está el visitante y los
          títulos de sección dicen qué es cada tramo. El h1 se queda, oculto:
          es el ancla de foco que `useScrollRestoration` busca al cambiar de
          ruta y el único título de nivel uno del documento. */}
      <h1 className="visually-hidden" data-page-title tabIndex="-1">{content?.Titulo || 'Eventos'}</h1>
      {cargando || state.error || agendaVacia ? (
        <section className="section container events-section">
          {cargando ? <LoadingState label="Cargando eventos" /> : null}
          {state.error ? <ErrorState message="No pudimos consultar los eventos en este momento." onRetry={state.refetch} /> : null}
          {agendaVacia ? <AgendaVacia /> : null}
        </section>
      ) : null}
      {delMes.length ? (
        <section className="section container events-section">
          <SectionHeading
            eyebrow="En cartelera"
            title="Eventos de este mes"
            description="Lo que está pasando ahora mismo en Centra Norte."
          />
          <div className="mosaic motion-grid reveal">
            {delMes.map((event) => <EventCard key={event.CodigoEvento} event={event} headingLevel={3} />)}
          </div>
        </section>
      ) : null}
      {proximos.length ? (
        <section className="section container events-section">
          <SectionHeading
            eyebrow="Ya vienen"
            title="Próximos eventos"
            description="Lo que estamos preparando para los meses que siguen."
          />
          <div className="mosaic motion-grid reveal">
            {proximos.map((event) => <EventCard key={event.CodigoEvento} event={event} headingLevel={3} />)}
          </div>
        </section>
      ) : null}
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
