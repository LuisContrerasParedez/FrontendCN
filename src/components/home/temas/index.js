import HeroFeria from './feria';
import HeroIndependencia from './septiembre';

/*
 * Registro de temáticas de portada.
 *
 * Cada temática es una carpeta autocontenida bajo `temas/` que exporta por
 * defecto un componente con este contrato común:
 *
 *   { titulo, acento, descripcion, accionPrimaria, accionSecundaria,
 *     fechas, nivelTitulo, id, className }
 *
 * La clave llega de la BD como el *nombre* del tema ("Agosto - Feria",
 * "Septiembre - Mes patrio"…), así que resolver por coincidencia exacta era
 * frágil: renombrar el tema en el intranet bastaba para que la portada cayera
 * en la temática por defecto sin avisar. Por eso se resuelve en dos pasos:
 *
 *   1. Clave exacta, para nombres que no mencionan el mes ("Fiestas patrias").
 *   2. Mes mencionado en el nombre. Es el criterio principal: da igual lo que
 *      venga después del mes, "Agosto - Feria", "Agosto - Kermés" y "Agosto,
 *      mes de la familia" montan la misma escena.
 *
 * Para añadir la siguiente (octubre, diciembre...):
 *   1. crear `temas/<clave>/` con su hero y su escena,
 *   2. añadir su mes a MESES —y su nombre semántico a TEMAS si lo tiene—.
 * No hay que tocar la página: `resolverHeroTematico` ya elige.
 */

// Nombres que no llevan mes y deben resolver igual.
const TEMAS = {
  feria: HeroFeria,
  independencia: HeroIndependencia,
  'fiestas-patrias': HeroIndependencia,
  'mes-de-la-patria': HeroIndependencia
};

// Mes -> temática. Un mes sin escena propia no se lista: cae en la default.
const MESES = {
  agosto: HeroFeria,
  septiembre: HeroIndependencia
};

export const TEMA_POR_DEFECTO = 'feria';

// Mismo criterio que `themeKey` en tematicaService: sin acentos, en minúsculas
// y con guiones, para que case aunque la BD mande "Agosto - Feria".
function normalizar(clave) {
  return String(clave || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Se compara palabra por palabra, no por substring: "septiembre" tiene que
// venir como término suelto para contar, no incrustado en otra palabra.
function temaDelMes(clave) {
  for (const palabra of clave.split('-')) {
    if (MESES[palabra]) return MESES[palabra];
  }
  return null;
}

// Devuelve el hero de la temática pedida. Mientras una clave no esté
// registrada cae en la temática por defecto, así la portada nunca queda vacía.
export function resolverHeroTematico(clave) {
  const normalizada = normalizar(clave);
  const tema = TEMAS[normalizada] || temaDelMes(normalizada);
  if (tema) return tema;

  // El respaldo silencioso ya escondió un fallo en producción durante un día
  // entero: la portada se veía bien, sólo que con la temática del mes pasado.
  // En desarrollo tiene que oírse.
  if (import.meta.env.DEV && normalizada) {
    console.warn(
      `[temas] "${clave}" no resuelve a ninguna temática (clave: "${normalizada}"). ` +
        `Se monta "${TEMA_POR_DEFECTO}". Añade su mes a MESES en temas/index.js.`
    );
  }

  return TEMAS[TEMA_POR_DEFECTO];
}

export default TEMAS;
