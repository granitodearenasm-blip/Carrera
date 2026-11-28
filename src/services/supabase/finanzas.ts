import { errorDe, requireSupabase } from './client';

// Patrocinios y gastos: solo los organizadores los leen y escriben (reglas de 0003_equipo_finanzas.sql).

export type EstadoPatrocinio = 'comprometido' | 'cobrado';
export type Patrocinio = { id: string; patrocinador: string; monto: number; estado: EstadoPatrocinio; notas: string; creado: Date };
export type Gasto = { id: string; concepto: string; categoria: string; monto: number; fecha: Date };

export async function listarPatrocinios(): Promise<Patrocinio[]> {
  const { data, error } = await requireSupabase().from('patrocinios').select('id, patrocinador, monto, estado, notas, creado').order('creado', { ascending: false });
  if (error) throw errorDe(error);
  return (data as (Omit<Patrocinio, 'creado'> & { creado: string })[]).map((f) => ({ ...f, creado: new Date(f.creado) }));
}

export async function agregarPatrocinio(p: { patrocinador: string; monto: number; estado: EstadoPatrocinio; notas: string }) {
  const { error } = await requireSupabase().from('patrocinios').insert({ ...p, patrocinador: p.patrocinador.trim() });
  if (error) throw errorDe(error);
}

export async function cambiarEstadoPatrocinio(id: string, estado: EstadoPatrocinio) {
  const { error } = await requireSupabase().from('patrocinios').update({ estado }).eq('id', id);
  if (error) throw errorDe(error);
}

export async function borrarPatrocinio(id: string) {
  const { error } = await requireSupabase().from('patrocinios').delete().eq('id', id);
  if (error) throw errorDe(error);
}

export async function listarGastos(): Promise<Gasto[]> {
  const { data, error } = await requireSupabase().from('gastos').select('id, concepto, categoria, monto, fecha').order('fecha', { ascending: false });
  if (error) throw errorDe(error);
  // fecha es un día sin hora: se lee a mediodía para no cambiar de día
  return (data as (Omit<Gasto, 'fecha'> & { fecha: string })[]).map((f) => ({ ...f, fecha: new Date(`${f.fecha}T12:00:00`) }));
}

export async function agregarGasto(g: { concepto: string; categoria: string; monto: number }) {
  const { error } = await requireSupabase().from('gastos').insert({ ...g, concepto: g.concepto.trim() });
  if (error) throw errorDe(error);
}

export async function borrarGasto(id: string) {
  const { error } = await requireSupabase().from('gastos').delete().eq('id', id);
  if (error) throw errorDe(error);
}
