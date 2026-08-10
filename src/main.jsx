import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App';
import './styles/fonts.css';
import './styles/variables.css';
import './styles/global.css';
import './styles/responsive.css';
import './styles/motion.css';

// El HTML servido trae un encabezado estatico (h1 y texto) para que el
// rastreador reciba contenido en la primera respuesta, antes de ejecutar este
// bundle. Se retira aqui, justo antes de montar React, que dibuja el encabezado
// real con los datos de la API.
document.getElementById('seo-fallback')?.remove();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
