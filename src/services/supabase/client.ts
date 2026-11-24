import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// La nube es opcional: sin VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY el sitio funciona en modo
// demostración (los números se guardan solo en este navegador y no se envía nada).
// La clave publicable es pública por diseño; la seguridad la dan las reglas de la base de datos
// (supabase/migrations). La clave secreta (service_role) NUNCA va aquí.

const url = import.meta.env.VITE_SUPABASE_URL || undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || undefined;

export const supabase = url && key ? createClient(url, key, { auth: { flowType: 'pkce', persistSession: true } }) : null;

export const hayNube = supabase !== null;

/** El cliente, para código que solo corre con la nube configurada (lanza un error si no lo está). */
export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new Error('sin-nube');
  return supabase;
}

/** Error de una función de la base de datos, con su código corto (ver 0001_inicial.sql) y el detalle. */
export class ErrorBase extends Error {
  constructor(
    readonly codigo: string,
    readonly detalle?: string,
  ) {
    super(codigo);
  }
}

/** Convierte el error de supabase-js en un ErrorBase con el código que lanzó la función. */
export function errorDe(e: { message?: string; details?: string; code?: string } | null): ErrorBase {
  const codigo = (e?.message ?? '').trim().split(/\s/)[0] || 'desconocido';
  return new ErrorBase(codigo, e?.details ?? undefined);
}
