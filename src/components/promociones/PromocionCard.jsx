import { Link } from 'react-router';
import ResponsiveImage from '../ui/ResponsiveImage';
import Icon from '../ui/Icon';
import { safeUrl } from '../../utils/safeUrl';

function formatValidity(start, end) {
  const format = (value) => {
    const rawValue = String(value);
    const datePart = rawValue.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
    const date = new Date(datePart ? `${datePart}T12:00:00` : rawValue);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('es-GT', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  };
  if (start && end) return `Del ${format(start)} al ${format(end)}`;
  if (end) return `Vigente hasta el ${format(end)}`;
  if (start) return `Vigente desde el ${format(start)}`;
  return '';
}

export default function PromotionCard({ promotion, headingLevel = 2 }) {
  const image = safeUrl(promotion.ImagenPrincipalUrl);
  const validity = formatValidity(promotion.FechaInicio, promotion.FechaFin);
  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  return (
    <article className="content-card promotion-card">
      <Link className="content-card__link" to={'/promociones/' + promotion.CodigoPromocion}>
        <span className="content-card__media" aria-hidden="true">
          {image ? <ResponsiveImage src={image} alt="" className="content-card__image" sizes="(max-width: 680px) 100vw, (max-width: 1024px) 50vw, 33vw" fallbackIcon="shop" /> : <span className="media-fallback"><Icon name="shop" size={32} /><small>Promoción sin imagen</small></span>}
        </span>
        <span className="content-card__body">
          {promotion.NombreLocal ? <span className="card-kicker">{promotion.NombreLocal}</span> : null}
          <Heading>{promotion.Titulo}</Heading>
          {promotion.Resumen ? <span className="card-summary">{promotion.Resumen}</span> : null}
          {validity ? <span className="card-meta">{validity}</span> : null}
          <span className="text-link">Ver promoción <span aria-hidden="true">→</span></span>
        </span>
      </Link>
    </article>
  );
}
