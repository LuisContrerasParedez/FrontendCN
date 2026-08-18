export const VB = { w: 1600, h: 900 };

export const CLOUDS = [
  { id: 'a', x: 104, y: 118, s: 1.05, opacity: .58, duration: 34, delay: -4 },
  { id: 'b', x: 640, y: 82, s: .72, opacity: .34, duration: 42, delay: -16 },
  { id: 'c', x: 1280, y: 154, s: .92, opacity: .46, duration: 38, delay: -11 },
  { id: 'd', x: 1120, y: 302, s: .52, opacity: .22, duration: 45, delay: -22 }
];

export const LEAVES = [
  { x: 1128, y: 210, r: -18, s: .95, d: 12.4, delay: -1.4 },
  { x: 1265, y: 258, r: 26, s: .78, d: 14.8, delay: -8.3 },
  { x: 1386, y: 326, r: -6, s: 1.06, d: 13.2, delay: -5.1 },
  { x: 1014, y: 392, r: 42, s: .72, d: 16.2, delay: -10.7 },
  { x: 1450, y: 430, r: -38, s: .86, d: 15.6, delay: -4.3 },
  { x: 1178, y: 492, r: 12, s: .62, d: 17.6, delay: -13.7 },
  { x: 1334, y: 545, r: -22, s: .72, d: 18.4, delay: -7.7 },
  { x: 1512, y: 548, r: 18, s: .56, d: 16.8, delay: -12.4 }
];

export const CANOPY_LEAVES = Array.from({ length: 62 }, (_, i) => {
  const angle = (i * 2.399963229728653) % (Math.PI * 2);
  const ring = 40 + (i % 9) * 13;
  const x = Math.cos(angle) * ring * (1.55 + (i % 3) * .12);
  const y = Math.sin(angle) * ring * .58 + ((i * 17) % 31) - 15;
  return {
    id: i,
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
    r: -35 + ((i * 23) % 70),
    s: .72 + ((i * 19) % 35) / 100,
    tone: i % 5,
    delay: -((i * 0.19) % 4.5)
  };
});

export const TRUNK_TEXTURES = [
  'M1054 690 C1028 604 1042 523 1063 436 C1076 381 1085 338 1094 300',
  'M1092 702 C1080 626 1086 548 1104 474 C1117 420 1122 357 1121 315',
  'M1137 704 C1136 620 1131 557 1147 489 C1158 442 1171 386 1177 335',
  'M1184 693 C1169 620 1180 558 1192 505 C1207 442 1225 404 1244 367',
  'M1012 703 C1025 645 1024 584 1029 540',
  'M1219 695 C1197 647 1201 599 1211 557'
];

export const ORCHIDS = [
  { id: 'a', x: 1236, y: 706, s: 1.02, delay: -1.6 },
  { id: 'b', x: 1448, y: 668, s: 1.18, delay: -3.2 }
];
