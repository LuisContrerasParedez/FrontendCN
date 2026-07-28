try {
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  if (!reducedMotion) {
    document.documentElement.classList.add('has-reveal');
  }
} catch {
  // Las animaciones son progresivas: si el navegador no permite detectarlas,
  // el contenido permanece visible y la aplicacion puede continuar.
}
