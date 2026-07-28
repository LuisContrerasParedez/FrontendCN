import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router';
import { safeUrl } from '../../utils/safeUrl';
import ResponsiveImage from '../ui/ResponsiveImage';
import Icon from '../ui/Icon';
import MobileNavigation from './MobileNavigation';

const NAV_ITEMS = [
  { to: '/', label: 'Inicio', icon: 'home', desktop: true },
  { to: '/locales', label: 'Locales', icon: 'shop', desktop: true },
  { to: '/eventos', label: 'Eventos', icon: 'calendar', desktop: true },
  { to: '/promociones', label: 'Promociones', icon: 'gift', desktop: true },
  { to: '/buses', label: 'Buses', icon: 'bus', desktop: true },
  { to: '/parqueos-inquilinos', label: 'Parqueos inquilinos', icon: 'car', desktop: true },
  { to: '/quienes-somos', label: 'Quiénes somos', icon: 'heart', desktop: true },
  { to: '/contacto', label: 'Contacto', icon: 'phone', desktop: false }
];

/* El cajón se desmonta al cerrarse, así que la salida necesita mantenerlo en el
   DOM mientras corre la animación. Debe coincidir con drawer-out en motion.css. */
const CLOSE_ANIMATION_MS = 220;

function BrandFallback({ hidden = false }) {
  return (
    <span className={'brand-fallback' + (hidden ? ' is-hidden' : '')} aria-hidden="true">
      <span className="brand-wordmark"><b>Centra</b><span>Norte</span></span>
      <span className="brand-symbol"><i /><i /><i /><i /></span>
    </span>
  );
}

export default function SiteHeader({ config = {} }) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [failedLogoUrl, setFailedLogoUrl] = useState('');
  const [loadedLogoUrl, setLoadedLogoUrl] = useState('');
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const closeTimerRef = useRef(0);
  const logo = safeUrl(config.LogoUrl);
  const canLoadLogo = Boolean(logo) && failedLogoUrl !== logo;
  const logoLoaded = Boolean(logo) && loadedLogoUrl === logo;

  const dismissMenu = (restoreFocus) => {
    if (closeTimerRef.current) return;
    const finish = () => {
      closeTimerRef.current = 0;
      setClosing(false);
      setOpen(false);
      if (restoreFocus) window.requestAnimationFrame(() => menuButtonRef.current?.focus());
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }

    setClosing(true);
    closeTimerRef.current = window.setTimeout(finish, CLOSE_ANIMATION_MS);
  };

  const closeMenu = () => dismissMenu(true);
  /* Al navegar el foco lo toma la página nueva: devolverlo al botón lo robaría. */
  const navigateAndClose = () => dismissMenu(false);
  /* El manejador global de Escape se registra una sola vez por apertura; leer el
     cierre desde una ref evita volver a montar ese efecto en cada render. */
  const closeMenuRef = useRef(null);

  useEffect(() => { closeMenuRef.current = closeMenu; });

  useEffect(() => () => window.clearTimeout(closeTimerRef.current), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-is-open', open);
    const backgroundNodes = [
      document.querySelector('.site-header'),
      document.querySelector('.site-main'),
      document.querySelector('.site-footer')
    ].filter(Boolean);
    backgroundNodes.forEach((node) => { node.inert = open; });

    if (open) closeButtonRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && open) {
        closeMenuRef.current();
        return;
      }

      if (event.key === 'Tab' && open) {
        const focusable = Array.from(document.querySelectorAll(
          '#mobile-navigation button, #mobile-navigation a'
        )).filter((element) => !element.hasAttribute('disabled'));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.classList.remove('menu-is-open');
      backgroundNodes.forEach((node) => { node.inert = false; });
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <>
      <a className="skip-link" href="#contenido-principal">Ir al contenido principal</a>
      <header className={'site-header' + (scrolled ? ' is-scrolled' : '')}>
        <div className="site-header__fair-line" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="container header-main">
          <Link className="brand" to="/" aria-label="Centra Norte, ir al inicio">
            {canLoadLogo ? (
              <ResponsiveImage
                src={logo}
                alt={config.NombreSitio || 'Centra Norte'}
                className={'brand-logo' + (logoLoaded ? ' is-loaded' : '')}
                sizes="268px"
                eager
                hideFallback
                onLoad={() => setLoadedLogoUrl(logo)}
                onLoadError={() => {
                  setFailedLogoUrl(logo);
                  setLoadedLogoUrl('');
                }}
              />
            ) : null}
            <BrandFallback hidden={logoLoaded} />
          </Link>

          <nav className="desktop-navigation" aria-label="Navegación principal">
            {NAV_ITEMS.filter((item) => item.desktop).map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}>{item.label}</NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <Link className="header-visit-link" to="/contacto">
              <Icon name="mapPin" size={17} />
              <span>Visítanos</span>
            </Link>
            <button
              ref={menuButtonRef}
              className="menu-toggle"
              type="button"
              aria-expanded={open}
              aria-controls="mobile-navigation"
              aria-label="Abrir menú"
              onClick={() => {
                window.clearTimeout(closeTimerRef.current);
                closeTimerRef.current = 0;
                setClosing(false);
                setOpen(true);
              }}
            >
              <Icon name="menu" size={25} />
            </button>
          </div>
        </div>
      </header>
      <div>
        <MobileNavigation
          open={open}
          closing={closing}
          items={NAV_ITEMS}
          onClose={closeMenu}
          onNavigate={navigateAndClose}
          closeButtonRef={closeButtonRef}
          logoUrl={canLoadLogo ? logo : ''}
          logoReady={logoLoaded}
        />
      </div>
    </>
  );
}
