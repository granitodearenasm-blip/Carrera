import { LoaderCircle } from 'lucide-react';

/** Indicador de espera. Quien lo usa dice con texto qué se espera. */
export function Spinner({ size = 18, className = '' }: { size?: number; className?: string }) {
  return <LoaderCircle size={size} aria-hidden="true" className={`shrink-0 animate-spin ${className}`} />;
}
