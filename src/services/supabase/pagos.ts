import { errorDe, requireSupabase } from './client';
import type { EstadoPago, MetodoPago, PagoReportado } from './panel';

// "Mi inscripción": con folio y correo, el corredor ve su estado y reporta su pago
// (ver supabase/migrations/0002_reporte_pago.sql). Reportar no marca pagado: lo revisa un organizador.

export type { MetodoPago, PagoReportado };

export type EstadoInscripcion = {
  folio: number;
  total: number;
  estadoPago: EstadoPago;
  pagarAntesDe: Date;
  numeros: number[];
  reporte: PagoReportado | null;
};

type Fila = {
  folio: number;
  total: number;
  estado_pago: EstadoPago;
  pagar_antes_de: string;
  numeros: number[] | null;
  pago_metodo: MetodoPago | null;
  pago_referencia: string | null;
  pago_reportado: string | null;
};

export async function consultarInscripcion(folio: number, correo: string): Promise<EstadoInscripcion> {
  const { data, error } = await requireSupabase().rpc('consultar_inscripcion', { p_folio: folio, p_correo: correo });
  if (error) throw errorDe(error);
  const f = (data as Fila[])[0];
  return {
    folio: f.folio,
    total: f.total,
    estadoPago: f.estado_pago,
    // Fecha sin hora (centro de México): se lee a mediodía para no cambiar de día
    pagarAntesDe: new Date(`${f.pagar_antes_de}T12:00:00`),
    numeros: f.numeros ?? [],
    reporte: f.pago_metodo && f.pago_reportado ? { metodo: f.pago_metodo, referencia: f.pago_referencia, cuando: new Date(f.pago_reportado) } : null,
  };
}

const MENSAJES: Record<string, string> = {
  'no-encontrada': 'No encontramos una inscripción con ese folio y ese correo. Revisa que sea el correo con el que te inscribiste.',
  'ya-pagada': 'Tu pago ya está confirmado; no hace falta reportarlo otra vez.',
  'ya-cancelada': 'Esta inscripción fue cancelada. Escríbenos si crees que es un error.',
  'datos-invalidos': 'Revisa la referencia: para una transferencia escribe la clave de rastreo o el número de referencia (al menos 4 caracteres).',
  'anonimo-desactivado': 'La consulta no está disponible por ahora. Intenta más tarde.',
};

/** Texto para la persona a partir del error de una consulta o reporte; nunca el error crudo. */
export function mensajeDePago(e: unknown): string {
  const codigo = (e as { codigo?: string; message?: string })?.codigo ?? (e as Error)?.message;
  return (codigo && MENSAJES[codigo]) || 'No pudimos conectar. Revisa tu internet e intenta de nuevo.';
}

export async function reportarPago(folio: number, correo: string, metodo: MetodoPago, referencia: string): Promise<void> {
  const { error } = await requireSupabase().rpc('reportar_pago', { p_folio: folio, p_correo: correo, p_metodo: metodo, p_referencia: referencia });
  if (error) throw errorDe(error);
}
