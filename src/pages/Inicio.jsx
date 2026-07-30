
import { useEffect } from 'react';
import { useOutletContext } from 'react-router';
import useApi from '../hooks/useApi';
import { obtenerBanners } from '../services/bannersService';
import { obtenerEventos } from '../services/eventosService';
import { obtenerLocalesCarrusel } from '../services/localesService';
import { obtenerRutasBus } from '../services/busesService';
import MonthlyHero from '../components/home/MonthlyHero';
import HeroTematico from '../components/home/temas/HeroTematico';
import HomeEventsAgenda from '../components/home/HomeEventsAgenda';
import HomeTransport from '../components/home/HomeTransport';
import LocalsMarquee from '../components/home/LocalsMarquee';
import SectionHeading from '../components/ui/SectionHeading';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/ContentStates';
import Seo from '../components/ui/Seo';
import useReveal from '../hooks/useReveal';

// Las cabinas de la rueda muestran la fecha real de cada evento («1 AGO»).
function etiquetaCabina(valor) {
  if (!valor) return '';
  const fecha = new Date(String(valor).replace(' ', 'T'));
  if (Number.isNaN(fecha.getTime())) return '';
  const dia = new Intl.DateTimeFormat('es-GT', { day: 'numeric' }).format(fecha);
  const mes = new Intl.DateTimeFormat('es-GT', { month: 'short' }).format(fecha).replace('.', '');
  return `${dia} ${mes.toUpperCase()}`;
}

export default function Inicio() {
  const { refreshToken, config, theme, themeState, pages, reportPageLoading } = useOutletContext();
  const banners = useApi(() => obtenerBanners(), [refreshToken]);
  const events = useApi(() => obtenerEventos(), [refreshToken]);
  // El backend elige la muestra: los destacados o, si no hay ninguno, un sorteo.
  const locals = useApi(() => obtenerLocalesCarrusel(), [refreshToken]);
  const routes = useApi(() => obtenerRutasBus(), [refreshToken]);
  const homePage = pages.find((page) => page.TipoPagina === 'INICIO');
  const wheelEvents = (events.data || []).slice(0, 9);
  const activeBanner = banners.data?.[0];
  // La temática manda: si el CMS apaga el área dinámica se mantiene el cartel plano.
  const showFairHero = theme ? Boolean(Number(theme.MostrarTematica)) : true;
  // Sin eventos publicados las cabinas van vacías; no se inventan fechas.
  const cabinDates = wheelEvents
    .map((event) => etiquetaCabina(event.FechaInicio))
    .filter(Boolean);
  const initialLoading = [banners, events]
    .some((state) => state.data === null && state.loading);

  useEffect(() => {
    reportPageLoading(initialLoading);
    return () => reportPageLoading(false);
  }, [initialLoading, reportPageLoading]);

  useReveal([events.data, banners.data, locals.data, routes.data, themeState.loading]);

  return (
    <div className="home-page">
      <Seo
        title={homePage?.MetaTitulo || config.MetaTitulo}
        description={homePage?.MetaDescripcion || config.MetaDescripcion}
        image={theme?.ImagenHeroDesktopUrl || activeBanner?.ImagenDesktopUrl}
        config={config}
      />
      <div className="footer-awning" aria-hidden="true">{Array.from({ length: 10 }, (_, index) => <i key={index} />)}</div>
      {showFairHero ? (
        <>
          {/* Todo el contenido sale de la BD; el respaldo vive dentro del tema. */}
          <HeroTematico
            clave={theme?.ClaveTema}
            titulo={theme?.TituloHero}
            descripcion={theme?.DescripcionHero}
            fechas={cabinDates}
          />
        </>
      ) : (
        <MonthlyHero theme={theme} banner={activeBanner} loading={themeState.loading} events={wheelEvents} />
      )}
      <div className="footer-awning" aria-hidden="true">{Array.from({ length: 10 }, (_, index) => <i key={index} />)}</div>
      <HomeEventsAgenda events={events.data || []} loading={events.loading} />
      <div className="footer-awning" aria-hidden="true">{Array.from({ length: 10 }, (_, index) => <i key={index} />)}</div>

      <section className="section reveal home-content-section home-content-section--local-marquee">
        <div className="container">
          <SectionHeading
            eyebrow="Para tu visita"
            title="Locales para descubrir"
            description="Explora tiendas, restaurantes y servicios disponibles en Centra Norte."
            href="/locales"
            linkLabel="Ver todos los locales"
          />
        </div>
        {locals.loading ? <div className="container locals-marquee__state"><LoadingState label="Cargando locales" /></div> : null}
        {locals.error ? <div className="container locals-marquee__state"><ErrorState message="Los locales no están disponibles por el momento." onRetry={locals.refetch} /></div> : null}
        {!locals.loading && !locals.error && locals.data?.datos.length ? <LocalsMarquee locals={locals.data.datos} /> : null}
        {!locals.loading && !locals.error && !locals.data?.datos.length ? (
          <div className="container">
            <EmptyState title="No hay locales disponibles por el momento." />
          </div>
        ) : null}
      </section>

      <div className="footer-awning" aria-hidden="true">{Array.from({ length: 10 }, (_, index) => <i key={index} />)}</div>
      <HomeTransport routes={routes.data || []} loading={routes.loading} />

    </div>
  );
}
