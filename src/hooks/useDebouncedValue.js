import { useEffect, useState } from 'react';

/**
 * Retrasa la propagación de un valor que cambia con cada pulsación.
 *
 * El directorio consulta la API en cada cambio de búsqueda; sin esta espera,
 * escribir «cafetería» dispararía nueve peticiones contra un endpoint con
 * límite por IP.
 */
export default function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
