import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export type Pestana<T extends string> = { id: T; label: string; icon?: LucideIcon };

/** Pestañas accesibles (flechas para moverse). Solo se monta el contenido de la pestaña activa. */
export function Pestanas<T extends string>({
  pestanas,
  activa,
  cambiar,
  children,
  etiqueta,
}: {
  pestanas: Pestana<T>[];
  activa: T;
  cambiar: (id: T) => void;
  children: ReactNode;
  etiqueta: string;
}) {
  const base = useId();
  const lista = useRef<HTMLDivElement>(null);
  const mover = (e: KeyboardEvent) => {
    const i = pestanas.findIndex((p) => p.id === activa);
    const sig = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? pestanas.length - 1 : null;
    if (sig === null) return;
    e.preventDefault();
    const p = pestanas[(sig + pestanas.length) % pestanas.length];
    cambiar(p.id);
    lista.current?.querySelector<HTMLButtonElement>(`#${CSS.escape(`${base}-${p.id}`)}`)?.focus();
  };
  return (
    <div>
      <div ref={lista} role="tablist" aria-label={etiqueta} onKeyDown={mover} className="flex gap-1 overflow-x-auto border-b-2 border-line">
        {pestanas.map(({ id, label, icon: Icono }) => {
          const sel = id === activa;
          return (
            <button
              key={id}
              id={`${base}-${id}`}
              role="tab"
              type="button"
              aria-selected={sel}
              aria-controls={`${base}-panel`}
              tabIndex={sel ? 0 : -1}
              onClick={() => cambiar(id)}
              className={`-mb-0.5 flex min-h-11 items-center gap-2 border-b-[3px] px-4 text-small font-bold whitespace-nowrap transition-colors duration-(--duration-fast) focus-visible:outline-2 focus-visible:outline-focus ${
                sel ? 'border-accent text-fg' : 'border-transparent text-fg-muted hover:text-fg'
              }`}
            >
              {Icono ? <Icono size={16} aria-hidden="true" /> : null}
              {label}
            </button>
          );
        })}
      </div>
      <div id={`${base}-panel`} role="tabpanel" aria-labelledby={`${base}-${activa}`} className="pt-6">
        {children}
      </div>
    </div>
  );
}
