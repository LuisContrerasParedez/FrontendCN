import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router';
import { safeUrl } from '../../utils/safeUrl';
import ResponsiveImage from '../ui/ResponsiveImage';
import Icon from '../ui/Icon';
import MobileNavigation from './MobileNavigation';

const NAV_ITEMS = [
  { to: '/', label: 'Inicio', desktop: true },
  { to: '/locales', label: 'Locales', desktop: true },
  { to: '/eventos', label: 'Eventos', desktop: true },
  { to: '/promociones', label: 'Promociones', desktop: true },
  { to: '/buses', label: 'Buses', desktop: true },
  { to: '/parqueos-inquilinos', label: 'Parqueos inquilinos', desktop: true },
  { to: '/quienes-somos', label: 'Quiénes somos', desktop: true },
  { to: '/contacto', label: 'Contacto', desktop: false }
];

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
  const [scrolled, setScrolled] = useState(false);
  const [failedLogoUrl, setFailedLogoUrl] = useState('');
  const [loadedLogoUrl, setLoadedLogoUrl] = useState('');
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const logo = safeUrl(config.LogoUrl);
  const canLoadLogo = Boolean(logo) && failedLogoUrl !== logo;
  const logoLoaded = Boolean(logo) && loadedLogoUrl === logo;
  const closeMenu = () => {
    setOpen(false);
    window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  };

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
        setOpen(false);
        window.requestAnimationFrame(() => menuButtonRef.current?.focus());
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
                sizes="260px"
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
              onClick={() => setOpen(true)}
            >
              <Icon name="menu" size={25} />
            </button>
          </div>
        </div>
      </header>
      <div>
        <MobileNavigation
          open={open}
          items={NAV_ITEMS}
          onClose={closeMenu}
          onNavigate={() => setOpen(false)}
          closeButtonRef={closeButtonRef}
        />
      </div>
    </>
  );
}
