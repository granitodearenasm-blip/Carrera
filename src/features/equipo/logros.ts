import type { MiEquipo } from '../../services/supabase/equipo';

// Lo que motiva a un miembro del equipo, calculado de lo que devuelve `mi_equipo` (pruebas en logros.test.ts).

export type Logros = {
  corredores: number;
  corredoresPagados: number;
  /** Inscripciones que todavía no pagan: a quién darle seguimiento */
  porPagar: number;
  estaSemana: number;
  /** Lugar en el ranking (1 = primero); null si aún no trae a nadie */
  lugar: number | null;
  /** Corredores que le faltan para pasar al de arriba; null si va primero o no hay nadie arriba */
  paraSubir: number | null;
  insigniasGanadas: number[];
  siguienteInsignia: number | null;
};

export function calcularLogros(d: MiEquipo, insignias: number[], hoy = new Date()): Logros {
  const vivas = d.inscripciones;
  const corredores = vivas.reduce((s, i) => s + i.corredores, 0);
  const haceUnaSemana = hoy.getTime() - 7 * 864e5;
  const i = d.ranking.findIndex((r) => r.yo);
  const lugar = corredores > 0 && i >= 0 ? d.ranking.filter((r) => r.corredores > corredores).length + 1 : null;
  const arriba = d.ranking.filter((r) => r.corredores > corredores).at(-1);
  return {
    corredores,
    corredoresPagados: vivas.filter((x) => x.estado === 'pagado').reduce((s, x) => s + x.corredores, 0),
    porPagar: vivas.filter((x) => x.estado === 'pendiente').length,
    estaSemana: vivas.filter((x) => x.creado.getTime() >= haceUnaSemana).reduce((s, x) => s + x.corredores, 0),
    lugar,
    paraSubir: arriba ? arriba.corredores - corredores + 1 : null,
    insigniasGanadas: insignias.filter((n) => corredores >= n),
    siguienteInsignia: insignias.find((n) => corredores < n) ?? null,
  };
}
