import { useOutletContext, useParams } from 'react-router';
import useApi from '../hooks/useApi';
import { obtenerLocal } from '../services/localesService';
import DetailNavigation from '../components/ui/DetailNavigation';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/ContentStates';
import Seo from '../components/ui/Seo';
import ResponsiveImage from '../components/ui/ResponsiveImage';
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

  return (
    <article className="detail-page">
      <Seo title={local.Nombre} description={local.Descripcion ? undefined : `${local.Nombre} en Centra Norte.`} image={local.ImagenUrl} config={config} />
      <DetailNavigation backTo="/locales" backLabel="Volver a locales" items={navigationItems(local.Nombre)} />
      <div className="container detail-page__grid">
        {image ? (
          <div className="detail-page__media">
            <ResponsiveImage src={image} alt={`Vista de ${local.Nombre}`} className="detail-page__image" sizes="(max-width: 719px) 100vw, 45vw" fallbackIcon="shop" />
          </div>
        ) : null}
        <div className="detail-card">
          {local.Categoria ? <p className="eyebrow">{local.Categoria}</p> : null}
          <h1>{local.Nombre}</h1>
          {local.Descripcion ? (
            <div className="rich-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(local.Descripcion, '') }} />
          ) : null}
          {local.Ubicacion || local.Horario ? (
            <dl className="detail-facts">
              {local.Ubicacion ? <div><dt>Ubicación</dt><dd>{local.Ubicacion}</dd></div> : null}
              {local.Horario ? <div><dt>Horario</dt><dd>{local.Horario}</dd></div> : null}
            </dl>
          ) : null}
        </div>
      </div>
    </article>
  );
}
