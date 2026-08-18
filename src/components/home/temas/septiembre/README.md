# Septiembre — Hero Independencia

Componente React autocontenido para la temática de septiembre.

## Uso

```jsx
import HeroIndependencia from './septiembre';

export default function Inicio() {
  return (
    <HeroIndependencia
      eventHref="/eventos"
      busHref="/rutas"
      escudoSrc="/tematicas/escudo-guatemala.svg"
    />
  );
}
```

## Diseño

- Composición editorial sin logo dentro del hero.
- Relación de aspecto 16:9 en escritorio.
- Ceiba protagonista, sin árboles secundarios.
- Dos monjas blancas como acentos visuales.
- El quetzal inicia posado, despega, realiza un recorrido y vuelve a la rama.
- Cielo, nubes, montañas, hojas, ceiba, flores, cinta y bandera inferior con animaciones independientes.
- La bandera lateral fue eliminada; solo permanece la bandera integrada en la cinta inferior.
- Respeta `prefers-reduced-motion`.
- En pantallas de 900 px o menos cambia a composición vertical para conservar legibilidad y accesibilidad.

## Props

- `eventHref`: URL del botón **Ver eventos**.
- `busHref`: URL del botón **Horarios de buses**.
- `escudoSrc`: imagen del escudo usada en la bandera inferior.
- `titulo`: título principal opcional.
- `descripcion`: texto secundario opcional.
- `eyebrow`: texto superior, por defecto `Septiembre`.
- `onEventClick`, `onBusClick`: handlers opcionales.

No requiere librerías de animación: las animaciones están hechas con CSS y SVG.
