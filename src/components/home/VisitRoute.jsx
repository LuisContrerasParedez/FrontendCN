import { Link } from 'react-router';
import Icon from '../ui/Icon';

// Vive fuera del hero para que cualquier portada pueda cerrarse con la misma
// ruta Comprar–Disfrutar–Viajar, sea cual sea el cartel de temporada.
const VISIT_STEPS = [
  {
    to: '/locales',
    label: 'Comprar',
    text: 'Tiendas, comida y servicios',
    icon: 'shop',
    tone: 'blue'
  },
  {
    to: '/eventos',
    label: 'Disfrutar',
    text: 'Actividades para compartir',
    icon: 'calendar',
    tone: 'coral'
  },
  {
    to: '/buses',
    label: 'Viajar',
    text: 'Rutas hacia tu próximo destino',
    icon: 'bus',
    tone: 'green'
  },
  {
    to: '/contacto',
    label: 'Visitar',
    text: 'Ubicación, horarios y contacto',
    icon: 'mapPin',
    tone: 'orange'
  }
];

export default function VisitRoute() {
  return (
    <nav className="container visit-route" aria-label="Formas de vivir Centra Norte">
      {VISIT_STEPS.map((step) => (
        <Link key={step.to} className={'visit-route__step visit-route__step--' + step.tone} to={step.to}>
          <span className="visit-route__icon" aria-hidden="true"><Icon name={step.icon} size={24} /></span>
          <span className="visit-route__copy">
            <strong>{step.label}</strong>
            <small>{step.text}</small>
          </span>
          {/* El enlace ya se nombra con «Comprar / Tiendas, comida y servicios»:
              la píldora repite la acción solo para la vista. */}
          <span className="visit-route__cta" aria-hidden="true">
            Ver Más
            <Icon className="visit-route__arrow" name="arrow" size={16} />
          </span>
        </Link>
      ))}
    </nav>
  );
}
