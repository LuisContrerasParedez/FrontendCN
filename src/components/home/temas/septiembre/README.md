# Septiembre — Hero Independencia

Hero de temporada autocontenido: ilustración SVG, animaciones CSS y ninguna
dependencia fuera de React.

```
septiembre/
├─ HeroIndependencia.jsx      componente principal + parallax de puntero
├─ HeroIndependencia.css      tokens, layout, animaciones
├─ ListonBandera.jsx          listón ceremonial inferior + bandera
├─ cintas.js                  geometría generada de las cuatro cintas
├─ Escudo.jsx                 escudo dibujado (respaldo si falla la imagen)
├─ iconos.jsx                 calendario, bus, flecha
├─ index.js
└─ escena/
   ├─ EscenaIndependencia.jsx orden de profundidad y capas de parallax
   ├─ escenografia.js         geometría, datos y trazados generados
   ├─ Cielo.jsx               degradado, sol, nubes, bandada lejana
   ├─ Paisaje.jsx             cordilleras, volcanes, neblina, pradera
   ├─ Ceiba.jsx               cinco capas: ramas de fondo, follaje de fondo,
   │                          ramas principales, tronco y follaje frontal
   ├─ Palmada.jsx             hoja palmada reutilizable
   ├─ MonjasBlancas.jsx       dos matas, tres flores
   ├─ Quetzal.jsx             anatomía, estados de posado y de vuelo
   ├─ useVueloQuetzal.js      máquina de estados del circuito del ave
   └─ Particulas.jsx          hojas al viento y motas de luz
```

## Uso

```jsx
import HeroIndependencia from './components/home/temas/septiembre';

<HeroIndependencia />
```

Ya está registrado en `temas/index.js`. La portada lo monta sola cuando el
nombre del tema en la BD **menciona septiembre** —da igual lo que venga
después: "Septiembre - Mes patrio", "Septiembre - Independencia", "15 de
Septiembre"— o cuando es uno de los nombres semánticos registrados
(`independencia`, `fiestas-patrias`, `mes-de-la-patria`).

### Navegación SPA

Por defecto los botones son anclas nativas, para que la carpeta funcione tal
cual en cualquier proyecto. En una app con router, inyecta el enlace:

```jsx
import SmartLink from '../ui/SmartLink';

<HeroIndependencia Enlace={SmartLink} />
```

## Props

| Prop | Por defecto | Qué hace |
| --- | --- | --- |
| `etiqueta` | `Septiembre` | Texto superior en versalitas |
| `titulo` | `¡Celebremos\nnuestra\nindependencia!` | Los `\n` son saltos de línea deliberados |
| `descripcion` | texto institucional | Párrafo de apoyo |
| `accionPrimaria` | `{ texto: 'Ver eventos', href: '/eventos' }` | Botón dorado |
| `accionSecundaria` | `{ texto: 'Horarios de buses', href: '/buses' }` | Botón claro |
| `escudoSrc` | `/tematicas/escudo-guatemala.svg` | Imagen del escudo en la bandera; si falla, se dibuja el respaldo |
| `nivelTitulo` | `h1` | `h1` o `h2`, según si el hero es el encabezado de la página |
| `id` | `septiembre-independencia` | Prefijo de los `id` accesibles |
| `className` | `''` | Clases extra en la sección |
| `Enlace` | `'a'` | Componente de enlace de los botones |

Un valor vacío cuenta como "no vino nada" y cae al respaldo, para que un campo
en blanco en la BD no deje el hero mudo.

## Decisiones de dirección de arte

- **Sin logotipo.** El hero se sostiene con la escalera tipográfica y el filete
  dorado de la etiqueta.
- **Ceiba protagonista.** Copa aplanada de 638 × 306, fuste de 212 px al pie
  contra 100 en la horquilla, y un contrafuerte de raíces tabulares que se abre
  a 422 px. La desproporción es deliberada: sin gambas, un tronco ancho sólo
  parece un cilindro grueso.
- **La copa se pinta por racimos, no por anillos.** El volumen NO se construye
  apilando copias de la silueta reducidas y desplazadas —eso produce islas
  concéntricas que se leen como manchas de camuflaje—. Cada pasada tonal es un
  conjunto propio de lóbulos repartidos dentro de la masa: los claros apretados
  contra el hombro por donde entra la luz, y una pasada de sombra sesgada en
  contra que abre los huecos entre racimos. Los dos tonos más claros van
  translúcidos para que se fundan en vez de recortarse.
- **Ramas por cinta, no por polígono.** Un contorno cerrado cuyos dos bordes se
  juntan en un vértice produce siempre una lanza. `rama()` construye el trazo
  desplazando una línea central curva según un perfil de grosor `(1 - t)^1.7`
  —adelgaza rápido cerca del fuste y despacio al final—, ensancha el cuello en
  el arranque y cierra la punta con un casquete redondeado. Dos senoidales
  desfasadas modulan el grosor un 6 % y un 4 % para que el borde no sea una
  curva perfecta.
