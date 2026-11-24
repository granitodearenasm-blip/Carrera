import type { AriaAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

/** Cómo actúa algo que se toca: ejecutar una acción, ir a una página del sitio, a una sección o a otro sitio. */
export interface PressProps {
  onPress?: () => void;
  /** Página del sitio ("/panel") */
  to?: string;
  /** Otro sitio (se abre en otra pestaña), un ancla de esta página ("#inscripcion"), mailto: o tel: */
  href?: string;
  /** Dentro de un formulario: "submit" lo envía */
  type?: 'button' | 'submit';
  disabled?: boolean;
}

interface PressableProps
  extends
    PressProps,
    Pick<AriaAttributes, 'aria-label' | 'aria-pressed' | 'aria-expanded' | 'aria-controls' | 'aria-haspopup' | 'aria-current' | 'aria-busy' | 'aria-describedby'> {
  className: string;
  title?: string;
  children: ReactNode;
}

const externo = (href: string) => /^https?:/.test(href);

/** El elemento detrás de cada control: botón, enlace del router o enlace normal. El comportamiento va en props, nunca solo en CSS. */
export function Pressable({ onPress, to, href, type = 'button', disabled, className, children, ...aria }: PressableProps) {
  if (to && !disabled)
    return (
      <Link to={to} className={className} onClick={onPress} {...aria}>
        {children}
      </Link>
    );
  if (href && !disabled)
    return (
      <a href={href} className={className} onClick={onPress} {...(externo(href) ? { target: '_blank', rel: 'noopener' } : {})} {...aria}>
        {children}
      </a>
    );
  return (
    <button type={type} onClick={onPress} disabled={disabled} className={className} {...aria}>
      {children}
    </button>
  );
}
