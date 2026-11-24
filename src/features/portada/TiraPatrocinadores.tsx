import { LogoPatrocinador } from './LogoPatrocinador';
import { patrocinadoresEnOrden } from './nivelesPatrocinio';

/** "Con el apoyo de": los logos de todos los patrocinadores, del nivel más alto al más bajo. */
export function TiraPatrocinadores({ fondo = 'tema', className = '' }: { fondo?: 'tema' | 'oscuro'; className?: string }) {
  const lista = patrocinadoresEnOrden();
  if (!lista.length) return null;
  return (
    <div className={className}>
      <p className={`text-small font-semibold ${fondo === 'oscuro' ? 'text-on-ink-muted' : 'text-fg-muted'}`}>Con el apoyo de</p>
      <ul className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-4">
        {lista.map((p) => (
          <li key={p.nombre}>
            {p.url ? (
              <a href={p.url} target="_blank" rel="noopener" className="block rounded-sm">
                <LogoPatrocinador p={p} fondo={fondo} className={p.nivel === 'principal' ? 'h-9' : 'h-7'} />
              </a>
            ) : (
              <LogoPatrocinador p={p} fondo={fondo} className={p.nivel === 'principal' ? 'h-9' : 'h-7'} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
