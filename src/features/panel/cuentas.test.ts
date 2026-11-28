import { describe, expect, it } from 'vitest';
import type { Miembro } from '../../services/supabase/equipo';
import type { Gasto, Patrocinio } from '../../services/supabase/finanzas';
import type { InscripcionPanel } from '../../services/supabase/panel';
import { balance, codigoDesdeNombre, desempenoEquipo, gastosPorCategoria, parteDelEquipo } from './cuentas';

const miembro = (id: string, nombre: string): Miembro => ({ id, nombre, codigo: id, clave: `k-${id}`, activo: true, creado: new Date() });
const ins = (estadoPago: InscripcionPanel['estadoPago'], corredores: number, equipoId: string | null = null): InscripcionPanel =>
  ({ estadoPago, total: corredores * 350, equipoId, corredores: Array.from({ length: corredores }, () => ({})) }) as InscripcionPanel;
const pat = (monto: number, estado: Patrocinio['estado']) => ({ monto, estado }) as Patrocinio;
const gasto = (monto: number, categoria = 'Otro') => ({ monto, categoria }) as Gasto;

describe('equipo', () => {
  const lista = [ins('pagado', 2, 'a'), ins('pendiente', 1, 'a'), ins('cancelado', 5, 'a'), ins('pagado', 3, 'b'), ins('pagado', 4)];
  it('cuenta lo de cada miembro sin canceladas y ordena por corredores', () => {
    const d = desempenoEquipo([miembro('a', 'Ana'), miembro('b', 'Beto'), miembro('c', 'Carla')], lista);
    expect(d.map((x) => x.miembro.id)).toEqual(['a', 'b', 'c']);
    expect(d[0]).toMatchObject({ inscripciones: 2, corredores: 3, corredoresPagados: 2, recaudado: 700, porCobrar: 350 });
    expect(d[2].corredores).toBe(0);
  });
  it('parte que llegó por links', () => expect(parteDelEquipo(lista)).toBeCloseTo(6 / 10));
});

describe('balance', () => {
  const lista = [ins('pagado', 10), ins('pendiente', 2), ins('cancelado', 3)];
  it('reparte el neto cobrado entre los viajeros', () => {
    const b = balance(lista, [pat(5000, 'cobrado'), pat(2000, 'comprometido')], [gasto(1500)], { viajeros: 10, costoPorViajero: 2000 });
    expect(b.neto).toBe(3500 + 5000 - 1500);
    expect(b.porViajero).toBe(700);
    expect(b.faltaPorViajero).toBe(1300);
    expect(b.netoProyectado).toBe(7000 + 700 + 2000);
  });
  it('si los gastos superan lo cobrado no reparte negativo, y sin costo no calcula lo que falta', () => {
    const b = balance([], [], [gasto(900)], { viajeros: 10, costoPorViajero: null });
    expect(b.neto).toBe(-900);
    expect(b.porViajero).toBe(0);
    expect(b.faltaPorViajero).toBeNull();
  });
  it('suma gastos por categoría', () => expect(gastosPorCategoria([gasto(100, 'Playeras'), gasto(50, 'Playeras'), gasto(20)])).toEqual({ Playeras: 150, Otro: 20 }));
});

describe('códigos de invitación', () => {
  it('quita acentos y espacios', () => expect(codigoDesdeNombre('  Sofía Ramírez Núñez ')).toBe('sofia-ramirez-nunez'));
});
