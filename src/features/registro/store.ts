/* ==========================================================================
   🔢 NÚMEROS DE CORREDOR E INSCRIPCIÓN EN 4 PASOS
   Estado del asistente (fuera de React, con useSyncExternalStore) y apartado de números.
   Datos: services/supabase (tabla pública `tablero` + funciones apartar/soltar/confirmar).
   - Al tocar un número queda apartado a tu nombre por CONFIG.apartado.minutos (como asientos de cine).
   - La conexión en tiempo real solo se abre en el paso 2 con la pestaña visible.
   - Sin Supabase configurado: modo demostración (los confirmados se guardan solo en este navegador).
   ========================================================================== */
import { useSyncExternalStore } from 'react';
import { CONFIG } from '../../config';
import { fechaLarga } from '../../shared/format';
import { guardar as guardarLocal, leer } from '../../shared/storage';
import { recordar } from '../pago/recordar';
import { hayNube, type ErrorBase } from '../../services/supabase/client';
import { asegurarSesionAnonima } from '../../services/supabase/auth';
import { apartarNumero, cargarTablero, escucharTablero, soltarAlSalir, soltarNumero, type Celda } from '../../services/supabase/numeros';
import { confirmarInscripcion } from '../../services/supabase/inscripciones';
import { atribuirInscripcion } from '../../services/supabase/equipo';
import { olvidarReferido, referidoVigente } from './referido';

export type Paso = 1 | 2 | 3 | 4;
export type Conexion = { tipo: 'cargando' | 'demo' | 'ok' | 'error'; texto: string };

export type Corredor = {
  numero: number;
  nombre: string;
  edad: string;
  sexo: string;
  categoria: string;
  talla: string;
  emergenciaNombre: string;
  emergenciaTelefono: string;
  correo?: string;
  telefono?: string;
};

export type Inscripcion = {
  tipo: 'Individual' | 'Grupo';
  grupo?: string;
  responsable?: string;
  correo: string;
  telefono: string;
  fecha: string;
  corredores: Corredor[];
  total: number;
  folio?: number;
  pagarAntesDe?: string;
};

export type Estado = {
  paso: Paso;
  cantidad: number;
  /** Lugar fijo por corredor: seleccion[0] es el número del Corredor 1… Un lugar vacío es null. */
  seleccion: (number | null)[];
  /** Mis apartados: número → hora local en que lo pedí. */
  mios: Record<number, number>;
  conexion: Conexion;
  alertaNumeros: string;
  /** Segundos que le quedan al apartado, o null si no hay apartados. */
  restante: number | null;
  /** Cambia cada vez que hay que volver a dibujar el tablero. */
  version: number;
  /** Cambia cuando el asistente debe desplazarse a su inicio. */
  scroll: number;
};

const APARTADO_MS = CONFIG.apartado.minutos * 60000;
const MARGEN_MS = 5000; // el temporizador termina 5 s antes que el servidor
const CLAVE_DEMO = 'numeros-demo';
const { minimo: MIN, maximo: MAX } = CONFIG.numeros;
const RANGO = `Números del ${MIN} al ${MAX}.`;

const DB = {
  iniciado: false,
  listo: false, // tablero cargado y sesión abierta
  tablero: new Map<number, Celda>(),
  escuchando: null as null | (() => void),
  desfase: 0, // diferencia aproximada entre el reloj del servidor y el del dispositivo
  /** Número elegido en la portada, para apartarlo en cuanto cargue el tablero */
  pendiente: null as number | null,
};

/** Captcha (Turnstile) para abrir la sesión anónima; lo registra el asistente al montarse. */
let pedirCaptcha: () => Promise<string | undefined> = async () => undefined;
export function configurarCaptcha(fn: () => Promise<string | undefined>) {
  pedirCaptcha = fn;
}

/* ---------- Estado compartido con React ---------- */
let estado: Estado = {
  paso: 1,
  cantidad: 1,
  seleccion: [null],
  mios: {},
  conexion: { tipo: 'cargando', texto: 'Consultando números disponibles…' },
  alertaNumeros: '',
  restante: null,
  version: 0,
  scroll: 0,
};
const oyentes = new Set<() => void>();
function cambiar(parcial: Partial<Estado>) {
  estado = { ...estado, ...parcial };
  oyentes.forEach((f) => f());
}
function suscribir(f: () => void) {
  oyentes.add(f);
  return () => {
    oyentes.delete(f);
  };
}
export const useRegistro = () => useSyncExternalStore(suscribir, () => estado);
const repintar = () => cambiar({ version: estado.version + 1 });
const alertar = (texto: string) => cambiar({ alertaNumeros: texto });

