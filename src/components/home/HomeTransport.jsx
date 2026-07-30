import { Link } from 'react-router';
import ResponsiveImage from '../ui/ResponsiveImage';
import Icon from '../ui/Icon';
import { safeUrl } from '../../utils/safeUrl';

// El relato manda y un mosaico de destinos lo acompaña. Las fichas van sin
// rótulo a la vista para que el bloque se lea como una postal del viaje y no
// como otra retícula de tarjetas; el destino sigue en el DOM y solo se enciende
// al pasar el cursor, así que el enlace nunca queda sin nombre accesible.
//
// Solo se usan repartos que llenan todas sus celdas, así que el mosaico nunca
// deja un hueco por más o menos rutas que publique el CMS. `columns` es el
// número de pistas de la retícula y `narrow` el mismo reparto resuelto para
// pantallas angostas, donde tres columnas dejarían las fichas del tamaño de un
// sello. `max` limita el ancho en rem para que una sola ruta no se convierta en
// un cartel.
//
// Cinco es primo: no hay retícula uniforme que lo cuadre. Lleva su propio
// patrón de anchos —tres arriba y dos abajo sobre seis pistas— y ese es el caso
// real de la central, con Zacapa, El Progreso, las Verapaces y Jalapa.
const TILE_LAYOUTS = [
  { count: 6, columns: 3, narrow: 2, max: 90 },
  { count: 5, columns: 6, narrow: 2, max: 90, pattern: 'cinco' },
  { count: 4, columns: 2, narrow: 2, max: 60 },
  { count: 3, columns: 3, narrow: 3, max: 90 },
  { count: 2, columns: 2, narrow: 2, max: 60 },
  { count: 1, columns: 1, narrow: 1, max: 30 }
];

const LOADING_LAYOUT = TILE_LAYOUTS.find((option) => option.count === 5);

export default function HomeTransport({ routes = [], loading = false }) {
  // Solo entran rutas con foto: una ficha sin imagen rompería el mosaico.
  const illustrated = routes.filter((route) => safeUrl(route.ImagenUrl));
  const layout = TILE_LAYOUTS.find((option) => option.count <= illustrated.length);

  // Sin una sola ruta ilustrada no hay mosaico y la sección no sale.
  if (!loading && !layout) return null;

  const tiles = layout ? illustrated.slice(0, layout.count) : [];
  const { columns, narrow, count, max, pattern } = layout || LOADING_LAYOUT;

  return (
    <section className="home-transport reveal" aria-labelledby="home-transport-title">
      <div className="container home-transport__inner">
        <div className="home-transport__copy">
          <p className="section-kicker">Central de transbordo</p>
          <h2 id="home-transport-title">Tu ruta al nororiente sale de aquí</h2>
          <p className="home-transport__lead">
            Más de 37 rutas de bus operan en nuestra central de transbordo, sobre la ruta al
            Atlántico, y conectan las zonas 1 y 4 de la capital con el nororiente del país.
          </p>

          <Link className="text-link home-transport__cta" to="/buses">
            Ver todas las rutas <span aria-hidden="true">→</span>
          </Link>
        </div>

        <ul
          className="home-transport__grid"
          data-pattern={pattern}
          style={{
            '--transport-columns': columns,
            '--transport-columns-narrow': narrow,
            '--transport-max': max
          }}
          aria-busy={loading || undefined}
        >
          {tiles.length === 0
            ? Array.from({ length: count }, (_, index) => (
                <li key={index} aria-hidden="true">
                  <span className="home-transport__tile home-transport__tile--loading" />
                </li>
              ))
            : tiles.map((route) => (
                <li key={route.CodigoRutaBus}>
                  <Link
                    className="home-transport__tile"
                    to={'/buses/' + encodeURIComponent(String(route.CodigoRutaBus))}
                  >
                    <ResponsiveImage
                      src={route.ImagenUrl}
                      alt=""
                      className="home-transport__image"
                      sizes="(max-width: 899px) 46vw, 24vw"
                      fallbackIcon="bus"
                      fallbackLabel="Ruta sin imagen"
                    />
                    <span className="home-transport__shade" aria-hidden="true" />
                    <span className="home-transport__label">
                      <span>{route.NombreRuta}</span>
                      <Icon name="arrowUpRight" size={16} />
                    </span>
                  </Link>
                </li>
              ))}
        </ul>
      </div>
    </section>
  );
}
