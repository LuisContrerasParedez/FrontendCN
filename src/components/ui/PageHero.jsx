export default function PageHero({ eyebrow, title, description, children }) {
  return (
    <header className="page-hero page-hero--compact">
      <div className={`container page-hero__inner${children ? ' page-hero__inner--with-utility' : ''}`}>
        <div className="page-hero__copy">
          {eyebrow ? <p className="section-kicker">{eyebrow}</p> : null}
          <h1 data-page-title tabIndex="-1">{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
        {children ? <div className="page-hero__utility">{children}</div> : null}
      </div>
    </header>
  );
}
