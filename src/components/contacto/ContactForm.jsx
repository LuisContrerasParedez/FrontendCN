import { useState } from 'react';
import { enviarMensajeContacto } from '../../services/formulariosService';
import RecaptchaCheckbox from './RecaptchaCheckbox';

const INITIAL_FORM = {
  nombre: '',
  correo: '',
  asunto: '',
  mensaje: '',
  sitioWeb: ''
};

export default function ContactForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [captchaToken, setCaptchaToken] = useState('');
  const [resetCaptcha, setResetCaptcha] = useState(0);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const captchaConfigured = Boolean(String(import.meta.env.VITE_RECAPTCHA_SITE_KEY || '').trim());

  const actualizarCampo = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (status.type !== 'idle') setStatus({ type: 'idle', message: '' });
  };

  const enviar = async (event) => {
    event.preventDefault();

    if (!captchaToken) {
      setStatus({ type: 'error', message: 'Confirma que no eres un robot antes de enviar.' });
      return;
    }

    setStatus({ type: 'loading', message: 'Enviando tu mensaje…' });

    try {
      const response = await enviarMensajeContacto({ ...form, captchaToken });
      setForm(INITIAL_FORM);
      setStatus({
        type: 'success',
        message: response?.message || 'Recibimos tu mensaje. Nos pondremos en contacto contigo pronto.'
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'No fue posible enviar el mensaje. Intenta nuevamente.'
      });
    } finally {
      setCaptchaToken('');
      setResetCaptcha((current) => current + 1);
    }
  };

  return (
    <section className="contact-form-card" aria-labelledby="contact-form-title">
      <div className="contact-form-card__heading">
        <p className="eyebrow">¿Podemos ayudarte?</p>
        <h3 id="contact-form-title">Ponte en contacto con nosotros</h3>
        <p>Completa el formulario y responderemos tu consulta lo antes posible.</p>
      </div>

      <form className="contact-form" onSubmit={enviar}>
        <div className="contact-form__field">
          <label htmlFor="contact-name">Nombre</label>
          <input id="contact-name" name="nombre" type="text" autoComplete="name" maxLength="120" placeholder="Tu nombre" value={form.nombre} onChange={actualizarCampo} required />
        </div>

        <div className="contact-form__field">
          <label htmlFor="contact-email">Correo electrónico</label>
          <input id="contact-email" name="correo" type="email" inputMode="email" autoComplete="email" maxLength="254" placeholder="nombre@correo.com" value={form.correo} onChange={actualizarCampo} required />
        </div>

        <div className="contact-form__field">
          <label htmlFor="contact-subject">Asunto</label>
          <input id="contact-subject" name="asunto" type="text" maxLength="160" placeholder="¿En qué podemos ayudarte?" value={form.asunto} onChange={actualizarCampo} required />
        </div>

        <div className="contact-form__field">
          <label htmlFor="contact-message">Mensaje</label>
          <textarea id="contact-message" name="mensaje" rows="6" minLength="10" maxLength="3000" placeholder="Cuéntanos los detalles de tu consulta" value={form.mensaje} onChange={actualizarCampo} required />
        </div>

        <div className="contact-form__honeypot" aria-hidden="true">
          <label htmlFor="contact-website">Sitio web</label>
          <input id="contact-website" name="sitioWeb" type="text" tabIndex="-1" autoComplete="off" value={form.sitioWeb} onChange={actualizarCampo} />
        </div>

        <RecaptchaCheckbox onChange={setCaptchaToken} resetSignal={resetCaptcha} />

        {status.message ? (
          <p className={`contact-form__status contact-form__status--${status.type}`} role="status" aria-live="polite">
            {status.message}
          </p>
        ) : null}

        <button className="button button--primary contact-form__submit" type="submit" disabled={!captchaConfigured || status.type === 'loading'}>
          {status.type === 'loading' ? 'Enviando…' : 'Enviar mensaje'}
        </button>
      </form>
    </section>
  );
}