/* ========================================================================
   🔌 CONEXIÓN (una sola vez, al llegar al paso 2)
   ======================================================================== */
function initNumeros() {
  if (DB.iniciado) return;
  DB.iniciado = true;
  if (!hayNube) {
    leer<number[]>(CLAVE_DEMO, []).forEach((n) => DB.tablero.set(n, { estado: 'confirmado', ms: 0 }));
    DB.listo = true;
    cambiar({ conexion: { tipo: 'demo', texto: `Modo demostración: nada se envía. ${RANGO}` } });
    aplicarPendiente();
    return;
  }
  cambiar({ conexion: { tipo: 'cargando', texto: 'Consultando números disponibles…' } });
  pedirCaptcha()
    .then((token) => asegurarSesionAnonima(token))
    .then(() => cargarTablero())
    .then((t) => {
      DB.tablero = t;
      DB.listo = true;
      conexionOk();
      if (estado.paso === 2 && !document.hidden) escuchar();
      alCambiarOcupados();
      aplicarPendiente();
    })
    .catch((err: Error) => {
      console.error('[supabase]', err);
      DB.iniciado = false; // se reintenta al volver al paso 2
      cambiar({
        conexion: {
          tipo: 'error',
          texto:
            err.message === 'anonimo-desactivado'
              ? 'Falta activar el acceso anónimo en Supabase (Authentication → Sign In / Providers → Allow anonymous sign-ins).'
              : 'No pudimos conectar con la base de datos. Revisa tu conexión y vuelve a intentarlo.',
        },
      });
    });
}

const conexionOk = () =>
  cambiar({ conexion: { tipo: 'ok', texto: `Disponibilidad en tiempo real. ${RANGO} Al tocar un número queda apartado para ti ${CONFIG.apartado.minutos} minutos.` } });

/** Reintenta conectar después de un error. */
export function reintentarConexion() {
  DB.iniciado = false;
  initNumeros();
}

/* ---------- Tiempo real (solo en el paso 2 y con la pestaña visible) ---------- */
function escuchar() {
  if (!hayNube || !DB.listo || DB.escuchando) return;
  DB.escuchando = escucharTablero(
    (n, celda) => {
      if (celda) DB.tablero.set(n, celda);
      else DB.tablero.delete(n);
      alCambiarOcupados();
    },
    () => {
      dejarDeEscuchar();
      cambiar({ conexion: { tipo: 'error', texto: 'Se perdió la conexión en tiempo real. Reconectando…' } });
      setTimeout(() => {
        if (estado.paso !== 2 || document.hidden) return;
        cargarTablero()
          .then((t) => {
            DB.tablero = t;
            conexionOk();
            escuchar();
            alCambiarOcupados();
          })
          .catch(() => cambiar({ conexion: { tipo: 'error', texto: 'No pudimos consultar los números disponibles. Recarga la página en unos momentos.' } }));
      }, 4000);
    },
  );
}
function dejarDeEscuchar() {
  DB.escuchando?.();
  DB.escuchando = null;
}
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) dejarDeEscuchar();
    else if (estado.paso === 2 && hayNube && DB.listo) {
      // Al volver se recarga el tablero completo: pudo cambiar mientras no escuchábamos
      cargarTablero()
        .then((t) => {
          DB.tablero = t;
          alCambiarOcupados();
          escuchar();
        })
        .catch(() => {});
    }
  });
}

/* ---------- Estado de cada número ---------- */
const esReservado = (n: number) => CONFIG.numeros.reservados.includes(n);
const enRango = (n: number) => Number.isInteger(n) && n >= MIN && n <= MAX;
const ahora = () => Date.now() + DB.desfase;
const vigente = (x?: Celda) => !!x && x.estado === 'apartado' && x.ms + APARTADO_MS > ahora();
const esMio = (n: number) => estado.mios[n] !== undefined;
/** Para fines prácticos, reservado = ocupado. */
export function estaOcupado(n: number) {
  const x = DB.tablero.get(n);
  return esReservado(n) || (!!x && x.estado === 'confirmado' && !esMio(n));
}
/** Apartado por otra persona que todavía está llenando su registro. */
export const enProceso = (n: number) => !esMio(n) && vigente(DB.tablero.get(n));
export const estaLibre = (n: number) => enRango(n) && !estaOcupado(n) && !enProceso(n);

