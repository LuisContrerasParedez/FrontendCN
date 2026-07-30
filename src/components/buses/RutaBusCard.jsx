import { Link } from 'react-router';
import ResponsiveImage from '../ui/ResponsiveImage';
import Icon from '../ui/Icon';
import { safeUrl } from '../../utils/safeUrl';

export default function BusRouteCard({ route, headingLevel = 2 }) {
  const image = safeUrl(route.ImagenUrl);
  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  const destinations = Array.isArray(route.Destinos) ? route.Destinos : [];

  return (
    <article className="content-card bus-route-card">
      <Link className="content-card__link" to={'/buses/' + route.CodigoRutaBus}>
        <span className="content-card__media" aria-hidden="true">
          {image ? <ResponsiveImage src={image} alt="" className="content-card__image" sizes="(max-width: 680px) 100vw, (max-width: 1024px) 50vw, 33vw" fallbackIcon="bus" /> : <span className="media-fallback"><Icon name="bus" size={32} /><small>Ruta sin imagen</small></span>}
        </span>
        <span className="content-card__body">
          <Heading>{route.NombreRuta}</Heading>
          {destinations.length ? (
            <span className="bus-route-card__destinations">
              {destinations.map((destination) => destination.NombreDestino).filter(Boolean).join(' · ')}
            </span>
          ) : null}
        </span>
      </Link>
    </article>
  );
}
