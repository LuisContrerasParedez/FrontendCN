import { useId } from 'react';
import SmartLink from '../../../ui/SmartLink';
import EscenaFeria from './escena/EscenaFeria';
import { FECHAS_POR_DEFECTO } from './escena/escenografia';
import { IconoBus, IconoFlecha } from './iconos';
import './HeroFeriaAgosto.css';

const RESPALDO = {
  titulo: 'La Feria de Agosto se vive en Centra Norte',
  descripcion: 'Disfruta juegos, sabores, actividades familiares, promociones y una experiencia llena de tradición y color.',
  accionPrimaria: { texto: 'Explorar eventos', href: '/eventos' },
  accionSecundaria: { texto: 'Consultar buses', href: '/buses' }
};

// Un campo vacío en la BD cuenta como "no vino nada", no como texto válido.
const oRespaldo = (valor, respaldo) => String(valor ?? '').trim() || respaldo;

// El título llega del CMS como una sola cadena, así que el resalte se aplica
// buscando la palabra indicada dentro de ella; si no aparece, se pinta plano.
function partirTitulo(titulo, acento) {
  const texto = String(titulo || '');
  const clave = String(acento || '').trim();
  if (!clave) return { antes: texto, resalte: '', despues: '' };
  const posicion = texto.toLowerCase().indexOf(clave.toLowerCase());
  if (posicion < 0) return { antes: texto, resalte: '', despues: '' };
  return {
    antes: texto.slice(0, posicion),
    resalte: texto.slice(posicion, posicion + clave.length),
    despues: texto.slice(posicion + clave.length)
  };
}

export default function HeroFeriaAgosto({
  titulo,
  acento = 'vive',
  descripcion,
  fechas = FECHAS_POR_DEFECTO,
  nivelTitulo = 'h1',
  id = 'feria-agosto',
  className = ''
}) {
  // Identificador único por instancia: evita que dos heros en la misma
  // página compartan gradientes o clipPaths.
  const uid = `hfa${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const Titulo = nivelTitulo === 'h2' ? 'h2' : 'h1';
  // Un array vacío es una instrucción explícita: cabinas sin fecha. Solo se
  // recurre a las de muestra cuando no se pasa la prop en absoluto.
  const listaFechas = Array.isArray(fechas) ? fechas : FECHAS_POR_DEFECTO;
  const textoDescripcion = oRespaldo(descripcion, RESPALDO.descripcion);
  const { antes, resalte, despues } = partirTitulo(oRespaldo(titulo, RESPALDO.titulo), acento);

  return (
    <section className={`hfa ${className}`.trim()} aria-labelledby={`${id}-titulo`}>
      <div className="hfa__escena">
        <EscenaFeria uid={uid} fechas={listaFechas} />
      </div>

      <div className="hfa__inner">
        <div className="hfa__copy">
          <Titulo className="hfa__titulo" id={`${id}-titulo`} data-page-title tabIndex="-1">
            {antes}
            {resalte ? <span className="hfa__titulo-acento">{resalte}</span> : null}
            {despues}
          </Titulo>

          {textoDescripcion ? <p className="hfa__lead">{textoDescripcion}</p> : null}

          <div className="hfa__acciones">
            <SmartLink className="hfa__btn hfa__btn--primario" href={RESPALDO.accionPrimaria.href}>
              {RESPALDO.accionPrimaria.texto}
              <IconoFlecha />
            </SmartLink>
            <SmartLink className="hfa__btn hfa__btn--claro" href={RESPALDO.accionSecundaria.href}>
              <IconoBus />
              {RESPALDO.accionSecundaria.texto}
            </SmartLink>
          </div>
        </div>
      </div>
    </section>
  );
}
