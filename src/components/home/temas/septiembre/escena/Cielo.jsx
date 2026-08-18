import { CLOUDS } from './escenografia';

function Nube({ cloud }) {
  return (
    <g transform={`translate(${cloud.x} ${cloud.y}) scale(${cloud.s})`} opacity={cloud.opacity}>
      <g
        className="sepScene__cloud"
        style={{
          '--cloud-duration': `${cloud.duration}s`,
          '--cloud-delay': `${cloud.delay}s`
        }}
      >
        <path d="M0 44 C10 27 28 22 45 29 C56 5 91 3 104 27 C122 19 149 29 154 48 C139 59 20 62 0 44Z" fill="#fff" />
        <path d="M20 50 C47 54 119 53 143 47" fill="none" stroke="#d9eef9" strokeWidth="4" strokeLinecap="round" opacity=".7" />
      </g>
    </g>
  );
}

export default function Cielo({ uid }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9dd8f6" />
          <stop offset=".48" stopColor="#cbeafa" />
          <stop offset="1" stopColor="#f7fbfd" />
        </linearGradient>
        <radialGradient id={`${uid}-sun`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff8cf" stopOpacity=".95" />
          <stop offset=".34" stopColor="#fff4b2" stopOpacity=".46" />
          <stop offset="1" stopColor="#fff4b2" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-haze`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity=".92" />
          <stop offset=".42" stopColor="#fff" stopOpacity=".56" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="1600" height="900" fill={`url(#${uid}-sky)`} />
      <circle className="sepScene__sun" cx="1050" cy="212" r="330" fill={`url(#${uid}-sun)`} />
      <path d="M0 0H720 C610 115 548 239 531 389 C514 539 372 625 0 655Z" fill={`url(#${uid}-haze)`} opacity=".58" />

      {CLOUDS.map((cloud) => <Nube key={cloud.id} cloud={cloud} />)}
    </g>
  );
}
