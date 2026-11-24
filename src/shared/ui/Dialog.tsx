import { useEffect, useId, useRef, type CSSProperties, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  /** Ancho máximo (CSS), por omisión 40rem */
  width?: string;
  /** hoja: entra desde la derecha, a toda la altura (menú en el celular) */
  look?: 'ventana' | 'hoja';
}

/** Ventana con <dialog> nativo: atrapa el foco, se cierra con Esc, con la ✕ o tocando fuera. */
export function Dialog({ open, onClose, title, children, width, look = 'ventana' }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const tituloId = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const hoja = look === 'hoja';
  return (
    <dialog
      ref={ref}
      className={hoja ? 'm-0 ml-auto h-dvh max-h-none w-[min(24rem,100%)] max-w-none border-0 bg-transparent p-0 text-inherit backdrop:bg-scrim' : 'ventana'}
      style={width ? ({ '--ancho': width } as CSSProperties) : undefined}
      aria-labelledby={open ? tituloId : undefined}
      aria-label={!open && typeof title === 'string' ? title : undefined}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {open ? (
        <div
          className={
            hoja
              ? 'flex h-full flex-col overflow-y-auto overscroll-contain border-l-[3px] border-outline bg-page p-5'
              : 'relative max-h-[inherit] overflow-y-auto overscroll-contain rounded-xl bg-page p-6 estampa-lg sm:p-8'
          }
        >
          <div className="flex items-start justify-between gap-4">
            <h2 id={tituloId} className="pt-1 titulo">
              {title}
            </h2>
            <IconButton icon={X} label="Cerrar" onPress={onClose} className="-mt-1 -mr-2" />
          </div>
          <div className="mt-5">{children}</div>
        </div>
      ) : null}
    </dialog>
  );
}
