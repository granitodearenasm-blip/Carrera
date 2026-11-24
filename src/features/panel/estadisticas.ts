import type { EstadoPago, InscripcionPanel } from '../../services/supabase/panel';

// Cálculos puros del panel (con pruebas en estadisticas.test.ts).

export type Resumen = {
  inscripciones: number;
  corredores: number;
  recaudado: number;
  pendiente: number;
  vencidas: number;
  porDistancia: Record<string, number>;
  porSexo: Record<string, number>;
  porTalla: Record<string, number>;
};

const contar = (lista: string[]) => lista.reduce<Record<string, number>>((m, k) => ((m[k] = (m[k] ?? 0) + 1), m), {});

/** Totales sin contar las canceladas. `hoy` se pasa para poder probarlo. */
export function resumir(lista: InscripcionPanel[], hoy = new Date()): Resumen {
  const vivas = lista.filter((i) => i.estadoPago !== 'cancelado');
  const corredores = vivas.flatMap((i) => i.corredores);
  const finDeHoy = new Date(hoy);
  finDeHoy.setHours(0, 0, 0, 0);
  return {
    inscripciones: vivas.length,
    corredores: corredores.length,
    recaudado: vivas.filter((i) => i.estadoPago === 'pagado').reduce((s, i) => s + i.total, 0),
    pendiente: vivas.filter((i) => i.estadoPago === 'pendiente').reduce((s, i) => s + i.total, 0),
    vencidas: vivas.filter((i) => i.estadoPago === 'pendiente' && i.pagarAntesDe < finDeHoy).length,
    porDistancia: contar(corredores.map((c) => c.categoria)),
    porSexo: contar(corredores.map((c) => c.sexo)),
    porTalla: contar(corredores.map((c) => c.talla)),
  };
}

export type Filtros = { texto: string; estado: EstadoPago | 'todas'; distancia: string };

const normalizar = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');

/** Busca por folio, número, nombre, grupo, correo o teléfono; sin importar acentos ni mayúsculas. */
export function filtrar(lista: InscripcionPanel[], f: Filtros): InscripcionPanel[] {
  const q = normalizar(f.texto.trim());
  return lista.filter((i) => {
    if (f.estado !== 'todas' && i.estadoPago !== f.estado) return false;
    if (f.distancia && !i.corredores.some((c) => c.categoria === f.distancia)) return false;
    if (!q) return true;
    const campos = [String(i.folio), i.grupo ?? '', i.responsable ?? '', i.correo, i.telefono, ...i.corredores.flatMap((c) => [String(c.numero), c.nombre])];
    return campos.some((c) => normalizar(c).includes(q));
  });
}

/** Una fila por corredor, para Excel o Google Sheets. */
export function comoCsv(lista: InscripcionPanel[]): string {
  const encabezado = [
    'Folio',
    'Fecha',
    'Estado de pago',
    'Pagar antes de',
    'Tipo',
    'Grupo',
    'Responsable',
    'Correo',
    'Teléfono',
    'Número',
    'Nombre',
    'Edad',
    'Rama',
    'Distancia',
    'Talla',
    'Emergencia',
    'Tel. emergencia',
    'Total inscripción',
    'Notas',
  ];
  const celda = (v: string | number) => {
    const s = String(v ?? '');
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const filas = lista.flatMap((i) =>
    i.corredores.map((c) =>
      [
        i.folio,
        i.creado.toISOString().slice(0, 16).replace('T', ' '),
        i.estadoPago,
        i.pagarAntesDe.toISOString().slice(0, 10),
        i.tipo,
        i.grupo ?? '',
        i.responsable ?? '',
        i.correo,
        i.telefono,
        c.numero,
        c.nombre,
        c.edad,
        c.sexo,
        c.categoria,
        c.talla,
        c.emergenciaNombre,
        c.emergenciaTelefono,
        i.total,
        i.notas,
      ]
        .map(celda)
        .join(','),
    ),
  );
  // BOM para que Excel abra bien los acentos
  return '﻿' + [encabezado.join(','), ...filas].join('\r\n');
}
