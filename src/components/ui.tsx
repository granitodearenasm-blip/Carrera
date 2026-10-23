import type { ReactNode } from 'react';

export function Wrap({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 ${className}`}>{children}</div>;
}

/** Poste de kilómetro: cada sección de la página es un tramo del recorrido. */
export function Km({ n, children, ko, tono = 'claro' }: { n: string; children: ReactNode; ko?: string; tono?: 'claro' | 'oscuro' }) {
  const oscuro = tono === 'oscuro';
  return (
    <p className={`flex items-center gap-3 text-[13px] font-semibold tracking-[0.14em] uppercase ${oscuro ? 'text-paper/70' : 'text-muted'}`}>
      <span className={`inline-flex h-7 items-stretch overflow-hidden rounded-[3px] text-[12px] font-bold tracking-[0.06em] ${oscuro ? 'bg-paper text-ink' : 'bg-ink text-paper'}`}>
        <span className="flex items-center px-2">KM</span>
        <span className="flex items-center bg-hong px-2 text-white tabular-nums">{n}</span>
      </span>
      <span>{children}</span>
      {ko && (
        <span lang="ko" className="font-medium tracking-normal normal-case opacity-60">
          {ko}
        </span>
      )}
    </p>
  );
}

/** Dato pendiente que Granito de Arena todavía debe confirmar. */
export function Pendiente({ children }: { children?: ReactNode }) {
  return (
    <span className="inline-block rounded-[3px] border border-dashed border-hwang bg-hwang/15 px-1.5 py-0.5 text-[0.85em] font-medium text-inherit">
      Por confirmar{children ? <>: {children}</> : null}
    </span>
  );
}

export const btn = {
  base: 'inline-flex items-center justify-center gap-2 rounded-[3px] font-bold uppercase tracking-[0.04em] condensed transition-colors disabled:cursor-not-allowed disabled:opacity-45',
  rojo: 'bg-hong text-white hover:bg-hong-700',
  tinta: 'bg-ink text-paper hover:bg-ink-2',
  borde: 'border-2 border-ink text-ink hover:bg-ink hover:text-paper',
  bordeClaro: 'border-2 border-paper/80 text-paper hover:bg-paper hover:text-ink',
  md: 'h-12 px-5 text-[15px]',
  lg: 'h-14 px-7 text-[17px]',
  sm: 'h-9 px-3 text-[13px]',
};

export const Saekdong = ({ className = '' }: { className?: string }) => <div aria-hidden className={`saekdong ${className}`} />;
