import { useEffect, useMemo } from 'react';
import { useOutletContext, useSearchParams } from 'react-router';
import useApi from '../hooks/useApi';
import { obtenerLocales } from '../services/localesService';
import LocalGrid from '../components/locales/LocalGrid';
import PageHero from '../components/ui/PageHero';
import SearchField from '../components/ui/SearchField';
import CategoryFilter from '../components/ui/CategoryFilter';
import Pagination from '../components/ui/Pagination';
import Icon from '../components/ui/Icon';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/ContentStates';
import Seo from '../components/ui/Seo';

const PAGE_SIZE = 12;

export default function Locales() {
  const { refreshToken, config, pages } = useOutletContext();
  const [params, setParams] = useSearchParams();
  const state = useApi(() => obtenerLocales(), [refreshToken]);
  const pageContent = pages.find((page) => page.TipoPagina === 'LOCALES');
  const query = params.get('buscar') || '';
  const category = params.get('categoria') || 'todos';
  const page = Math.max(1, Number(params.get('pagina')) || 1);
  const locals = useMemo(() => state.data || [], [state.data]);
  const categories = useMemo(() => {
    const values = new Map();
    locals.forEach((local) => {
      if (local.CodigoCategoriaLocal && local.Categoria) values.set(String(local.CodigoCategoriaLocal), local.Categoria);
    });
    return [{ slug: 'todos', name: 'Todos' }, ...Array.from(values, ([slug, name]) => ({ slug, name }))];
  }, [locals]);
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('es');
    return locals.filter((local) => {
      const matchesCategory = category === 'todos' || String(local.CodigoCategoriaLocal) === category;
      const text = `${local.Nombre || ''} ${local.Categoria || ''} ${local.Descripcion || ''}`.toLocaleLowerCase('es');
      return matchesCategory && (!term || text.includes(term));
    });
  }, [locals, query, category]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((Math.min(page, pageCount) - 1) * PAGE_SIZE, Math.min(page, pageCount) * PAGE_SIZE);

  useEffect(() => {
    if (page > pageCount) {
      const next = new URLSearchParams(params);
      next.set('pagina', String(pageCount));
      setParams(next, { replace: true });
    }
  }, [page, pageCount, params, setParams]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'todos' || (key === 'pagina' && value === 1)) next.delete(key);
    else next.set(key, String(value));
    if (key !== 'pagina') next.delete('pagina');
    setParams(next);
  };

  return (
    <div className="page">
      <Seo title={pageContent?.MetaTitulo || 'Locales'} description={pageContent?.MetaDescripcion || pageContent?.Resumen} config={config} />
      <PageHero eyebrow="Directorio comercial" title={pageContent?.Titulo || 'Locales'} description={pageContent?.Resumen || 'Encuentra restaurantes, tiendas y servicios.'}>
        <div className="directory-hero-overview" aria-live="polite" aria-atomic="true">
          <span className="directory-hero-overview__icon" aria-hidden="true"><Icon name="shop" size={30} /></span>
          {state.loading ? (
            <p>Preparando el directorio…</p>
          ) : (
            <p>
              <strong>{locals.length} {locals.length === 1 ? 'local' : 'locales'}</strong>
            </p>
          )}
        </div>
      </PageHero>
      <section className="section container directory-section">
        <div className="directory-toolbar">
          <div className="directory-tools">
            <SearchField value={query} onChange={(value) => update('buscar', value)} label="Buscar local" placeholder="Buscar por nombre o categoría" />
            {!state.loading ? <p className="result-count" role="status" aria-live="polite" aria-atomic="true">{filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}</p> : null}
          </div>
          <CategoryFilter categories={categories} value={category} onChange={(value) => update('categoria', value)} />
        </div>
        {state.loading ? <LoadingState label="Cargando directorio" /> : null}
        {state.error ? <ErrorState message="No pudimos cargar el directorio en este momento." onRetry={state.refetch} /> : null}
        {!state.loading && !state.error && !filtered.length ? <EmptyState title="No encontramos locales con esos filtros." message="Prueba con otro nombre o selecciona una categoría distinta." /> : null}
        {!state.loading && !state.error && visible.length ? <LocalGrid locales={visible} /> : null}
        <Pagination page={Math.min(page, pageCount)} pageCount={pageCount} onChange={(value) => update('pagina', value)} />
      </section>
    </div>
  );
}
