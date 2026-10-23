import { CONFIG } from '../config';
import { pesos, soloDigitos } from '../lib/format';
import type { Corredor, Inscripcion } from './store';

export type Contacto = { grupo: string; responsable: string; correo: string; telefono: string };
export type DatosCorredor = Omit<Corredor, 'numero' | 'correo' | 'telefono'>;

export const CORREDOR_VACIO: DatosCorredor = { nombre: '', edad: '', sexo: '', categoria: '', talla: '', emergenciaNombre: '', emergenciaTelefono: '' };

export type Regla = { requerido?: boolean; min?: number; tipo?: 'correo' | 'telefono' | 'edad' };

export const REGLAS_CONTACTO: Record<keyof Contacto, Regla> = {
  grupo: { requerido: true, min: 2 },
  responsable: { requerido: true, min: 5 },
  correo: { requerido: true, tipo: 'correo' },
  telefono: { requerido: true, tipo: 'telefono' },
};

export const REGLAS_CORREDOR: Record<keyof DatosCorredor, Regla> = {
  nombre: { requerido: true, min: 5 },
  edad: { requerido: true, tipo: 'edad' },
  sexo: { requerido: true },
  categoria: { requerido: true },
  talla: { requerido: true },
  emergenciaNombre: { requerido: true, min: 3 },
  emergenciaTelefono: { requerido: true, tipo: 'telefono' },
};

export function errorDeCampo(valor: string, regla: Regla) {
  const v = valor.trim();
  if (regla.requerido && !v) return 'Este campo es obligatorio.';
  if (!v) return '';
  if (regla.tipo === 'correo' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Escribe un correo válido.';
  if (regla.tipo === 'telefono' && soloDigitos(v).length !== 10) return 'Escribe 10 dígitos.';
  if (regla.tipo === 'edad') {
    const n = Number(v);
    if (!Number.isInteger(n) || n < CONFIG.edadMinima || n > CONFIG.edadMaxima) return `Edad entre ${CONFIG.edadMinima} y ${CONFIG.edadMaxima} años.`;
  }
  if (regla.min && v.length < regla.min) return `Escribe al menos ${regla.min} caracteres.`;
  return '';
}

export const categoria = (id: string) => CONFIG.categorias.find((c) => c.id === id) ?? null;

export function armarInscripcion(seleccion: (number | null)[], corredores: DatosCorredor[], contacto: Contacto): Inscripcion {
  const grupo = seleccion.length > 1;
  const lista: Corredor[] = seleccion.map((numero, i) => {
    const d = corredores[i] ?? CORREDOR_VACIO;
    return {
      numero: numero as number,
      nombre: d.nombre.trim(),
      edad: d.edad.trim(),
      sexo: d.sexo,
      categoria: d.categoria,
      talla: d.talla,
      emergenciaNombre: d.emergenciaNombre.trim(),
      emergenciaTelefono: d.emergenciaTelefono.trim(),
    };
  });
  const subtotal = lista.reduce((s, r) => s + (categoria(r.categoria)?.precio ?? 0), 0);
  let pct = 0;
  if (grupo) CONFIG.descuentosGrupo.forEach((d) => {
    if (lista.length >= d.desde && d.porcentaje > pct) pct = d.porcentaje;
  });
  const descuento = Math.round((subtotal * pct) / 100);
  const base = { fecha: new Date().toLocaleString('es-MX'), corredores: lista, total: subtotal - descuento };
  if (!grupo) {
    lista[0].correo = contacto.correo.trim();
    lista[0].telefono = contacto.telefono;
    return { tipo: 'Individual', ...base };
  }
  return {
    tipo: 'Grupo',
    grupo: contacto.grupo.trim(),
    responsable: contacto.responsable.trim(),
    correo: contacto.correo.trim(),
    telefono: contacto.telefono,
    subtotal,
    descuento,
    ...base,
  };
}

/* ---------- Texto plano para copiar ---------- */
export function comoTexto(d: Inscripcion) {
  let t = `🏃 ${CONFIG.nombreCarrera}\nInscripción: ${d.tipo}\nFecha: ${d.fecha}\n`;
  if (d.tipo === 'Grupo') t += `\nGrupo: ${d.grupo}\nResponsable: ${d.responsable}\nCorreo: ${d.correo}\nTeléfono: ${d.telefono}\n`;
  d.corredores.forEach((r) => {
    t += `\n#${r.numero} · ${r.nombre} · ${r.edad} años · ${r.sexo} · ${r.categoria} · Talla ${r.talla}`;
    if (r.correo) t += `\n   ${r.correo} · ${r.telefono}`;
    t += `\n   Emergencia: ${r.emergenciaNombre} (${r.emergenciaTelefono})`;
  });
  if (d.descuento) t += `\n\nSubtotal: ${pesos(d.subtotal ?? 0)}\nDescuento: −${pesos(d.descuento)}`;
  t += `\nTOTAL: ${pesos(d.total)}`;
  if (d.pagarAntesDe) t += `\nPagar antes del: ${d.pagarAntesDe}`;
  return t;
}

// Formato separado por tabuladores para pegar directo en Excel
export function comoFilas(d: Inscripcion) {
  return d.corredores
    .map((r) =>
      [d.fecha, d.tipo, d.grupo ?? '', r.numero, r.nombre, r.edad, r.sexo, r.categoria, r.talla, r.correo || d.correo, r.telefono || d.telefono, r.emergenciaNombre, r.emergenciaTelefono].join('\t'),
    )
    .join('\n');
}

export function enlaceWhatsApp(d: Inscripcion) {
  if (!CONFIG.pago.whatsapp) return null;
  const nums = d.corredores.map((r) => `#${r.numero}`).join(', ');
  const quien = d.tipo === 'Grupo' ? `el grupo "${d.grupo}" (responsable: ${d.responsable})` : d.corredores[0].nombre;
  const msg = `Hola, me inscribí a ${CONFIG.nombreCarrera}. Inscripción de ${quien} · Número(s): ${nums} · Total: ${pesos(d.total)}. ¿Me pueden compartir el número de cuenta para realizar el pago?`;
  return `https://wa.me/${CONFIG.pago.whatsapp}?text=${encodeURIComponent(msg)}`;
}
