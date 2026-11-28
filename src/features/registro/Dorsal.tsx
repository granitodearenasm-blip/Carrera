import { CONFIG } from '../../config';
import { fechaCorta } from '../../shared/format';

/** Cada dígito rueda al cambiar, como un marcador de meta (el único momento orquestado del sitio). */
function Cifras({ valor }: { valor: string }) {
  return (
    <span className="inline-flex" aria-hidden="true">
      {valor.split('').map((d, i) => (
        <span key={`${i}-${valor.length}`} className="inline-block overflow-hidden">
          <span key={d} className="inline-block animate-[rodar_var(--duration-roll)_var(--ease-stamp)]" style={{ animationDelay: `${i * 70}ms`, animationFillMode: 'backwards' }}>
            {d}
          </span>
        </span>
      ))}
    </span>
  );
}

export interface DorsalProps {
  numero: string | number;
  nombre?: string;
  /** Texto del talón: la distancia */
  pie?: string;
  /** Tamaño base: todo el dorsal escala con la fuente */
  className?: string;
  /** Anima los dígitos al cambiar */
  rodar?: boolean;
}

const HOYOS = ['top-[0.7em] left-[0.7em]', 'top-[0.7em] right-[0.7em]', 'bottom-[0.7em] left-[0.7em]', 'bottom-[0.7em] right-[0.7em]'];

/**
 * El número de corredor como estampa de Granito: contorno café grueso, sombra plana, banda amarilla,
 * cuatro orificios para los seguros y talón desprendible. Escala con `font-size`.
 */
export function Dorsal({ numero, nombre, pie, className = '', rodar = false }: DorsalProps) {
  const texto = String(numero);
  return (
    <div
      role="img"
      aria-label={`Dorsal número ${texto}${nombre ? ` de ${nombre}` : ''}`}
      className={`relative overflow-hidden rounded-[1.4em] border-[0.22em] border-outline bg-surface text-fg shadow-[0.45em_0.55em_0_0_var(--color-stamp)] ${className}`}
    >
      {HOYOS.map((p) => (
        <span key={p} aria-hidden="true" className={`absolute z-10 size-[0.85em] rounded-full border-[0.12em] border-outline bg-page ${p}`} />
      ))}
      <div className="flex items-center justify-between gap-2 border-b-[0.18em] border-outline bg-ink px-[2.2em] py-[0.55em] text-on-ink">
        <span className="font-logo text-[1.6em] leading-none" translate="no">
          Hanguk
        </span>
        <span lang="ko" className="text-[1.3em] leading-none text-on-ink">
          한국
        </span>
      </div>
      <div className="px-[1.4em] pt-[0.5em] pb-[0.3em] text-center">
        <span className="block cifra text-[6.2em] text-fg">{rodar ? <Cifras valor={texto} /> : texto}</span>
        {nombre ? <span className="mt-[0.15em] block truncate font-display text-[1.15em] font-semibold">{nombre}</span> : null}
      </div>
      <div aria-hidden="true" className="mx-[1em] h-[0.6em] perforado" />
      <div className="flex items-center justify-between px-[2.2em] pt-[0.35em] pb-[0.9em] text-[0.82em] font-bold text-fg-muted">
        <span>{pie ?? '3K, 5K o 10K'}</span>
        <span className="tabular-nums">{fechaCorta(new Date(CONFIG.salida))}</span>
      </div>
    </div>
  );
}
