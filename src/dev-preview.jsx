/*
 * Página de previsualización, solo para desarrollo.
 *
 * Monta un hero de temática suelto, sin pasar por la portada ni por el backend,
 * para poder verlo sin depender de qué temática esté activa en la BD ni de que
 * el web service esté levantado.
 *
 * Se abre en http://localhost:5173/preview.html con `npm run dev`. La temática
 * se elige por query string:
 *
 *   /preview.html                    -> institucional (la de respaldo)
 *   /preview.html?tema=septiembre    -> mes patrio
 *   /preview.html?tema=feria         -> feria de agosto
 *
 * Y la franja horaria de la institucional se puede forzar sin cambiar el reloj
 * del equipo, que es lo único que la hace variar:
 *
 *   /preview.html?franja=dia|tarde|noche
 *
 * No entra en el build de producción: Vite solo empaqueta `index.html`.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import HeroTematico from './components/home/temas/HeroTematico';
import './styles/fonts.css';
import './styles/variables.css';
import './styles/global.css';
import './styles/responsive.css';
import './styles/motion.css';

const parametros = new URLSearchParams(window.location.search);
const tema = parametros.get('tema') || 'institucional';
const franja = parametros.get('franja');

// Las mismas cinco que trae la feria por defecto; cámbialas aquí para probar
// otras, o pasa `fechas={[]}` para ver el tendido sin ningún dato colgado.
const FECHAS = ['1 SEP', '8 SEP', '15 SEP', '22 SEP', '29 SEP'];

/* La franja forzada se aplica pisando la clase que el propio hero se pone: es
   una utilidad de previsualización, no un modo que deba existir en la portada,
   así que no se le añade una prop al componente por esto. */
if (franja) {
  // El hero se repone su propia clase cada vez que React vuelve a renderizar,
  // así que no basta con escribirla una vez: hay que reescribirla cuando pase.
  const observador = new window.MutationObserver(() => {
    document.querySelectorAll('.instHero').forEach((nodo) => {
      nodo.classList.remove('instHero--dia', 'instHero--tarde', 'instHero--noche');
      nodo.classList.add(`instHero--${franja}`);
    });
  });
  observador.observe(document.documentElement, { childList: true, subtree: true });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <HeroTematico clave={tema} fechas={FECHAS} />
    </BrowserRouter>
  </React.StrictMode>
);
