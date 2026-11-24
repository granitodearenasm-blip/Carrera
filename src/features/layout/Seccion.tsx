import type { ReactNode } from 'react';
import { Contenedor } from '../../shared/ui/decoracion';

const TONO = {
  page: 'bg-page text-fg',
  sunken: 'bg-sunken text-fg',
  ink: 'bg-ink text-on-ink',
};

export interface SeccionProps {
  id: string;
  titulo?: ReactNode;
  /** El título en coreano, como detalle temático junto al título */
  ko?: string;
  /** Texto corto junto al título */
  entrada?: ReactNode;
  tone?: keyof typeof TONO;
  children: ReactNode;
  className?: string;
  /** Piezas de fondo (manchas), detrás del contenido */
  fondo?: ReactNode;
}

/** Un bloque de la página: título y contenido sobre un bloque de color completo. */
export function Seccion({ id, titulo, ko, entrada, tone = 'page', children, className = '', fondo }: SeccionProps) {
  const oscuro = tone === 'ink';
  return (
    <section id={id} aria-labelledby={titulo ? `${id}-titulo` : undefined} className={`relative overflow-hidden py-20 lg:py-28 ${TONO[tone]} ${className}`}>
      {fondo}
      <Contenedor className="relative">
        {titulo ? (
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className={entrada ? 'lg:col-span-7' : 'lg:col-span-12'}>
              {ko ? (
                <p lang="ko" aria-hidden="true" className={`mb-3 text-[1.15rem] ${oscuro ? 'text-accent' : 'text-danger'}`}>
                  {ko}
                </p>
              ) : null}
              <h2 id={`${id}-titulo`} className="titulo-display">
                {titulo}
              </h2>
            </div>
            {entrada ? <div className={`text-lead lg:col-span-5 ${oscuro ? 'text-on-ink-muted' : 'text-fg-muted'}`}>{entrada}</div> : null}
          </div>
        ) : null}
        {children}
      </Contenedor>
    </section>
  );
}

/** Dato que Granito de Arena todavía debe confirmar: se muestra como pendiente, nunca se inventa. */
export function Pendiente({ children }: { children?: ReactNode }) {
  return (
    <span className="inline-block rounded-sm border-[1.5px] border-dashed border-on-accent/60 bg-accent-soft px-1.5 py-px text-[0.9em] font-semibold text-on-accent">
      Por confirmar{children ? <>: {children}</> : null}
    </span>
  );
}
