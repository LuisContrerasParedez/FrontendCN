import { useOutletContext } from 'react-router';
import PageHero from '../components/ui/PageHero';
import Seo from '../components/ui/Seo';
import Icon from '../components/ui/Icon';

const AMENITIES = [
  { icon: 'wifi', label: 'Wifi gratis' },
  { icon: 'shield', label: 'Seguridad' },
  { icon: 'mapPin', label: 'Accesibilidad' },
  { icon: 'bus', label: 'Central de transbordo' },
  { icon: 'coffee', label: 'Área de restaurantes' }
];

export default function QuienesSomos() {
  const { config, pages } = useOutletContext();
  const content = pages.find((page) => page.TipoPagina === 'QUIENES_SOMOS');

  return (
    <div className="page about-page">
      <Seo title={content?.MetaTitulo || 'Quiénes somos'} description={content?.MetaDescripcion || content?.Resumen} image={content?.ImagenPortadaUrl} config={config} />
      <PageHero eyebrow="Centra Norte" title={content?.Titulo || 'Quiénes somos'} description={content?.Resumen || 'Un punto de encuentro para compras, servicios y transporte.'} />

      <section className="section about-section" aria-labelledby="about-title">
        <div className="container">
          <div className="about-board">
            <header className="about-board__header">
              <p>Centra Norte es</p>
              <h2 id="about-title">¡El Mall donde grandes cosas pasan!</h2>
            </header>

            <div className="about-board__story">
              <h3>¿Quiénes somos?</h3>
              <div className="about-board__copy">
                <p>Centra Norte es un centro comercial único en Guatemala, con una gran variedad de locales y una Central de Transbordo donde operan más de 37 rutas de buses. Estas conectan la ruta al Atlántico con las zonas 1 y 4, además de rutas desde y hacia el nororiente del país.</p>
                <p>Nuestros espacios reúnen moda, gastronomía, conveniencia y entretenimiento para crear experiencias que sorprenden a niños, jóvenes y adultos de manera constante.</p>
              </div>
            </div>

            <div className="about-board__purpose">
              <article>
                <h3>Misión</h3>
                <p>Ofrecer atención y servicio de excelencia mediante la innovación permanente, amplias alternativas comerciales y entretenimiento familiar, con altos estándares de calidad, limpieza, seguridad y comodidad.</p>
              </article>
              <article>
                <h3>Visión</h3>
                <p>Ser el mejor centro comercial y central de transbordo de Guatemala, donde se vivan experiencias únicas que eleven la calidad de vida de nuestros clientes con las mejores marcas, productos y servicios.</p>
              </article>
            </div>

            <div className="about-board__facilities">
              <div className="about-board__facilities-copy">
                <h3>Nuestras instalaciones</h3>
                <p>Más de 180 locales comerciales y más de 800 espacios de parqueo para autos y motos hacen que comprar, comer, resolver y disfrutar sea más fácil.</p>
              </div>

              <ul className="about-board__amenities" aria-label="Servicios disponibles en Centra Norte">
                {AMENITIES.map((amenity) => (
                  <li key={amenity.label}>
                    <Icon name={amenity.icon} size={38} aria-hidden="true" />
                    <strong>{amenity.label}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
