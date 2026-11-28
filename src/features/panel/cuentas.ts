import type { Miembro } from '../../services/supabase/equipo';
import type { Gasto, Patrocinio } from '../../services/supabase/finanzas';
import type { InscripcionPanel } from '../../services/supabase/panel';

// Cálculos puros del Equipo Hanguk y de las finanzas (con pruebas en cuentas.test.ts).

export type DesempenoMiembro = { miembro: Miembro; inscripciones: number; corredores: number; corredoresPagados: number; recaudado: number; porCobrar: number };

/** Lo que trajo cada miembro, sin contar canceladas. Ordenado de más a menos corredores. */
export function desempenoEquipo(equipo: Miembro[], lista: InscripcionPanel[]): DesempenoMiembro[] {
  return equipo
    .map((miembro) => {
      const suyas = lista.filter((i) => i.equipoId === miembro.id && i.estadoPago !== 'cancelado');
      const pagadas = suyas.filter((i) => i.estadoPago === 'pagado');
      return {
        miembro,
        inscripciones: suyas.length,
        corredores: suyas.reduce((s, i) => s + i.corredores.length, 0),
        corredoresPagados: pagadas.reduce((s, i) => s + i.corredores.length, 0),
        recaudado: pagadas.reduce((s, i) => s + i.total, 0),
        porCobrar: suyas.filter((i) => i.estadoPago === 'pendiente').reduce((s, i) => s + i.total, 0),
      };
    })
    .sort((a, b) => b.corredores - a.corredores || a.miembro.nombre.localeCompare(b.miembro.nombre));
}

/** Qué parte de los corredores llegó por un link del equipo (0 a 1). */
export function parteDelEquipo(lista: InscripcionPanel[]): number {
  const vivas = lista.filter((i) => i.estadoPago !== 'cancelado');
  const total = vivas.reduce((s, i) => s + i.corredores.length, 0);
  const conLink = vivas.filter((i) => i.equipoId).reduce((s, i) => s + i.corredores.length, 0);
  return total ? conLink / total : 0;
}

export type Balance = {
  inscripcionesCobradas: number;
  inscripcionesPorCobrar: number;
  patrociniosCobrados: number;
  patrociniosComprometidos: number;
  gastos: number;
  /** Cobrado (inscripciones + patrocinios) menos gastos */
  neto: number;
  porViajero: number;
  /** Lo que falta por viajero para cubrir su viaje; null si el costo no está confirmado */
  faltaPorViajero: number | null;
  /** Si se cobra todo lo pendiente y lo comprometido */
  netoProyectado: number;
  porViajeroProyectado: number;
};

export function balance(lista: InscripcionPanel[], patrocinios: Patrocinio[], gastos: Gasto[], viaje: { viajeros: number; costoPorViajero: number | null }): Balance {
  const suma = <T>(xs: T[], f: (x: T) => number) => xs.reduce((s, x) => s + f(x), 0);
  const inscripcionesCobradas = suma(
    lista.filter((i) => i.estadoPago === 'pagado'),
    (i) => i.total,
  );
  const inscripcionesPorCobrar = suma(
    lista.filter((i) => i.estadoPago === 'pendiente'),
    (i) => i.total,
  );
  const patrociniosCobrados = suma(
    patrocinios.filter((p) => p.estado === 'cobrado'),
    (p) => p.monto,
  );
  const patrociniosComprometidos = suma(
    patrocinios.filter((p) => p.estado === 'comprometido'),
    (p) => p.monto,
  );
  const totalGastos = suma(gastos, (g) => g.monto);
  const neto = inscripcionesCobradas + patrociniosCobrados - totalGastos;
  const netoProyectado = neto + inscripcionesPorCobrar + patrociniosComprometidos;
  const n = Math.max(1, viaje.viajeros);
  const porViajero = Math.max(0, neto) / n;
  return {
    inscripcionesCobradas,
    inscripcionesPorCobrar,
    patrociniosCobrados,
    patrociniosComprometidos,
    gastos: totalGastos,
    neto,
    porViajero,
    faltaPorViajero: viaje.costoPorViajero === null ? null : Math.max(0, viaje.costoPorViajero - porViajero),
    netoProyectado,
    porViajeroProyectado: Math.max(0, netoProyectado) / n,
  };
}

export function gastosPorCategoria(gastos: Gasto[]): Record<string, number> {
  return gastos.reduce<Record<string, number>>((m, g) => ((m[g.categoria] = (m[g.categoria] ?? 0) + g.monto), m), {});
}

/** Código para el link de invitación a partir del nombre: «Sofía Ramírez» → «sofia-ramirez». */
export function codigoDesdeNombre(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30)
    .replace(/-+$/, '');
}
