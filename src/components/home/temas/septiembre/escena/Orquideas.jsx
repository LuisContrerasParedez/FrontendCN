import { ORCHIDS } from './escenografia';

function Orquidea({ orchid, uid }) {
  return (
    <g transform={`translate(${orchid.x} ${orchid.y}) scale(${orchid.s})`}>
      <g className="sepOrchid" style={{ '--orchid-delay': `${orchid.delay}s` }}>
      <path d="M-10 66 C-18 35 -18 9 -8 -16" fill="none" stroke="#396f43" strokeWidth="5" strokeLinecap="round" />
      <path d="M-6 43 C-34 32 -50 35 -65 50 C-39 55 -20 56 -7 51Z" fill="#547f42" />
      <path d="M-2 32 C21 14 42 15 58 27 C37 40 17 44 -4 42Z" fill="#6f9348" />
      <g className="sepOrchid__flower">
        <ellipse cx="0" cy="0" rx="23" ry="42" fill={`url(#${uid}-petal)`} transform="rotate(-4) translate(0 -23)" />
        <ellipse cx="0" cy="0" rx="22" ry="40" fill={`url(#${uid}-petal)`} transform="rotate(60) translate(2 -22)" />
        <ellipse cx="0" cy="0" rx="22" ry="40" fill={`url(#${uid}-petal)`} transform="rotate(-60) translate(-2 -22)" />
        <ellipse cx="0" cy="0" rx="18" ry="30" fill="#fffdf7" transform="rotate(102) translate(-2 -17)" />
        <ellipse cx="0" cy="0" rx="18" ry="30" fill="#fffdf7" transform="rotate(-102) translate(2 -17)" />
        <path d="M-14 7 C-8 -3 8 -5 16 5 C15 19 9 30 0 36 C-10 28 -16 19 -14 7Z" fill="#c62c79" />
        <path d="M-7 7 C-2 1 5 1 9 7 C6 14 2 18 -1 20 C-5 16 -8 12 -7 7Z" fill="#f0b43e" />
      </g>
      </g>
    </g>
  );
}

export default function Orquideas({ uid }) {
  return (
    <g>
      <defs>
        <radialGradient id={`${uid}-petal`} cx="42%" cy="36%" r="70%">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".72" stopColor="#f9f9f4" />
          <stop offset="1" stopColor="#e7edf1" />
        </radialGradient>
      </defs>
      {ORCHIDS.map((orchid) => <Orquidea key={orchid.id} orchid={orchid} uid={uid} />)}
    </g>
  );
}
