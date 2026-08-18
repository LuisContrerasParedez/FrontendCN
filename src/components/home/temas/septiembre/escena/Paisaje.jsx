export default function Paisaje({ uid }) {
  return (
    <g className="sepScene__landscape">
      <defs>
        <linearGradient id={`${uid}-mountain-far`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fc9e5" />
          <stop offset="1" stopColor="#d8eaf5" />
        </linearGradient>
        <linearGradient id={`${uid}-mountain-mid`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6ca8d0" />
          <stop offset="1" stopColor="#b7d8e9" />
        </linearGradient>
        <linearGradient id={`${uid}-mountain-near`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4f91bd" />
          <stop offset="1" stopColor="#9bc5dc" />
        </linearGradient>
        <linearGradient id={`${uid}-ground`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#91b985" stopOpacity=".7" />
          <stop offset="1" stopColor="#5d8c66" stopOpacity=".18" />
        </linearGradient>
      </defs>

      <g className="sepScene__mountain sepScene__mountain--far">
        <path d="M-120 675 L86 548 L208 607 L398 465 L520 572 L707 515 L832 613 L1024 452 L1154 593 L1331 510 L1710 675 Z" fill={`url(#${uid}-mountain-far)`} opacity=".62" />
      </g>

      <g className="sepScene__mountain sepScene__mountain--mid">
        <path d="M-120 735 L180 596 L318 660 L530 541 L705 669 L915 548 L1092 667 L1280 566 L1710 724 L1710 900 L-120 900 Z" fill={`url(#${uid}-mountain-mid)`} opacity=".62" />
      </g>

      <g className="sepScene__mountain sepScene__mountain--near">
        <path d="M-120 790 C180 646 356 680 574 712 C796 744 903 624 1118 661 C1328 697 1438 649 1710 758 L1710 900 L-120 900 Z" fill={`url(#${uid}-mountain-near)`} opacity=".48" />
      </g>

      <path d="M720 788 C916 711 1217 684 1600 726 L1600 900 H698 C721 850 734 814 720 788Z" fill={`url(#${uid}-ground)`} />
      <path d="M794 797 C1022 721 1285 713 1600 751" fill="none" stroke="#d5e8cf" strokeWidth="18" opacity=".22" strokeLinecap="round" />
      <rect x="0" y="690" width="1600" height="170" fill="#fff" opacity=".09" />
    </g>
  );
}
