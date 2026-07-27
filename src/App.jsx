import { Route, Routes } from 'react-router';
import Layout from './components/layout/Layout';
import { ThemeProvider } from './theme/ThemeProvider';
import useRefreshInterval from './hooks/useRefreshInterval';
import Inicio from './pages/Inicio';
import QuienesSomos from './pages/QuienesSomos';
import Locales from './pages/Locales';
import LocalDetalle from './pages/LocalDetalle';
import Eventos from './pages/Eventos';
import EventoDetalle from './pages/EventoDetalle';
import Promociones from './pages/Promociones';
import PromocionDetalle from './pages/PromocionDetalle';
import Buses from './pages/Buses';
import BusDetalle from './pages/BusDetalle';
import ParqueosInquilinos from './pages/ParqueosInquilinos';
import Contacto from './pages/Contacto';
import NotFound from './pages/NotFound';

export default function App() {
  const refreshToken = useRefreshInterval(60000);

  return (
    <ThemeProvider refreshToken={refreshToken}>
      <Routes>
        <Route path="/" element={<Layout refreshToken={refreshToken} />}>
          <Route index element={<Inicio />} />
          <Route path="quienes-somos" element={<QuienesSomos />} />
          <Route path="locales" element={<Locales />} />
          <Route path="locales/:codigo" element={<LocalDetalle />} />
          <Route path="eventos" element={<Eventos />} />
          <Route path="eventos/:codigo" element={<EventoDetalle />} />
          <Route path="promociones" element={<Promociones />} />
          <Route path="promociones/:codigo" element={<PromocionDetalle />} />
          <Route path="buses" element={<Buses />} />
          <Route path="buses/:codigo" element={<BusDetalle />} />
          <Route path="parqueos-inquilinos" element={<ParqueosInquilinos />} />
          <Route path="contacto" element={<Contacto />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}
