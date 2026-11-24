import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Check, CircleAlert } from 'lucide-react';

export interface ToastOptions {
  message: string;
  /** danger se anuncia de inmediato (role="alert"); el resto, con cortesía */
  tone?: 'neutral' | 'success' | 'danger';
  /** ms en pantalla */
  duration?: number;
}

interface ToastApi {
  show: (opciones: ToastOptions) => void;
  dismiss: () => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/** Mensajes breves después de una acción ("Número apartado", "Datos copiados"). */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast necesita un ToastProvider');
  return api;
}

/** Un aviso a la vez: uno nuevo reemplaza al actual. Se monta una vez, alrededor de la app. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<(ToastOptions & { key: number }) | null>(null);
  const contador = useRef(0);
  const show = useCallback((o: ToastOptions) => setToast({ ...o, key: ++contador.current }), []);
  const dismiss = useCallback(() => setToast(null), []);
  const api = useMemo(() => ({ show, dismiss }), [show, dismiss]);
  return (
    <ToastContext.Provider value={api}>
      {children}
      <Vista toast={toast} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function Vista({ toast, onDismiss }: { toast: (ToastOptions & { key: number }) | null; onDismiss: () => void }) {
  const [pausa, setPausa] = useState(false);
  const duracion = toast?.duration ?? 4500;
  useEffect(() => {
    if (!toast || pausa) return;
    const t = setTimeout(onDismiss, duracion);
    return () => clearTimeout(t);
  }, [toast, pausa, duracion, onDismiss]);

  const Icono = toast?.tone === 'success' ? Check : toast?.tone === 'danger' ? CircleAlert : null;
  return (
    // La región siempre está en la página, para que los lectores de pantalla oigan lo que aparece.
    <div
      role={toast?.tone === 'danger' ? 'alert' : 'status'}
      className="pointer-events-none fixed inset-x-0 z-(--layer-toast) flex justify-center px-4"
      style={{ bottom: 'calc(var(--barra-inferior, 0px) + env(safe-area-inset-bottom) + 1rem)' }}
    >
      {toast ? (
        <div
          key={toast.key}
          onPointerEnter={() => setPausa(true)}
          onPointerLeave={() => setPausa(false)}
          className="pointer-events-auto flex max-w-md animate-[estampar_var(--duration-slow)_var(--ease-stamp)] items-center gap-2.5 rounded-pill border-[2.5px] border-outline bg-ink px-5 py-3 text-small font-bold text-on-ink shadow-md"
        >
          {Icono ? <Icono size={18} aria-hidden="true" className={toast.tone === 'success' ? 'text-accent' : ''} /> : null}
          <span>{toast.message}</span>
        </div>
      ) : null}
    </div>
  );
}
