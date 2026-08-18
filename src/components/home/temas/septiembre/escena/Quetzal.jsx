export default function Quetzal({ uid }) {
  return (
    <g transform="translate(914 218)">
      <g className="sepQuetzal__route">
        <g transform="scale(.86)">
          <g className="sepQuetzal">
          <defs>
            <linearGradient id={`${uid}-quetzal-green`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#65cf72" />
              <stop offset=".46" stopColor="#12a868" />
              <stop offset="1" stopColor="#087458" />
            </linearGradient>
            <linearGradient id={`${uid}-quetzal-wing`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#203e3d" />
              <stop offset=".5" stopColor="#1b5c52" />
              <stop offset="1" stopColor="#2ea06b" />
            </linearGradient>
            <linearGradient id={`${uid}-quetzal-red`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e9473e" />
              <stop offset="1" stopColor="#bb262c" />
            </linearGradient>
            <linearGradient id={`${uid}-quetzal-tail`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1eb27a" />
              <stop offset=".56" stopColor="#0e8f6a" />
              <stop offset="1" stopColor="#0d6e68" />
            </linearGradient>
            <filter id={`${uid}-quetzal-shadow`} x="-80%" y="-80%" width="260%" height="280%">
              <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#16352f" floodOpacity=".22" />
            </filter>
          </defs>

          <g filter={`url(#${uid}-quetzal-shadow)`}>
            <g className="sepQuetzal__tail">
              <path d="M15 82 C-8 149 -39 222 -85 303 C-57 224 -39 146 -25 72Z" fill={`url(#${uid}-quetzal-tail)`} />
              <path d="M26 82 C24 165 13 247 -11 344 C4 257 35 178 55 84Z" fill="#12976d" />
              <path d="M6 82 C-2 146 -12 206 -29 258" fill="none" stroke="#72d48a" strokeWidth="5" strokeLinecap="round" opacity=".55" />
              <path d="M40 80 C35 151 27 220 18 278" fill="none" stroke="#55c97c" strokeWidth="4" strokeLinecap="round" opacity=".48" />
              <path d="M-17 76 C-6 99 3 118 12 137" fill="none" stroke="#f2f5f0" strokeWidth="12" strokeLinecap="round" />
              <path d="M44 77 C38 101 32 119 23 139" fill="none" stroke="#f2f5f0" strokeWidth="12" strokeLinecap="round" />
            </g>

            <g className="sepQuetzal__wing sepQuetzal__wing--back">
              <path d="M-15 34 C-64 -20 -103 -68 -119 -120 C-77 -105 -38 -74 -1 -34 C13 -17 19 3 17 27Z" fill={`url(#${uid}-quetzal-wing)`} />
              <path d="M-25 18 C-61 -23 -86 -58 -100 -90" fill="none" stroke="#74b18c" strokeWidth="5" strokeLinecap="round" opacity=".54" />
              <path d="M-9 10 C-38 -32 -57 -61 -70 -86" fill="none" stroke="#a4c19d" strokeWidth="4" strokeLinecap="round" opacity=".38" />
              <path d="M-37 -20 C-59 -38 -79 -49 -101 -58" fill="none" stroke="#152f35" strokeWidth="8" strokeLinecap="round" opacity=".52" />
            </g>

            <g className="sepQuetzal__wing sepQuetzal__wing--front">
              <path d="M27 31 C60 -26 97 -76 145 -113 C136 -62 115 -14 72 36 C60 50 42 57 28 48Z" fill={`url(#${uid}-quetzal-wing)`} />
              <path d="M45 24 C78 -18 104 -52 126 -79" fill="none" stroke="#77b991" strokeWidth="5" strokeLinecap="round" opacity=".56" />
              <path d="M58 37 C95 6 120 -20 137 -43" fill="none" stroke="#afc9ab" strokeWidth="4" strokeLinecap="round" opacity=".36" />
              <path d="M71 13 C90 -8 112 -22 133 -31" fill="none" stroke="#173537" strokeWidth="8" strokeLinecap="round" opacity=".5" />
            </g>

            <ellipse cx="12" cy="49" rx="46" ry="56" fill={`url(#${uid}-quetzal-green)`} />
            <path d="M-25 54 C-12 84 13 101 44 91 C58 85 67 75 69 61 C45 64 18 60 -25 54Z" fill={`url(#${uid}-quetzal-red)`} />
            <path d="M-30 53 C-11 66 12 70 37 65" fill="none" stroke="#93dc93" strokeWidth="6" strokeLinecap="round" opacity=".5" />

            <g className="sepQuetzal__head">
              <circle cx="7" cy="-2" r="37" fill={`url(#${uid}-quetzal-green)`} />
              <path d="M-17 -25 C-14 -50 -1 -58 8 -41 C18 -59 30 -52 27 -31 C14 -23 1 -20 -17 -25Z" fill="#44bd6b" />
              <circle cx="26" cy="-7" r="6.5" fill="#0c2630" />
              <circle cx="28" cy="-9" r="2" fill="#fff" />
              <path d="M37 -3 72 7 39 15Z" fill="#f4a326" />
              <path d="M42 4 67 8 42 10Z" fill="#c36f1b" opacity=".55" />
            </g>

            <g className="sepQuetzal__feet">
              <path d="M-3 94 C-4 103 -6 110 -11 116 M12 95 C11 104 8 111 4 117" fill="none" stroke="#5f493a" strokeWidth="4" strokeLinecap="round" />
              <path d="M-17 116 C-8 112 1 112 8 116 M0 117 C9 112 18 112 25 116" fill="none" stroke="#5f493a" strokeWidth="3" strokeLinecap="round" />
            </g>
          </g>
          </g>
        </g>
      </g>
    </g>
  );
}
