import type { RealtimeChannel } from '@supabase/supabase-js';
import { errorDe, requireSupabase } from './client';

// El tablero público de números (tabla `tablero`) y las funciones para apartar y soltar.

export type Celda = { estado: 'apartado' | 'confirmado'; ms: number };
export type Tablero = Map<number, Celda>;

const aCelda = (fila: { estado: string; creado: string }): Celda => ({ estado: fila.estado as Celda['estado'], ms: new Date(fila.creado).getTime() });

/** Todo el tablero (unas cuantas centenas de filas como máximo). */
export async function cargarTablero(): Promise<Tablero> {
  const { data, error } = await requireSupabase().from('tablero').select('numero, estado, creado');
  if (error) throw errorDe(error);
  return new Map(data.map((f) => [f.numero as number, aCelda(f)]));
}

/** Escucha los cambios del tablero en tiempo real. Devuelve cómo dejar de escuchar. */
export function escucharTablero(alCambiar: (numero: number, celda: Celda | null) => void, alFallar: () => void): () => void {
  const sb = requireSupabase();
  const canal: RealtimeChannel = sb
    .channel('tablero')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tablero' }, (p) => {
      if (p.eventType === 'DELETE') alCambiar((p.old as { numero: number }).numero, null);
      else {
        const f = p.new as { numero: number; estado: string; creado: string };
        alCambiar(f.numero, aCelda(f));
      }
    })
    .subscribe((estado) => {
      if (estado === 'CHANNEL_ERROR' || estado === 'TIMED_OUT') alFallar();
    });
  return () => {
    void sb.removeChannel(canal);
  };
}

/** Aparta un número a tu nombre. Devuelve la hora del servidor (para corregir el reloj del dispositivo). */
export async function apartarNumero(n: number): Promise<number> {
  const { data, error } = await requireSupabase().rpc('apartar_numero', { n });
  if (error) throw errorDe(error);
  return new Date(data as string).getTime();
}

/** Suelta tu apartado. Si ya venció o se confirmó, no pasa nada. */
export async function soltarNumero(n: number): Promise<void> {
  await requireSupabase().rpc('soltar_numero', { n });
}

/** Al cerrar la página: un intento de soltar que el navegador no cancela. */
export function soltarAlSalir(numeros: number[]) {
  for (const n of numeros) void requireSupabase().rpc('soltar_numero', { n });
}
