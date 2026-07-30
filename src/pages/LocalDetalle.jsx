import { useOutletContext, useParams } from 'react-router';
import useApi from '../hooks/useApi';
import { obtenerLocal } from '../services/localesService';
import Breadcrumbs from '../components/ui/Breadcrumbs';
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

  if (state.loading) return <div className="section container"><LoadingState label="Cargando información del local" /></div>;
  if (state.error) return <div className="section container"><ErrorState message="No pudimos cargar este local." onRetry={state.refetch} /></div>;
  // Sin local: el código no es válido o la API respondió 404.
  if (!local) {
    return (
      <div className="section container">
        <Seo title="Local no encontrado" config={config} noIndex />
        <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Locales', to: '/locales' }, { label: 'Local no encontrado' }]} />
        <EmptyState title="Este local no está disponible." message="Consulta el directorio para encontrar otros comercios y servicios." />
      </div>
    );
  }

  const image = safeUrl(local.ImagenUrl);

  return (
    <article className="detail-page">
      <Seo title={local.Nombre} description={local.Descripcion ? undefined : `${local.Nombre} en Centra Norte.`} image={local.ImagenUrl} config={config} />
      <div className="container detail-page__breadcrumbs"><Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Locales', to: '/locales' }, { label: local.Nombre }]} /></div>
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
