import { ErrorBase, errorDe, requireSupabase } from './client';
import type { EstadoPago } from './panel';

// Equipo Hanguk: quienes invitan a correr con su link. Los organizadores dan de alta a los miembros;
// cada miembro ve sus números con su link privado (función `mi_equipo`, sin datos de contacto).

export type Miembro = { id: string; nombre: string; codigo: string; clave: string; activo: boolean; creado: Date };

type FilaMiembro = { id: string; nombre: string; codigo: string; clave: string; activo: boolean; creado: string };
const comoMiembro = (f: FilaMiembro): Miembro => ({ ...f, creado: new Date(f.creado) });

export async function listarEquipo(): Promise<Miembro[]> {
  const { data, error } = await requireSupabase().from('equipo').select('id, nombre, codigo, clave, activo, creado').order('creado');
  if (error) throw errorDe(error);
  return (data as FilaMiembro[]).map(comoMiembro);
}

/** Da de alta a un miembro. Lanza 'codigo-repetido' si ese código ya lo usa alguien. */
export async function agregarMiembro(nombre: string, codigo: string): Promise<Miembro> {
  const { data, error } = await requireSupabase().from('equipo').insert({ nombre: nombre.trim(), codigo }).select('id, nombre, codigo, clave, activo, creado').single();
  if (error) throw new Error(error.code === '23505' ? 'codigo-repetido' : 'fallo');
  return comoMiembro(data as FilaMiembro);
}

export async function cambiarActivo(id: string, activo: boolean) {
  const { error } = await requireSupabase().from('equipo').update({ activo }).eq('id', id);
  if (error) throw errorDe(error);
}

/** Liga la inscripción recién hecha al miembro cuyo link trajo a la persona. Si falla, no pasa nada. */
export async function atribuirInscripcion(inscripcion: string, codigo: string) {
  await requireSupabase().rpc('atribuir_inscripcion', { inscripcion, codigo });
}

export type MiInscrito = { nombres: string; corredores: number; estado: EstadoPago; creado: Date };
export type LugarRanking = { nombre: string; corredores: number; yo: boolean };
export type MiEquipo = { nombre: string; codigo: string; inscripciones: MiInscrito[]; ranking: LugarRanking[]; totalCarrera: number };

type FilaMiEquipo = {
  nombre: string;
  codigo: string;
  inscripciones: { nombres: string | null; corredores: number; estado: EstadoPago; creado: string }[];
  ranking: LugarRanking[];
  total_carrera: number;
};

/** Lo que ve un miembro con su link privado. Lanza 'no-encontrado' si la clave no existe o está inactiva. */
export async function consultarMiEquipo(clave: string): Promise<MiEquipo> {
  if (!/^[0-9a-f-]{36}$/i.test(clave)) throw new ErrorBase('no-encontrado');
  const { data, error } = await requireSupabase().rpc('mi_equipo', { clave });
  if (error) throw errorDe(error);
  const d = data as FilaMiEquipo;
  return {
    nombre: d.nombre,
    codigo: d.codigo,
    inscripciones: d.inscripciones.map((i) => ({ nombres: i.nombres ?? '', corredores: Number(i.corredores), estado: i.estado, creado: new Date(i.creado) })),
    ranking: d.ranking.map((r) => ({ ...r, corredores: Number(r.corredores) })),
    totalCarrera: Number(d.total_carrera),
  };
}

// Links de cada miembro (con la base del sitio, que puede vivir en una subcarpeta)
const raiz = () => `${window.location.origin}${import.meta.env.BASE_URL}`;
/** Link público para invitar: cuenta las inscripciones que lleguen por él. */
export const linkInvitacion = (codigo: string) => `${raiz()}?ref=${codigo}`;
/** Link privado del miembro para ver sus números. No se comparte. */
export const linkPrivado = (clave: string) => `${raiz()}equipo/${clave}`;
