import { useState } from 'react';
import { useOutletContext } from 'react-router';
import useApi from '../hooks/useApi';
import { obtenerFormularios } from '../services/formulariosService';
import PageHero from '../components/ui/PageHero';
import SmartLink from '../components/ui/SmartLink';
import Icon from '../components/ui/Icon';
import { ErrorState, LoadingState } from '../components/ui/ContentStates';
import Seo from '../components/ui/Seo';
import useReveal from '../hooks/useReveal';
import ContactForm from '../components/contacto/ContactForm';

const FALLBACK_ADDRESS = 'Km 8.5 Carretera al Atlántico, 40-26 zona 17, Guatemala';

export default function Contacto() {
  const [mapResetKey, setMapResetKey] = useState(0);
  const { refreshToken, config, configState, pages } = useOutletContext();
  const forms = useApi(() => obtenerFormularios({ tipo: 'CONTACTO' }), [refreshToken]);
  const content = pages.find((page) => page.TipoPagina === 'CONTACTO');
  const phone = String(config.Telefono || '').replace(/[^\d+]/g, '');
  const whatsapp = String(config.WhatsApp || '').replace(/\D/g, '');
  const address = config.Direccion || FALLBACK_ADDRESS;
  const destination = encodeURIComponent(`Centra Norte, ${address}`);
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving&dir_action=navigate`;
  const wazeUrl = `https://www.waze.com/ul?q=${destination}&navigate=yes&utm_source=centranorte_web`;
  const mapEmbedUrl = `https://maps.google.com/maps?q=${destination}&z=16&output=embed`;
  useReveal([configState.loading, forms.data]);

  return (
    <div className="page motion-page contact-page">
      <Seo title={content?.MetaTitulo || 'Contacto'} description={content?.MetaDescripcion || content?.Resumen} config={config} />
      <PageHero eyebrow="Visítanos" title={content?.Titulo || 'Contacto'} description={content?.Resumen || 'Encuentra nuestra ubicación y canales de contacto.'} />
      <section className="section container contact-layout">
        <div className="contact-copy motion-panel reveal">
          <p className="eyebrow">Información de visita</p>
          <h2>Encuentra Centra Norte</h2>
          {configState.loading ? <LoadingState label="Cargando información de contacto" /> : null}
          {configState.error ? <ErrorState message="No pudimos actualizar la información de contacto." onRetry={configState.refetch} /> : null}
          <dl className="contact-list">
            {config.Direccion ? <div><dt>Dirección</dt><dd>{config.Direccion}</dd></div> : null}
            {config.Telefono ? <div><dt>Teléfono</dt><dd><a href={`tel:${phone}`}>{config.Telefono}</a></dd></div> : null}
            {config.CorreoContacto ? <div><dt>Correo</dt><dd><a href={`mailto:${config.CorreoContacto}`}>{config.CorreoContacto}</a></dd></div> : null}
            {config.HorarioSemana ? <div><dt>Lunes a sábado</dt><dd>{config.HorarioSemana}</dd></div> : null}
            {config.HorarioDomingo ? <div><dt>Domingo</dt><dd>{config.HorarioDomingo}</dd></div> : null}
            {config.HorarioEspecial ? <div><dt>Horario especial</dt><dd>{config.HorarioEspecial}</dd></div> : null}
          </dl>
          <ContactForm />
          <div className="contact-actions">
            {whatsapp ? <a className="button button--outline" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer noopener">Escribir por WhatsApp</a> : null}
          </div>
        </div>
        <section className="contact-map-card motion-panel reveal" aria-labelledby="contact-map-title">
          <div className="contact-map-card__map">
            <iframe
              key={mapResetKey}
              title="Mapa de la ubicación de Centra Norte en Google Maps"
              src={mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <button
              className="contact-map-card__recenter"
              type="button"
              onClick={() => setMapResetKey((currentKey) => currentKey + 1)}
              aria-label="Volver a centrar el mapa en la ubicación exacta de Centra Norte"
            >
              <Icon name="mapPin" size={18} strokeWidth={2} />
              <span>Ubicación exacta</span>
            </button>
          </div>
          <div className="contact-map-card__body">
            <div>
              <h3 id="contact-map-title">Centra Norte</h3>
              <p>{address}</p>
            </div>
            <nav className="contact-map-card__actions" aria-label="Abrir indicaciones para llegar">
              <SmartLink className="button button--primary" href={googleMapsUrl}>
                <Icon name="mapPin" size={19} /> Google Maps
              </SmartLink>
              <SmartLink className="button button--waze" href={wazeUrl}>
                <Icon name="car" size={20} /> Waze
              </SmartLink>
            </nav>
          </div>
        </section>
      </section>
      {!forms.loading && !forms.error && forms.data?.length ? <section className="section section--tint"><div className="container narrow-section motion-panel reveal"><h2>Formularios de contacto</h2><div className="form-list">{forms.data.map((form) => <article key={form.CodigoFormularioEnlace}><div><h3>{form.Titulo}</h3>{form.Descripcion ? <p>{form.Descripcion}</p> : null}</div><SmartLink className="button button--primary" href={form.UrlFormulario} aria-label={form.TextoBoton + ': ' + form.Titulo}>{form.TextoBoton}</SmartLink></article>)}</div></div></section> : null}
    </div>
  );
}
