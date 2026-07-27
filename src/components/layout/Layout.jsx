import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import Header from './Header';
import Footer from './Footer';
import { InitialLoadingScreen } from '../ui/ContentStates';
import useApi from '../../hooks/useApi';
import { obtenerConfiguracion } from '../../services/configuracionService';
import { obtenerPaginas } from '../../services/paginasService';
import { useTheme } from '../../theme/ThemeProvider';

export default function Layout({ refreshToken }) {
  const location = useLocation();
  const routeKey = `${location.pathname}${location.search}`;
  const themeState = useTheme();
  const configState = useApi(() => obtenerConfiguracion(), [refreshToken]);
  const pagesState = useApi(() => obtenerPaginas(), [refreshToken]);
  const config = configState.data || {};
  const previousRoute = useRef(routeKey);
  const pendingScrollReset = useRef(false);
  const [pageLoadState, setPageLoadState] = useState({
    path: location.pathname,
    loading: location.pathname === '/'
  });
  const reportPageLoading = useCallback((loading) => {
    setPageLoadState({ path: location.pathname, loading: Boolean(loading) });
  }, [location.pathname]);
  const baseInitialLoading = themeState.loading
    || (configState.data === null && configState.loading)
    || (pagesState.data === null && pagesState.loading);
  const pageInitialLoading = pageLoadState.path === location.pathname
    ? pageLoadState.loading
    : location.pathname === '/';
  const initialLoading = baseInitialLoading || pageInitialLoading;

  useEffect(() => {
    document.body.classList.toggle('initial-load-is-active', initialLoading);
    return () => document.body.classList.remove('initial-load-is-active');
  }, [initialLoading]);

  const resetPageScroll = useCallback(() => {
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    root.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    root.style.scrollBehavior = previousBehavior;
  }, []);

  useEffect(() => {
    if (!('scrollRestoration' in window.history)) return undefined;
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    resetPageScroll();
    pendingScrollReset.current = true;

    if (previousRoute.current === routeKey) {
      return undefined;
    }
    previousRoute.current = routeKey;

    let secondFrame;
    const firstFrame = window.requestAnimationFrame(() => {
      resetPageScroll();
      const main = document.getElementById('contenido-principal');
      const title = main?.querySelector('[data-page-title], h1');
      const target = title || main;
      if (target && !target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target?.focus({ preventScroll: true });
      secondFrame = window.requestAnimationFrame(resetPageScroll);
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [resetPageScroll, routeKey]);

  useEffect(() => {
    if (initialLoading || !pendingScrollReset.current) return undefined;

    let secondFrame;
    const firstFrame = window.requestAnimationFrame(() => {
      resetPageScroll();
      secondFrame = window.requestAnimationFrame(() => {
        resetPageScroll();
        pendingScrollReset.current = false;
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [initialLoading, resetPageScroll, routeKey]);

  useEffect(() => {
    let frameId;
    const resetHorizontalOffset = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        document.documentElement.scrollLeft = 0;
        document.body.scrollLeft = 0;
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
        aria-hidden={initialLoading || undefined}
        inert={initialLoading ? '' : undefined}
      >
        <Header config={config} />
        <main id="contenido-principal" className="site-main" tabIndex="-1">
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
        </main>
        <Footer config={config} />
      </div>
    </div>
  );
}
