import { useState } from 'react';
import { Link } from 'react-router';
import { safeUrl } from '../../utils/safeUrl';
import Icon from '../ui/Icon';
import ResponsiveImage from '../ui/ResponsiveImage';
import SmartLink from '../ui/SmartLink';

const NETWORKS = [
  { key: 'facebook', label: 'Facebook', icon: 'facebook', url: 'https://www.facebook.com/CentraNorteGT' },
  { key: 'tiktok', label: 'TikTok', icon: 'tiktok', url: 'https://www.tiktok.com/@centranortegt' },
  { key: 'instagram', label: 'Instagram', icon: 'instagram', url: 'https://instagram.com/centranortegt' }
];

const FACTURAS_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSf66DJ94PuZaOk_W2eAdKwa3CN2eKQK05JC8yZ29UwuBDlwsw/viewform';
const FACTURAS_LABEL = 'Carga tus facturas aquí';

export default function SiteFooter({ config = {} }) {
  const [failedLogoUrl, setFailedLogoUrl] = useState('');
  const [loadedLogoUrl, setLoadedLogoUrl] = useState('');
  const logo = safeUrl(config.LogoUrl);
  const canLoadLogo = Boolean(logo) && failedLogoUrl !== logo;
  const logoLoaded = Boolean(logo) && loadedLogoUrl === logo;

  return (
    <footer className="site-footer">
      <div className="footer-awning" aria-hidden="true">{Array.from({ length: 10 }, (_, index) => <i key={index} />)}</div>

      <div className="container footer-main">
        <div className="footer-brand">
          <Link
            className="footer-brand__logo"
            to="/"
            aria-label={`${config.NombreSitio || 'Centra Norte'}, ir al inicio`}
          >
            {canLoadLogo ? (
              <ResponsiveImage
                src={logo}
                alt=""
                className={'footer-logo' + (logoLoaded ? ' is-loaded' : '')}
                sizes="196px"
                hideFallback
                onLoad={() => setLoadedLogoUrl(logo)}
                onLoadError={() => {
                  setFailedLogoUrl(logo);
                  setLoadedLogoUrl('');
                }}
              />
            ) : null}
            <span className={'footer-wordmark' + (logoLoaded ? ' is-hidden' : '')} aria-hidden="true">
              <b>Centra</b><span>Norte</span>
            </span>
          </Link>

          <div className="social-links" aria-label="Redes sociales de Centra Norte">
            {NETWORKS.map((network) => (
              <a key={network.key} href={network.url} target="_blank" rel="noreferrer noopener" aria-label={`${network.label} de Centra Norte`}>
                <Icon name={network.icon} size={17} />
              </a>
            ))}
          </div>

          <SmartLink className="footer-cta" href={FACTURAS_URL} aria-label={FACTURAS_LABEL}>
            <Icon name="upload" size={17} />
            {FACTURAS_LABEL}
          </SmartLink>
        </div>

        <nav className="footer-navigation" aria-label="Enlaces del pie de página">
          <div className="footer-links">
            <h2>Descubre</h2>
            <Link to="/locales">Locales</Link>
            <Link to="/promociones">Promociones</Link>
            <Link to="/eventos">Eventos</Link>
            <Link to="/buses">Rutas de bus</Link>
          </div>

          <div className="footer-links">
            <h2>Información</h2>
            <Link to="/quienes-somos">Quiénes somos</Link>
            <Link to="/contacto">Contacto</Link>
            <Link to="/parqueos-inquilinos">Parqueos para inquilinos</Link>
          </div>
        </nav>

        <section className="footer-visit" aria-labelledby="footer-visit-title">
          <h2 id="footer-visit-title">Prepara tu visita</h2>

          {config.Direccion ? (
            <address>
              <Icon name="mapPin" size={16} />
              <span>{config.Direccion}</span>
            </address>
          ) : null}

          {(config.HorarioSemana || config.HorarioDomingo) ? (
            <dl className="footer-visit__hours">
              {config.HorarioSemana ? <div><dt>Lunes a sábado</dt><dd>{config.HorarioSemana}</dd></div> : null}
              {config.HorarioDomingo ? <div><dt>Domingo</dt><dd>{config.HorarioDomingo}</dd></div> : null}
            </dl>
          ) : null}

          <Link className="footer-visit__link" to="/contacto">Ubicación y contacto <Icon name="arrow" size={16} /></Link>
        </section>
      </div>

      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} Centra Norte.</p>
        <p>Centro comercial y punto de transporte en Guatemala.</p>
      </div>
    </footer>
  );
}
