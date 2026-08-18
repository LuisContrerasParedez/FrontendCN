import { useState } from 'react';

function EscudoMini({ src }) {
  const [fallo, setFallo] = useState(false);

  if (!src || fallo) {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M19 43c8-16 18-22 27-25M17 36c6 2 10 6 13 12M45 35c-6 2-10 6-13 12" fill="none" stroke="#6b8135" strokeWidth="3" strokeLinecap="round" />
        <path d="m32 18 5 9 10 2-7 7 2 10-10-5-10 5 2-10-7-7 10-2Z" fill="#d4a72c" />
      </svg>
    );
  }

  return <img src={src} alt="" onError={() => setFallo(true)} />;
}

export default function Tendido({ escudoSrc }) {
  return (
    <div className="sepRibbon" aria-hidden="true">
      <svg className="sepRibbon__svg" viewBox="0 0 1600 190" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sep-ribbon-blue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#68b7eb" />
            <stop offset="1" stopColor="#1680c9" />
          </linearGradient>
          <linearGradient id="sep-ribbon-blue-deep" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#1474b5" />
            <stop offset=".48" stopColor="#399bd6" />
            <stop offset="1" stopColor="#0d639f" />
          </linearGradient>
          <filter id="sep-ribbon-shadow" x="-20%" y="-50%" width="140%" height="200%">
            <feDropShadow dx="0" dy="7" stdDeviation="10" floodColor="#0b4677" floodOpacity=".18" />
          </filter>
        </defs>

        <g className="sepRibbon__wave" filter="url(#sep-ribbon-shadow)">
          <path d="M-80 74 C250 124 470 28 785 70 C1105 113 1310 34 1680 88 L1680 132 C1320 77 1111 155 790 115 C475 76 250 167 -80 119 Z" fill="url(#sep-ribbon-blue)" />
          <path d="M-80 99 C248 145 478 53 788 94 C1110 136 1322 60 1680 112 L1680 135 C1324 84 1114 159 790 119 C474 80 245 171 -80 124 Z" fill="#fff" />
          <path d="M-80 119 C248 159 478 79 790 115 C1113 153 1320 82 1680 129 L1680 141 C1328 97 1118 165 790 132 C475 98 244 176 -80 138 Z" fill="#d8aa2b" />
          <path d="M-80 137 C255 174 480 101 790 133 C1115 166 1328 106 1680 146 L1680 200 L-80 200 Z" fill="url(#sep-ribbon-blue-deep)" />
        </g>
      </svg>

      <div className="sepRibbon__flag">
        <div className="sepRibbon__flagFold sepRibbon__flagFold--left" />
        <div className="sepRibbon__flagBody">
          <span className="sepRibbon__flagBlue" />
          <span className="sepRibbon__flagWhite"><EscudoMini src={escudoSrc} /></span>
          <span className="sepRibbon__flagBlue" />
        </div>
        <div className="sepRibbon__flagFold sepRibbon__flagFold--right" />
      </div>
    </div>
  );
}
