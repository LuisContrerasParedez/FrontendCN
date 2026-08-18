import { SUELO, VB } from './escenografia';

/**
 * Cordilleras, volcanes y pradera. La profundidad se construye con perspectiva
 * atmosférica: cada plano que se acerca pierde azul, gana saturación y contraste.
 * Entre planos se intercalan bandas de neblina que son las que hacen creíble la
 * distancia sin necesidad de detalle.
 *
 * Ninguna cresta se dibuja con segmentos rectos. Un volcán resuelto con dos
 * rectas y un vértice se lee como un triángulo; el perfil real es cóncavo —las
 * faldas se abren al llegar al suelo— y asimétrico, y es esa curva la que hace
 * que la silueta parezca una montaña y no un icono.
 */
export default function Paisaje({ uid }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-lejos`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d6e5f3" />
          <stop offset="1" stopColor="#c1d8ec" />
        </linearGradient>
        <linearGradient id={`${uid}-volcan`} x1="0.1" y1="0" x2="0.9" y2="0.9">
          <stop offset="0" stopColor="#c4d8ec" />
          <stop offset="0.52" stopColor="#a7c2de" />
          <stop offset="1" stopColor="#8aa9cc" />
        </linearGradient>
        <linearGradient id={`${uid}-medio`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#accae3" />
          <stop offset="1" stopColor="#8db1d3" />
        </linearGradient>
        <linearGradient id={`${uid}-colinas`} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#93b6ae" />
          <stop offset="1" stopColor="#6d947c" />
        </linearGradient>
        <linearGradient id={`${uid}-pradera`} x1="0.1" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#96bf70" />
          <stop offset="0.58" stopColor="#7aa858" />
          <stop offset="1" stopColor="#649345" />
        </linearGradient>
        <linearGradient id={`${uid}-praderaCerca`} x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0" stopColor="#5f8f45" />
          <stop offset="1" stopColor="#476f37" />
        </linearGradient>
        <linearGradient id={`${uid}-neblina`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.55" stopColor="#f4fbff" stopOpacity="0.72" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${uid}-sombraSuelo`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#2c4a24" stopOpacity="0.36" />
          <stop offset="0.6" stopColor="#2c4a24" stopOpacity="0.15" />
          <stop offset="1" stopColor="#2c4a24" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-claroLuz`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fdf6d8" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fdf6d8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Cresta más lejana: apenas un tono sobre el cielo. Los planos del
          paisaje no se animan nunca; una montaña que se desplaza delata la
          ilustración más que cualquier otro detalle. */}
      <path
        fill={`url(#${uid}-lejos)`}
        opacity="0.6"
        d="M-40 498C70 470 138 492 232 462C312 436 366 478 448 458C534 436 590 484 686 464C770 446 822 482 906 466C994 450 1046 488 1142 472C1234 456 1294 490 1390 474C1476 460 1536 490 1640 474L1640 640L-40 640Z"
      />

      {/* Cordillera lejana */}
      <path
        fill={`url(#${uid}-lejos)`}
        d="M-40 528C80 492 150 516 238 484C318 456 374 502 456 480C544 456 600 508 696 488C780 470 832 506 916 490C1004 474 1056 512 1152 496C1244 480 1304 514 1400 498C1486 484 1544 514 1640 498L1640 668L-40 668Z"
      />

      {/* Par de volcanes: la silueta que identifica el altiplano. Falda cóncava,
          cumbre desplazada del centro y una muesca de cráter en la cima. */}
      <g>
        <path
          fill={`url(#${uid}-volcan)`}
          d="M486 566C544 552 598 514 640 456C652 440 660 432 666 430C673 428 680 436 692 454C736 516 798 552 858 566Z"
        />
        {/* Cara iluminada, sólo en la ladera que mira a la luz */}
        <path
          fill="#dfecf8"
          opacity="0.68"
          d="M666 430C650 462 630 496 604 524C580 548 556 560 534 566C566 552 594 530 616 502C638 474 654 450 666 430Z"
        />
        <path fill="#8fadcf" opacity="0.45" d="M666 430C673 428 680 436 692 454C704 474 716 492 728 506C712 494 698 478 686 458C678 444 672 434 666 430Z" />

        <path
          fill={`url(#${uid}-volcan)`}
          d="M752 566C798 556 840 528 862 484C870 466 876 460 880 460C885 460 890 468 898 484C920 528 960 556 1004 566Z"
        />
        <path
          fill="#d3e3f2"
          opacity="0.56"
          d="M880 460C870 486 856 512 838 534C822 552 806 562 790 566C812 554 830 536 846 512C862 488 873 470 880 460Z"
        />
      </g>

      {/* Cordillera media */}
      <path
        fill={`url(#${uid}-medio)`}
        d="M-40 584C86 558 168 578 268 552C358 528 422 570 522 552C612 536 678 574 778 558C866 544 928 578 1030 562C1122 548 1186 582 1286 566C1374 552 1438 584 1536 568C1574 562 1612 570 1640 564L1640 706L-40 706Z"
      />

      <rect x="-40" y="516" width={VB.w + 80} height="124" fill={`url(#${uid}-neblina)`} />

      {/* Colinas cercanas: primer plano verde-azulado */}
      <path
        fill={`url(#${uid}-colinas)`}
        d="M-40 642C104 612 198 638 314 618C420 600 486 632 604 622C710 613 782 640 898 628C1004 617 1076 642 1190 632C1294 622 1362 644 1476 634C1546 628 1600 636 1640 632L1640 766L-40 766Z"
      />

      <rect x="-40" y="600" width={VB.w + 80} height="90" fill={`url(#${uid}-neblina)`} opacity="0.7" />

      {/* Pradera */}
      <path
        fill={`url(#${uid}-pradera)`}
        d={`M-40 690C130 666 236 692 372 678C486 666 566 692 700 684C820 677 900 696 1032 690C1150 685 1230 702 1356 696C1462 691 1560 700 1640 694L1640 ${SUELO + 40}L-40 ${SUELO + 40}Z`}
      />

      <ellipse cx="470" cy="708" rx="380" ry="46" fill={`url(#${uid}-claroLuz)`} />

      <path
        fill={`url(#${uid}-praderaCerca)`}
        d={`M-40 728C140 714 268 732 420 724C560 717 660 734 812 730C950 726 1050 740 1200 736C1330 733 1520 742 1640 736L1640 ${SUELO + 40}L-40 ${SUELO + 40}Z`}
      />

      {/* Sombra proyectada de la ceiba, centrada en el eje del fuste y tan ancha
          como el contrafuerte de raíces. */}
      <ellipse cx="1252" cy={SUELO - 2} rx="286" ry="32" fill={`url(#${uid}-sombraSuelo)`} />

      {/* Matas de zacate: textura mínima, sin poblar el suelo */}
      <g className="sepEsc__zacate" stroke="#3f6c33" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.5">
        <path d="M1064 748C1062 734 1060 724 1056 714M1074 748C1074 734 1076 724 1078 712M1084 749C1086 736 1090 726 1096 718" />
        <path d="M1318 750C1316 736 1314 726 1310 716M1328 750C1328 737 1330 727 1334 718" />
        <path d="M1440 748C1438 735 1436 726 1432 717M1450 749C1451 736 1454 727 1458 719M1460 750C1464 738 1468 730 1474 723" />
        <path d="M1556 746C1554 733 1552 724 1548 715M1566 747C1567 734 1570 725 1574 717" />
      </g>
    </g>
  );
}
