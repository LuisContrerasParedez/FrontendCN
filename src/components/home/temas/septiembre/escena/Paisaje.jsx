import { SUELO, VB } from './escenografia';


export default function Paisaje({ uid }) {
  return (
    <g>
      <defs>
        {/* ============================================================
            MONTAÑAS LEJANAS
            ============================================================ */}

        <linearGradient
          id={`${uid}-montanaLejana`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0" stopColor="#d5e5f1" />
          <stop offset="0.55" stopColor="#bed4e5" />
          <stop offset="1" stopColor="#a9c3d8" />
        </linearGradient>

        <linearGradient
          id={`${uid}-montanaMedia`}
          x1="0"
          y1="0"
          x2="0.15"
          y2="1"
        >
          <stop offset="0" stopColor="#b5ccdb" />
          <stop offset="0.5" stopColor="#91b1c6" />
          <stop offset="1" stopColor="#769aae" />
        </linearGradient>

        {/* ============================================================
            VOLCANES
            ============================================================ */}

        <linearGradient
          id={`${uid}-volcanPrincipal`}
          x1="0"
          y1="0"
          x2="1"
          y2="0.85"
        >
          <stop offset="0" stopColor="#bfcfdc" />
          <stop offset="0.34" stopColor="#a6bfce" />
          <stop offset="0.7" stopColor="#88a7b8" />
          <stop offset="1" stopColor="#708fa0" />
        </linearGradient>

        <linearGradient
          id={`${uid}-volcanSecundario`}
          x1="0"
          y1="0"
          x2="0.9"
          y2="1"
        >
          <stop offset="0" stopColor="#bccfda" />
          <stop offset="0.6" stopColor="#96b3c1" />
          <stop offset="1" stopColor="#7d9dac" />
        </linearGradient>

        <linearGradient
          id={`${uid}-luzVolcan`}
          x1="0"
          y1="0"
          x2="1"
          y2="0.5"
        >
          <stop offset="0" stopColor="#eef5f8" stopOpacity="0.82" />
          <stop offset="0.6" stopColor="#d9e7ed" stopOpacity="0.34" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        <linearGradient
          id={`${uid}-sombraVolcan`}
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          <stop offset="0" stopColor="#557488" stopOpacity="0" />
          <stop offset="0.55" stopColor="#557488" stopOpacity="0.2" />
          <stop offset="1" stopColor="#405f72" stopOpacity="0.42" />
        </linearGradient>

        {/* ============================================================
            COLINAS
            ============================================================ */}

        <linearGradient
          id={`${uid}-colinas`}
          x1="0"
          y1="0"
          x2="0.15"
          y2="1"
        >
          <stop offset="0" stopColor="#88afa1" />
          <stop offset="0.55" stopColor="#739987" />
          <stop offset="1" stopColor="#5d806e" />
        </linearGradient>

        <linearGradient
          id={`${uid}-colinasSombra`}
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          <stop offset="0" stopColor="#426d5c" stopOpacity="0.08" />
          <stop offset="0.55" stopColor="#365e4f" stopOpacity="0.2" />
          <stop offset="1" stopColor="#315344" stopOpacity="0.34" />
        </linearGradient>

        {/* ============================================================
            PRADERA
            ============================================================ */}

        {/* Los dos degradados del campo van anclados al espacio de usuario.
            El suelo se prolonga por debajo del viewBox —ver PRADERA MEDIA y
            PRIMER PLANO— y con `objectBoundingBox` ese alargue estiraría la
            rampa de color; fijados aquí, la franja de más se rellena con el
            último tono y el campo queda igual que antes. */}
        <linearGradient
          id={`${uid}-pradera`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="677.14"
          x2="0"
          y2="802"
        >
          <stop offset="0" stopColor="#8fb76a" />
          <stop offset="0.38" stopColor="#7daa5a" />
          <stop offset="0.75" stopColor="#67934a" />
          <stop offset="1" stopColor="#527c3e" />
        </linearGradient>

        <linearGradient
          id={`${uid}-praderaCerca`}
          gradientUnits="userSpaceOnUse"
          x1="-50"
          y1="732.74"
          x2="290"
          y2="802"
        >
          <stop offset="0" stopColor="#638d4a" />
          <stop offset="0.5" stopColor="#557e42" />
          <stop offset="1" stopColor="#426b36" />
        </linearGradient>

        {/* ============================================================
            ATMÓSFERA
            ============================================================ */}

        <linearGradient
          id={`${uid}-bruma`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0" stopColor="#f7fbfd" stopOpacity="0" />
          <stop offset="0.45" stopColor="#f4f9fc" stopOpacity="0.78" />
          <stop offset="0.75" stopColor="#edf6fa" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        <radialGradient
          id={`${uid}-luzAtmosfera`}
          cx="0.36"
          cy="0.25"
          r="0.65"
        >
          <stop offset="0" stopColor="#fff9dd" stopOpacity="0.42" />
          <stop offset="0.42" stopColor="#f7f5df" stopOpacity="0.16" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        <radialGradient
          id={`${uid}-claroPradera`}
          cx="0.5"
          cy="0.5"
          r="0.5"
        >
          <stop offset="0" stopColor="#e4dd98" stopOpacity="0.28" />
          <stop offset="0.55" stopColor="#cad487" stopOpacity="0.1" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        <radialGradient
          id={`${uid}-sombraSuelo`}
          cx="0.5"
          cy="0.5"
          r="0.5"
        >
          <stop offset="0" stopColor="#263e20" stopOpacity="0.32" />
          <stop offset="0.52" stopColor="#263e20" stopOpacity="0.15" />
          <stop offset="1" stopColor="#263e20" stopOpacity="0" />
        </radialGradient>

        {/* Blur extremadamente ligero: solamente planos remotos */}
        <filter
          id={`${uid}-desenfoqueLejano`}
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
        >
          <feGaussianBlur stdDeviation="1.15" />
        </filter>
      </defs>

      {/* ==============================================================
          LUZ ATMOSFÉRICA
          ============================================================== */}

      <ellipse
        cx="590"
        cy="420"
        rx="620"
        ry="330"
        fill={`url(#${uid}-luzAtmosfera)`}
      />

      {/* ==============================================================
          CORDILLERA MUY LEJANA

          Apenas perceptible. Al perder contraste y detalle parece estar
          decenas de kilómetros detrás.
          ============================================================== */}

      <path
        fill={`url(#${uid}-montanaLejana)`}
        opacity="0.46"
        filter={`url(#${uid}-desenfoqueLejano)`}
        d="
          M-50 520
          C30 494 94 485 156 492
          C218 499 256 480 312 458
          C367 437 409 450 463 471
          C515 491 557 478 609 457
          C666 434 706 448 761 470
          C814 492 852 477 905 461
          C961 444 1008 455 1060 474
          C1111 493 1150 483 1201 466
          C1260 447 1308 459 1361 480
          C1412 500 1459 491 1512 477
          C1562 464 1604 469 1650 485
          L1650 620
          L-50 620
          Z
        "
      />

      {/* ==============================================================
          VOLCANES

          Un volcán principal alto y otro más bajo, parcialmente oculto.
          ============================================================== */}

      <g>
        {/* Volcán principal */}
        <path
          fill={`url(#${uid}-volcanPrincipal)`}
          d="
            M390 585

            C444 571
             489 548
             531 515

            C572 483
             605 440
             628 401

            C643 375
             655 354
             666 350

            C675 347
             681 350
             688 356

            C695 361
             702 358
             709 358

            C720 359
             727 372
             741 396

            C770 447
             805 493
             847 524

            C883 550
             919 571
             964 585

            Z
          "
        />

        {/* Ladera iluminada */}
        <path
          fill={`url(#${uid}-luzVolcan)`}
          d="
            M666 350

            C650 383
             627 424
             598 461

            C567 500
             532 535
             492 557

            C467 571
             441 579
             411 585

            L572 585

            C594 555
             615 521
             631 485

            C646 451
             657 414
             666 350

            Z
          "
        />

        {/* Cara opuesta */}
        <path
          fill={`url(#${uid}-sombraVolcan)`}
          d="
            M688 356

            C711 386
             728 422
             749 461

            C772 503
             810 544
             859 568

            C879 577
             897 582
             923 585

            L739 585

            C730 537
             717 489
             706 444

            C699 414
             692 383
             688 356

            Z
          "
        />

        {/* Cráter */}
        <path
          d="
            M666 350
            C675 347 681 350 688 356
            C695 361 702 358 709 358
          "
          fill="none"
          stroke="#768fa0"
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.45"
        />

        {/* Volcán secundario */}
        <path
          fill={`url(#${uid}-volcanSecundario)`}
          d="
            M756 586

            C798 574
             831 551
             854 521

            C877 491
             889 458
             903 432

            C913 414
             920 404
             928 403

            C938 403
             944 414
             955 434

            C971 464
             989 501
             1017 529

            C1046 557
             1076 575
             1115 586

            Z
          "
        />

        <path
          fill="#dbe7eb"
          opacity="0.38"
          d="
            M928 403
            C910 444 890 486 862 520
            C842 545 819 565 790 578
            L838 586
            C870 555 895 512 910 474
            C920 448 926 421 928 403
            Z
          "
        />
      </g>

      {/* ==============================================================
          BRUMA DEL VALLE

          Ya no es un rectángulo. Sigue la topografía y rompe visualmente
          las bases de los volcanes.
          ============================================================== */}

      <path
        fill={`url(#${uid}-bruma)`}
        opacity="0.82"
        d="
          M-60 548

          C110 520
           235 553
           364 543

          C490 534
           563 551
           680 550

          C799 549
           875 527
           1006 542

          C1133 556
           1236 533
           1365 548

          C1482 561
           1577 542
           1660 554

          L1660 629

          C1502 608
           1371 624
           1242 614

          C1116 604
           1012 623
           891 612

          C763 601
           665 623
           538 613

          C397 602
           294 622
           168 610

          C75 601
           3 611
           -60 606

          Z
        "
      />

      {/* ==============================================================
          CORDILLERA MEDIA
          ============================================================== */}

      <path
        fill={`url(#${uid}-montanaMedia)`}
        d="
          M-50 610

          C43 578
           108 590
           176 576

          C239 563
           287 539
           346 553

          C402 566
           446 588
           508 573

          C571 557
           622 557
           685 577

          C747 596
           804 578
           866 566

          C929 554
           979 570
           1040 582

          C1105 594
           1154 576
           1217 567

          C1282 558
           1335 577
           1397 588

          C1472 601
           1544 579
           1650 592

          L1650 706
          L-50 706
          Z
        "
      />

      {/* Sombras de la cordillera media */}
      <path
        fill="#617f91"
        opacity="0.14"
        d="
          M160 584
          C258 562 297 541 347 553
          C399 565 445 588 505 574
          C456 599 400 610 337 606
          C273 602 224 590 160 584
          Z

          M850 570
          C924 551 979 571 1040 582
          C1098 592 1151 576 1217 567
          C1159 603 1095 615 1026 608
          C963 602 908 584 850 570
          Z
        "
      />

      {/* Bruma baja */}
      <path
        fill={`url(#${uid}-bruma)`}
        opacity="0.43"
        d="
          M-50 606
          C159 588 286 615 449 603
          C612 592 725 618 890 606
          C1048 595 1174 621 1341 609
          C1460 600 1559 609 1650 606
          L1650 676
          C1499 660 1374 675 1224 667
          C1072 659 955 678 806 668
          C655 658 539 676 387 666
          C238 656 111 675 -50 663
          Z
        "
      />

      {/* ==============================================================
          COLINAS
          ============================================================== */}

      <path
        fill={`url(#${uid}-colinas)`}
        d="
          M-50 666

          C75 623
           164 642
           258 626

          C344 611
           416 611
           500 636

          C577 659
           646 631
           727 626

          C810 621
           876 651
           955 647

          C1042 643
           1093 618
           1184 626

          C1272 634
           1339 658
           1430 647

          C1512 637
           1584 647
           1650 651

          L1650 760
          L-50 760
          Z
        "
      />

      {/* Sombra de laderas */}
      <path
        fill={`url(#${uid}-colinasSombra)`}
        d="
          M492 636
          C574 659 642 632 727 626
          C679 651 639 669 575 675
          C535 673 513 657 492 636
          Z

          M950 647
          C1034 644 1095 618 1184 626
          C1138 654 1087 669 1027 670
          C994 667 970 658 950 647
          Z

          M1427 647
          C1511 637 1585 647 1650 651
          L1650 704
          C1565 684 1494 674 1427 647
          Z
        "
      />

      {/* ==============================================================
          PRADERA MEDIA
          ============================================================== */}

      <path
        fill={`url(#${uid}-pradera)`}
        d={`
          M-50 706

          C78 677
           194 694
           301 687

          C421 679
           507 670
           614 686

          C723 702
           818 679
           926 688

          C1046 698
           1129 688
           1234 694

          C1341 700
           1444 684
           1650 700

          L1650 ${VB.h + 10}
          L-50 ${VB.h + 10}
          Z
        `}
      />

      {/* Mancha de luz sobre el campo */}
      <ellipse
        cx="498"
        cy="715"
        rx="390"
        ry="62"
        fill={`url(#${uid}-claroPradera)`}
        transform="rotate(-2 498 715)"
      />

      {/* Variación tonal del terreno */}
      <path
        d="
          M-30 718
          C172 697 319 722 471 709
          C598 699 705 718 827 710
          C966 701 1054 722 1186 712
        "
        fill="none"
        stroke="#9fbd6e"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.15"
      />

      {/* ==============================================================
          PRIMER PLANO

          El campo cierra por debajo del viewBox, no en la línea de suelo. El
          hero es 16:9 y el viewBox también, así que en cuanto la caja cae en
          esa proporción exacta `slice` no recorta nada: todo lo que quedara
          sin pintar entre el suelo y VB.h dejaría ver el cielo como una franja
          gris bajo el pasto.
          ============================================================== */}

      <path
        fill={`url(#${uid}-praderaCerca)`}
        d={`
          M-50 745

          C85 724
           213 747
           344 736

          C480 725
           591 746
           728 738

          C867 730
           980 751
           1120 741

          C1265 731
           1393 750
           1650 738

          L1650 ${VB.h + 10}
          L-50 ${VB.h + 10}
          Z
        `}
      />

      {/* Pequeñas zonas oscuras del terreno */}
      <g
        fill="none"
        stroke="#355d31"
        strokeLinecap="round"
        opacity="0.18"
      >
        <path
          d="
            M64 766
            C151 755 213 766 289 758
          "
          strokeWidth="5"
        />

        <path
          d="
            M673 761
            C746 751 811 762 873 757
          "
          strokeWidth="4"
        />

        <path
          d="
            M1376 760
            C1440 752 1514 761 1584 754
          "
          strokeWidth="5"
        />
      </g>

      {/* ==============================================================
          SOMBRA DE LA CEIBA
          ============================================================== */}

      <ellipse
        cx="1252"
        cy={SUELO - 2}
        rx="292"
        ry="34"
        fill={`url(#${uid}-sombraSuelo)`}
      />

      {/* ==============================================================
          ZACATE

          Distribución irregular. Evita repetir exactamente el mismo patrón.
          ============================================================== */}

      <g
        className="sepEsc__zacate"
        stroke="#355f31"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.48"
      >
        <path
          d="
            M1007 751
            C1005 738 1003 729 998 720

            M1016 751
            C1016 737 1019 726 1022 715

            M1026 751
            C1029 738 1033 729 1040 720
          "
        />

        <path
          d="
            M1104 753
            C1103 741 1100 731 1096 724

            M1112 753
            C1114 740 1117 730 1122 722
          "
        />

        <path
          d="
            M1342 751
            C1340 737 1337 728 1332 718

            M1352 752
            C1352 739 1355 728 1359 719

            M1361 752
            C1365 741 1369 732 1376 724
          "
        />

        <path
          d="
            M1482 751
            C1479 738 1477 729 1472 720

            M1492 752
            C1493 738 1497 728 1502 719
          "
        />

        <path
          d="
            M1571 750
            C1569 737 1567 728 1563 719

            M1581 751
            C1583 739 1587 730 1592 722
          "
        />
      </g>
    </g>
  );
}
