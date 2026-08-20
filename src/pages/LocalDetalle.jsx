import { Link, useOutletContext, useParams } from 'react-router';
import useApi from '../hooks/useApi';
import { obtenerLocal } from '../services/localesService';
import DetailNavigation from '../components/ui/DetailNavigation';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/ContentStates';
import Seo from '../components/ui/Seo';
import ResponsiveImage from '../components/ui/ResponsiveImage';
import Icon from '../components/ui/Icon';
import { sanitizeHtml } from '../utils/sanitizeHtml';
import { safeUrl } from '../utils/safeUrl';

export default function LocalDetalle() {
  const { codigo } = useParams();
  const { refreshToken, config } = useOutletContext();
  // La ficha se pide por su propio endpoint: abrir el enlace directo o recargar
  // muestra la misma información, sin depender del listado ni del carrusel.
  const state = useApi(() => obtenerLocal(codigo), [codigo, refreshToken]);
  const local = state.data;
  const navigationItems = (currentLabel) => [{ label: 'Inicio', to: '/' }, { label: 'Locales', to: '/locales' }, { label: currentLabel }];

  if (state.loading) return (
    <div className="detail-page">
      <DetailNavigation backTo="/locales" backLabel="Volver a locales" items={navigationItems('Cargando local')} />
      <div className="section container"><LoadingState label="Cargando información del local" /></div>
    </div>
  );
  if (state.error) return (
    <div className="detail-page">
      <DetailNavigation backTo="/locales" backLabel="Volver a locales" items={navigationItems('Local')} />
      <div className="section container"><ErrorState message="No pudimos cargar este local." onRetry={state.refetch} /></div>
    </div>
  );
  // Sin local: el código no es válido o la API respondió 404.
  if (!local) {
    return (
      <div className="detail-page">
        <DetailNavigation backTo="/locales" backLabel="Volver a locales" items={navigationItems('Local no encontrado')} />
        <div className="section container">
          <Seo title="Local no encontrado" config={config} noIndex />
          <EmptyState title="Este local no está disponible." message="Consulta el directorio para encontrar otros comercios y servicios." />
        </div>
      </div>
    );
  }

  const image = safeUrl(local.ImagenUrl);
  const descripcion = local.Descripcion ? sanitizeHtml(local.Descripcion, '') : '';

  return (
    <article className="detail-page detail-page--local">
      <Seo title={local.Nombre} description={local.Descripcion ? undefined : `${local.Nombre} en Centra Norte.`} image={local.ImagenUrl} config={config} />
      <DetailNavigation backTo="/locales" backLabel="Volver a locales" items={navigationItems(local.Nombre)} />

      <div className="detail-hero">
        <div className="container detail-hero__inner">
          <div className="detail-hero__media">
            <ResponsiveImage
              src={image}
              alt={`Vista de ${local.Nombre}`}
              className="detail-hero__image"
              sizes="(max-width: 719px) 100vw, (max-width: 1179px) 50vw, 42vw"
              fallbackIcon="shop"
              fallbackLabel="Local sin imagen"
              eager
            />
            {local.Destacado ? (
              <span className="detail-hero__badge detail-hero__badge--featured">
                <Icon name="star" size={14} />Destacado
              </span>
            ) : null}
          </div>

          <div className="detail-hero__body">
            {local.Categoria ? <p className="eyebrow detail-hero__eyebrow"><Icon name="shop" size={15} />{local.Categoria}</p> : null}
            <h1>{local.Nombre}</h1>

            {descripcion ? <div className="rich-content" dangerouslySetInnerHTML={{ __html: descripcion }} /> : null}

            {local.Ubicacion || local.Horario ? (
              <dl className="detail-facts detail-facts--grid">
                {local.Ubicacion ? (
                  <div className="detail-fact">
                    <dt><span className="detail-fact__icon" aria-hidden="true"><Icon name="mapPin" size={17} /></span>Ubicación</dt>
                    <dd>{local.Ubicacion}</dd>
                  </div>
                ) : null}
                {local.Horario ? (
                  <div className="detail-fact">
                    <dt><span className="detail-fact__icon" aria-hidden="true"><Icon name="clock" size={17} /></span>Horario</dt>
                    <dd>{local.Horario}</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
          </div>
        </div>
      </div>

      <div className="container detail-cta">
        <div className="detail-cta__copy">
          <p className="eyebrow">Sigue explorando</p>
          <h2>Descubre más en Centra Norte</h2>
          <p>Recorre el directorio completo de comercios y revisa las promociones vigentes.</p>
        </div>
        <div className="detail-cta__actions">
          <Link className="button button--primary" to="/locales">Ver todos los locales</Link>
          <Link className="button button--outline" to="/promociones">Ver promociones</Link>
        </div>
      </div>
    </article>
  );
}
