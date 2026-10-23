import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

/** Ventana con <dialog> nativo: se cierra con Esc, con la ✕ o tocando fuera. */
export function Dialog({ open, onClose, titulo, children }: { open: boolean; onClose: () => void; titulo: ReactNode; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog ref={ref} className="modal" onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <div className="relative max-h-[inherit] overflow-y-auto rounded-[6px] bg-card p-6 text-ink sm:p-8">
        <button type="button" onClick={onClose} aria-label="Cerrar" className="absolute top-4 right-4 rounded-full p-1.5 text-muted hover:bg-paper hover:text-ink">
          <X size={20} />
        </button>
        <h2 className="display pr-10 text-[2.2rem]">{titulo}</h2>
        <div className="mt-5">{children}</div>
      </div>
    </dialog>
  );
}
