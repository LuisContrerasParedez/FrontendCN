import { Link } from 'react-router';
import Icon from '../ui/Icon';
import SmartLink from '../ui/SmartLink';

const NETWORKS = [
  { key: 'facebook', label: 'Facebook', icon: 'facebook', url: 'https://www.facebook.com/CentraNorteGT' },
  { key: 'tiktok', label: 'TikTok', icon: 'tiktok', url: 'https://www.tiktok.com/@centranortegt' },
  { key: 'instagram', label: 'Instagram', icon: 'instagram', url: 'https://instagram.com/centranortegt' }
];

const FACTURAS_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSf66DJ94PuZaOk_W2eAdKwa3CN2eKQK05JC8yZ29UwuBDlwsw/viewform';
const FACTURAS_LABEL = 'Carga tus facturas aquí';

export default function SiteFooter({ config = {} }) {
  return (
    <footer className="site-footer">
      <div className="footer-awning" aria-hidden="true">{Array.from({ length: 10 }, (_, index) => <i key={index} />)}</div>

      <div className="container footer-main">
        <div className="footer-brand">
          <Link className="footer-wordmark" to="/" aria-label="Centra Norte, ir al inicio"><b>Centra</b><span>Norte</span></Link>
          <p>Un lugar para comprar, compartir y seguir tu camino.</p>
          <div className="social-links" aria-label="Redes sociales de Centra Norte">
            {NETWORKS.map((network) => (
              <a key={network.key} href={network.url} target="_blank" rel="noreferrer noopener" aria-label={`${network.label} de Centra Norte`}>
                <Icon name={network.icon} size={18} />
              </a>
            ))}
          </div>
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
          <div className="footer-visit__heading">
            <span aria-hidden="true"><Icon name="mapPin" size={21} /></span>
            <h2 id="footer-visit-title">Prepara tu visita</h2>
          </div>

          {config.Direccion ? <address>{config.Direccion}</address> : null}

          {(config.HorarioSemana || config.HorarioDomingo) ? (
            <dl className="footer-visit__hours">
              {config.HorarioSemana ? <div><dt>Lunes a sábado</dt><dd>{config.HorarioSemana}</dd></div> : null}
              {config.HorarioDomingo ? <div><dt>Domingo</dt><dd>{config.HorarioDomingo}</dd></div> : null}
            </dl>
          ) : null}

          <Link className="footer-visit__link" to="/contacto">Ubicación y contacto <Icon name="arrow" size={17} /></Link>
        </section>
      </div>

      <div className="container footer-bottom">
        <SmartLink className="footer-cta" href={FACTURAS_URL} aria-label={FACTURAS_LABEL}>
          <Icon name="upload" size={18} />
          {FACTURAS_LABEL}
        </SmartLink>

        <div className="footer-legal">
          <p>© {new Date().getFullYear()} Centra Norte.</p>
          <p>Centro comercial y punto de transporte en Guatemala.</p>
        </div>
      </div>
    </footer>
  );
}
