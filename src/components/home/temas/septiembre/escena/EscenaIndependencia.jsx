import Cielo from './Cielo';
import Paisaje from './Paisaje';
import Ceiba from './Ceiba';
import Quetzal from './Quetzal';
import Orquideas from './Orquideas';
import { LEAVES, VB } from './escenografia';

function HojaVolando({ leaf }) {
  return (
    <g transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.r}) scale(${leaf.s})`}>
      <g
        className="sepScene__floatingLeaf"
        style={{
          '--leaf-duration': `${leaf.d}s`,
          '--leaf-delay': `${leaf.delay}s`
        }}
      >
        <path d="M0 -9 C10 -7 15 1 6 9 C0 14 -8 10 -10 4 C-12 -3 -7 -8 0 -9Z" fill="#78a950" />
        <path d="M-6 6 5-6" stroke="#d4d78a" strokeWidth="1.2" opacity=".55" />
      </g>
    </g>
  );
}

export default function EscenaIndependencia({ uid }) {
  return (
    <svg
      className="sepScene"
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
      focusable="false"
    >
      <Cielo uid={uid} />
      <Paisaje uid={uid} />
      <Ceiba uid={uid} />
      <Orquideas uid={uid} />
      <Quetzal uid={uid} />
      {LEAVES.map((leaf, index) => <HojaVolando key={index} leaf={leaf} />)}
    </svg>
  );
}
