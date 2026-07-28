import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import Header from './Header';
import Footer from './Footer';
import { InitialLoadingScreen } from '../ui/ContentStates';
import useApi from '../../hooks/useApi';
import useScrollRestoration from '../../hooks/useScrollRestoration';
import { obtenerConfiguracion } from '../../services/configuracionService';
import { obtenerPaginas } from '../../services/paginasService';
import { useTheme } from '../../theme/ThemeProvider';

export default function Layout({ refreshToken }) {
  const location = useLocation();
  const themeState = useTheme();
  const configState = useApi(() => obtenerConfiguracion(), [refreshToken]);
  const pagesState = useApi(() => obtenerPaginas(), [refreshToken]);
  const config = configState.data || {};
  const [pageLoadState, setPageLoadState] = useState({
    path: location.pathname,
    loading: location.pathname === '/'
  });
  const [hasBooted, setHasBooted] = useState(false);
  const reportPageLoading = useCallback((loading) => {
    setPageLoadState({ path: location.pathname, loading: Boolean(loading) });
  }, [location.pathname]);
  const baseInitialLoading = themeState.loading
    || (configState.data === null && configState.loading)
    || (pagesState.data === null && pagesState.loading);
  const pageInitialLoading = pageLoadState.path === location.pathname
    ? pageLoadState.loading
    : location.pathname === '/';
  const bootLoading = baseInitialLoading || pageInitialLoading;

  const initialLoading = !hasBooted && bootLoading;

  useEffect(() => {
    if (!bootLoading) setHasBooted(true);
  }, [bootLoading]);

  useEffect(() => {
    document.body.classList.toggle('initial-load-is-active', initialLoading);
    return () => document.body.classList.remove('initial-load-is-active');
  }, [initialLoading]);

  /* Atrás y adelante devuelven a la posición de lectura; cambiar de ruta empieza
     arriba; cambiar solo los filtros del directorio no mueve nada. */
  useScrollRestoration(!initialLoading);

  useEffect(() => {
    let frameId;
    /* Solo se escribe cuando hay corrimiento real: asignar scrollLeft en cada
       evento de scroll cancelaba cualquier desplazamiento suave en curso
       (scroll-behavior: smooth, anclas, reencuadre de la paginación). */
    const resetHorizontalOffset = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        const root = document.documentElement;
        if (root.scrollLeft !== 0) root.scrollLeft = 0;
        if (document.body.scrollLeft !== 0) document.body.scrollLeft = 0;
        if (window.scrollX !== 0) {
          window.scrollTo({ top: window.scrollY, left: 0, behavior: 'auto' });
        }
      });
    };

    resetHorizontalOffset();
    window.addEventListener('resize', resetHorizontalOffset, { passive: true });
    window.addEventListener('orientationchange', resetHorizontalOffset, { passive: true });
    window.addEventListener('scroll', resetHorizontalOffset, { passive: true });
    window.visualViewport?.addEventListener('resize', resetHorizontalOffset, { passive: true });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resetHorizontalOffset);
      window.removeEventListener('orientationchange', resetHorizontalOffset);
      window.removeEventListener('scroll', resetHorizontalOffset);
      window.visualViewport?.removeEventListener('resize', resetHorizontalOffset);
    };
  }, []);

  return (
    <div className="site-shell" aria-busy={initialLoading || undefined}>
      {initialLoading ? <InitialLoadingScreen /> : null}
      <div
        className="site-shell__content"
        inert={initialLoading ? '' : undefined}
      >
        <Header config={config} />
        <main id="contenido-principal" className="site-main" tabIndex="-1">
          <div key={location.pathname} className="page-transition">
            <Outlet context={{
              refreshToken,
              config,
              configState,
              pages: pagesState.data || [],
              pagesState,
              theme: themeState.theme,
              themeState,
              reportPageLoading
            }} />
          </div>
        </main>
        <Footer config={config} />
      </div>
    </div>
  );
}
