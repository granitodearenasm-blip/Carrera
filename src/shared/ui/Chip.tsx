import type { ReactNode } from 'react';

/** Opción que se activa o desactiva (filtros, rangos). */
export function Chip({ children, pressed, onPress, className = '' }: { children: ReactNode; pressed: boolean; onPress: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-pressed={pressed}
      className={`relative inline-flex min-h-9 cursor-pointer items-center rounded-pill px-3.5 text-[0.875rem] font-bold tabular-nums transition-colors duration-(--duration-fast) before:absolute before:inset-x-0 before:-inset-y-1 before:content-[''] ${
        pressed ? 'bg-ink text-on-ink' : 'bg-surface text-fg contorno-fino hover:bg-hover'
      } ${className}`}
    >
      {children}
    </button>
  );
}
