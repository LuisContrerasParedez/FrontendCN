/**
 * Fechas de la API.
 *
 * El webservice entrega marcas en UTC (`2026-10-31T14:00:00.000Z`) que no son
 * un instante universal, sino la fecha y hora que se capturaron en gestión. Por
 * eso se leen con los métodos `getUTC*`: interpretarlas en la zona del
 * navegador movería un evento de medianoche al día anterior.
 */

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

function parse(value) {
  if (!value) return null;
  const date = new Date(String(value).replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** `31 de octubre de 2026`. Devuelve el valor original si no es una fecha. */
export function formatearFecha(value) {
  const date = parse(value);
  if (!date) return value ? String(value) : '';
  return `${date.getUTCDate()} de ${MESES[date.getUTCMonth()]} de ${date.getUTCFullYear()}`;
}

/** `14:00`, o cadena vacía cuando la hora capturada es medianoche (sin hora útil). */
export function formatearHora(value) {
  const date = parse(value);
  if (!date) return '';
  const horas = date.getUTCHours();
  const minutos = date.getUTCMinutes();
  if (horas === 0 && minutos === 0) return '';
  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
}

/** Día y hora en una sola línea: `31 de octubre de 2026, 14:00`. */
export function formatearFechaHora(value) {
  const fecha = formatearFecha(value);
  const hora = formatearHora(value);
  return hora ? `${fecha}, ${hora}` : fecha;
}

/** `Del 1 al 3 de agosto de 2026` cuando abarca varios días; si no, el día suelto. */
export function formatearRango(inicio, fin) {
  const desde = formatearFecha(inicio);
  const hasta = formatearFecha(fin);
  if (desde && hasta && desde !== hasta) return `Del ${desde} al ${hasta}`;
  return desde || hasta || '';
}

/** Etiqueta corta para el talón de la tarjeta: `{ day: '31', month: 'oct' }`. */
export function obtenerTalonFecha(value) {
  const date = parse(value);
  if (!date) return null;
  return { day: String(date.getUTCDate()), month: MESES[date.getUTCMonth()].slice(0, 3) };
}

/** Mes de calendario como número comparable: `2026-09` → `24321`. */
function indiceMes(anio, mes) {
  return anio * 12 + mes;
}

/**
 * `true` cuando la fecha cae en un mes posterior al que corre. La referencia
 * es el reloj del visitante y la fecha del evento se lee en UTC, igual que en
 * el resto del módulo: comparar índices de mes evita que el día o la hora
 * muevan un evento de sección.
 *
 * Un evento sin fecha —o con una fecha ilegible— no se considera posterior: se
 * queda en la agenda del mes en curso en lugar de esconderse en la de después.
 */
export function esDeMesPosterior(value, referencia = new Date()) {
  const date = parse(value);
  if (!date) return false;
  return indiceMes(date.getUTCFullYear(), date.getUTCMonth())
    > indiceMes(referencia.getFullYear(), referencia.getMonth());
}
