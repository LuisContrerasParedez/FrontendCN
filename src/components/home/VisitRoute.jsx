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
  }
];

export default function VisitRoute() {
  return (
    <nav className="container visit-route" aria-label="Tres formas de vivir Centra Norte">
      {VISIT_STEPS.map((step, index) => (
        <Link key={step.to} className={'visit-route__step visit-route__step--' + step.tone} to={step.to}>
          <span className="visit-route__number" aria-hidden="true">{index + 1}</span>
          <span className="visit-route__icon" aria-hidden="true"><Icon name={step.icon} size={24} /></span>
          <span className="visit-route__copy">
            <strong>{step.label}</strong>
            <small>{step.text}</small>
          </span>
          <Icon className="visit-route__arrow" name="arrow" size={20} />
        </Link>
      ))}
    </nav>
  );
}
