import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import ResponsiveImage from '../ui/ResponsiveImage';
import SmartLink from '../ui/SmartLink';
import Icon from '../ui/Icon';
import { safeUrl } from '../../utils/safeUrl';

const FALLBACK = {
  TituloHero: 'Todo lo que buscas. Todo lo que te mueve.',
  DescripcionHero: 'Ven a comprar, comer, compartir y conectar con tu próximo destino en un solo lugar.',
  TextoBotonPrimario: 'Explorar locales',
  UrlBotonPrimario: '/locales',
  TextoBotonSecundario: 'Consultar buses',
  UrlBotonSecundario: '/buses'
};

function isBusDestination(value) {
  try {
    return new URL(String(value || ''), window.location.origin).pathname.replace(/\/$/, '') === '/buses';
  } catch {
    return false;
  }
}

const VISIT_STEPS = [
  {
    to: '/locales',
    label: 'Comprar',
    text: 'Tiendas, comida y servicios',
    icon: 'shop',
    tone: 'blue'
  },
  {
    to: '/eventos',
    label: 'Disfrutar',
    text: 'Actividades para compartir',
    icon: 'calendar',
    tone: 'coral'
  },
  {
    to: '/buses',
    label: 'Viajar',
    text: 'Rutas hacia tu próximo destino',
    icon: 'bus',
    tone: 'green'
  }
];

const WHEEL_CENTER = { x: 200, y: 98 };
const WHEEL_RADIUS = 128;
const INNER_RING_RADIUS = 106;
const TRUSS_RING_RADIUS = 85;
const CABIN_RADIUS = WHEEL_RADIUS + 16;
const GONDOLA_COLORS = ['url(#cabinGradientBlack)'];

function wheelPoint(angleDeg, radius = WHEEL_RADIUS, center = WHEEL_CENTER) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: center.x + radius * Math.cos(rad),
    y: center.y + radius * Math.sin(rad)
  };
}

function lerp(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

const SPOKE_ANGLES = Array.from({ length: 16 }, (_, index) => index * 22.5);
const RIM_LIGHT_ANGLES = SPOKE_ANGLES.map((angle) => angle + 11.25);
const HUB_BOLT_ANGLES = Array.from({ length: 8 }, (_, index) => index * 45);
const GROUND_Y = 280;
const LEG_TOP_RADIUS = 20;
const LEG_TOP_LEFT = wheelPoint(120, LEG_TOP_RADIUS);
const LEG_TOP_RIGHT = wheelPoint(60, LEG_TOP_RADIUS);
const LEG_OUTER_LEFT = { x: 66, y: GROUND_Y };
const LEG_INNER_RIGHT = { x: 232, y: GROUND_Y };
const LEG_OUTER_RIGHT = { x: 334, y: GROUND_Y };
const LEG_INNER_LEFT = { x: 168, y: GROUND_Y };
const BRACE_1 = [lerp(LEG_TOP_LEFT, LEG_OUTER_LEFT, .52), lerp(LEG_TOP_RIGHT, LEG_OUTER_RIGHT, .52)];
const BRACE_2 = [lerp(LEG_TOP_LEFT, LEG_INNER_RIGHT, .8), lerp(LEG_TOP_RIGHT, LEG_INNER_LEFT, .8)];

const EVENT_FOCUS_POINT = { x: 416, y: 264 };
const EVENT_FOCUS_ANGLE = (Math.atan2(EVENT_FOCUS_POINT.y - WHEEL_CENTER.y, EVENT_FOCUS_POINT.x - WHEEL_CENTER.x) * 180) / Math.PI;
const SEAT_WIDTH = 36;
const SEAT_HEIGHT = 32;
const SEAT_RADIUS = 9;
const SEAT_HANGER_DROP = 9;
const SEAT_IMAGE_INSET = 4;
const FACET_LABEL_RADIUS = (TRUSS_RING_RADIUS + INNER_RING_RADIUS) / 2;
const MAX_WHEEL_EVENTS = 9;
// Keep in sync with the `fair-wheel-spin` / `fair-wheel-spin-reverse` animation-duration in global.css —
// the wheel spins continuously and never stops; this only times when each cabin's dwell highlight shows.
const ROTATION_PERIOD_MS = 60000;
const EVENT_DWELL_MS = 2600;

function normalizeAngle(angle) {
  return ((angle % 360) + 360) % 360;
}

function starPath(cx, cy, outerR, innerR, points = 5) {
  const step = Math.PI / points;
  let d = '';
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    d += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2) + ' ';
  }
  return d + 'Z';
}