/** Para la portada: carga el tablero una vez (solo lectura, sin sesión) y dice si un número está libre. */
let consulta: Promise<void> | null = null;
export function consultarDisponibilidad(): Promise<void> {
  if (DB.listo || !hayNube) {
    if (!hayNube && !DB.iniciado) leer<number[]>(CLAVE_DEMO, []).forEach((n) => DB.tablero.set(n, { estado: 'confirmado', ms: 0 }));
    return Promise.resolve();
  }
  consulta ??= cargarTablero()
    .then((t) => {
      if (!DB.listo) DB.tablero = t;
    })
    .catch(() => {
      consulta = null;
    });
  return consulta;
}

/** Cuántos números quedan libres (para la franja de confianza). Llamar después de consultarDisponibilidad(). */
export function contarDisponibles(): { libres: number; total: number } {
  let libres = 0;
  for (let n = MIN; n <= MAX; n++) if (estaLibre(n)) libres++;
  return { libres, total: MAX - MIN + 1 };
}

/* ---------- Apartar / soltar un número ---------- */
type ErrorCodigo = Error & { codigo?: string; numeros?: number[] };
const errorNumero = (codigo: string): ErrorCodigo => Object.assign(new Error(codigo), { codigo });

async function apartar(n: number) {
  if (!hayNube) {
    DB.tablero.set(n, { estado: 'apartado', ms: Date.now() }); // modo demostración
    return;
  }
  if (!DB.listo) throw errorNumero('sin-conexion');
  const pedido = Date.now();
  try {
    const servidor = await apartarNumero(n);
    DB.desfase = servidor - pedido;
    DB.tablero.set(n, { estado: 'apartado', ms: servidor });
  } catch (e) {
    const codigo = (e as ErrorBase).codigo;
    if (codigo === 'ocupado') DB.tablero.set(n, { estado: 'confirmado', ms: 0 });
    throw errorNumero(codigo ?? 'fallo');
  }
}

function soltar(n: number) {
  const x = DB.tablero.get(n);
  if (x && x.estado === 'apartado') DB.tablero.delete(n);
  if (hayNube && DB.listo) void soltarNumero(n).catch(() => {});
}

/* ---------- Selección ---------- */
const elegidos = () => estado.seleccion.filter((n): n is number => n !== null);
const vacios = () => estado.seleccion.filter((n) => n === null).length;
function quitarMios(nums: number[]) {
  const mios = { ...estado.mios };
  nums.forEach((n) => delete mios[n]);
  cambiar({ mios });
}
function liberarMio(n: number | null) {
  if (n === null) return;
  quitarMios([n]);
  soltar(n);
}
// Deja vacíos los lugares cuyo número cumpla la condición y devuelve qué se liberó
function liberarLugares(condicion: (n: number) => boolean) {
  const perdidos: { numero: number; corredor: number }[] = [];
  const seleccion = estado.seleccion.map((n, i) => {
    if (n !== null && condicion(n)) {
      perdidos.push({ numero: n, corredor: i + 1 });
      return null;
    }
    return n;
  });
  cambiar({ seleccion });
  return perdidos;
}
const listaPerdidos = (perdidos: { numero: number; corredor: number }[]) => perdidos.map((p) => `#${p.numero}${estado.cantidad > 1 ? ` (corredor ${p.corredor})` : ''}`).join(', ');
const textoPerdidos = (perdidos: { numero: number; corredor: number }[], final: string) =>
  `${listaPerdidos(perdidos)} ${perdidos.length > 1 ? 'acaban' : 'acaba'} de ser apartado${perdidos.length > 1 ? 's' : ''} por otra persona. ${final}`;

