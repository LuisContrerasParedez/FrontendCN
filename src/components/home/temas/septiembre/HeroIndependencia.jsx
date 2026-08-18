import { useId, useMemo } from 'react';
import EscenaIndependencia from './escena/EscenaIndependencia';
import Tendido from './Tendido';
import { IconoBus, IconoCalendario, IconoFlecha } from './iconos';
import './HeroIndependencia.css';

const TITULO_PREDETERMINADO = '¡Celebremos nuestra independencia!';

function TituloEditorial({ titulo }) {
  if (titulo !== TITULO_PREDETERMINADO) {
    return <>{titulo}</>;
  }

  return (
    <>
      <span>¡Celebremos</span>
      <span>nuestra</span>
      <span>independencia!</span>
    </>
  );
}

export default function HeroIndependencia({
  eventHref = '/eventos',
  busHref = '/rutas',
  escudoSrc = '/tematicas/escudo-guatemala.svg',
  titulo = TITULO_PREDETERMINADO,
  descripcion = 'Un mes para honrar nuestras raíces, disfrutar en familia y celebrar con orgullo lo que nos une como guatemaltecos.',
  eyebrow = 'Septiembre',
  onEventClick,
  onBusClick
}) {
  const reactId = useId();
  const uid = useMemo(
    () => `sep${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`,
    [reactId]
  );

  return (
    <section className="sepHero" aria-labelledby={`${uid}-titulo`}>
      <div className="sepHero__scene" aria-hidden="true">
        <EscenaIndependencia uid={uid} />
      </div>

      <div className="sepHero__shell">
        <div className="sepHero__content">
          <div className="sepHero__eyebrow" aria-label={eyebrow}>
            <span className="sepHero__eyebrowLine" />
            <span>{eyebrow}</span>
            <span className="sepHero__eyebrowLeaf" aria-hidden="true">◆</span>
            <span className="sepHero__eyebrowLine sepHero__eyebrowLine--short" />
          </div>

          <h1 id={`${uid}-titulo`} className="sepHero__title">
            <TituloEditorial titulo={titulo} />
          </h1>

          <p className="sepHero__description">{descripcion}</p>

          <div className="sepHero__actions" aria-label="Acciones principales">
            <a
              className="sepHero__button sepHero__button--primary"
              href={eventHref}
              onClick={onEventClick}
            >
              <span className="sepHero__buttonIcon"><IconoCalendario /></span>
              <span>Ver eventos</span>
              <span className="sepHero__buttonArrow" aria-hidden="true"><IconoFlecha /></span>
            </a>

            <a
              className="sepHero__button sepHero__button--secondary"
              href={busHref}
              onClick={onBusClick}
            >
              <span className="sepHero__buttonIcon"><IconoBus /></span>
              <span>Horarios de buses</span>
              <span className="sepHero__buttonArrow" aria-hidden="true"><IconoFlecha /></span>
            </a>
          </div>
        </div>
      </div>

      <Tendido escudoSrc={escudoSrc} />
    </section>
  );
}
