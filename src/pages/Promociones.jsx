import { useOutletContext } from 'react-router';
import useApi from '../hooks/useApi';
import { obtenerPromociones } from '../services/promocionesService';
import PromotionCard from '../components/promociones/PromocionCard';
import PromotionParticipation from '../components/promociones/PromotionParticipation';
import PageHero from '../components/ui/PageHero';
import { ErrorState, LoadingState } from '../components/ui/ContentStates';
import Seo from '../components/ui/Seo';
import useReveal from '../hooks/useReveal';

export default function Promociones() {
  const { refreshToken, config, pages } = useOutletContext();
  const state = useApi(() => obtenerPromociones(), [refreshToken]);
  const content = pages.find((page) => page.TipoPagina === 'PROMOCIONES');
  useReveal([state.data]);

  return (
    <div className="page motion-page promotions-page">
      <Seo title={content?.MetaTitulo || 'Promociones'} description={content?.MetaDescripcion || content?.Resumen} config={config} />
      <PageHero eyebrow="Beneficios vigentes" title={content?.Titulo || 'Promociones'} description={content?.Resumen || 'Descubre las promociones disponibles en Centra Norte.'} />
      <section className="section container promotions-section">
        {state.loading ? <LoadingState label="Cargando promociones" /> : null}
        {state.error ? <ErrorState message="No pudimos consultar las promociones en este momento." onRetry={state.refetch} /> : null}
        {!state.loading && !state.error && !(state.data || []).length ? <div className="motion-panel reveal"><PromotionParticipation /></div> : null}
        {!state.loading && !state.error && state.data?.length ? <div className="mosaic motion-grid reveal">{state.data.map((promotion) => <PromotionCard key={promotion.CodigoPromocion} promotion={promotion} />)}</div> : null}
      </section>
    </div>
  );
}
