import { createElement } from 'react';
import { resolverHeroTematico } from './index';

/*
 * Única puerta de entrada para las páginas: se le pasa la clave de la temática
 * activa y él decide qué escena montar. Así la portada no conoce el catálogo
 * de temas y añadir uno nuevo no la toca.
 */
export default function HeroTematico({ clave, ...props }) {
  return createElement(resolverHeroTematico(clave), props);
}
