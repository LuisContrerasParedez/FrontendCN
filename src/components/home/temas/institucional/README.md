# Institucional — Centra Norte todo el año

La temática **de respaldo** de la portada: la que se monta cuando la BD no trae
temática, cuando la que trae está fuera de vigencia o cuando su nombre no
corresponde a ninguna campaña registrada.

Es la única del catálogo que no puede depender de ningún dato. Con todos los
campos vacíos tiene que verse igual de terminada que una campaña montada a
mano, porque ese es exactamente el día en que se va a ver.

```
institucional/
├─ HeroInstitucional.jsx      componente principal + parallax de puntero
├─ HeroInstitucional.css      paleta de las tres franjas, layout, animaciones
├─ iconos.jsx                 flecha, tienda, bus, calendario
├─ index.js
└─ escena/
   ├─ EscenaInstitucional.jsx orden de profundidad y capas de parallax
   ├─ escenografia.js         líneas maestras, medidas y trazados
   ├─ useFranjaHoraria.js     día / tarde / noche según el reloj del visitante
   ├─ Cielo.jsx               degradado, disco, halo, estrellas y nubes
   ├─ Valle.jsx               crestas, conos, neblina y luces del fondo
   ├─ Terminal.jsx            marquesina de bóvedas, andén y buses parados
   ├─ Complejo.jsx            centro comercial, atrio, portal y tótem
   ├─ Plaza.jsx               suelo y calzada (`Suelo`) + primer plano
   └─ Figuras.jsx             bus, persona, palmera, árbol, farola, nube
```

## Uso

```jsx
import HeroInstitucional from './components/home/temas/institucional';

<HeroInstitucional />
```

Ya está registrado en `temas/index.js` **como `TEMA_POR_DEFECTO`**, así que la
portada lo monta sola en cuanto la clave del tema no resuelve a ninguna otra.
También responde a los nombres semánticos `institucional`, `centra-norte`,
`centra-norte-todo-el-ano`, `todo-el-ano` y `permanente`.

### Por qué el respaldo dejó de ser la feria

Antes `TEMA_POR_DEFECTO` era `feria`. Eso significaba que una portada sin
temática montaba en noviembre la escena de una feria que terminó en agosto: no
se veía rota, se veía *desactualizada*, que es peor porque nadie lo reporta.
La institucional no caduca —no menciona ningún mes— y lo que la mantiene viva
es la hora de quien mira, no el calendario.

## Props

| Prop | Por defecto | Qué hace |
| --- | --- | --- |
| `etiqueta` | `Centra Norte` | Texto superior en versalitas |
| `titulo` | `Todo lo que necesitas,\nen un mismo lugar` | Los `\n` son saltos deliberados |
| `acento` | `un mismo lugar` | Fragmento que se resalta en rojo dentro del título |
| `descripcion` | texto institucional | Párrafo de apoyo |
| `accionPrimaria` | `{ texto: 'Descubrir los locales', href: '/locales' }` | Botón rojo sólido |
| `accionSecundaria` | `{ texto: 'Consultar buses', href: '/buses' }` | Botón de contorno claro |
| `nivelTitulo` | `h1` | `h1` o `h2`, según si el hero encabeza la página |
| `id` | `centra-norte-institucional` | Prefijo de los `id` accesibles |
| `className` | `''` | Clases extra en la sección |
| `Enlace` | `SmartLink` | Componente de enlace de los botones |

Un valor vacío cuenta como "no vino nada" y cae al respaldo, para que un campo
en blanco en la BD no deje el hero mudo. Si `acento` no aparece dentro del
título, la línea se pinta plana en lugar de partirse por un índice que no
existe.

`Enlace` viene con el `SmartLink` del sitio para que los botones naveguen sin
recargar; cambiarlo por `'a'` deja la carpeta utilizable fuera de este
proyecto.

## Los dos destinos de los botones

`/locales` y `/buses`, no `/eventos`. Son las dos páginas que **siempre** tienen
contenido: un hero de respaldo que manda a una agenda vacía es peor que no
tener hero. La misma razón por la que los tres pilares no son enlaces —con dos
botones justo encima, cinco destinos en el mismo bloque dejan de ser una
jerarquía y pasan a ser un menú—.

## Dirección de arte

