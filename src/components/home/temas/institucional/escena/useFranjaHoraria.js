import { useEffect, useState } from 'react';

/*
 * Franja horaria del visitante: día, tarde o noche.
 *
 * Es lo que mantiene viva una portada que, por definición, no cambia con el
 * calendario: la temática institucional es la que se ve cuando nadie ha
 * programado nada, así que si además fuera siempre idéntica se leería como un
 * hueco. La hora la pone quien mira, no la BD.
 */

// Cinco minutos: el salto entre franjas se nota a lo sumo con ese retraso y no
// hace falta un temporizador por minuto para eso.
const REVISION_MS = 5 * 60 * 1000;

export function franjaDe(fecha = new Date()) {
  const hora = fecha.getHours();
  if (hora >= 6 && hora < 17) return 'dia';
  if (hora >= 17 && hora < 20) return 'tarde';
  return 'noche';
}

export default function useFranjaHoraria() {
  const [franja, setFranja] = useState(franjaDe);

  useEffect(() => {
    const id = window.setInterval(() => setFranja(franjaDe()), REVISION_MS);
    return () => window.clearInterval(id);
  }, []);

  return franja;
}
