import { NavLink } from 'react-router';
import Icon from '../ui/Icon';
import ResponsiveImage from '../ui/ResponsiveImage';
import SmartLink from '../ui/SmartLink';
import { FACTURAS_LABEL, FACTURAS_URL, NETWORKS } from './siteLinks';

export default function MobileNavigation({
  open,
  closing = false,
  items,
  onClose,
  onNavigate,
  closeButtonRef,
  logoUrl = '',
  logoReady = false
}) {
  if (!open) return null;

  const state = closing ? ' is-closing' : '';
  /* El emblema solo se pinta cuando la cabecera ya lo descargó: así entra desde
     la caché sin destello y la palabra de respaldo cubre el caso sin logo. */
  const showLogo = Boolean(logoUrl) && logoReady;

  return (
    <>
      <button
        className={'nav-backdrop' + state}
        type="button"
        tabIndex="-1"
        aria-label="Cerrar menú"
        onClick={onClose}
      />
      <div
        id="mobile-navigation"
        className={'mobile-navigation' + state}
        role="dialog"
        aria-modal="true"
        aria-label="Menú principal"
      >
        <div className="mobile-navigation__awning" aria-hidden="true">
          {Array.from({ length: 12 }, (_, index) => <i key={index} />)}
        </div>

        <div className="mobile-navigation__head">
          <span className="mobile-navigation__brand">
            {showLogo ? (
              <ResponsiveImage
                src={logoUrl}
                alt=""
                className="mobile-navigation__logo"
                sizes="140px"
                hideFallback
              />
            ) : (
              <span className="mobile-navigation__wordmark" aria-hidden="true">
                <b>Centra</b><span>Norte</span>
              </span>
            )}
          </span>

          <button
            ref={closeButtonRef}
            className="mobile-navigation__close"
            type="button"
            aria-label="Cerrar menú"
            onClick={onClose}
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <nav aria-label="Navegación móvil">
          <p className="mobile-navigation__kicker">Explora</p>
          {items.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onNavigate}
              style={{ '--stagger': index + 1 }}
            >
              <span className="mobile-navigation__icon"><Icon name={item.icon} size={19} /></span>
              <span className="mobile-navigation__label">{item.label}</span>
              <Icon name="chevronRight" size={18} className="mobile-navigation__chevron" />
            </NavLink>
          ))}
        </nav>

        <div className="mobile-navigation__foot">
          <SmartLink className="mobile-navigation__cta" href={FACTURAS_URL} onClick={onNavigate}>
            <Icon name="upload" size={17} />
            {FACTURAS_LABEL}
          </SmartLink>

          <div className="mobile-navigation__social">
            <p className="mobile-navigation__kicker">Síguenos</p>
            <div className="social-links" aria-label="Redes sociales de Centra Norte">
              {NETWORKS.map((network) => (
                <a
                  key={network.key}
                  href={network.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`${network.label} de Centra Norte`}
                >
                  <Icon name={network.icon} size={17} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
