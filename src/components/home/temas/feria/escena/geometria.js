/*
 * Utilidades geométricas de la escena de feria.
 * Sin JSX ni estado: solo cálculo puro, para poder reusarlo desde cualquier pieza.
 */

export const RAD = Math.PI / 180;

export const f = (n) => Math.round(n * 100) / 100;

export const polar = (cx, cy, r, deg) => ({
  x: f(cx + r * Math.cos(deg * RAD)),
  y: f(cy + r * Math.sin(deg * RAD))
});

// Ruido determinista: mismos valores en cada render y en cada recarga,
// así la escena nunca "salta" ni difiere entre servidor y cliente.
export function azar(i, sal = 0) {
  const v = Math.sin(i * 12.9898 + sal * 78.233 + 17.31) * 43758.5453;
  return v - Math.floor(v);
}

export const rango = (i, min, max, sal = 0) => min + azar(i, sal) * (max - min);

export function curvaGuirnalda(a, b, caida) {
  const cx = f((a.x + b.x) / 2);
  const cy = f((a.y + b.y) / 2 + caida * 2);
  return { d: `M${a.x} ${a.y} Q${cx} ${cy} ${b.x} ${b.y}`, cx, cy };
}

export function bombillasGuirnalda(a, b, caida, total) {
  const { cx, cy } = curvaGuirnalda(a, b, caida);
  return Array.from({ length: total }, (_, i) => {
    const t = (i + 0.5) / total;
    const u = 1 - t;
    return {
      x: f(u * u * a.x + 2 * u * t * cx + t * t * b.x),
      y: f(u * u * a.y + 2 * u * t * cy + t * t * b.y),
      grupo: i % 3
    };
  });
}
