/**
 * Escudo de Guatemala, versión simplificada de respaldo.
 *
 * Se dibuja a mano porque a 46 px la reproducción literal se convierte en
 * ruido: aquí quedan sólo los cuatro elementos que la hacen reconocible —corona
 * de laurel, fusiles y espadas cruzados, pergamino y quetzal—. Si `escudoSrc`
 * carga correctamente, esta versión nunca se muestra.
 */
export default function Escudo() {
  return (
    <g>
      {/* Laurel */}
      <g fill="none" stroke="#4b7a30" strokeWidth="3" strokeLinecap="round">
        <path d="M40 88C22 76 15 54 22 32" />
        <path d="M60 88C78 76 85 54 78 32" />
      </g>
      <g fill="#5c8f38">
        {[
          [22, 36, -32], [25, 48, -24], [30, 60, -16], [37, 71, -8], [45, 80, 0],
          [78, 36, 32], [75, 48, 24], [70, 60, 16], [63, 71, 8], [55, 80, 0]
        ].map(([x, y, r], i) => (
          <ellipse key={i} cx={x} cy={y} rx="5.2" ry="2.8" transform={`rotate(${r} ${x} ${y})`} />
        ))}
      </g>

      {/* Fusiles y espadas cruzados */}
      <g stroke="#7a6746" strokeWidth="3.2" strokeLinecap="round">
        <path d="M28 76L70 26" />
        <path d="M72 76L30 26" />
      </g>
      <g stroke="#9fa9b3" strokeWidth="2.4" strokeLinecap="round">
        <path d="M24 70L68 22" />
        <path d="M76 70L32 22" />
      </g>

      {/* Pergamino */}
      <path
        d="M22 52C38 45 62 45 78 52L78 64C62 57 38 57 22 64Z"
        fill="#f8f3e4"
        stroke="#c2a252"
        strokeWidth="1.4"
      />
      <path d="M30 55C43 51 57 51 70 55" stroke="#b09248" strokeWidth="1.6" fill="none" strokeLinecap="round" />

      {/* Quetzal */}
      <g transform="translate(50 34)">
        <path d="M-3 8C-9 4 -10 -4 -5 -8C-1 -11 5 -10 7 -6C9 -2 7 4 2 7Z" fill="#1c8d5f" />
        <path d="M-4 6C-7 3 -7 -1 -5 -4C-2 -1 1 2 3 5Z" fill="#c9243c" />
        <circle cx="-3" cy="-6" r="1.3" fill="#12261c" />
        <path d="M-8 -6L-12 -5L-8 -4Z" fill="#e8b93f" />
        <path d="M4 4C10 12 12 22 10 30C10 20 7 12 2 6Z" fill="#17805a" />
      </g>
    </g>
  );
}