/* ---------- ⏱ Temporizador del apartado ---------- */
function limiteApartado() {
  let limite: number | null = null;
  for (const n of elegidos()) {
    const inicio = estado.mios[n];
    if (inicio === undefined) continue;
    const fin = inicio + APARTADO_MS - MARGEN_MS;
    if (limite === null || fin < limite) limite = fin;
  }
  return limite;
}
function actualizarTemporizador() {
  const limite = limiteApartado();
  if (limite === null) {
    if (estado.restante !== null) cambiar({ restante: null });
    return;
  }
  const resta = limite - Date.now();
  if (resta <= 0) return expirarApartados();
  const s = Math.ceil(resta / 1000);
  if (s !== estado.restante) cambiar({ restante: s });
}
function expirarApartados() {
  const mis = elegidos();
  mis.forEach((n) => esMio(n) && soltar(n));
  cambiar({ seleccion: estado.seleccion.map(() => null), mios: {}, restante: null });
  if (estado.paso > 2) irAPaso(2);
  repintar();
  alertar(`Se acabó el tiempo y ${mis.length > 1 ? 'tus números se liberaron' : 'tu número se liberó'}. Vuelve a elegir; tus datos se conservan.`);
}

let arrancado = false;
/** Arranca el reloj del apartado (una sola vez). */
export function arrancar() {
  if (arrancado) return;
  arrancado = true;
  let tick = 0;
  setInterval(() => {
    actualizarTemporizador();
    // Cada 3 s se actualiza el tablero, por si venció el apartado de alguien más
    if (++tick % 3 === 0 && estado.paso === 2) repintar();
  }, 1000);
  // Si la persona cierra o sale de la página, se intenta liberar sus números
  window.addEventListener('pagehide', () => {
    const mis = elegidos().filter(esMio);
    if (hayNube && DB.listo && mis.length) soltarAlSalir(mis);
  });
}

/* ---------- Navegación entre pasos ---------- */
export function irAPaso(n: Paso, sinScroll = false) {
  cambiar({ paso: n, scroll: sinScroll ? estado.scroll : estado.scroll + 1 });
  if (n === 2) {
    initNumeros();
    if (!document.hidden) escuchar();
    repintar();
  } else dejarDeEscuchar();
}

function numerosListos() {
  alertar('');
  const perdidos = liberarLugares((n) => estaOcupado(n) || enProceso(n));
  if (perdidos.length) {
    quitarMios(perdidos.map((p) => p.numero));
    repintar();
    alertar(textoPerdidos(perdidos, 'Elige otro.'));
    return false;
  }
  const faltan = vacios();
  if (faltan) {
    alertar(`Te falta${faltan > 1 ? 'n' : ''} elegir ${faltan} número${faltan > 1 ? 's' : ''}.`);
    return false;
  }
  return true;
}

/** Avanza (o regresa) de paso. Para salir del paso 3 se pasa la validación del formulario. */
export function intentarIr(destino: Paso, validarDatos?: () => boolean) {
  if (destino > estado.paso) {
    if (estado.paso === 2 && !numerosListos()) return;
    if (estado.paso === 3 && validarDatos && !validarDatos()) return;
  }
  irAPaso(destino);
}

/** Desde la portada: lleva al paso 2 con ese número ya apartado (si sigue libre). */
export function elegirDesdePortada(n: number) {
  DB.pendiente = n;
  irAPaso(2);
  if (DB.listo) aplicarPendiente();
}
function aplicarPendiente() {
  const n = DB.pendiente;
  DB.pendiente = null;
  if (n === null || estado.seleccion.includes(n)) return;
  if (!estaLibre(n)) {
    alertar(`El #${n} ya no está libre. Elige otro en el tablero.`);
    return;
  }
  alternarNumero(n);
}

/* ---------- Paso 1: cantidad ---------- */
export function setCantidad(valor: number | string) {
  let n = parseInt(String(valor), 10);
  if (isNaN(n)) n = 1;
  n = Math.max(1, Math.min(CONFIG.corredoresMaximo, n));
  let seleccion = estado.seleccion.slice();
  // Al reducir se conservan primero los números ya elegidos
  if (seleccion.length > n) {
    const antes = elegidos();
    seleccion = [...antes, ...seleccion.map(() => null)].slice(0, n);
    antes.forEach((x) => !seleccion.includes(x) && liberarMio(x));
  }
  while (seleccion.length < n) seleccion.push(null);
  cambiar({ cantidad: n, seleccion });
}

