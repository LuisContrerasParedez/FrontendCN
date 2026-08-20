import { useEffect, useMemo, useRef } from 'react';
import { useOutletContext, useSearchParams } from 'react-router';
import useApi from '../hooks/useApi';
import useDebouncedValue from '../hooks/useDebouncedValue';
import { LOCALES_POR_PAGINA, obtenerCategoriasLocales, obtenerLocales } from '../services/localesService';
import LocalGrid from '../components/locales/LocalGrid';
import PageHero from '../components/ui/PageHero';
import SearchField from '../components/ui/SearchField';
import CategoryFilter from '../components/ui/CategoryFilter';
import Pagination from '../components/ui/Pagination';
import Icon from '../components/ui/Icon';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/ContentStates';
import Seo from '../components/ui/Seo';
import useReveal from '../hooks/useReveal';
import useRefreshInterval from '../hooks/useRefreshInterval';

const ACTUALIZAR_DIRECTORIO_MS = 15000;

export default function Locales() {
  const { refreshToken, config, pages } = useOutletContext();
  // El directorio cambia con frecuencia desde administracion. Su consulta se
  // revalida sin esperar el refresco general de un minuto del resto del sitio.
  const directoryRefreshToken = useRefreshInterval(ACTUALIZAR_DIRECTORIO_MS);
  const [params, setParams] = useSearchParams();
  const toolbarRef = useRef(null);
  const pageContent = pages.find((page) => page.TipoPagina === 'LOCALES');
  const query = params.get('buscar') || '';
  const category = params.get('categoria') || 'todos';
  const page = Math.max(1, Number(params.get('pagina')) || 1);
  // La API se consulta con el término ya reposado, no con cada tecla.
  const search = useDebouncedValue(query);

  const state = useApi(
    () => obtenerLocales({ pagina: page, limite: LOCALES_POR_PAGINA, categoria: category, busqueda: search }),
    [directoryRefreshToken, page, category, search]
  );
  // El filtro no puede salir de la página visible: con paginación real solo
  // llegan doce locales, así que las categorías vienen de su propio endpoint.
  const categoriesState = useApi(() => obtenerCategoriasLocales(), [refreshToken]);

  const locals = useMemo(() => state.data?.datos || [], [state.data]);
  const pagination = state.data?.paginacion;
  const total = pagination?.TotalRegistros ?? 0;
  const pageCount = pagination?.TotalPaginas ?? 0;
  const categories = useMemo(() => [
    { slug: 'todos', name: 'Todos' },
    ...(categoriesState.data || []).map((item) => ({ slug: String(item.CodigoCategoriaLocal), name: item.Nombre }))
  ], [categoriesState.data]);

  useReveal([state.data, query, category, page]);

  useEffect(() => {
    // Si se pide una página que ya no existe (por un filtro o por un cambio en
    // el contenido), se vuelve a la última disponible.
    if (pageCount > 0 && page > pageCount) {
      const next = new URLSearchParams(params);
      next.set('pagina', String(pageCount));
      setParams(next, { replace: true });
    }
  }, [page, pageCount, params, setParams]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'todos' || (key === 'pagina' && value === 1)) next.delete(key);
    else next.set(key, String(value));
    // Cualquier filtro nuevo reinicia la paginación.
    if (key !== 'pagina') next.delete('pagina');
    // Escribir no debe dejar una entrada de historial por cada letra.
    setParams(next, key === 'buscar' ? { replace: true } : undefined);
    if (key === 'pagina') toolbarRef.current?.scrollIntoView({ block: 'start' });
  };

  const hasFilters = Boolean(query.trim()) || category !== 'todos';

  return (
    <div className="page locales-page">
      <Seo title={pageContent?.MetaTitulo || 'Locales'} description={pageContent?.MetaDescripcion || pageContent?.Resumen} config={config} />
      <PageHero title={pageContent?.Titulo || 'Locales'} description={pageContent?.Resumen || 'Encuentra restaurantes, tiendas y servicios.'}>
        <div className="directory-hero-overview" aria-live="polite" aria-atomic="true">
          <span className="directory-hero-overview__icon" aria-hidden="true"><Icon name="shop" size={18} /></span>
          {state.loading ? (
            <p>Preparando el directorio…</p>
          ) : (
            <p>
              <strong>{total} {total === 1 ? 'local' : 'locales'}</strong>
            </p>
          )}
        </div>
      </PageHero>
      {/* La barra de filtros cierra el encabezado en lugar de flotar dentro de
          la cuadrícula: título, búsqueda y categorías se leen como un solo bloque. */}
      <div className="directory-toolbar reveal" ref={toolbarRef}>
        <div className="container directory-toolbar__inner">
          <SearchField value={query} onChange={(value) => update('buscar', value)} label="Buscar local" placeholder="Buscar local o categoría" />
          <CategoryFilter categories={categories} value={category} onChange={(value) => update('categoria', value)} />
        </div>
      </div>
      <section className="section container directory-section">
        {state.loading ? <LoadingState label="Cargando directorio" /> : null}
        {state.error ? <ErrorState message="No pudimos cargar el directorio en este momento." onRetry={state.refetch} /> : null}
        {!state.loading && !state.error && !locals.length ? (
          <EmptyState
            title={hasFilters ? 'No encontramos locales con esos filtros.' : 'No hay locales disponibles por el momento.'}
            message={hasFilters ? 'Prueba con otro nombre o selecciona una categoría distinta.' : undefined}
          />
        ) : null}
        {!state.loading && !state.error && locals.length ? (
          <div aria-busy={state.refreshing || undefined}>
            <LocalGrid locales={locals} className="locals-grid-reveal reveal" />
          </div>
        ) : null}
        <Pagination page={Math.min(page, Math.max(pageCount, 1))} pageCount={pageCount} onChange={(value) => update('pagina', value)} />
      </section>
    </div>
  );
}
