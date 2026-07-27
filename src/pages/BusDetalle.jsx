import { useOutletContext, useParams } from 'react-router';
import useApi from '../hooks/useApi';
import { obtenerRutaBus } from '../services/busesService';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ResponsiveImage from '../components/ui/ResponsiveImage';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/ContentStates';
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
  const companies = Array.isArray(route.EmpresasBus) && route.EmpresasBus.length
    ? route.EmpresasBus
    : [route.EmpresaBus].filter(Boolean);

  return (
    <article className="detail-page">
      <Seo title={route.Destino} description={`${route.Destino} · ${companies.join(', ')} en Centra Norte.`} image={route.ImagenUrl} config={config} />
      <div className="container detail-page__breadcrumbs"><Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Buses', to: '/buses' }, { label: route.Destino }]} /></div>
      <div className="container detail-page__grid">
        {image ? (
          <div className="detail-page__media">
            <ResponsiveImage src={image} alt={`Vista de ${route.Destino}`} className="detail-page__image" sizes="(max-width: 719px) 100vw, 45vw" fallbackIcon="bus" />
          </div>
        ) : null}
        <div className="detail-card">
          <h1>{route.Destino}</h1>
          <dl className="detail-facts">
            {route.NombreRuta ? <div><dt>Destino</dt><dd>{route.NombreRuta}</dd></div> : null}
            {companies.length ? <div><dt>{companies.length === 1 ? 'Empresa' : 'Empresas'}</dt><dd>{companies.join(', ')}</dd></div> : null}
          </dl>
        </div>
      </div>
    </article>
  );
}
