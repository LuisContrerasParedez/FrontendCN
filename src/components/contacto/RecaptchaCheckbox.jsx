import { useEffect, useRef, useState } from 'react';

const SCRIPT_ID = 'google-recaptcha-script';
const SCRIPT_URL = 'https://www.google.com/recaptcha/api.js?render=explicit&hl=es';
const LOAD_TIMEOUT_MS = 10000;
const POLL_INTERVAL_MS = 50;

let scriptPromise;

function cargarRecaptcha() {
  if (window.grecaptcha?.render) return Promise.resolve(window.grecaptcha);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existente = document.getElementById(SCRIPT_ID);
    const script = existente || document.createElement('script');
    const startedAt = Date.now();

    const esperarDisponibilidad = () => {
      if (window.grecaptcha?.render) {
        resolve(window.grecaptcha);
        return;
      }

      if (Date.now() - startedAt >= LOAD_TIMEOUT_MS) {
        reject(new Error('Google reCAPTCHA no quedó disponible.'));
        return;
      }

      window.setTimeout(esperarDisponibilidad, POLL_INTERVAL_MS);
    };

    const alFallar = () => reject(new Error('No fue posible cargar Google reCAPTCHA.'));

    script.addEventListener('load', esperarDisponibilidad, { once: true });
    script.addEventListener('error', alFallar, { once: true });

    if (!existente) {
      script.id = SCRIPT_ID;
      script.src = SCRIPT_URL;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } else {
      esperarDisponibilidad();
    }
  }).catch((error) => {
    scriptPromise = undefined;
    throw error;
  });

  return scriptPromise;
}

export default function RecaptchaCheckbox({ onChange, resetSignal = 0 }) {
  const siteKey = String(import.meta.env.VITE_RECAPTCHA_SITE_KEY || '').trim();
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const [error, setError] = useState('');

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!siteKey || !containerRef.current) return undefined;

    let activo = true;
    const slot = document.createElement('div');
    containerRef.current.replaceChildren(slot);

    cargarRecaptcha()
      .then((recaptcha) => {
        if (!activo) return;

        widgetIdRef.current = recaptcha.render(slot, {
          sitekey: siteKey,
          size: slot.parentElement?.clientWidth < 304 ? 'compact' : 'normal',
          callback: (token) => onChangeRef.current(token),
          'expired-callback': () => onChangeRef.current(''),
          'error-callback': () => {
            onChangeRef.current('');
            setError('No fue posible verificar el CAPTCHA. Intenta recargarlo.');
          }
        });
      })
      .catch((cause) => {
        if (!activo) return;
        const detail = import.meta.env.DEV && cause instanceof Error
          ? ` (${cause.message})`
          : '';
        setError(`No fue posible cargar el CAPTCHA. Revisa tu conexión e intenta nuevamente.${detail}`);
      });

    return () => {
      activo = false;
      widgetIdRef.current = null;
      slot.remove();
    };
  }, [siteKey]);

  useEffect(() => {
    if (widgetIdRef.current === null || !window.grecaptcha?.reset) return;
    window.grecaptcha.reset(widgetIdRef.current);
    onChangeRef.current('');
    setError('');
  }, [resetSignal]);

  if (!siteKey) {
    return (
      <p className="contact-form__captcha-error" role="alert">
        El CAPTCHA aún no está configurado para este sitio.
      </p>
    );
  }

  return (
    <div className="contact-form__captcha">
      <div ref={containerRef} aria-label="Verificación de seguridad reCAPTCHA" />
      {error ? <p className="contact-form__captcha-error" role="alert">{error}</p> : null}
    </div>
  );
}
