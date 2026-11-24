import type { ElementType, ReactNode } from 'react';

const TONO = {
  surface: 'bg-surface text-fg',
  sunken: 'bg-sunken text-fg',
  sand: 'bg-sand text-fg',
  accent: 'bg-accent text-on-accent',
  ink: 'bg-ink text-on-ink',
};

export interface CardProps {
  children: ReactNode;
  tone?: keyof typeof TONO;
  /** estampa: contorno café y sombra plana (lo del logo). plano: solo contorno fino. */
  look?: 'estampa' | 'plano';
  as?: ElementType;
  className?: string;
}

/** Superficie con contenido agrupado. El relleno y la cuadrícula los decide quien la usa. */
export function Card({ children, tone = 'surface', look = 'estampa', as: Tag = 'div', className = '' }: CardProps) {
  return <Tag className={`rounded-lg ${look === 'estampa' ? 'estampa' : 'contorno-fino'} ${TONO[tone]} ${className}`}>{children}</Tag>;
}
