import type { Patrocinador } from '../../config';
import { useTema } from '../../shared/theme';

const ruta = (archivo: string) => `${import.meta.env.BASE_URL}img/patrocinadores/${archivo}`;

/**
 * Logo de un patrocinador, en la versión que se lee sobre su fondo.
 * fondo: 'tema' sigue al tema claro u oscuro; 'oscuro' para bloques que siempre son oscuros (pie de página).
 */
export function LogoPatrocinador({ p, fondo = 'tema', className = '' }: { p: Patrocinador; fondo?: 'tema' | 'oscuro'; className?: string }) {
  const { tema } = useTema();
  const oscuro = fondo === 'oscuro' || tema === 'dark';
  return <img src={ruta(oscuro && p.logoOscuro ? p.logoOscuro : p.logo)} alt={p.nombre} loading="lazy" decoding="async" className={`object-contain ${className}`} />;
}
