import { useOutletContext, useParams } from 'react-router';
import useApi from '../hooks/useApi';
import { obtenerPromocion } from '../services/promocionesService';
import PromotionParticipation from '../components/promociones/PromotionParticipation';
import DetailNavigation from '../components/ui/DetailNavigation';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/ContentStates';
import Seo from '../components/ui/Seo';
import { sanitizeHtml } from '../utils/sanitizeHtml';

function formatDate(value) {
  if (!value) return '';
  const rawValue = String(value);
  const datePart = rawValue.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  const date = new Date(datePart ? `${datePart}T12:00:00` : rawValue);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-GT', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

function formatValidity(start, end) {
  const from = formatDate(start);
  const to = formatDate(end);
  if (from && to) return `Vigente del ${from} al ${to}`;
  if (to) return `Vigente hasta el ${to}`;
  if (from) return `Vigente desde el ${from}`;
  return '';
}

export default function PromocionDetalle() {
  const { codigo } = useParams();
  const { refreshToken, config } = useOutletContext();
  const state = useApi(() => obtenerPromocion(codigo), [codigo, refreshToken]);
  const promotion = state.data;

  const navigationItems = (currentLabel) => [{ label: 'Inicio', to: '/' }, { label: 'Promociones', to: '/promociones' }, { label: currentLabel }];

  if (state.loading) return (
    <div className="detail-page">
      <DetailNavigation backTo="/promociones" backLabel="Volver a promociones" items={navigationItems('Cargando promoción')} />
      <div className="section container"><LoadingState label="Cargando información de la promoción" /></div>
    </div>
  );
  if (state.error) return (
    <div className="detail-page">
      <DetailNavigation backTo="/promociones" backLabel="Volver a promociones" items={navigationItems('Promoción')} />
      <div className="section container"><ErrorState message="No pudimos cargar esta promoción." onRetry={state.refetch} /></div>
    </div>
  );
  if (!promotion) return (
    <div className="detail-page">
      <DetailNavigation backTo="/promociones" backLabel="Volver a promociones" items={navigationItems('Promoción no encontrada')} />
      <div className="section container">
        <Seo title="Promoción no encontrada" config={config} noIndex />
        <EmptyState title="Esta promoción no está disponible." message="Consulta las promociones vigentes para conocer otros beneficios." />
      </div>
    </div>
  );

  const validity = formatValidity(promotion.FechaInicio, promotion.FechaFin);

  return (
    <article className="detail-page promotion-detail-page">
      <Seo title={promotion.Titulo} description={`${promotion.Titulo} en Centra Norte.`} image={promotion.ImagenPrincipalUrl} config={config} />
      <DetailNavigation backTo="/promociones" backLabel="Volver a promociones" items={navigationItems(promotion.Titulo)} />
      <div className="container promotion-detail-page__content">
        <PromotionParticipation promotion={promotion} headingLevel={1} />
        {promotion.Descripcion || validity ? (
          <section className="detail-card" aria-labelledby="promotion-details-title">
            <h2 id="promotion-details-title">Detalles de la promoción</h2>
            {validity ? <p className="eyebrow">{validity}</p> : null}
            {promotion.Descripcion ? <div className="rich-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(promotion.Descripcion, '') }} /> : null}
          </section>
        ) : null}
      </div>
    </article>
  );
}
