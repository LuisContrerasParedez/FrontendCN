import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router';
import useApi from '../hooks/useApi';
import { obtenerRutasBus } from '../services/busesService';
import BusRouteCard from '../components/buses/RutaBusCard';
import PageHero from '../components/ui/PageHero';
import SearchField from '../components/ui/SearchField';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/ContentStates';
import Seo from '../components/ui/Seo';

export default function Buses() {
  const { refreshToken, config, pages } = useOutletContext();
  const state = useApi(() => obtenerRutasBus(), [refreshToken]);
  const [query, setQuery] = useState('');
  const content = pages.find((page) => page.TipoPagina === 'BUSES');
  const visible = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('es');
    return (state.data || []).filter((route) => !term || String(route.Destino || '').toLocaleLowerCase('es').includes(term));
  }, [state.data, query]);

  return (
    <div className="page buses-page">
      <Seo title={content?.MetaTitulo || 'Buses'} description={content?.MetaDescripcion || content?.Resumen} config={config} />
      <PageHero eyebrow="Punto de transporte" title={content?.Titulo || 'Buses'} description={content?.Resumen || 'Encuentra el bus que te lleva a tu destino.'} />
      <section className="section container bus-directory">
        <div className="bus-search">
          <div><h2>Busca tu destino</h2><p>Escribe el lugar al que quieres viajar.</p></div>
          <SearchField value={query} onChange={setQuery} label="Buscar destino" placeholder="Ej. Zacapa" />
        </div>
        {!state.loading ? <p className="result-count" role="status" aria-live="polite" aria-atomic="true">{visible.length} {visible.length === 1 ? 'ruta' : 'rutas'}</p> : null}
        {state.loading ? <LoadingState label="Cargando rutas" /> : null}
        {state.error ? <ErrorState message="No pudimos consultar las rutas en este momento." onRetry={state.refetch} /> : null}
        {!state.loading && !state.error && !visible.length ? <EmptyState title="No encontramos ese destino." message="Prueba con otro nombre de destino." /> : null}
        {!state.loading && !state.error && visible.length ? <div className="bus-route-list bus-route-list--mosaic">{visible.map((route) => <BusRouteCard key={route.CodigoRutaBus} route={route} />)}</div> : null}
      </section>
    </div>
  );
}