- **Arquitectura, no ilustración orgánica.** Casi todo son rectas y arcos, que
  es lo que permite dibujar un complejo entero sin que se note la mano. La
  personalidad la ponen tres gestos, no el detalle: el alero que vuela por los
  dos costados —para que el bloque no se lea como una caja apoyada en el
  suelo—, el atrio acristalado de triple altura que parte la fachada justo
  sobre la entrada, y el tótem, único punto vertical del cuadro.
- **Sin logotipo ni una sola letra dentro de la escena.** Lo que identifica el
  lugar es el rombo de cuatro cuadros del tótem, el mismo símbolo y el mismo
  reparto de color que `.brand-symbol` en la cabecera. Nada que traducir y nada
  que mantener sincronizado con el logotipo que sirve el CMS.
- **La profundidad se construye por escalonado de tono, no por textura.** Las
  dos crestas y los dos conos bajan un paso cada uno y ninguno lleva detalle.
  Los pies de los volcanes quedan tapados por la cresta cercana, que es como se
  ven desde el valle.
- **Un solo vehículo en movimiento.** Dos convierten el hero en un anuncio y le
  quitan el sitio al titular, que es lo que hay que leer.
- **El rojo de marca aparece tres veces y no más:** el filete de la etiqueta, el
  botón primario y el canto del alero. Con más, la fachada se vuelve un cartel.

## Las tres franjas horarias

Es lo que mantiene viva una portada que, por definición, no cambia con el
calendario. `useFranjaHoraria` mira el reloj del visitante y pone una clase:

| Franja | Horas | Clase |
| --- | --- | --- |
| Día | 06:00 – 16:59 | `.instHero--dia` |
| Tarde | 17:00 – 19:59 | `.instHero--tarde` |
| Noche | 20:00 – 05:59 | `.instHero--noche` |

**La geometría no sabe nada de color.** Cada pieza del SVG sale con una clase
—incluidas las paradas de los degradados, que llevan `stop-color` por CSS y no
por atributo— y la paleta entera se resuelve en `HeroInstitucional.css`. Cambiar
de franja es redefinir tokens; no se vuelve a dibujar nada. La noche es la base
y las otras dos solo sobrescriben.

La luz cálida —ventanas, farolas, andén— se apaga casi del todo de día: dejarla
encendida a mediodía es lo que delata que una ilustración está pintada "de noche
con un filtro de día".

### La regla de contraste que no se rompe

La columna de texto va **siempre** sobre el velo azul marino y **siempre** en
blanco. Si el texto cambiara de color con la hora habría que medir el contraste
tres veces y una de las tres acabaría fallando; así solo hay un caso, y es el de
máximo contraste.

Por eso el velo se mantiene denso hasta el 36 % del ancho y no se apaga hasta el
66 %: la columna llega al 52 % y un titular largo la ocupa entera. Si cayera
antes, el final de la línea quedaría sobre cielo claro. Medido al 51 %, el
blanco sigue en 7.4:1.

## Animación

Ningún ciclo comparte múltiplo con otro, para que el conjunto nunca caiga en un
pulso común: nubes a 58/74/91 s, estrellas a 5.3 s, luces del valle a 7.1 s,
ventanas a 13 s, luminarias a 9.4 s, palmeras a 8.3/10.7 s y el bus a 38 s.

Las ventanas laten muy poco y muy despacio: una ventana que parpadea se lee
como un fallo; lo que se busca es que el edificio no parezca congelado.

### Cuidado al animar `transform` sobre una pieza colocada

Un `transform` de CSS **sustituye** al atributo `transform` del mismo elemento.
Cualquier pieza que se coloque con `translate(...)` en el atributo y además se
anime necesita **dos grupos**: el de fuera con la animación, el de dentro con la
colocación. Está resuelto así en la nube, la corona de la palmera, el bus
cercano y las siluetas que caminan. Si se junta en un solo `<g>`, la pieza
desaparece al origen del dibujo.

### Parallax

El hero escribe `--inst-px` / `--inst-py` normalizadas a [-1, 1] desde `rAF` y el
CSS decide cuánto se mueve cada plano: 2 px el cielo, 9 px el primer plano. No
hay estado de React de por medio. Se desactiva en punteros gruesos y con
`prefers-reduced-motion`.

## Adaptación

- **Escritorio:** 16:9 como proporción de referencia, acotado a
  `calc(100svh - var(--inst-cabecera))`. A ancho completo un 16:9 mide 864 px en
  un monitor de 1536 y eso deja el titular y los botones bajo el pliegue; cuando
  la ventana no da, la caja se recorta en vez de obligar a hacer scroll. El
  token `--inst-cabecera` (104 px) se redefine desde fuera si la cabecera cambia.
