/*
THESIS: Centra Norte se presenta como un programa familiar de feria, no como un centro comercial genérico ni un tablero de tarjetas.
OWN-WORLD: Azul plaza y papel claro dominan; amarillo, coral y verde orientan. Toldos planos, cortes de boleto y señalización compacta forman el lenguaje.
STORY: La persona entiende qué puede comprar, disfrutar y cómo seguir su viaje; después descubre contenido real y prepara su visita.
FIRST VIEWPORT: Mensaje y acciones a la izquierda, imagen real o cartel gráfico a la derecha, y una ruta Comprar–Disfrutar–Viajar cerrando la vista.
FORM: Programa de feria familiar, sexta dirección del recorrido local; clave de semilla adf597e1.
*/
import { useEffect } from 'react';
import { useOutletContext } from 'react-router';
import useApi from '../hooks/useApi';
import { obtenerBanners } from '../services/bannersService';
import { obtenerEventos } from '../services/eventosService';
import EventCard from '../components/eventos/EventoCard';
import MonthlyHero from '../components/home/MonthlyHero';
import SectionHeading from '../components/ui/SectionHeading';
import { ErrorState, LoadingState } from '../components/ui/ContentStates';
import Seo from '../components/ui/Seo';
import useReveal from '../hooks/useReveal';

export default function Inicio() {
  const { refreshToken, config, theme, themeState, pages, reportPageLoading } = useOutletContext();
  const banners = useApi(() => obtenerBanners(), [refreshToken]);
  const events = useApi(() => obtenerEventos(), [refreshToken]);
  const homePage = pages.find((page) => page.TipoPagina === 'INICIO');
  const upcomingEvents = (events.data || []).slice(0, 8);
  const wheelEvents = (events.data || []).slice(0, 9);
  const activeBanner = banners.data?.[0];
  const initialLoading = [banners, events]
    .some((state) => state.data === null && state.loading);

  useEffect(() => {
    reportPageLoading(initialLoading);
    return () => reportPageLoading(false);
  }, [initialLoading, reportPageLoading]);

  useReveal([events.data, banners.data, themeState.loading]);

  return (
    <div className="home-page">
      <Seo
        title={homePage?.MetaTitulo || config.MetaTitulo}
        description={homePage?.MetaDescripcion || config.MetaDescripcion}
        image={theme?.ImagenHeroDesktopUrl || activeBanner?.ImagenDesktopUrl}
        config={config}
      />
      <div className="footer-awning" aria-hidden="true">{Array.from({ length: 10 }, (_, index) => <i key={index} />)}</div>
      <MonthlyHero theme={theme} banner={activeBanner} loading={themeState.loading} events={wheelEvents} />
      <div className="footer-awning" aria-hidden="true">{Array.from({ length: 10 }, (_, index) => <i key={index} />)}</div>

      {/* <section className="section section--surface reveal home-content-section home-content-section--locals">
        <div className="container">
          <div className="home-content-section__layout home-content-section__layout--locals">
          <SectionHeading
            eyebrow="Para tu visita"
            title="Lugares para descubrir"
            description="Encuentra opciones para comprar, comer y resolver tus gestiones."
            href="/locales"
            linkLabel="Explorar todos los locales"
          />
          {locals.loading ? <LoadingState label="Cargando locales" /> : null}
          {locals.error ? <ErrorState message="Los locales destacados no están disponibles por el momento." onRetry={locals.refetch} /> : null}
          {!locals.loading && !locals.error && featuredLocals.length ? (
            <div className="discovery-board">
              <LocalCard local={featuredLocals[0]} headingLevel={3} className="discovery-board__feature" />
              {featuredLocals.length > 1 ? (
                <ul className="discovery-board__list">
                  {featuredLocals.slice(1).map((local) => (
                    <li key={local.CodigoLocal}>
                      <LocalCard local={local} headingLevel={3} className="discovery-board__item" />
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
          {!locals.loading && !locals.error && !featuredLocals.length ? <EmptyState title="No hay locales destacados por el momento." /> : null}
          </div>
        </div>
      </section> */}

      {events.loading ? <section className="section container"><LoadingState label="Cargando eventos" /></section> : null}
      {events.error ? <section className="section container"><ErrorState message="Los eventos no están disponibles por el momento." onRetry={events.refetch} /></section> : null}
      {!events.loading && !events.error && upcomingEvents.length ? (
        <section className="section events-showcase reveal home-content-section home-content-section--events">
          <div className="container">
            <div className="home-content-section__layout home-content-section__layout--events">
              <SectionHeading title="Próximos eventos" description="Consulta las actividades programadas en Centra Norte." href="/eventos" linkLabel="Ver agenda completa" />
              <div className="home-events-grid">
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={event.CodigoEvento}
                    event={event}
                    headingLevel={3}
                    variant="ticket"
                    imageSizes="(max-width: 719px) 100vw, (max-width: 1179px) 50vw, 25vw"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

    </div>
  );
}
