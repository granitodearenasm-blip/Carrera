import { describe, expect, it } from 'vitest';
import type { MiEquipo } from '../../services/supabase/equipo';
import { calcularLogros } from './logros';

const hoy = new Date('2026-12-10T12:00:00Z');
const d = (mias: [number, 'pagado' | 'pendiente', string][], otros: number[]): MiEquipo => ({
  nombre: 'Sofía',
  codigo: 'sofia',
  inscripciones: mias.map(([corredores, estado, f]) => ({ nombres: 'Ana', corredores, estado, creado: new Date(f) })),
  ranking: [...otros.map((c, i) => ({ nombre: `O${i}`, corredores: c, yo: false })), { nombre: 'Sofía', corredores: mias.reduce((s, m) => s + m[0], 0), yo: true }].sort(
    (a, b) => b.corredores - a.corredores,
  ),
  totalCarrera: 100,
});

describe('logros del equipo', () => {
  it('cuenta, ubica en el ranking y dice cuánto falta para subir', () => {
    const l = calcularLogros(
      d(
        [
          [3, 'pagado', '2026-12-08'],
          [4, 'pendiente', '2026-11-20'],
        ],
        [12, 9, 2],
      ),
      [5, 10, 25],
      hoy,
    );
    expect(l).toMatchObject({ corredores: 7, corredoresPagados: 3, porPagar: 1, estaSemana: 3, lugar: 3, paraSubir: 3, insigniasGanadas: [5], siguienteInsignia: 10 });
  });
  it('el primero no tiene a quién pasar; sin corredores no hay lugar', () => {
    expect(calcularLogros(d([[8, 'pagado', '2026-12-01']], [3]), [5], hoy)).toMatchObject({ lugar: 1, paraSubir: null, siguienteInsignia: null });
    expect(calcularLogros(d([], [3]), [5], hoy)).toMatchObject({ lugar: null, paraSubir: 4 });
  });
});