- **Las ramas nacen de la madera.** Sus líneas centrales arrancan DENTRO del
  fuste y el tronco se pinta después, encima: eso cubre todos los arranques y
  elimina la sensación de piezas apoyadas sobre el tronco.
- **Copa baja.** El faldón llega a y ≈ 515 y cubre el horquillado entero. Lo
  único que queda al aire es el brazo de la percha, porque ahí se posa el ave;
  el ramaje visible entre fuste y copa hacía que el árbol se leyera como un
  esqueleto con hojas encima. Las ramas de la capa `fondo` van detrás de la
  silueta y quedan ocultas: siguen dibujadas porque son las que sostienen la
  estructura si la copa vuelve a subir.
- **Quetzal.** Cresta erizada, pico corto, garganta turquesa, pecho carmesí,
  infracobertoras blancas y plumas caudales largas. Tiene dos juegos de alas y
  de cola, posado y en vuelo, que se cruzan por opacidad: un ave posada pliega
  el ala y deja caer la cola, así que son formas distintas, no la misma girada.
- **Tres monjas blancas.** Acento, no motivo.
- **El listón es UNA cinta, no cuatro franjas.** Las cuatro hebras salen de
  la misma **curva maestra**: un solo barrido en S con menos de un ciclo
  completo a lo ancho. Cada hebra es esa curva desplazada, con una variación
  propia pequeña —la que produce algún giro suelto— y un factor que atenúa la
  maestra hacia abajo, porque la parte baja del fajín está más escorzada y la
  recorta el marco. Van casi paralelas a propósito: cuatro ondas
  independientes cruzándose todo el rato vuelven a leerse como un apilado de
  bandas, y ninguna pareja pasa del 18 % del recorrido cruzada.
- **Cada hebra es una banda cerrada,** con dos bordes propios que no van en
  paralelo: tiene grosor y se estrecha donde la tela gira. Los solapes son
  generosos —lo que se ve de cada una es la distancia hasta la siguiente, y
  el resto queda debajo— para que la masa no se abra nunca. El relieve son
  filos, sombras de contacto y pliegues (geometría), nunca un `filter`: el
  listón se mueve, y un filtro en el ancestro obligaría a rasterizar la
  franja entera en cada fotograma.
- **Reparto del peso:** unas 52 u de azul, 48 de blanca, 19 de celeste y el
  resto de azul hondo, sobre un lienzo de 220. Blanca y azul mandan por
  igual; la celeste es un hilo.
- **El oro son hilos, no una quinta hebra.** 3 u sobre 220, uno por cada
  canto de la blanca. En cuanto engorda deja de ser ceremonial y se convierte
  en una franja mostaza.
- **Los pliegues no llegan a los cantos.** Se quedan en el tercio central de
  lo que se ve de cada hebra. En cuanto tocan los dos bordes dejan de ser un
  quiebre de la tela y pasan a ser una costura que la corta de lado a lado.
- **La sombra sobre el suelo va antes que la cinta.** Tres contornos anidados
  siguiendo el filo superior del listón, de menos a más cerca del contacto.
  Son los que borran el corte entre pradera y decoración.
- **Sin bandera flotante.** La única bandera vive integrada en el listón:
  proporción 1.9 : 1, no el 1.6 : 1 del pabellón, porque se ve escorzada
  dentro del fajín —con la proporción exacta se levanta por encima de la
  cinta y vuelve a parecer una imagen pegada—. Un doblez blanco con vivos de
  oro le cruza por delante de la esquina superior izquierda y se pierde a los
  lados dentro del listón; la hebra frontal le pasa por delante de los
  últimos 26 u del canto inferior.
- **Paisaje sin poblar.** Dos volcanes de falda cóncava, tres planos de
  cordillera, bandas de neblina y ni un solo arbolito de relleno.

## Animación

Un solo reloj de 17 s gobierna el quetzal, el rebote de su rama y el cruce
entre alas plegadas y extendidas. El resto —copa, nubes, hojas, listón— corre
en ciclos primos entre sí para que el conjunto nunca caiga en un pulso común.

El listón **no se desplaza en bucle**. Cada cinta va y vuelve entre dos
posiciones separadas por una decena de unidades del lienzo, con periodos de
31, 37, 43 y 53 s: los planos se rozan entre ellos en vez de moverse en
bloque, y el recorrido es del orden de un milímetro por segundo, que se
percibe como tela y no como animación. La bandera lleva su propio ciclo de
12.4 s, independiente. El trazado se dibuja 160 u más allá de cada borde del
lienzo, así que el vaivén no descubre nunca los cantos laterales.

### Trayectoria y aleteo: generados

Salen de `quetzal.keyframes.js`. Se ejecuta con `node quetzal.keyframes.js` y
escribe por stdout las tres reglas (`sep-quetzal-vuelo`, `sep-aleteo`,
`sep-aleteo-lejos`), que se pegan en el bloque marcado del CSS. **Si mueves
`PERCHA` en `escenografia.js`, hay que regenerarlas.**

