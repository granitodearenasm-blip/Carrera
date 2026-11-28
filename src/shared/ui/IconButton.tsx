import type { LucideIcon } from 'lucide-react';
import { Pressable, type PressProps } from './Pressable';

export interface IconButtonProps extends PressProps {
  icon: LucideIcon;
  /** Nombre accesible obligatorio: el botón no tiene texto visible */
  label: string;
  variant?: 'quiet' | 'secondary' | 'onInk';
  size?: 'md' | 'sm';
  pressed?: boolean;
  expanded?: boolean;
  controls?: string;
  className?: string;
}

const VARIANT = {
  quiet: 'text-current hover:bg-current/10',
  secondary: 'bg-surface text-fg contorno shadow-sm hover:bg-hover active:translate-x-[2px] active:translate-y-[3px] active:shadow-none',
  onInk: 'text-on-ink hover:bg-ink-hover',
};

/** Botón de solo ícono, con área táctil de 44 px. */
export function IconButton({ icon: Icon, label, variant = 'quiet', size = 'md', pressed, expanded, controls, className = '', ...press }: IconButtonProps) {
  return (
    <Pressable
      {...press}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      aria-expanded={expanded}
      aria-controls={controls}
      className={`relative inline-flex shrink-0 cursor-pointer items-center justify-center transition-[background-color,transform,box-shadow] duration-(--duration-fast) disabled:cursor-not-allowed disabled:opacity-40 ${
        size === 'md' ? 'size-11' : "size-9 before:absolute before:-inset-1 before:content-['']"
      } ${VARIANT[variant]} ${className}`}
    >
      <Icon size={size === 'md' ? 21 : 17} aria-hidden="true" strokeWidth={2.4} />
    </Pressable>
  );
}
