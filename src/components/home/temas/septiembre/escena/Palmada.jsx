import { foliolo } from './escenografia';

const FOLIOLOS = [
  { giro: -74, largo: 15 },
  { giro: -38, largo: 19 },
  { giro: 0, largo: 22 },
  { giro: 38, largo: 19 },
  { giro: 74, largo: 15 }
];

/**
 * Hoja palmada de cinco foliolos: la forma real de la hoja de ceiba y el
 * detalle que impide que las masas de follaje se lean como manchas planas.
 * Se declara una sola vez en `<defs>` y se reutiliza con `<use>`.
 */
export default function Palmada({ id }) {
  return (
    <g id={id}>
      <path d="M0 0L0 -5" stroke="#4a7a3c" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {FOLIOLOS.map((f) => (
        <path key={f.giro} d={foliolo(f.largo)} transform={`rotate(${f.giro})`} />
      ))}
    </g>
  );
}