- La tipografía escala por ancho **y por alto** (`svh`): en una ventana baja el
  titular cede tamaño en lugar de empujar los botones fuera de cuadro.
- **Tablet (≤1180 px):** misma composición, columna de texto más estrecha.
- **Vertical (≤900 px):** otra composición —el texto va completo y centrado
  arriba y la escena baja a una banda propia—, porque a pantalla completa el
  `slice` se comería justo el complejo, que es lo único que hay que ver. El
  fondo del bloque de texto es fijo y no cambia con la franja: ahí ya no hay
  velo que garantice el contraste.
- **El bloque de texto se funde con la escena.** Su degradado aterriza
  exactamente en `--inst-cielo-1`, el color con el que arranca el cielo, sea
  cual sea la franja horaria: en la costura no hay cambio de color, así que el
  filo desaparece y los dos bloques se leen como una sola superficie. Sólo la
  parada final es variable; las dos primeras son azul marino fijo para que el
  texto blanco mida igual a las tres horas —la más clara de las tres, el cielo
  de día `#12459b`, da 7.7:1 en blanco—. El degradado va en el bloque de texto y
  **no** en la sección: en la sección se reparte por todo el alto, incluida la
  parte que tapa la escena, y en la costura sólo ha recorrido la mitad.
- **La banda es 4:3, no 16:9.** Con la proporción del viewBox se ve la escena
  entera, y a 390 px de ancho eso deja los buses y la marquesina del tamaño de
  una uña. Al estrechar la banda el `slice` escala para cubrir y recorta por los
  lados, que es el acercamiento que hace falta. El orden de los dos bloques es
  una sola propiedad (`flex-direction` en `.instHero`), y se puede comparar en
  vivo con `?orden=arriba|abajo` en la página de previsualización.
- **Móvil (≤560 px):** botones apilados a ancho completo y pilares en columna,
  con el bloque de pilares centrado pero sus ítems alineados a la izquierda para
  que los tres iconos caigan en la misma vertical.

En móvil los botones van **apilados a todo el ancho y con el contenido
centrado**, en la misma proporción que la temática de feria. Lo que decide si se
ven bien es la proporción, no el ancho: a 48 px de alto con la etiqueta a
`.9rem` —el sitio escala la raíz al 90 %, así que son 13 px— el texto flotaba
dentro de la caja y el botón parecía enorme. Con **44 px y la etiqueta a
`1rem`** la caja va llena.

44 px es además el objetivo táctil mínimo; por debajo no se baja. Verificado sin
desbordes a 320 px, que es el `min-width` del `body`.

La forma sigue siendo `--radius-small`, la del `.button` del sitio y la de la
temática de septiembre; la feria es la única que usa píldora.

## Accesibilidad

- La ilustración completa es decorativa (`role="presentation"`, sin texto
  alternativo que leer).
- `aria-labelledby` enlaza la sección con su título; `data-page-title` y
  `tabIndex="-1"` permiten al router llevar el foco al encabezado.
- Foco visible con `outline` de 3 px y separación propia en botones y título.
- Contraste medido sobre el velo: título 15:1, párrafo 12.4:1, etiqueta 9.2:1,
  pilares 12.4:1, botón rojo 5.3:1 (7.1:1 en `:hover`). El hover del primario
  **oscurece** en vez de aclarar: aclarar el rojo dejaría el texto blanco por
  debajo de 4.5:1.

## Movimiento reducido

Con `prefers-reduced-motion: reduce` todo queda quieto en su posición dibujada.
Ojo con el detalle que ya falló una vez en la temática de septiembre: el bus
necesita un `transform` base (`translateX(980px)`) porque al desactivar la
animación el elemento vuelve a su transform declarado, y sin él aparecería
clavado fuera de cuadro por la izquierda. Con él queda estacionado frente al
centro comercial.

## Previsualización

```
npm run dev
```

- `http://localhost:5173/preview.html` → institucional
- `…/preview.html?franja=dia` · `?franja=tarde` · `?franja=noche` → fuerza la
  franja sin tocar el reloj del equipo
- `…/preview.html?tema=septiembre` · `?tema=feria` → las otras temáticas
- `…/preview.html?orden=arriba` · `?orden=abajo` → invierte escena y texto en
  vertical, para comparar las dos composiciones sin tocar el CSS
