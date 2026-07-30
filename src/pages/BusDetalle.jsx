import { useOutletContext, useParams } from 'react-router';
import useApi from '../hooks/useApi';
import { obtenerRutaBus } from '../services/busesService';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ResponsiveImage from '../components/ui/ResponsiveImage';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/ContentStates';
import Icon from '../components/ui/Icon';
import Seo from '../components/ui/Seo';
import { safeUrl } from '../utils/safeUrl';

export default function BusDetalle() {
  const { codigo } = useParams();
  const { refreshToken, config } = useOutletContext();
  const state = useApi(() => obtenerRutaBus(codigo), [codigo, refreshToken]);
  const route = state.data;

  if (state.loading) return <div className="section container"><LoadingState label="Cargando información de la ruta" /></div>;
  if (state.error) return <div className="section container"><ErrorState message="No pudimos cargar esta ruta." onRetry={state.refetch} /></div>;
  if (!route) return <div className="section container"><Seo title="Ruta no encontrada" config={config} noIndex /><EmptyState title="Esta ruta no está disponible." message="Consulta el directorio de buses para ver otros destinos." /></div>;

  const image = safeUrl(route.ImagenUrl);
  const destinations = Array.isArray(route.Destinos) ? route.Destinos : [];
  const serviceCount = destinations.reduce((total, destination) => total + (destination.Empresas?.length || 0), 0);
  const description = destinations.length
    ? `${route.NombreRuta}: ${destinations.map((destination) => destination.NombreDestino).join(', ')}.`
    : `Consulta la ruta ${route.NombreRuta} en Centra Norte.`;

  return (
    <article className="detail-page bus-route-detail">
      <Seo title={route.NombreRuta} description={description} image={route.ImagenUrl} config={config} />
      <div className="container detail-page__breadcrumbs"><Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Buses', to: '/buses' }, { label: route.NombreRuta }]} /></div>
      <div className={`container detail-page__grid bus-route-detail__hero${image ? '' : ' bus-route-detail__hero--without-media'}`}>
        {image ? (
          <div className="detail-page__media">
            <ResponsiveImage src={image} alt={`Vista de la ruta ${route.NombreRuta}`} className="detail-page__image" sizes="(max-width: 719px) 100vw, 45vw" fallbackIcon="bus" />
          </div>
        ) : null}
        <div className="detail-card bus-route-summary">
          <p className="bus-route-summary__eyebrow"><Icon name="bus" size={18} /> Ruta de buses</p>
          <h1>{route.NombreRuta}</h1>
          <p className="detail-card__lead">
            Consulta los destinos disponibles y las empresas que prestan servicio en cada uno.
          </p>
          <dl className="bus-route-summary__stats">
            <div><dt>Destinos</dt><dd>{destinations.length}</dd></div>
            <div><dt>Servicios</dt><dd>{serviceCount}</dd></div>
          </dl>
        </div>
      </div>

      {destinations.length ? (
        <section className="container bus-service-directory" aria-labelledby="bus-service-directory-title">
          <header className="bus-service-directory__heading">
            <div>
              <p className="section-kicker">Directorio de transporte</p>
              <h2 id="bus-service-directory-title">Destinos y servicios</h2>
              <p>Encuentra rápidamente qué empresa te lleva a cada destino.</p>
            </div>
            <div className="bus-service-directory__total" aria-label={`${serviceCount} servicios publicados`}>
              <Icon name="bus" size={22} />
              <span><strong>{serviceCount}</strong> {serviceCount === 1 ? 'servicio' : 'servicios'}</span>
            </div>
          </header>

          <div className="bus-destinations">
            {destinations.map((destination, destinationIndex) => {
              const companies = Array.isArray(destination.Empresas) ? destination.Empresas : [];
              return (
                <article className="bus-destination" key={destination.CodigoRutaBusDestino}>
                  <header className="bus-destination__heading">
                    <span className="bus-destination__number" aria-hidden="true">{String(destinationIndex + 1).padStart(2, '0')}</span>
                    <span className="bus-destination__title">
                      <small>Destino</small>
                      <h3>{destination.NombreDestino}</h3>
                    </span>
                    <span className="bus-destination__pin" aria-hidden="true"><Icon name="mapPin" size={22} /></span>
                  </header>

                  <div className="bus-destination__body">
                    <p className="bus-destination__count">
                      {companies.length} {companies.length === 1 ? 'servicio de transporte' : 'servicios de transporte'}
                    </p>
                    {companies.length ? (
                      <ol className="bus-service-list">
                        {companies.map((company, companyIndex) => (
                          <li key={company.CodigoRutaBusDestinoEmpresa ?? `${company.CodigoEmpresaBus}-${companyIndex}`}>
                            <span className="bus-service-list__icon" aria-hidden="true"><Icon name="bus" size={20} /></span>
                            <span className="bus-service-list__copy">
                              <small>Servicio {String(companyIndex + 1).padStart(2, '0')}</small>
                              <strong>{company.Nombre}</strong>
                            </span>
                            <span className="bus-service-list__order" aria-hidden="true">{companyIndex + 1}</span>
                          </li>
                        ))}
                      </ol>
                    ) : <p className="bus-destination__empty">Empresa pendiente de confirmar.</p>}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : (
        <div className="container bus-service-directory"><p className="bus-destination__empty">Aún no hay destinos publicados para esta ruta.</p></div>
      )}
    </article>
  );
}
