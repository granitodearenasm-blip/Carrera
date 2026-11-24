import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

/** Pantalla vacía: dice qué falta y qué hacer, con una acción si la hay. */
export function EmptyState({ icon: Icono, title, children, action }: { icon: LucideIcon; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border-[2px] border-dashed border-line-strong px-6 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-pill bg-sand text-fg">
        <Icono size={26} aria-hidden="true" strokeWidth={2.2} />
      </span>
      <h3 className="subtitulo">{title}</h3>
      {children ? <div className="max-w-sm text-small text-fg-muted">{children}</div> : null}
      {action}
    </div>
  );
}
