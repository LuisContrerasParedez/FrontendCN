import Cielo from './Cielo';
import Complejo from './Complejo';
import Plaza, { Suelo } from './Plaza';
import Terminal from './Terminal';
import Valle from './Valle';
import { VB } from './escenografia';

/*
 * Escena institucional: Centra Norte visto desde la calle, dibujada al 100 %
 * con SVG inline y CSS. Ni una imagen, ni un background-image, ni un base64,
 * ni una fuente de iconos: cada volumen, cada ventana y cada silueta es
 * geometría declarada en `escenografia.js`.
 *
 * El orden de los grupos ES la profundidad: cielo → valle → suelo → terminal →
 * centro comercial → primer plano.
 *
 * Los degradados llevan sus paradas por clase en vez de por atributo porque la
 * paleta entera —las tres franjas horarias— vive en el CSS. Aquí solo hay
 * geometría; si algo hay que recolorear, no se toca este archivo.
 */
export default function EscenaInstitucional({ uid }) {
  return (
    <svg
      className="instEsc"
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${uid}-cielo`} x1="0" y1="0" x2="0.12" y2="1">
          <stop offset="0%" className="instG__cielo1" />
          <stop offset="34%" className="instG__cielo2" />
          <stop offset="68%" className="instG__cielo3" />
          <stop offset="100%" className="instG__cielo4" />
        </linearGradient>

        <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" className="instG__halo0" />
          <stop offset="42%" className="instG__halo1" />
          <stop offset="100%" className="instG__halo2" />
        </radialGradient>

        <linearGradient id={`${uid}-resplandor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="instG__resplandor0" />
          <stop offset="100%" className="instG__resplandor1" />
        </linearGradient>

        <linearGradient id={`${uid}-bruma`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="instG__bruma0" />
          <stop offset="55%" className="instG__bruma1" />
          <stop offset="100%" className="instG__bruma0" />
        </linearGradient>

        <linearGradient id={`${uid}-suelo`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="instG__suelo0" />
          <stop offset="38%" className="instG__suelo1" />
          <stop offset="100%" className="instG__suelo2" />
        </linearGradient>

        <linearGradient id={`${uid}-atrio`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="instG__atrio0" />
          <stop offset="100%" className="instG__atrio1" />
        </linearGradient>
      </defs>

      <g className="instEsc__capa instEsc__capa--fondo">
        <Cielo uid={uid} />
        <Valle uid={uid} />
      </g>

      <g className="instEsc__capa instEsc__capa--medio">
        <Suelo uid={uid} />
        <Terminal />
        <Complejo uid={uid} />
      </g>

      <g className="instEsc__capa instEsc__capa--frente">
        <Plaza />
      </g>
    </svg>
  );
}
