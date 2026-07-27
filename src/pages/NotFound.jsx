import { Link, useOutletContext } from 'react-router';
import Seo from '../components/ui/Seo';

export default function NotFound() {
  const { config } = useOutletContext();
  return (
    <section className="not-found container">
      <Seo title="Página no encontrada" description="La página solicitada no está disponible." config={config} noIndex />
      <p className="eyebrow">Error 404</p>
      <h1>Esta página no está disponible.</h1>
      <p>Revisa la dirección o vuelve al inicio para continuar navegando.</p>
      <Link className="button button--primary" to="/">Volver al inicio</Link>
    </section>
  );
}
