import { describe, expect, it } from 'vitest';
import type { InscripcionPanel } from '../../services/supabase/panel';
import { comoCsv, filtrar, resumir } from './estadisticas';

const corredor = (numero: number, extra: Partial<InscripcionPanel['corredores'][number]> = {}) => ({
  numero,
  nombre: 'José Pérez',
  edad: 30,
  sexo: 'Masculino',
  categoria: '10K',
  talla: 'L',
  emergenciaNombre: 'Ana',
  emergenciaTelefono: '2221234567',
  ...extra,
});
const ins = (folio: number, extra: Partial<InscripcionPanel> = {}): InscripcionPanel => ({
  id: String(folio),
  folio,
  tipo: 'Individual',
  grupo: null,
  responsable: null,
  correo: `p${folio}@mail.com`,
  telefono: '2227654321',
  total: 350,
  estadoPago: 'pendiente',
  pagarAntesDe: new Date('2026-11-27T12:00:00'),
  notas: '',
  creado: new Date('2026-11-23T10:00:00Z'),
  reporte: null,
  equipoId: null,
  corredores: [corredor(folio)],
  ...extra,
});

describe('resumen del panel', () => {
  const lista = [
    ins(1, { estadoPago: 'pagado' }),
    ins(2, { total: 700, tipo: 'Grupo', grupo: 'Ardillas', corredores: [corredor(20, { categoria: '5K', sexo: 'Femenino', talla: 'S' }), corredor(21, { categoria: '5K' })] }),
    ins(3, { estadoPago: 'cancelado', total: 350 }),
    ins(4, { pagarAntesDe: new Date('2026-11-20T12:00:00') }),
  ];
  const r = resumir(lista, new Date('2026-11-23T15:00:00'));

  it('no cuenta las canceladas', () => {
    expect(r.inscripciones).toBe(3);
    expect(r.corredores).toBe(4);
  });
  it('separa lo recaudado de lo pendiente', () => {
    expect(r.recaudado).toBe(350);
    expect(r.pendiente).toBe(1050);
  });
  it('cuenta las pendientes vencidas', () => expect(r.vencidas).toBe(1));
  it('agrupa por distancia, rama y talla', () => {
    expect(r.porDistancia).toEqual({ '10K': 2, '5K': 2 });
    expect(r.porSexo).toEqual({ Masculino: 3, Femenino: 1 });
    expect(r.porTalla).toEqual({ L: 3, S: 1 });
  });
});

describe('filtros', () => {
  const lista = [ins(1, { corredores: [corredor(128, { nombre: 'María Ñúñez' })] }), ins(2, { estadoPago: 'pagado', corredores: [corredor(7, { categoria: '3K' })] })];
  const base = { texto: '', estado: 'todas' as const, distancia: '' };
  it('busca sin acentos', () => expect(filtrar(lista, { ...base, texto: 'nunez' }).map((i) => i.folio)).toEqual([1]));
  it('busca por número', () => expect(filtrar(lista, { ...base, texto: '128' }).map((i) => i.folio)).toEqual([1]));
  it('filtra por estado', () => expect(filtrar(lista, { ...base, estado: 'pagado' }).map((i) => i.folio)).toEqual([2]));
  it('filtra por distancia', () => expect(filtrar(lista, { ...base, distancia: '3K' }).map((i) => i.folio)).toEqual([2]));

  const avisos = [
    ins(5, { reporte: { metodo: 'transferencia', referencia: 'BBVA 98765', cuando: new Date('2026-11-24T10:00:00Z') } }),
    ins(6, { estadoPago: 'pagado', reporte: { metodo: 'efectivo', referencia: null, cuando: new Date('2026-11-24T10:00:00Z') } }),
    ins(7),
  ];
  it('"por revisar" son las pendientes con aviso de pago, no las ya pagadas', () => expect(filtrar(avisos, { ...base, estado: 'revisar' }).map((i) => i.folio)).toEqual([5]));
  it('busca por la referencia que avisó el corredor', () => expect(filtrar(avisos, { ...base, texto: '98765' }).map((i) => i.folio)).toEqual([5]));
  it('el resumen cuenta los pagos por revisar', () => expect(resumir(avisos).porRevisar).toBe(1));
});

describe('CSV', () => {
  it('una fila por corredor y escapa comas y comillas', () => {
    const csv = comoCsv([ins(1, { notas: 'Pagó "en efectivo", ok' })]);
    const filas = csv.replace('﻿', '').split('\r\n');
    expect(filas).toHaveLength(2);
    expect(filas[1]).toContain('"Pagó ""en efectivo"", ok"');
  });
  it('incluye el pago que avisó el corredor', () => {
    const csv = comoCsv([ins(1, { reporte: { metodo: 'transferencia', referencia: 'REF-1234', cuando: new Date('2026-11-24T10:30:00Z') } })]);
    expect(csv).toContain('2026-11-24 10:30,transferencia,REF-1234');
  });
});
