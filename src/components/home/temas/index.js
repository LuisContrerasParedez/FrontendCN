import HeroFeria from './feria';

/*
 * Registro de temáticas de portada.
 *
 * Cada temática es una carpeta autocontenida bajo `temas/` que exporta por
 * defecto un componente con este contrato común:
 *
 *   { titulo, acento, descripcion, accionPrimaria, accionSecundaria,
 *     fechas, nivelTitulo, id, className }
 *
 * Para añadir la siguiente (patrios, halloween, navidad...):
 *   1. crear `temas/<clave>/` con su hero y su escena,
 *   2. registrarla abajo con la clave que devuelva la BD.
 * No hay que tocar la página: `resolverHeroTematico` ya elige por clave.
 */

const TEMAS = {
  feria: HeroFeria,
  'agosto-feria': HeroFeria
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

// Devuelve el hero de la temática pedida. Mientras una clave no esté
// registrada cae en la temática por defecto, así la portada nunca queda vacía.
export function resolverHeroTematico(clave) {
  return TEMAS[normalizar(clave)] || TEMAS[TEMA_POR_DEFECTO];
}

export default TEMAS;