El script comprueba tres invariantes y falla si alguna se rompe:

- la rotación del cuerpo no sale nunca de **[-10, 10] grados**;
- `scaleX` es **siempre positivo** (mínimo 0.82). El escorzo insinúa el viraje
  del tramo alto, pero el ave **nunca se voltea ni queda invertida**;
- el fotograma del 0 %, el del 86 % y el del 100 % son **idénticos**, así que el
  bucle cierra sin salto.

El circuito es un óvalo que sale de la rama hacia arriba y a la izquierda, se
demora en el ápice y vuelve descendiendo. El ave está dibujada mirando siempre
a la izquierda: la sensación de dirección la dan la posición, las alas, la
cabeza y la cola, no un volteo del cuerpo. El tramo en el que deriva hacia la
derecha va alto, en planeo y escorzado, y la aproximación final vuelve a ser
hacia la izquierda, que es el instante que más se mira.

El aleteo emite sólo los extremos del batido y cambia de frecuencia por tramo
colocándolos más juntos o más separados: 3.2 Hz al despegar, 2 Hz en crucero,
0.9 Hz en el planeo alto y 2.4 Hz frenando. Cada ala tiene su propio hombro y
su desfase; cada pluma caudal, su propio retardo.

### Parallax

El hero escribe `--sep-px` / `--sep-py` normalizadas a [-1, 1] desde `rAF` y el
CSS decide cuánto se mueve cada plano: 2 px el cielo, 10 px el quetzal. No hay
estado de React de por medio. Se desactiva en punteros gruesos y con
`prefers-reduced-motion`.

## Adaptación

- **Escritorio:** 16:9 como proporción de referencia, pero acotado a
  `calc(100svh - var(--sep-cabecera))`. A ancho completo un 16:9 mide 864 px en
  un monitor de 1536 y eso deja el titular y los botones bajo el pliegue; cuando
  la ventana no da, la caja se recorta en vez de obligar a hacer scroll. El
  token `--sep-cabecera` (104 px) se redefine desde fuera si la cabecera cambia.
- La tipografía escala por ancho **y por alto** (`svh`): en una ventana baja el
  titular cede tamaño en lugar de empujar los botones fuera de cuadro.
- **Tablet (≤1180 px):** misma composición, columna de texto más estrecha.
- **Vertical (≤900 px):** otra composición —el texto ocupa el bloque superior y
  la escena baja a una banda inferior—, con `max-height: none` porque aquí sí
  debe ser más alta que la ventana.
- **Móvil (≤560 px):** botones apilados a ancho completo con la flecha alineada
  al borde.
- **Listón:** `--sep-liston` es el peso visual (76–126 px en escritorio) y
  `--sep-liston-alto` le suma un 35 % de zona de transición para la sombra y
  el tramo de barrido que se mete en la pradera. El filo superior barre entre
  unos 90 y unos 170 px sobre el canto del hero.
  Las capas de cinta se estiran con `preserveAspectRatio="none"` —es lo que
  las hace sangrar de canto a canto—, y `--sep-liston-ancho` corrige el
  estirón: sirve el lienzo más ancho que la caja y centrado, que es un
  recorte horizontal hecho a mano, para que la escala horizontal siga a la
  vertical. Sin esa corrección las ondas salen comprimidas en una ventana
  estrecha y la cinta pasa a parecer una sierra. La bandera no puede
  estirarse, así que vive en su propio SVG proporcional, dimensionado contra
  el **alto** del listón: así la relación entre paño y cinta es la misma en
  1920 y en un móvil.

`preserveAspectRatio="xMaxYMid slice"` sirve a las dos composiciones porque cada
una recorta por un eje distinto: en escritorio el recorte sólo puede ser
vertical y va centrado (anclarlo abajo se comería la copa en cuanto la ventana
es más baja que un 16:9); en vertical el recorte es sólo horizontal y `xMax`
mantiene a la vista el lado derecho, que es donde vive la ceiba.

## Accesibilidad

- La ilustración completa es decorativa (`role="presentation"`, sin texto
  alternativo que leer).
- `aria-labelledby` enlaza la sección con su título; `data-page-title` y
  `tabIndex="-1"` permiten al router llevar el foco al encabezado.
- Foco visible con `outline` de 3 px y separación propia en botones y título.
- Contraste medido: título 15:1, párrafo 8.5:1, botón dorado 8.2:1.

## Movimiento reducido

Con `prefers-reduced-motion: reduce` el quetzal se queda posado en su rama con
las alas plegadas, las partículas y las nubes se congelan en su posición
dibujada, las cintas y la bandera se quedan en su posición de reposo y el
parallax se apaga. Ojo con un detalle que ya falló una vez:
`.sepQuetzal__vuelo` necesita un `transform` base igual al fotograma del 0 %,
porque al desactivar la animación el elemento vuelve a su transform declarado y
sin él el ave aparece clavada en la esquina superior izquierda de la escena.
