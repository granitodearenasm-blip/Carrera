import { errorDe, requireSupabase } from './client';

// Lo que usa el panel de organizadores. Las reglas de la base de datos solo dejan leer y cambiar
// esto a cuentas de la tabla `organizadores`.

export type EstadoPago = 'pendiente' | 'pagado' | 'cancelado';

export type MetodoPago = 'transferencia' | 'efectivo';

/** Lo que el corredor avisó desde "Mi inscripción" (no significa que ya se revisó). */
export type PagoReportado = { metodo: MetodoPago; referencia: string | null; cuando: Date };

export type CorredorPanel = {
  numero: number;
  nombre: string;
  edad: number;
  sexo: string;
  categoria: string;
  talla: string;
  emergenciaNombre: string;
  emergenciaTelefono: string;
};

export type InscripcionPanel = {
  id: string;
  folio: number;
  tipo: 'Individual' | 'Grupo';
  grupo: string | null;
  responsable: string | null;
  correo: string;
  telefono: string;
  total: number;
  estadoPago: EstadoPago;
  pagarAntesDe: Date;
  notas: string;
  creado: Date;
  reporte: PagoReportado | null;
  /** Miembro del equipo que la trajo (su link), si hubo */
  equipoId: string | null;
  corredores: CorredorPanel[];
};

type Fila = {
  id: string;
  folio: number;
  tipo: 'Individual' | 'Grupo';
  grupo: string | null;
  responsable: string | null;
  correo: string;
  telefono: string;
  total: number;
  estado_pago: EstadoPago;
  pagar_antes_de: string;
  notas: string;
  creado: string;
  pago_metodo: MetodoPago | null;
  pago_referencia: string | null;
  pago_reportado: string | null;
  equipo_id: string | null;
  corredores: { numero: number; nombre: string; edad: number; sexo: string; categoria: string; talla: string; emergencia_nombre: string; emergencia_telefono: string }[];
};

export async function listarInscripciones(): Promise<InscripcionPanel[]> {
  const { data, error } = await requireSupabase()
    .from('inscripciones')
    .select('id, folio, tipo, grupo, responsable, correo, telefono, total, estado_pago, pagar_antes_de, notas, creado, pago_metodo, pago_referencia, pago_reportado, equipo_id, corredores (numero, nombre, edad, sexo, categoria, talla, emergencia_nombre, emergencia_telefono)')
    .order('creado', { ascending: false });
  if (error) throw errorDe(error);
  return (data as Fila[]).map((f) => ({
    id: f.id,
    folio: f.folio,
    tipo: f.tipo,
    grupo: f.grupo,
    responsable: f.responsable,
    correo: f.correo,
    telefono: f.telefono,
    total: f.total,
    estadoPago: f.estado_pago,
    pagarAntesDe: new Date(`${f.pagar_antes_de}T12:00:00`),
    notas: f.notas,
    creado: new Date(f.creado),
    reporte: f.pago_metodo && f.pago_reportado ? { metodo: f.pago_metodo, referencia: f.pago_referencia, cuando: new Date(f.pago_reportado) } : null,
    equipoId: f.equipo_id,
    corredores: f.corredores
      .map((c) => ({ ...c, emergenciaNombre: c.emergencia_nombre, emergenciaTelefono: c.emergencia_telefono }))
      .sort((a, b) => a.numero - b.numero),
  }));
}

export async function cambiarEstadoPago(id: string, estado: EstadoPago) {
  const { error } = await requireSupabase().rpc('cambiar_estado_pago', { inscripcion: id, nuevo: estado });
  if (error) throw errorDe(error);
}

export async function guardarNotas(id: string, notas: string) {
  const { error } = await requireSupabase().from('inscripciones').update({ notas }).eq('id', id);
  if (error) throw errorDe(error);
}
