import SmartLink from './SmartLink';

export default function SectionHeading({ eyebrow, title, description, href, linkLabel = 'Ver todos' }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow ? <p className="section-kicker">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {href ? <SmartLink className="text-link" href={href}>{linkLabel} <span aria-hidden="true">→</span></SmartLink> : null}
    </div>
  );
}