/* ---------- Paso 2: tablero ---------- */
function apartarVarios(nums: number[]) {
  const mios = { ...estado.mios };
  nums.forEach((n) => (mios[n] = Date.now()));
  cambiar({ mios });
  repintar();
  actualizarTemporizador();
  nums.forEach((n) => {
    apartar(n)
      .then(() => {
        // Si la persona lo quitó mientras se apartaba, se libera de inmediato
        if (!esMio(n)) soltar(n);
        repintar();
      })
      .catch((e: ErrorCodigo) => {
        const perdidos = liberarLugares((x) => x === n);
        quitarMios([n]);
        if (e.codigo === 'sin-conexion') alertar(`No pudimos apartar el #${n}: no hay conexión con la base de datos. Recarga la página e intenta de nuevo.`);
        else if (e.codigo === 'cerrado') alertar('Las inscripciones están cerradas.');
        else {
          if (!['ocupado', 'en-proceso'].includes(e.codigo ?? '')) console.error('[apartar]', e);
          if (perdidos.length) alertar(textoPerdidos(perdidos, 'Elige otro.'));
        }
        repintar();
        actualizarTemporizador();
      });
  });
}

/** Tocar un número: si está libre se agrega; si ya es tuyo, se quita. */
export function alternarNumero(n: number) {
  const i = estado.seleccion.indexOf(n);
  alertar('');
  if (i !== -1) {
    const seleccion = estado.seleccion.slice();
    seleccion[i] = null;
    cambiar({ seleccion });
    liberarMio(n);
    repintar();
    return;
  }
  const lugar = estado.seleccion.indexOf(null);
  if (lugar !== -1) {
    const seleccion = estado.seleccion.slice();
    seleccion[lugar] = n; // se asigna al primer corredor sin número
    cambiar({ seleccion });
  } else if (estado.cantidad === 1) {
    liberarMio(estado.seleccion[0]); // individual: cambia directo
    cambiar({ seleccion: [n] });
  } else {
    alertar(`Ya elegiste ${estado.cantidad} números. Quita uno para cambiarlo.`);
    return;
  }
  apartarVarios([n]);
}

/** Un número libre al azar (para el sorteo de la portada). */
export function numeroAlAzar(): number {
  const libres: number[] = [];
  for (let k = MIN; k <= MAX; k++) if (estaLibre(k)) libres.push(k);
  return libres.length ? libres[Math.floor(Math.random() * libres.length)] : MIN;
}

export function alAzar() {
  if (!vacios()) {
    alertar(`Ya elegiste tus ${estado.cantidad} número${estado.cantidad > 1 ? 's' : ''}. Quita uno si quieres cambiarlo.`);
    return;
  }
  const libres: number[] = [];
  for (let k = MIN; k <= MAX; k++) if (estaLibre(k) && !estado.seleccion.includes(k)) libres.push(k);
  const nuevos: number[] = [];
  const seleccion = estado.seleccion.map((n) => {
    if (n !== null || !libres.length) return n;
    const x = libres.splice(Math.floor(Math.random() * libres.length), 1)[0];
    nuevos.push(x);
    return x;
  });
  cambiar({ seleccion });
  alertar('');
  apartarVarios(nuevos);
}

// Primer bloque de "cantidad" números libres y consecutivos a partir de "desde"
function bloqueConsecutivo(cantidad: number, desde: number) {
  const libreDesde = (s: number) => {
    for (let k = 0; k < cantidad; k++) if (!estaLibre(s + k) && !estado.seleccion.includes(s + k)) return false;
    return true;
  };
  for (let s = Math.max(MIN, desde); s + cantidad - 1 <= MAX; s++) if (libreDesde(s)) return s;
  for (let s = MIN; s < desde && s + cantidad - 1 <= MAX; s++) if (libreDesde(s)) return s;
  return -1;
}

export function asignarConsecutivos(desdeTexto: string) {
  let inicio = parseInt(desdeTexto, 10);
  if (isNaN(inicio)) inicio = MIN;
  const { cantidad } = estado;
  const s = bloqueConsecutivo(cantidad, inicio);
  if (s === -1) {
    alertar(`No hay ${cantidad} números consecutivos libres. Elígelos uno por uno.`);
    return;
  }
  const anteriores = elegidos();
  const seleccion = Array.from({ length: cantidad }, (_, k) => s + k);
  cambiar({ seleccion });
  anteriores.forEach((x) => !seleccion.includes(x) && liberarMio(x));
  alertar(s === inicio ? '' : `Desde el #${inicio} no había ${cantidad} números seguidos libres; te asignamos del #${s} al #${s + cantidad - 1}.`);
  apartarVarios(seleccion.filter((x) => !anteriores.includes(x)));
}