function formatBoothDate(value) {
  if (!value) return '';
  const date = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return '';
  const day = new Intl.DateTimeFormat('es-GT', { day: 'numeric' }).format(date);
  const month = new Intl.DateTimeFormat('es-GT', { month: 'short' }).format(date).replace('.', '');
  return `${day} ${month}`;
}

const SKY_BAND_CHECK_MS = 5 * 60 * 1000;

function getSkyBand(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 6 && hour < 18) return 'day';
  if (hour >= 18 && hour < 20) return 'dusk';
  return 'night';
}

function FairWheelScene({ events = [] }) {
  const navigate = useNavigate();
  const cabinCount = Math.min(events.length, MAX_WHEEL_EVENTS);
  const hasEvents = cabinCount > 0;
  const [activeStep, setActiveStep] = useState(0);
  const [isDwelling, setIsDwelling] = useState(true);
  const [skyBand, setSkyBand] = useState(getSkyBand);

  useEffect(() => {
    const intervalId = window.setInterval(() => setSkyBand(getSkyBand()), SKY_BAND_CHECK_MS);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!hasEvents || cabinCount < 2) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    // The wheel itself never stops turning (see `.fair-wheel__spin` in global.css).
    // This timer only tracks which cabin is currently passing the booth, so its
    // photo/date can pop into the center panel as it goes by, in step with the
    // constant rotation — cabin `index` reaches the booth every `gapMs`, starting
    // at mount, since eventCabins[0] is positioned exactly at the booth angle.
    const gapMs = ROTATION_PERIOD_MS / cabinCount;
    const dwellMs = Math.min(EVENT_DWELL_MS, gapMs * 0.5);
    let timeoutId;
    let cancelled = false;
    let index = 0;

    const showAtBooth = () => {
      if (cancelled) return;
      setActiveStep(index);
      setIsDwelling(true);
      timeoutId = window.setTimeout(clearBooth, dwellMs);
    };
    const clearBooth = () => {
      if (cancelled) return;
      setIsDwelling(false);
      index = (index + 1) % cabinCount;
      timeoutId = window.setTimeout(showAtBooth, gapMs - dwellMs);
    };

    timeoutId = window.setTimeout(showAtBooth, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [hasEvents, cabinCount]);

  const eventCabins = useMemo(() => {
    if (!hasEvents) return [];
    const step = 360 / cabinCount;
    return events.slice(0, cabinCount).map((event, index) => ({
      event,
      angle: normalizeAngle(EVENT_FOCUS_ANGLE - index * step)
    }));
  }, [events, hasEvents, cabinCount]);

  const activeIndex = hasEvents ? activeStep % cabinCount : -1;
  const activeEvent = activeIndex >= 0 ? eventCabins[activeIndex]?.event : null;

  return (
    <>
    <div className={'fair-poster fair-poster--' + skyBand} aria-hidden="true">
      <svg className="fair-wheel" viewBox="-24 -70 500 370" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient
            id="rimGradient"
            gradientUnits="userSpaceOnUse"
            x1={WHEEL_CENTER.x - WHEEL_RADIUS * 0.75}
            y1={WHEEL_CENTER.y - WHEEL_RADIUS * 0.75}
            x2={WHEEL_CENTER.x + WHEEL_RADIUS * 0.75}
            y2={WHEEL_CENTER.y + WHEEL_RADIUS * 0.75}
          >
            <stop offset="0%" stopColor="#aab1ba" />
            <stop offset="10%" stopColor="#f4f6f8" />
            <stop offset="24%" stopColor="#6f757e" />
            <stop offset="38%" stopColor="#e9ecef" />
            <stop offset="52%" stopColor="#4d525a" />
            <stop offset="66%" stopColor="#eef1f3" />
            <stop offset="80%" stopColor="#7d838c" />
            <stop offset="92%" stopColor="#f4f6f8" />
            <stop offset="100%" stopColor="#8b929c" />
          </linearGradient>
          <linearGradient
            id="legGradient"
            gradientUnits="userSpaceOnUse"
            x1={WHEEL_CENTER.x - WHEEL_RADIUS * 0.6}
            y1={WHEEL_CENTER.y}
            x2={WHEEL_CENTER.x + WHEEL_RADIUS * 0.6}
            y2={GROUND_Y}
          >
            <stop offset="0%" stopColor="#9aa0a8" />
            <stop offset="15%" stopColor="#cfd3d8" />
            <stop offset="30%" stopColor="#5c6169" />
            <stop offset="45%" stopColor="#b3b8bf" />
            <stop offset="60%" stopColor="#454950" />
            <stop offset="75%" stopColor="#9aa0a8" />
            <stop offset="90%" stopColor="#63676e" />
            <stop offset="100%" stopColor="#4a4d53" />
          </linearGradient>
          <radialGradient id="hubMetalGradient" cx="32%" cy="28%" r="80%">
            <stop offset="0%" stopColor="#f2f4f6" />
            <stop offset="40%" stopColor="#9aa1ab" />
            <stop offset="75%" stopColor="#5c636d" />
            <stop offset="100%" stopColor="#33373d" />
          </radialGradient>
          <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000" stopOpacity=".38" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="cabinGradientBlack" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3a3d44" />
            <stop offset="100%" stopColor="#0c0d10" />
          </linearGradient>
          <radialGradient id="hubStarGradient" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#ffe27a" />
            <stop offset="100%" stopColor="var(--fair-yellow)" />
          </radialGradient>
          <filter id="softShadow" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2.2" floodColor="#000" floodOpacity=".3" />
          </filter>
        </defs>
        <line className="fair-wheel__leg" x1={LEG_TOP_LEFT.x} y1={LEG_TOP_LEFT.y} x2={LEG_OUTER_LEFT.x} y2={LEG_OUTER_LEFT.y} />
        <line className="fair-wheel__leg" x1={LEG_TOP_LEFT.x} y1={LEG_TOP_LEFT.y} x2={LEG_INNER_RIGHT.x} y2={LEG_INNER_RIGHT.y} />
        <line className="fair-wheel__leg" x1={LEG_TOP_RIGHT.x} y1={LEG_TOP_RIGHT.y} x2={LEG_OUTER_RIGHT.x} y2={LEG_OUTER_RIGHT.y} />
        <line className="fair-wheel__leg" x1={LEG_TOP_RIGHT.x} y1={LEG_TOP_RIGHT.y} x2={LEG_INNER_LEFT.x} y2={LEG_INNER_LEFT.y} />
        <line className="fair-wheel__brace" x1={BRACE_1[0].x} y1={BRACE_1[0].y} x2={BRACE_1[1].x} y2={BRACE_1[1].y} />
        <line className="fair-wheel__brace" x1={BRACE_2[0].x} y1={BRACE_2[0].y} x2={BRACE_2[1].x} y2={BRACE_2[1].y} />

        <ellipse className="fair-wheel__shadow" cx={WHEEL_CENTER.x} cy={GROUND_Y + 4} rx="150" ry="14" />

        <g className="fair-wheel__spin">
          <circle className="fair-wheel__rim" cx={WHEEL_CENTER.x} cy={WHEEL_CENTER.y} r={WHEEL_RADIUS} />
          <circle className="fair-wheel__rim-inner" cx={WHEEL_CENTER.x} cy={WHEEL_CENTER.y} r={INNER_RING_RADIUS} />
          {SPOKE_ANGLES.map((angle) => {
            const point = wheelPoint(angle);
            return (
              <line
                key={angle}
                className="fair-wheel__spoke"
                x1={WHEEL_CENTER.x}
                y1={WHEEL_CENTER.y}
                x2={point.x}
                y2={point.y}
              />
            );
          })}
          {RIM_LIGHT_ANGLES.map((angle, index) => {
            const point = wheelPoint(angle);
            return (
              <circle
                key={angle}
                className="fair-wheel__rim-light"
                cx={point.x}
                cy={point.y}
                r="2.6"
                fill={index % 2 ? 'var(--fair-yellow)' : 'var(--wheel-line)'}
              />
            );
          })}
          <circle className="fair-wheel__hub-outer" cx={WHEEL_CENTER.x} cy={WHEEL_CENTER.y} r="18" />
          {HUB_BOLT_ANGLES.map((angle) => {
            const point = wheelPoint(angle, 13);
            return <circle key={angle} className="fair-wheel__hub-bolt" cx={point.x} cy={point.y} r="1.7" />;
          })}
          <circle className="fair-wheel__hub-inner" cx={WHEEL_CENTER.x} cy={WHEEL_CENTER.y} r="8" />
          <path className="fair-wheel__hub-star" d={starPath(WHEEL_CENTER.x, WHEEL_CENTER.y, 6.4, 2.7)} />
          {hasEvents ? eventCabins.map(({ event, angle }, index) => {
            const rimPoint = wheelPoint(angle);
            const cabinPoint = wheelPoint(angle, CABIN_RADIUS);
            const seatTopY = cabinPoint.y + SEAT_HANGER_DROP;
            const facetPoint = wheelPoint(angle, FACET_LABEL_RADIUS);
            const isActive = index === activeIndex && isDwelling;
            const clipId = `eventCabinClip${index}`;
            const image = safeUrl(event.ImagenPrincipalUrl);
            const dateLabel = formatBoothDate(event.FechaInicio);
            return (
              <g key={event.CodigoEvento || index} className="fair-wheel__cabin" filter="url(#softShadow)">
                <line className="fair-wheel__strut" x1={rimPoint.x} y1={rimPoint.y} x2={cabinPoint.x} y2={cabinPoint.y} />
                {dateLabel ? (
                  <g
                    className="fair-wheel__cabin-upright"
                    style={{ transformOrigin: `${facetPoint.x}px ${facetPoint.y}px` }}
                  >
                    <text
                      className={'fair-wheel__facet-date' + (!isDwelling ? ' is-visible' : '')}
                      x={facetPoint.x}
                      y={facetPoint.y}
                      textAnchor="middle"
                    >
                      {dateLabel}
                    </text>
                  </g>
                ) : null}
                <g
                  className="fair-wheel__cabin-upright"
                  style={{ transformOrigin: `${cabinPoint.x}px ${cabinPoint.y}px` }}
                >
                  <a
                    className="fair-wheel__event-link"
                    href={`/eventos/${event.CodigoEvento}`}
                    tabIndex={-1}
                    aria-hidden="true"
                    onClick={(clickEvent) => {
                      clickEvent.preventDefault();
                      navigate(`/eventos/${event.CodigoEvento}`);
                    }}
                  >
                    <circle className="fair-wheel__seat-hook" cx={cabinPoint.x} cy={cabinPoint.y} r="2" />
                    <line
                      className="fair-wheel__seat-hanger"
                      x1={cabinPoint.x}
                      y1={cabinPoint.y}
                      x2={cabinPoint.x - SEAT_WIDTH / 2 + 3}
                      y2={seatTopY}
                    />
                    <line
                      className="fair-wheel__seat-hanger"
                      x1={cabinPoint.x}
                      y1={cabinPoint.y}
                      x2={cabinPoint.x + SEAT_WIDTH / 2 - 3}
                      y2={seatTopY}
                    />
                    <rect
                      className={'fair-wheel__seat-body' + (isActive ? ' is-active' : '')}
                      x={cabinPoint.x - SEAT_WIDTH / 2}
                      y={seatTopY}
                      width={SEAT_WIDTH}
                      height={SEAT_HEIGHT}
                      rx={SEAT_RADIUS}
                      fill={GONDOLA_COLORS[index % GONDOLA_COLORS.length]}
                    />
                    {image ? (
                      <>
                        <clipPath id={clipId}>
                          <rect
                            x={cabinPoint.x - SEAT_WIDTH / 2 + SEAT_IMAGE_INSET}
                            y={seatTopY + SEAT_IMAGE_INSET}
                            width={SEAT_WIDTH - SEAT_IMAGE_INSET * 2}
                            height={SEAT_HEIGHT - SEAT_IMAGE_INSET * 2}
                            rx={SEAT_RADIUS - SEAT_IMAGE_INSET}
                          />
                        </clipPath>
                        <image
                          href={image}
                          x={cabinPoint.x - SEAT_WIDTH / 2 + SEAT_IMAGE_INSET}
                          y={seatTopY + SEAT_IMAGE_INSET}
                          width={SEAT_WIDTH - SEAT_IMAGE_INSET * 2}
                          height={SEAT_HEIGHT - SEAT_IMAGE_INSET * 2}
                          clipPath={`url(#${clipId})`}
                          preserveAspectRatio="xMidYMid slice"
                        />
                      </>
                    ) : null}
                    <rect
                      className="fair-wheel__seat-bar"
                      x={cabinPoint.x - SEAT_WIDTH / 2 + 3}
                      y={seatTopY + SEAT_HEIGHT - 5}
                      width={SEAT_WIDTH - 6}
                      height="3"
                      rx="1.5"
                    />
                  </a>
                </g>
              </g>
            );
          }) : SPOKE_ANGLES.map((angle, index) => {
            const rimPoint = wheelPoint(angle);
            const cabinPoint = wheelPoint(angle, CABIN_RADIUS);
            return (
              <g key={angle} className="fair-wheel__cabin" filter="url(#softShadow)">
                <line className="fair-wheel__strut" x1={rimPoint.x} y1={rimPoint.y} x2={cabinPoint.x} y2={cabinPoint.y} />
                <g
                  className="fair-wheel__cabin-upright"
                  style={{
                    '--cabin-color': GONDOLA_COLORS[index % GONDOLA_COLORS.length],
                    transformOrigin: `${cabinPoint.x}px ${cabinPoint.y}px`
                  }}
                >
                  <ellipse
                    className="fair-wheel__cabin-roof"
                    cx={cabinPoint.x}
                    cy={cabinPoint.y - 9}
                    rx="9.5"
                    ry="4.5"
                  />
                  <rect
                    className="fair-wheel__cabin-body"
                    x={cabinPoint.x - 9}
                    y={cabinPoint.y - 6}
                    width="18"
                    height="19"
                    rx="7"
                  />
                  <rect
                    className="fair-wheel__cabin-window"
                    x={cabinPoint.x - 4.5}
                    y={cabinPoint.y - 2}
                    width="9"
                    height="7"
                    rx="2"
                  />
                  <ellipse className="fair-wheel__cabin-shine" cx={cabinPoint.x - 4} cy={cabinPoint.y - 9} rx="3.4" ry="1.6" />
                </g>
              </g>
            );
          })}
        </g>

        <foreignObject
          className="fair-wheel__center-object"
          x={WHEEL_CENTER.x - INNER_RING_RADIUS}
          y={WHEEL_CENTER.y - INNER_RING_RADIUS}
          width={INNER_RING_RADIUS * 2}
          height={INNER_RING_RADIUS * 2}
        >
          <div xmlns="http://www.w3.org/1999/xhtml" className={'fair-wheel__center' + (hasEvents && activeEvent && isDwelling ? ' is-visible' : '')}>
            {activeEvent ? (
              <Link className="fair-wheel__center-link" to={`/eventos/${activeEvent.CodigoEvento}`}>
                {safeUrl(activeEvent.ImagenPrincipalUrl) ? (
                  <img className="fair-wheel__center-image" src={safeUrl(activeEvent.ImagenPrincipalUrl)} alt="" />
                ) : null}
                <span className="fair-wheel__center-scrim" aria-hidden="true" />
                <span className="fair-wheel__center-copy">
                  {activeEvent.FechaInicio ? <span className="fair-wheel__center-eyebrow">{formatBoothDate(activeEvent.FechaInicio)}</span> : null}
                  <strong className="fair-wheel__center-title">{activeEvent.Titulo}</strong>
                </span>
              </Link>
            ) : null}
          </div>
        </foreignObject>

      </svg>
    </div>
    </>
  );
}

export default function MonthlyHero({ theme, banner, loading = false, events = [] }) {
  const [imageFailed, setImageFailed] = useState(false);
  const content = theme || FALLBACK;
  // La temática indica si mostrar el área dinámica (la escena de la feria).
  // Si viene apagada no se renderiza; sin temática cargada se mantiene por defecto.
  const showDynamicArea = theme ? Boolean(Number(theme.MostrarTematica)) : true;
  const bannerMatchesTheme = Boolean(
    theme?.CodigoTemaMensual
    && banner?.CodigoTemaMensual
    && String(theme.CodigoTemaMensual) === String(banner.CodigoTemaMensual)
  );
  const desktopImage = content.ImagenHeroDesktopUrl || (bannerMatchesTheme ? banner?.ImagenDesktopUrl : '');
  const mobileImage = content.ImagenHeroMobileUrl || (bannerMatchesTheme ? banner?.ImagenMobileUrl : '');
  const themeHasImage = Boolean(content.ImagenHeroDesktopUrl || content.ImagenHeroMobileUrl);
  const hasImage = Boolean(desktopImage || mobileImage) && !imageFailed;
  const title = content.TituloHero || FALLBACK.TituloHero;
  const longTitle = title.length > 36;
  const primaryUrl = content.UrlBotonPrimario || FALLBACK.UrlBotonPrimario;
  const secondaryUrl = content.UrlBotonSecundario || FALLBACK.UrlBotonSecundario;
  const primaryIsBus = isBusDestination(primaryUrl);
  const secondaryIsBus = isBusDestination(secondaryUrl);
  const campaignAlt = bannerMatchesTheme
    ? [banner?.Titulo, banner?.Subtitulo, banner?.Descripcion].filter(Boolean).join('. ')
    : '';
  const imageAlt = content.TextoAlternativo || (bannerMatchesTheme ? banner?.TextoAlternativo : '') || (!themeHasImage ? campaignAlt : '');

  useEffect(() => {
    setImageFailed(false);
  }, [desktopImage, mobileImage]);

  return (
    <section
      className={'monthly-hero ' + (loading ? 'monthly-hero--loading' : hasImage ? 'monthly-hero--image' : 'monthly-hero--fallback') + (showDynamicArea ? '' : ' monthly-hero--flat')}
      aria-labelledby="inicio-titulo"
      aria-busy={loading || undefined}
    >
      {loading ? <span className="visually-hidden" role="status">Cargando la temática de temporada.</span> : null}
      <div className="container monthly-hero__layout">
        <div className="monthly-hero__visual">
          <div className={'monthly-hero__content' + (longTitle ? ' monthly-hero__content--long' : '')}>
            <h1 id="inicio-titulo" data-page-title tabIndex="-1">{title}</h1>
            {content.DescripcionHero ? <p className="hero-lead">{content.DescripcionHero}</p> : null}
            <div className="hero-actions">
              <SmartLink className="button button--primary" href={primaryUrl}>
                {content.TextoBotonPrimario || FALLBACK.TextoBotonPrimario}
                <Icon name="arrow" size={18} />
              </SmartLink>
              {primaryIsBus ? (
                <SmartLink className="button button--accent" href={secondaryUrl}>
                  {content.TextoBotonSecundario || 'Explorar Centra Norte'}
                  <Icon name="arrow" size={18} />
                </SmartLink>
              ) : (
                <Link className="button button--accent" to="/buses">
                  Consultar buses
                  <Icon name="bus" size={18} />
                </Link>
              )}
            </div>
            {!primaryIsBus && !secondaryIsBus && secondaryUrl !== primaryUrl ? (
              <SmartLink className="hero-campaign-link" href={secondaryUrl}>
                {content.TextoBotonSecundario || 'Ver la temporada activa'}
                <Icon name="arrow" size={17} />
              </SmartLink>
            ) : null}
          </div>
          {showDynamicArea ? <FairWheelScene events={events} /> : null}
          {!loading && hasImage ? (
            <div className="monthly-hero__image-layer">
              <ResponsiveImage
                src={desktopImage}
                mobileSrc={mobileImage}
                alt={imageAlt}
                className="monthly-hero__image"
                sizes="(max-width: 979px) 100vw, (max-width: 1179px) 48vw, 66vw"
                eager
                hideFallback
                onLoadError={() => setImageFailed(true)}
              />
            </div>
          ) : null}
        </div>
      </div>

      <nav className="container visit-route" aria-label="Tres formas de vivir Centra Norte">
        {VISIT_STEPS.map((step, index) => (
          <Link key={step.to} className={'visit-route__step visit-route__step--' + step.tone} to={step.to}>
            <span className="visit-route__number" aria-hidden="true">{index + 1}</span>
            <span className="visit-route__icon" aria-hidden="true"><Icon name={step.icon} size={24} /></span>
            <span className="visit-route__copy">
              <strong>{step.label}</strong>
              <small>{step.text}</small>
            </span>
            <Icon className="visit-route__arrow" name="arrow" size={20} />
          </Link>
        ))}
      </nav>
    </section>
  );
}
