import { SITE_LOGO_URL } from '../../services/configuracionService';

export function LoadingState({ label = 'Cargando contenido' }) {
  return (
    <div className="loading-grid" aria-live="polite" aria-busy="true" aria-label={label}>
      <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
    </div>
  );
}

export function InitialLoadingScreen() {
  return (
    <div
      className="initial-loading-screen"
      role="status"
      aria-live="polite"
      aria-label="Cargando la información de Centra Norte"
    >
      <div className="initial-loading-screen__content">
        <img
          className="initial-loading-screen__logo"
          src={SITE_LOGO_URL}
          alt=""
          aria-hidden="true"
        />
        <span>Preparando tu visita…</span>
        <span className="initial-loading-screen__track" aria-hidden="true"><i /></span>
      </div>
    </div>
  );
}

export function EmptyState({ title, message }) {
  return (
    <div className="content-state content-state--empty">
      <h2>{title}</h2>
      {message ? <p>{message}</p> : null}
    </div>
  );
}

export function ErrorState({ message = 'Este contenido no está disponible por el momento.', onRetry }) {
  return (
    <div className="content-state content-state--error" role="status">
      <p>{message}</p>
      {onRetry ? <button className="text-button" type="button" onClick={onRetry}>Intentar de nuevo</button> : null}
    </div>
  );
}
