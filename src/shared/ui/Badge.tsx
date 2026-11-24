import type { ReactNode } from 'react';

const TONO = {
  neutral: 'bg-sunken text-fg',
  sand: 'bg-sand text-fg',
  info: 'bg-info-soft text-info',
  danger: 'bg-danger-soft text-danger',
  success: 'bg-success-soft text-success',
  accent: 'bg-accent text-on-accent',
};

/** Etiqueta corta de estado ("Pagado", "Por confirmar"). */
export function Badge({ children, tone = 'neutral', className = '' }: { children: ReactNode; tone?: keyof typeof TONO; className?: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-[0.8125rem] font-bold whitespace-nowrap ${TONO[tone]} ${className}`}>{children}</span>;
}
