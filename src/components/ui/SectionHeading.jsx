import SmartLink from './SmartLink';

export default function SectionHeading({ eyebrow, title, description, href, linkLabel = 'Ver todos', action }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow ? <p className="section-kicker">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {/* La esquina admite un enlace fijo o un control propio de la sección
          (por ejemplo el "Ver más" que trae otra tanda del archivo). */}
      {action || (href ? <SmartLink className="text-link" href={href}>{linkLabel} <span aria-hidden="true">→</span></SmartLink> : null)}
    </div>
  );
}
