import ResponsiveImage from '../ui/ResponsiveImage';
import Icon from '../ui/Icon';
import { safeUrl } from '../../utils/safeUrl';

const DEFAULT_TITLE = 'Gasta más de Q200 y participa por premios especiales';

const participationSteps = [
  {
    icon: 'receipt',
    title: 'Registra tus facturas',
    description: 'Registra tus facturas en el kiosco de información. Por cada Q200.00 acumulados, podrás ganar premios instantáneos.'
  },
  {
    icon: 'star',
    title: 'Participa en la dinámica',
    description: 'Registra tus facturas con un monto mínimo de Q200.'
  },
  {
    icon: 'gift',
    title: 'Gana premios instantáneos y más'
  }
];

export default function PromotionParticipation({ promotion, headingLevel = 2 }) {
  const Title = headingLevel === 1 ? 'h1' : 'h2';
  const StepsTitle = headingLevel === 1 ? 'h2' : 'h3';
  const StepTitle = headingLevel === 1 ? 'h3' : 'h4';
  const image = safeUrl(promotion?.ImagenPrincipalUrl);
  const title = promotion?.Titulo || DEFAULT_TITLE;

  return (
    <section className={`promotion-participation${image ? ' promotion-participation--with-image' : ''}`} aria-labelledby="promotion-participation-title">
      <header className="promotion-participation__hero">
        <div className="promotion-participation__copy">
          <p className="promotion-participation__eyebrow">¡Regístrate, participa y gana!</p>
          {promotion?.NombreLocal ? <p className="promotion-participation__brand">{promotion.NombreLocal}</p> : null}
          <Title id="promotion-participation-title">{title}</Title>
        </div>
        {image ? (
          <div className="promotion-participation__media">
            <ResponsiveImage
              src={image}
              alt={`Imagen de la promoción ${title}`}
              className="promotion-participation__image"
              sizes="(max-width: 859px) 100vw, 42vw"
              fallbackIcon="gift"
            />
          </div>
        ) : (
          <div className="promotion-participation__amount" aria-hidden="true">
            <span>Q</span>200
          </div>
        )}
      </header>

      <p className="promotion-participation__callout">Registra tus facturas en el kiosco de información y participa</p>

      <div className="promotion-participation__steps">
        <StepsTitle>¿Cómo participar?</StepsTitle>
        <ol>
          {participationSteps.map((step) => (
            <li key={step.title}>
              <span className="promotion-participation__step-icon" aria-hidden="true"><Icon name={step.icon} size={32} /></span>
              <div>
                <StepTitle>{step.title}</StepTitle>
                {step.description ? <p>{step.description}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
