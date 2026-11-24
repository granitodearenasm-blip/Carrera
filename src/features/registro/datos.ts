// Validación del paso 3, armado de la inscripción y textos para copiar o mandar por WhatsApp.
// Las mismas reglas las vuelve a revisar la base de datos (confirmar_inscripcion): esto solo es para
// avisar a tiempo y junto al campo.
import { CONFIG } from '../../config';
import { pesos, soloDigitos } from '../../shared/format';
import type { Corredor, Inscripcion } from './store';

export type Contacto = { grupo: string; responsable: string; correo: string; telefono: string };
export type DatosCorredor = Omit<Corredor, 'numero' | 'correo' | 'telefono'>;

export const CONTACTO_VACIO: Contacto = { grupo: '', responsable: '', correo: '', telefono: '' };
export const CORREDOR_VACIO: DatosCorredor = { nombre: '', edad: '', sexo: '', categoria: '', talla: '', emergenciaNombre: '', emergenciaTelefono: '' };

export type Regla = { requerido?: boolean; min?: number; max?: number; tipo?: 'correo' | 'telefono' | 'edad' };

export const REGLAS_CONTACTO: Record<keyof Contacto, Regla> = {
  grupo: { requerido: true, min: 2, max: 80 },
  responsable: { requerido: true, min: 5, max: 80 },
  correo: { requerido: true, tipo: 'correo', max: 120 },
  telefono: { requerido: true, tipo: 'telefono' },
};

export const REGLAS_CORREDOR: Record<keyof DatosCorredor, Regla> = {
  nombre: { requerido: true, min: 5, max: 80 },
  edad: { requerido: true, tipo: 'edad' },
  sexo: { requerido: true },
  categoria: { requerido: true },
  talla: { requerido: true },
  emergenciaNombre: { requerido: true, min: 3, max: 80 },
  emergenciaTelefono: { requerido: true, tipo: 'telefono' },
};

/** Mensaje de error de un campo, o '' si está bien. Dice qué arreglar. */
export function errorDeCampo(valor: string, regla: Regla) {
  const v = valor.trim();
  if (regla.requerido && !v) return 'Este dato es obligatorio.';
  if (!v) return '';
  if (regla.tipo === 'correo' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Escribe un correo completo, por ejemplo nombre@gmail.com.';
  if (regla.tipo === 'telefono' && soloDigitos(v).length !== 10) return 'Escribe los 10 dígitos, sin espacios ni lada internacional.';
  if (regla.tipo === 'edad') {
    const n = Number(v);
    if (!Number.isInteger(n) || n < CONFIG.edadMinima || n > CONFIG.edadMaxima) return `La edad debe estar entre ${CONFIG.edadMinima} y ${CONFIG.edadMaxima} años.`;
  }
  if (regla.min && v.length < regla.min) return `Escribe al menos ${regla.min} caracteres.`;
  if (regla.max && v.length > regla.max) return `Máximo ${regla.max} caracteres.`;
  return '';
}

export const PRECIO = CONFIG.categorias[0]?.precio ?? 0;
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
      emergenciaTelefono: soloDigitos(d.emergenciaTelefono),
    };
  });
  return {
    tipo: grupo ? 'Grupo' : 'Individual',
    grupo: grupo ? contacto.grupo.trim() : undefined,
    responsable: grupo ? contacto.responsable.trim() : undefined,
    correo: contacto.correo.trim(),
    telefono: soloDigitos(contacto.telefono),
    fecha: new Date().toLocaleString('es-MX'),
    corredores: lista,
    // El total definitivo lo calcula la base de datos; este es el que se muestra antes de enviar.
    total: lista.reduce((s, r) => s + (categoria(r.categoria)?.precio ?? PRECIO), 0),
  };
}

/* ---------- Texto plano para copiar ---------- */
export function comoTexto(d: Inscripcion) {
  let t = `${CONFIG.nombreCarrera}\nInscripción ${d.tipo.toLowerCase()}${d.folio ? `, folio ${d.folio}` : ''}\nFecha: ${d.fecha}\n`;
  if (d.tipo === 'Grupo') t += `\nGrupo: ${d.grupo}\nResponsable: ${d.responsable}`;
  t += `\nCorreo: ${d.correo}\nTeléfono: ${d.telefono}\n`;
  d.corredores.forEach((r) => {
    t += `\n#${r.numero}: ${r.nombre}, ${r.edad} años, ${r.sexo}, ${r.categoria}, talla ${r.talla}`;
    t += `\n   Emergencia: ${r.emergenciaNombre} (${r.emergenciaTelefono})`;
  });
  t += `\n\nTotal: ${pesos(d.total)}`;
  if (d.pagarAntesDe) t += `\nPagar a más tardar el ${d.pagarAntesDe}`;
  return t;
}

export function enlaceWhatsApp(d: Inscripcion) {
  if (!CONFIG.pago.whatsapp) return null;
  const nums = d.corredores.map((r) => `#${r.numero}`).join(', ');
  const quien = d.tipo === 'Grupo' ? `el grupo "${d.grupo}" (responsable: ${d.responsable})` : d.corredores[0].nombre;
  const folio = d.folio ? ` Folio ${d.folio}.` : '';
  const msg = `Hola, me inscribí a ${CONFIG.nombreCarrera}.${folio} Inscripción de ${quien}, número(s) ${nums}, total ${pesos(d.total)}. ¿Me comparten el número de cuenta para pagar?`;
  return `https://wa.me/${CONFIG.pago.whatsapp}?text=${encodeURIComponent(msg)}`;
}
