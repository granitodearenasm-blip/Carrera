import type { LucideIcon } from 'lucide-react';
import { Pressable, type PressProps } from './Pressable';
import { Spinner } from './Spinner';

/**
 * primary: rojo sol, la única acción principal de una pantalla. ink: una segunda acción fuerte.
 * secondary: bloque claro con contorno. quiet: discreta. danger: borra o cancela. link: se lee como enlace.
 */
export type ButtonVariant = 'primary' | 'ink' | 'secondary' | 'quiet' | 'danger' | 'link';

export interface ButtonProps extends PressProps {
  /** Texto visible; también es el nombre accesible */
  label: string;
  icon?: LucideIcon;
  iconPosition?: 'start' | 'end';
  variant?: ButtonVariant;
  /** lg: 56 px. md: 48 px. sm: 40 px a la vista, 44 px al dedo */
  size?: 'lg' | 'md' | 'sm';
  fullWidth?: boolean;
  /** Muestra un indicador y bloquea los toques hasta terminar */
  loading?: boolean;
  /** Solo acomodo (márgenes, alineación); el aspecto lo da la variante */
  className?: string;
}

// Los bloques se "aprietan" al tocarlas: bajan hacia su sombra.
const ESTAMPA = 'shadow-sm active:translate-x-[4px] active:translate-y-[4px] active:shadow-none';
const VARIANT: Record<ButtonVariant, string> = {
  primary: `bg-accent text-on-accent border-[3px] border-outline hover:bg-accent-hover ${ESTAMPA}`,
  ink: `bg-ink text-on-ink border-[3px] border-outline hover:bg-ink-hover ${ESTAMPA}`,
  secondary: `bg-surface text-fg contorno hover:bg-hover ${ESTAMPA}`,
  quiet: 'bg-sunken text-fg hover:bg-hover',
  danger: `bg-danger text-on-danger border-[3px] border-danger hover:opacity-90 ${ESTAMPA}`,
  link: 'text-link underline decoration-2 underline-offset-4 hover:decoration-[3px]',
};
const SIZE = {
  lg: 'min-h-14 px-7 text-[1.0625rem]',
  md: 'min-h-12 px-5 text-button',
  sm: "min-h-10 px-4 text-[0.8125rem] before:absolute before:inset-x-0 before:-inset-y-0.5 before:content-['']",
};

/** Clases de un botón, para el raro elemento que debe verse como uno sin serlo. */
export function buttonClasses({ variant = 'primary', size = 'md', fullWidth = false, loading = false }: Pick<ButtonProps, 'variant' | 'size' | 'fullWidth' | 'loading'> = {}) {
  return [
    'relative inline-flex cursor-pointer items-center justify-center gap-2 font-display font-black tracking-[0.12em] uppercase whitespace-nowrap select-none',
    'transition-[background-color,color,transform,box-shadow,opacity] duration-(--duration-fast) ease-standard',
    loading ? 'cursor-wait' : 'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-0',
    variant === 'link' ? 'min-h-11 px-1 text-button' : SIZE[size],
    VARIANT[variant],
    fullWidth ? 'w-full' : '',
  ].join(' ');
}

/** Una acción con nombre. */
export function Button({ label, icon: Icon, iconPosition = 'start', variant, size, fullWidth, loading = false, disabled, className = '', ...press }: ButtonProps) {
  const iconSize = size === 'sm' ? 16 : 19;
  const inicio = loading ? <Spinner size={iconSize} /> : Icon && iconPosition === 'start' ? <Icon size={iconSize} aria-hidden="true" strokeWidth={2.4} /> : null;
  return (
    <Pressable {...press} disabled={disabled || loading} aria-busy={loading || undefined} className={`${buttonClasses({ variant, size, fullWidth, loading })} ${className}`}>
      {inicio}
      <span>{label}</span>
      {Icon && iconPosition === 'end' && !loading ? <Icon size={iconSize} aria-hidden="true" strokeWidth={2.4} /> : null}
    </Pressable>
  );
}
