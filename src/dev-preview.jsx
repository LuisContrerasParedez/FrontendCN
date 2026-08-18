/*
 * Página de previsualización, solo para desarrollo.
 *
 * Monta el hero de la temática de septiembre suelto, sin pasar por la portada
 * ni por el backend, para poder verlo sin depender de qué temática esté activa
 * en la BD ni de que el web service esté levantado.
 *
 * Se abre en http://localhost:5173/preview.html con `npm run dev`.
 * No entra en el build de producción: Vite solo empaqueta `index.html`.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import HeroIndependencia from './components/home/temas/septiembre/HeroIndependencia';
import './styles/fonts.css';
import './styles/variables.css';
import './styles/global.css';
import './styles/responsive.css';
import './styles/motion.css';

// Las mismas cinco que trae el hero por defecto; cámbialas aquí para probar
// otras, o pasa `fechas={[]}` para ver el tendido sin ningún dato colgado.
const FECHAS = ['1 SEP', '8 SEP', '15 SEP', '22 SEP', '29 SEP'];

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <HeroIndependencia fechas={FECHAS} />
    </BrowserRouter>
  </React.StrictMode>
);
