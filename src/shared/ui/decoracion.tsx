import type { ReactNode } from 'react';

// Piezas decorativas del lenguaje de Granito: las manchas de arena del logo y la franja saekdong del hanbok.
// Son decorativas: aria-hidden, sin texto.

/** Formas orgánicas de las manchas pálidas del logo (viewBox 0 0 100 100). */
const FORMAS = [
  'M50 6c18 0 38 9 41 27 3 17-8 27-6 43 2 15-14 22-30 18-15-4-23 4-37-4C4 82 4 64 9 50 14 35 8 24 18 15 27 8 38 6 50 6Z',
  'M30 10c14-6 31 2 43 10 13 9 22 22 18 36-4 15-20 18-30 28-11 10-30 11-41 1C9 75 13 60 9 47 5 33 15 16 30 10Z',
  'M62 8c13 4 28 15 30 30 2 14-10 22-12 36-3 13-17 21-31 18-14-3-17-15-28-22C10 63 2 52 6 38 10 24 23 17 35 11c9-4 18-6 27-3Z',
];

export interface Mancha {
  /** Posición y tamaño en % del contenedor */
  x: number;
  y: number;
  size: number;
  forma?: 0 | 1 | 2;
  rotar?: number;
}

/** Manchas de arena de fondo. El contenedor necesita `relative` y `overflow-hidden`. */
export function Manchas({ manchas, className = 'text-sand' }: { manchas: Mancha[]; className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      {manchas.map((m, i) => (
        <svg
          key={i}
          viewBox="0 0 100 100"
          className="absolute"
          style={{ left: `${m.x}%`, top: `${m.y}%`, width: `${m.size}%`, aspectRatio: '1', transform: `translate(-50%, -50%) rotate(${m.rotar ?? 0}deg)` }}
        >
          <path d={FORMAS[m.forma ?? i % 3]} fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}

/** Franja saekdong: divide bloques, hace de cinta de meta y de barra de progreso. */
export function Saekdong({ className = 'h-2.5' }: { className?: string }) {
  return <div aria-hidden="true" className={`saekdong ${className}`} />;
}

/** Ancho máximo y márgenes laterales del sitio. */
export function Contenedor({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[78rem] px-5 sm:px-8 ${className}`}>{children}</div>;
}
