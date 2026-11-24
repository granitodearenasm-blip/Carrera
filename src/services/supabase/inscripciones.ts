import { errorDe, requireSupabase } from './client';

// Envío de la inscripción: una sola llamada a `confirmar_inscripcion`, que valida, calcula el total y
// confirma los números en una transacción (ver supabase/migrations/0001_inicial.sql).

export type CorredorEnvio = {
  numero: number;
  nombre: string;
  edad: string;
  sexo: string;
  categoria: string;
  talla: string;
  emergenciaNombre: string;
  emergenciaTelefono: string;
};

export type InscripcionEnvio = {
  grupo?: string;
  responsable?: string;
  correo: string;
  telefono: string;
  corredores: CorredorEnvio[];
};

export type Recibo = { id: string; folio: number; total: number; pagarAntesDe: Date };

export async function confirmarInscripcion(datos: InscripcionEnvio): Promise<Recibo> {
  const { data, error } = await requireSupabase().rpc('confirmar_inscripcion', { datos });
  if (error) throw errorDe(error);
  const fila = (data as { id: string; folio: number; total: number; pagar_antes_de: string }[])[0];
  // pagar_antes_de es una fecha sin hora (hora del centro de México): se lee a mediodía para no cambiar de día.
  return { id: fila.id, folio: fila.folio, total: fila.total, pagarAntesDe: new Date(`${fila.pagar_antes_de}T12:00:00`) };
}
