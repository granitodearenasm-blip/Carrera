import { useCallback } from 'react';
import { useToast } from './Toast';

/** Copia un texto al portapapeles y lo avisa; si el navegador no deja, pide copiarlo a mano. */
export function useCopiar() {
  const toast = useToast();
  return useCallback(
    async (texto: string, aviso = 'Copiado') => {
      try {
        await navigator.clipboard.writeText(texto);
        toast.show({ message: aviso, tone: 'success' });
      } catch {
        toast.show({ message: 'No se pudo copiar. Selecciona el texto y cópialo a mano.', tone: 'danger' });
      }
    },
    [toast],
  );
}
