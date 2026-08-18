import { CANOPY_LEAVES, TRUNK_TEXTURES } from './escenografia';

function Hoja({ leaf }) {
  const fills = ['#2c723f', '#3f8850', '#5a9b5d', '#79aa61', '#9bbc67'];
  return (
    <g transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.r}) scale(${leaf.s})`}>
      <g className="sepTree__leaf" style={{ '--leaf-delay': `${leaf.delay}s` }}>
        <path d="M0 -10 C9 -7 13 1 5 9 C1 13 -6 12 -9 6 C-13 -3 -8 -9 0 -10Z" fill={fills[leaf.tone]} />
        <path d="M-5 7 5-6" stroke="#d6d985" strokeWidth="1" opacity=".34" strokeLinecap="round" />
      </g>
    </g>
  );
}

export default function Ceiba({ uid }) {
  return (
    <g className="sepTree" transform="translate(102 0)">
      <defs>
        <linearGradient id={`${uid}-trunk`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5f3b27" />
          <stop offset=".28" stopColor="#8c5c36" />
          <stop offset=".52" stopColor="#a67546" />
          <stop offset=".72" stopColor="#765032" />
          <stop offset="1" stopColor="#4f3426" />
        </linearGradient>
        <linearGradient id={`${uid}-branch`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#967048" />
          <stop offset="1" stopColor="#5c3a27" />
        </linearGradient>
        <radialGradient id={`${uid}-canopy`} cx="46%" cy="34%" r="72%">
          <stop offset="0" stopColor="#85b865" />
          <stop offset=".42" stopColor="#4a8a4f" />
          <stop offset="1" stopColor="#1e5736" />
        </radialGradient>
        <radialGradient id={`${uid}-canopy-highlight`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#cfdf77" stopOpacity=".66" />
          <stop offset="1" stopColor="#a9ca66" stopOpacity="0" />
        </radialGradient>
        <filter id={`${uid}-tree-shadow`} x="-30%" y="-30%" width="170%" height="190%">
          <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#17392d" floodOpacity=".2" />
        </filter>
      </defs>

      <ellipse cx="1160" cy="744" rx="250" ry="34" fill="#315e4c" opacity=".12" />

      <g className="sepTree__trunk" filter={`url(#${uid}-tree-shadow)`}>
        <path d="M1032 726 C1039 664 1050 607 1054 552 C1059 492 1066 431 1086 371 C1094 344 1103 320 1114 294 C1130 320 1147 346 1155 375 C1170 427 1166 482 1181 531 C1194 578 1214 625 1234 673 C1242 691 1252 709 1267 726 C1228 721 1191 715 1158 713 C1118 711 1079 716 1032 726Z" fill={`url(#${uid}-trunk)`} />

        <path d="M1112 332 C1062 324 1014 305 973 273 C947 253 921 241 886 235" fill="none" stroke={`url(#${uid}-branch)`} strokeWidth="34" strokeLinecap="round" />
        <path d="M1119 342 C1177 313 1236 279 1289 238 C1328 209 1373 193 1416 186" fill="none" stroke={`url(#${uid}-branch)`} strokeWidth="38" strokeLinecap="round" />
        <path d="M1124 360 C1165 359 1208 352 1254 330 C1290 313 1326 304 1361 302" fill="none" stroke={`url(#${uid}-branch)`} strokeWidth="24" strokeLinecap="round" />
        <path d="M1092 365 C1059 368 1021 364 987 348 C951 330 918 322 882 322" fill="none" stroke={`url(#${uid}-branch)`} strokeWidth="22" strokeLinecap="round" />
        <path d="M1115 336 C1122 292 1134 253 1153 220" fill="none" stroke={`url(#${uid}-branch)`} strokeWidth="26" strokeLinecap="round" />

        <path d="M1055 573 C1018 629 995 675 956 720 C1001 715 1042 708 1081 703Z" fill="#69432b" />
        <path d="M1168 570 C1200 624 1242 683 1291 725 C1248 719 1204 712 1160 711Z" fill="#68412b" />
        <path d="M1100 600 C1090 651 1073 690 1054 723 L1121 712Z" fill="#9e7045" />
        <path d="M1144 602 C1156 650 1172 690 1198 718 L1138 712Z" fill="#765033" />

        {TRUNK_TEXTURES.map((d, index) => (
          <path key={index} d={d} fill="none" stroke={index % 2 ? '#4b3024' : '#c49763'} strokeWidth={index % 2 ? 4 : 3} opacity={index % 2 ? .28 : .26} strokeLinecap="round" />
        ))}
      </g>

      <g transform="translate(1130 240)">
        <g className="sepTree__canopy">
        <path d="M-286 74 C-317 13 -279 -45 -220 -58 C-211 -122 -142 -149 -88 -119 C-48 -169 39 -171 76 -123 C137 -153 204 -120 214 -63 C270 -51 308 4 286 56 C315 111 267 161 211 160 C188 214 110 228 66 190 C14 227 -60 215 -91 172 C-155 204 -227 169 -228 113 C-260 108 -281 95 -286 74Z" fill={`url(#${uid}-canopy)`} />
        <path d="M-246 17 C-199 -59 -117 -103 -22 -100 C86 -96 171 -47 220 34 C112 -10 13 -5 -75 24 C-136 44 -193 43 -246 17Z" fill="#73aa5b" opacity=".34" />
        <ellipse cx="-42" cy="-72" rx="190" ry="96" fill={`url(#${uid}-canopy-highlight)`} opacity=".58" />

        {CANOPY_LEAVES.map((leaf) => <Hoja key={leaf.id} leaf={leaf} />)}
        </g>
      </g>

      <g className="sepTree__perchBranch">
        <path d="M979 316 C941 304 907 299 870 303 C848 305 830 313 813 324" fill="none" stroke="#64422d" strokeWidth="16" strokeLinecap="round" />
        <path d="M883 307 C860 290 842 276 826 257" fill="none" stroke="#76543b" strokeWidth="8" strokeLinecap="round" />
        <g transform="translate(812 253)">
          <path d="M0 12 C10 -8 29 -9 37 5 C26 12 14 15 0 12Z" fill="#6b9a4e" />
          <path d="M10 1 C16 14 17 28 13 39" fill="none" stroke="#48713e" strokeWidth="2" />
        </g>
      </g>
    </g>
  );
}
