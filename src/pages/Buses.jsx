import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router';
import useApi from '../hooks/useApi';
import { obtenerRutasBus } from '../services/busesService';
import BusRouteCard from '../components/buses/RutaBusCard';
import PageHero from '../components/ui/PageHero';
import SearchField from '../components/ui/SearchField';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/ContentStates';
import Seo from '../components/ui/Seo';
import useReveal from '../hooks/useReveal';

export default function Buses() {
  const { refreshToken, config, pages } = useOutletContext();
  const state = useApi(() => obtenerRutasBus(), [refreshToken]);
  const [query, setQuery] = useState('');
  const content = pages.find((page) => page.TipoPagina === 'BUSES');
  const visible = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('es');
    return (state.data || []).filter((route) => {
      if (!term) return true;
      const searchable = [
        route.NombreRuta,
        ...(route.Destinos || []).flatMap((destination) => [
          destination.NombreDestino,
          ...(destination.Empresas || []).map((company) => company.Nombre)
        ])
      ];
      return searchable.some((value) => String(value || '').toLocaleLowerCase('es').includes(term));
    });
  }, [state.data, query]);

  useReveal([state.data, query]);

  return (
    <div className="page motion-page buses-page">
      <Seo title={content?.MetaTitulo || 'Buses'} description={content?.MetaDescripcion || content?.Resumen} config={config} />
      {/* El buscador es el control principal de la página, así que acompaña al
          título en la franja en lugar de repetirlo en un panel propio. */}
      <PageHero title={content?.Titulo || 'Buses'} description={content?.Resumen || 'Encuentra el bus que te lleva a tu destino.'}>
        <SearchField value={query} onChange={setQuery} label="Buscar ruta, destino o empresa" placeholder="Ej. Guastatoya" />
      </PageHero>
      <section className="section container bus-directory">
        {!state.loading ? <p className="result-count" role="status" aria-live="polite" aria-atomic="true">{visible.length} {visible.length === 1 ? 'ruta' : 'rutas'}</p> : null}
        {state.loading ? <LoadingState label="Cargando rutas" /> : null}
        {state.error ? <ErrorState message="No pudimos consultar las rutas en este momento." onRetry={state.refetch} /> : null}
        {!state.loading && !state.error && !visible.length ? <EmptyState title="No encontramos ese destino." message="Prueba con otro nombre de destino." /> : null}
        {!state.loading && !state.error && visible.length ? <div className="bus-route-list bus-route-list--mosaic motion-grid reveal">{visible.map((route) => <BusRouteCard key={route.CodigoRutaBus} route={route} />)}</div> : null}
      </section>
    </div>
  );
}
