// Encabezado de las páginas internas: una franja de una sola línea. El título
// y su bajada comparten renglón porque la navegación sticky ya indica la ruta
// activa; el encabezado solo la confirma y deja el primer viewport libre para
// el contenido.
export default function PageHero({ title, description, children }) {
  return (
    <header className="page-hero">
      <div className="container page-hero__inner">
        <div className="page-hero__copy">
          <h1 data-page-title tabIndex="-1">{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
        {children ? <div className="page-hero__utility">{children}</div> : null}
      </div>
    </header>
  );
}
