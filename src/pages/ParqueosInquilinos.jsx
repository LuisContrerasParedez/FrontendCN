import { useOutletContext } from 'react-router';
import PageHero from '../components/ui/PageHero';
import SmartLink from '../components/ui/SmartLink';
import Icon from '../components/ui/Icon';
import Seo from '../components/ui/Seo';

const TAS_ACTIONS = [
  {
    id: 'pago-tas',
    className: 'parking-tas__action--payment',
    label: 'Pago mensual',
    title: 'Pago de TAS',
    description: 'Si ya cuentas con tu tarjeta, registra el pago de TAS correspondiente al mes.',
    buttonLabel: 'Registrar pago de TAS',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSd7EFoiVFdvKbnRweCl0Wks4ky3SCHeuZd58xpU6c1rwGWLCA/viewform'
  },
  {
    id: 'solicitud-tas',
    className: 'parking-tas__action--request',
    label: 'Primera tarjeta',
    title: 'Solicitud de TAS',
    description: 'Si aún no cuentas con tu tarjeta, inicia el trámite de tarjeta para parqueo.',
    buttonLabel: 'Solicitar tarjeta TAS',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSe1TlQyK-aprILDCjTYW4YiGxEGUNlREZMZj263Nj4c0Dh1sA/viewform'
  }
];

export default function ParqueosInquilinos() {
  const { config, pages } = useOutletContext();
  const content = pages.find((page) => page.TipoPagina === 'PARQUEOS');

  return (
    <div className="page parking-tas-page">
      <Seo
        title={content?.MetaTitulo || 'Parqueos para inquilinos'}
        description={content?.MetaDescripcion || content?.Resumen || 'Pago y solicitud de tarjeta TAS para inquilinos.'}
        config={config}
        noIndex
      />
      <PageHero
        eyebrow="Gestiones"
        title={content?.Titulo || 'Parqueos para inquilinos'}
        description={content?.Resumen || 'Realiza el pago mensual o solicita tu tarjeta TAS desde el formulario correspondiente.'}
      />

      <section className="section container parking-tas" aria-labelledby="parking-tas-title">
        <div className="parking-tas__panel">
          <div className="parking-tas__intro">
            <span className="parking-tas__icon" aria-hidden="true"><Icon name="car" size={36} strokeWidth={1.7} /></span>
            <div>
              <p className="parking-tas__overline">Acceso para inquilinos</p>
              <h2 id="parking-tas-title">Gestiona tu tarjeta TAS</h2>
              <p>Elige la opción que corresponde a tu gestión. Cada enlace te llevará al formulario oficial.</p>
            </div>
          </div>

          <div className="parking-tas__actions">
            {TAS_ACTIONS.map((action) => (
              <article className={`parking-tas__action ${action.className}`} key={action.id}>
                <p className="parking-tas__label">{action.label}</p>
                <h3>{action.title}</h3>
                <p id={`${action.id}-description`}>{action.description}</p>
                <SmartLink
                  className="button parking-tas__button"
                  href={action.url}
                  aria-describedby={`${action.id}-description`}
                >
                  {action.buttonLabel}
                  <Icon name="arrowUpRight" size={19} strokeWidth={2.2} />
                </SmartLink>
              </article>
            ))}
          </div>
        </div>

        <p className="parking-tas__security-note">
          <Icon name="shield" size={20} strokeWidth={1.9} />
          Estos son los enlaces oficiales de Centra Norte para las gestiones de parqueo de inquilinos.
        </p>
      </section>
    </div>
  );
}
