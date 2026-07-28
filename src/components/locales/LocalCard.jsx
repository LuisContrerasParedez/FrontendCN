import { Link } from 'react-router';
import Icon from '../ui/Icon';
import ResponsiveImage from '../ui/ResponsiveImage';
import { safeUrl } from '../../utils/safeUrl';

export default function LocalCard({ local, headingLevel = 2, className = '', linkTabIndex }) {
  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  const image = safeUrl(local.ImagenUrl);

  return (
    <article className={`content-card local-card${className ? ` ${className}` : ''}`}>
      <Link className="content-card__link" to={'/locales/' + local.CodigoLocal} tabIndex={linkTabIndex}>
        <span className="content-card__media" aria-hidden="true">
          {image ? <ResponsiveImage src={image} alt="" className="content-card__image" sizes="(max-width: 680px) 100vw, (max-width: 1024px) 50vw, 33vw" fallbackIcon="shop" /> : <span className="media-fallback"><Icon name="shop" size={32} /></span>}
        </span>
        <span className="content-card__body">
          {local.Categoria ? <span className="card-kicker">{local.Categoria}</span> : null}
          <Heading>{local.Nombre}</Heading>
          {local.Ubicacion ? <span className="card-meta">{local.Ubicacion}</span> : null}
          <span className="text-link">Ver local <span aria-hidden="true">→</span></span>
        </span>
      </Link>
    </article>
  );
}