// Cuando cambia la lista de ocupados (tiempo real): quita de tu selección lo que alguien más confirmó.
function alCambiarOcupados() {
  const perdidos = liberarLugares((n) => {
    const x = DB.tablero.get(n);
    return esReservado(n) || (!!x && x.estado === 'confirmado' && !esMio(n));
  });
  quitarMios(perdidos.map((p) => p.numero));
  if (perdidos.length) {
    if (estado.paso > 2) irAPaso(2);
    alertar(textoPerdidos(perdidos, 'Elige otro; tus datos se conservan.'));
  }
  repintar();
}

/* ---------- Envío ---------- */
export type ResultadoEnvio = { tipo: 'ok' | 'demo'; data: Inscripcion } | { tipo: 'numeros' | 'conectando' | 'cerrado' } | { tipo: 'fallo'; data: Inscripcion };

export async function enviar(data: Inscripcion): Promise<ResultadoEnvio> {
  const numeros = data.corredores.map((r) => r.numero);

  if (!hayNube) {
    // Modo demostración: solo revisa y guarda en este navegador
    if (numeros.some(estaOcupado)) return marcarPerdidos(numeros.filter(estaOcupado));
    numeros.forEach((n) => DB.tablero.set(n, { estado: 'confirmado', ms: 0 }));
    const confirmados = [...DB.tablero].filter(([, x]) => x.estado === 'confirmado').map(([n]) => n);
    guardarLocal(CLAVE_DEMO, confirmados);
    const limite = new Date(Date.now() + CONFIG.pago.diasParaPagar * 864e5);
    reiniciar();
    return { tipo: 'demo', data: { ...data, pagarAntesDe: fechaLarga(limite) } };
  }

  if (!DB.listo) return { tipo: 'conectando' };
  try {
    const recibo = await confirmarInscripcion({
      grupo: data.grupo,
      responsable: data.responsable,
      correo: data.correo,
      telefono: data.telefono,
      corredores: data.corredores.map(({ numero, nombre, edad, sexo, categoria, talla, emergenciaNombre, emergenciaTelefono }) => ({
        numero,
        nombre,
        edad,
        sexo,
        categoria,
        talla,
        emergenciaNombre,
        emergenciaTelefono,
      })),
    });
    numeros.forEach((n) => DB.tablero.set(n, { estado: 'confirmado', ms: 0 }));
    reiniciar();
    recordar({ folio: recibo.folio, correo: data.correo });
    // Si llegó con el link de alguien del Equipo Hanguk, se le cuenta (si falla, la inscripción ya quedó)
    const ref = referidoVigente();
    if (ref) void atribuirInscripcion(recibo.id, ref).then(olvidarReferido, () => {});
    return { tipo: 'ok', data: { ...data, folio: recibo.folio, total: recibo.total, pagarAntesDe: fechaLarga(recibo.pagarAntesDe) } };
  } catch (err) {
    const e = err as ErrorBase;
    if (e.codigo === 'numeros-ocupados') return marcarPerdidos((e.detalle ?? '').split(',').map(Number).filter(Boolean));
    if (e.codigo === 'cerrado') return { tipo: 'cerrado' };
    console.error('[inscripcion]', err);
    return { tipo: 'fallo', data };
  }
}

// El número ya no está apartado a tu nombre (alguien lo confirmó o venció tu tiempo)
function marcarPerdidos(caidos: number[]): ResultadoEnvio {
  const perdidos = liberarLugares((n) => caidos.includes(n));
  caidos.forEach((n) => liberarMio(n));
  irAPaso(2);
  alertar(
    `${listaPerdidos(perdidos)} ya no ${perdidos.length > 1 ? 'están apartados' : 'está apartado'} a tu nombre (alguien lo tomó o se acabó el tiempo). Elige otro; tus datos se conservan.`,
  );
  return { tipo: 'numeros' };
}

function reiniciar() {
  cambiar({ seleccion: [null], mios: {}, restante: null, alertaNumeros: '', cantidad: 1 });
  irAPaso(1, true);
  repintar();
}
