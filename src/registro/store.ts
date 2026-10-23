/* ==========================================================================
   🔢 NÚMEROS DE CORREDOR E INSCRIPCIÓN EN 4 PASOS
   Mismo modelo de datos que firestore.rules (compartido con la Expo con Causa):
   - numeros/{n}      → un documento por número: estado "apartado" (6 min) o "confirmado".
                        Es la fuente de verdad; la página casi no lo lee.
   - tablero/{bloque} → RESUMEN en 7 documentos (1–100, 101–200…). El tablero se dibuja
                        leyendo SOLO estos 7 documentos (en vez de hasta 700).
   - inscripciones    → datos personales; nadie puede leerlos desde la página.
   Ahorros para el plan gratuito:
     • Apartar y confirmar son escrituras directas (sin lecturas previas); las reglas
       rechazan lo que no se puede hacer.
     • La conexión en tiempo real solo está abierta en el paso 2 con la pestaña visible.
     • Firebase se descarga hasta que alguien llega al paso 2.
   ========================================================================== */
import { useSyncExternalStore } from 'react';
import type { DocumentData, Firestore, Timestamp, WriteBatch } from 'firebase/firestore';
import { CONFIG } from '../config';

type FS = typeof import('firebase/firestore');
type Celda = { e: 'a' | 'c'; ms: number };
type ErrorCodigo = Error & { code?: string; numeros?: number[] };

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
  correo?: string;
  telefono?: string;
  subtotal?: number;
  descuento?: number;
  fecha: string;
  corredores: Corredor[];
  total: number;
  estadoPago?: string;
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
  /** Cambia cuando el asistente debe desplazarse al indicador de pasos. */
  scroll: number;
};

const APARTADO_MS = CONFIG.apartado.minutos * 60000;
const MARGEN_MS = 5000; // el temporizador termina 5 s antes que el servidor
const DEMO_KEY = 'hr_numeros_tomados_demo';
const { minimo: MIN, maximo: MAX } = CONFIG.numeros;
const RANGO = `Números del ${MIN} al ${MAX}.`;

const DB = {
  db: null as Firestore | null,
  fs: null as FS | null,
  iniciado: false,
  uid: 'demo', // identidad anónima de este visitante
  tablero: new Map<number, Celda>(),
  escuchando: null as null | (() => void),
  desfase: 0, // diferencia aproximada entre el reloj del servidor y el del dispositivo
  pedidos: {} as Record<number, number>, // número → hora local en que se pidió el apartado
};

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
   🔌 FIREBASE (se carga una sola vez, al llegar al paso 2)
   ======================================================================== */
let conexion: Promise<Firestore> | null = null;
export function firebaseConfigurado() {
  return CONFIG.modo === 'firebase' && !!CONFIG.firebase.apiKey && !!CONFIG.firebase.projectId;
}
function conectarFirebase() {
  if (conexion) return conexion;
  conexion = Promise.all([import('firebase/app'), import('firebase/auth'), import('firebase/firestore')]).then(async ([app, auth, fs]) => {
    const a = app.getApps()[0] ?? app.initializeApp(CONFIG.firebase);
    // Identidad anónima (sin correo ni contraseña): sirve para saber de quién es cada apartado
    const cred = await auth.signInAnonymously(auth.getAuth(a));
    DB.uid = cred.user.uid;
    DB.fs = fs;
    return fs.getFirestore(a);
  });
  return conexion;
}

const refNumero = (n: number) => DB.fs!.doc(DB.db!, 'numeros', String(n));
const refBloque = (n: number) => DB.fs!.doc(DB.db!, 'tablero', String(Math.ceil(n / 100)));
// Escribe el valor de UN número en el resumen, reemplazándolo por completo y creando el bloque si no existe.
const datosResumen = (n: number, valor: DocumentData) => ({ n: { [n]: valor }, k: String(n) });
const opcionesResumen = (n: number) => ({ mergeFields: [`n.${n}`, 'k'] });
const escribirResumen = (n: number, valor: DocumentData) => DB.fs!.setDoc(refBloque(n), datosResumen(n, valor), opcionesResumen(n));
const resumenEnLote = (batch: WriteBatch, n: number, valor: DocumentData) => batch.set(refBloque(n), datosResumen(n, valor), opcionesResumen(n));
const quitarDelResumen = (n: number) => ({ k: String(n), [`n.${n}`]: DB.fs!.deleteField() });

function initNumeros() {
  if (DB.iniciado) return;
  DB.iniciado = true;
  if (!firebaseConfigurado()) {
    // Modo demostración: los números confirmados se guardan solo en este navegador
    try {
      ((JSON.parse(localStorage.getItem(DEMO_KEY) ?? 'null') as number[] | null) ?? []).forEach((n) => DB.tablero.set(n, { e: 'c', ms: 0 }));
    } catch {
      /* sin almacenamiento */
    }
    cambiar({ conexion: { tipo: 'demo', texto: `Modo demostración. ${RANGO}` } });
    return;
  }
  cambiar({ conexion: { tipo: 'cargando', texto: 'Consultando números disponibles…' } });
  conectarFirebase()
    .then((db) => {
      DB.db = db;
      if (estado.paso === 2 && !document.hidden) escuchar();
    })
    .catch((err: ErrorCodigo) => {
      console.error('[firebase]', err);
      const falta = /operation-not-allowed|admin-restricted|configuration-not-found/.test(err?.code ?? '');
      cambiar({
        conexion: {
          tipo: 'error',
          texto: falta
            ? 'Falta activar el acceso anónimo en Firebase (Authentication → Método de acceso → Anónimo).'
            : 'No pudimos conectar con la base de datos. Revisa tu conexión y recarga la página.',
        },
      });
    });
}

/* ---------- Conexión en tiempo real (solo en el paso 2 y con la pestaña visible) ---------- */
function escuchar() {
  const { db, fs } = DB;
  if (!db || !fs || DB.escuchando) return;
  DB.escuchando = fs.onSnapshot(
    fs.collection(db, 'tablero'),
    (snap) => {
      const mapa = new Map<number, Celda>();
      snap.docs.forEach((d) => {
        const n = (d.data({ serverTimestamps: 'estimate' }).n ?? {}) as Record<string, { e: 'a' | 'c'; t?: Timestamp }>;
        Object.keys(n).forEach((k) => {
          const v = n[k];
          const num = Number(k);
          const ms = v.t && typeof v.t.toMillis === 'function' ? v.t.toMillis() : 0;
          mapa.set(num, { e: v.e, ms });
          // Con un apartado propio ya confirmado por el servidor se calcula el desfase de relojes
          if (v.e === 'a' && DB.pedidos[num] && !d.metadata.hasPendingWrites) {
            DB.desfase = ms - DB.pedidos[num];
            delete DB.pedidos[num];
          }
        });
      });
      DB.tablero = mapa;
      cambiar({
        conexion: { tipo: 'ok', texto: `Disponibilidad en tiempo real. ${RANGO} Al tocar un número queda apartado para ti por ${CONFIG.apartado.minutos} minutos.` },
      });
      alCambiarOcupados();
    },
    (err) => {
      console.error('[tablero]', err);
      DB.escuchando = null;
      cambiar({ conexion: { tipo: 'error', texto: 'No pudimos consultar los números disponibles. Recarga la página en unos momentos.' } });
    },
  );
}
function dejarDeEscuchar() {
  if (DB.escuchando) {
    DB.escuchando();
    DB.escuchando = null;
  }
}
// Si la pestaña queda en segundo plano se cierra la conexión (no gasta lecturas); al volver se reabre
document.addEventListener('visibilitychange', () => {
  if (document.hidden) dejarDeEscuchar();
  else if (estado.paso === 2) escuchar();
});

/* ---------- Estado de cada número ---------- */
const esReservado = (n: number) => CONFIG.numeros.reservados.includes(n);
const enRango = (n: number) => Number.isInteger(n) && n >= MIN && n <= MAX;
const ahora = () => Date.now() + DB.desfase;
const vigente = (x?: Celda) => !!x && x.e === 'a' && x.ms + APARTADO_MS > ahora();
const esMio = (n: number) => estado.mios[n] !== undefined;
// Para fines prácticos, reservado = ocupado
export function estaOcupado(n: number) {
  const x = DB.tablero.get(n);
  return esReservado(n) || (!!x && x.e === 'c' && !esMio(n));
}
// Apartado por otra persona que todavía está llenando su registro
export const enProceso = (n: number) => !esMio(n) && vigente(DB.tablero.get(n));
const estaLibre = (n: number) => enRango(n) && !estaOcupado(n) && !enProceso(n);

/* ---------- Apartar / soltar un número ---------- */
function errorNumero(code: string): ErrorCodigo {
  return Object.assign(new Error(code), { code });
}

// Si el resumen quedó desactualizado (alguien cerró la página a medias), se corrige leyendo ese
// único número. Solo ocurre cuando algo falla.
async function repararResumen(n: number) {
  const fs = DB.fs!;
  const s = await fs.getDoc(refNumero(n));
  const x = DB.tablero.get(n);
  const d = s.exists() ? s.data() : null;
  let cambio: Promise<void> | null = null;
  if (!d || (d.estado === 'apartado' && d.creado && d.creado.toMillis() + APARTADO_MS <= ahora())) {
    if (x) cambio = fs.updateDoc(refBloque(n), quitarDelResumen(n));
  } else if (d.estado === 'confirmado' && (!x || x.e !== 'c')) {
    cambio = escribirResumen(n, { e: 'c' });
  } else if (d.estado === 'apartado' && (!x || x.e !== 'a' || x.ms !== d.creado.toMillis())) {
    cambio = escribirResumen(n, { e: 'a', t: d.creado });
  }
  cambio?.catch((e) => console.warn('[reparar]', e));
  return d;
}

async function apartar(n: number) {
  const { db, fs } = DB;
  if (!db || !fs) {
    // Con Firebase configurado pero sin conexión, NO se aparta (no se finge un apartado)
    if (firebaseConfigurado()) throw errorNumero('sin-conexion');
    DB.tablero.set(n, { e: 'a', ms: Date.now() }); // modo demostración
    return;
  }
  // Una sola escritura (sin lecturas): el número y su resumen, con la misma hora del servidor
  const batch = fs.writeBatch(db);
  batch.set(refNumero(n), { numero: n, estado: 'apartado', uid: DB.uid, creado: fs.serverTimestamp() });
  resumenEnLote(batch, n, { e: 'a', t: fs.serverTimestamp() });
  DB.pedidos[n] = Date.now();
  try {
    await batch.commit();
  } catch (e) {
    delete DB.pedidos[n];
    if ((e as ErrorCodigo)?.code !== 'permission-denied') throw e;
    // Alguien lo tiene: se corrige el resumen por si estaba desactualizado
    let d: DocumentData | null;
    try {
      d = await repararResumen(n);
    } catch {
      throw errorNumero('ocupado');
    }
    throw errorNumero(d?.estado === 'confirmado' ? 'ocupado' : 'en-proceso');
  }
}

function soltar(n: number) {
  const { db, fs } = DB;
  if (!db || !fs) {
    const x = DB.tablero.get(n); // modo demostración
    if (x && x.e === 'a') DB.tablero.delete(n);
    return;
  }
  const batch = fs.writeBatch(db);
  batch.delete(refNumero(n));
  batch.update(refBloque(n), quitarDelResumen(n));
  batch.commit().catch(() => {
    /* ya vencido o ya confirmado */
  });
}

/* ---------- Selección ---------- */
const elegidos = () => estado.seleccion.filter((n): n is number => n !== null);
const vacios = () => estado.seleccion.filter((n) => n === null).length;
function quitarMios(nums: number[]) {
  const mios = { ...estado.mios };
  nums.forEach((n) => delete mios[n]);
  cambiar({ mios });
}
// Quita un número de "mis apartados" y lo libera para todos
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
const listaPerdidos = (perdidos: { numero: number; corredor: number }[]) =>
  perdidos.map((p) => `#${p.numero}${estado.cantidad > 1 ? ` (Corredor ${p.corredor})` : ''}`).join(', ');
const textoPerdidos = (perdidos: { numero: number; corredor: number }[], final: string) =>
  `${listaPerdidos(perdidos)} ${perdidos.length > 1 ? 'acaban' : 'acaba'} de ser apartado${perdidos.length > 1 ? 's' : ''} por otra persona. ${final}`;

/* ---------- ⏱ Temporizador del apartado ----------
   Cuenta desde el primer número apartado. Al llegar a cero se liberan los números y la
   persona vuelve a elegir (sus datos se conservan). */
function limiteApartado() {
  let limite: number | null = null;
  for (const n of elegidos()) {
    // Hora local en que se pidió el apartado: siempre es igual o anterior a la del servidor,
    // así que el temporizador nunca se pasa del tiempo real.
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
  mis.forEach((n) => {
    if (esMio(n)) soltar(n);
  });
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
  window.addEventListener('pagehide', () =>
    elegidos().forEach((n) => {
      if (esMio(n)) soltar(n);
    }),
  );
}

/* ---------- Navegación entre pasos ---------- */
export function irAPaso(n: Paso, sinScroll = false) {
  cambiar({ paso: n, scroll: sinScroll ? estado.scroll : estado.scroll + 1 });
  // La conexión en tiempo real solo se usa en el paso 2. En los pasos 3 y 4 no hace falta:
  // nadie puede quitarte un número apartado.
  if (n === 2) {
    try {
      initNumeros();
    } catch (e) {
      console.error('[numeros]', e);
    }
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
    antes.forEach((x) => {
      if (!seleccion.includes(x)) liberarMio(x); // libera los que sobran
    });
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
        // Si la persona lo quitó mientras se estaba apartando, se libera de inmediato
        if (!esMio(n)) soltar(n);
      })
      .catch((e: ErrorCodigo) => {
        const perdidos = liberarLugares((x) => x === n);
        quitarMios([n]);
        if (e?.code === 'sin-conexion') {
          alertar(`No pudimos apartar el #${n} porque no hay conexión con la base de datos. Recarga la página e intenta de nuevo.`);
        } else {
          if (!['ocupado', 'en-proceso', 'permission-denied'].includes(e?.code ?? '')) console.error('[apartar]', e);
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
    // ya era tuyo: se quita y se libera para todos
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
    alertar(`Ya elegiste ${estado.cantidad} números. Quita uno (toca la ✕) para cambiarlo.`);
    return;
  }
  apartarVarios([n]);
}

export function alAzar() {
  if (!vacios()) {
    alertar(`Ya elegiste tus ${estado.cantidad} número${estado.cantidad > 1 ? 's' : ''}. Quita uno si quieres cambiarlo.`);
    return;
  }
  const libres: number[] = [];
  for (let k = MIN; k <= MAX; k++) if (estaLibre(k) && !estado.seleccion.includes(k)) libres.push(k);
  // Llena solo los lugares vacíos y los aparta
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
    for (let k = 0; k < cantidad; k++) if (!estaLibre(s + k)) return false;
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
  anteriores.forEach((x) => {
    if (!seleccion.includes(x)) liberarMio(x);
  });
  alertar(s === inicio ? '' : `Desde el #${inicio} no había ${cantidad} números seguidos libres; te asignamos del #${s} al #${s + cantidad - 1}.`);
  apartarVarios(seleccion.filter((x) => !anteriores.includes(x)));
}

// Cuando cambia la lista de ocupados (tiempo real): quita de tu selección lo que ya no está libre.
// Un número tuyo se pierde solo si alguien más lo confirmó (por ejemplo, si tu apartado falló).
function alCambiarOcupados() {
  const perdidos = liberarLugares((n) => {
    const x = DB.tablero.get(n);
    return esReservado(n) || (!!x && x.e === 'c');
  });
  quitarMios(perdidos.map((p) => p.numero));
  if (perdidos.length) {
    if (estado.paso > 2) irAPaso(2); // regresa a elegir; los datos ya escritos se conservan
    alertar(textoPerdidos(perdidos, 'Elige otro; tus datos se conservan.'));
  }
  repintar();
}

/* ---------- Envío ---------- */
function errorOcupados(numeros: number[]): ErrorCodigo {
  return Object.assign(new Error(`Números ocupados: ${numeros.join(', ')}`), { code: 'numeros-ocupados', numeros });
}

async function guardar(data: Inscripcion): Promise<{ offline?: boolean }> {
  const numeros = data.corredores.map((r) => r.numero);
  const { db, fs } = DB;

  if (db && fs) {
    // UNA sola escritura en lote, sin lecturas: guarda la inscripción y pasa cada número de
    // "apartado" a "confirmado". Las reglas solo lo permiten si cada número sigue apartado a
    // tu nombre y sin vencer; si alguno falla, no se guarda NADA.
    const batch = fs.writeBatch(db);
    const inscRef = fs.doc(fs.collection(db, 'inscripciones'));
    batch.set(inscRef, { ...data, creado: fs.serverTimestamp() });
    numeros.forEach((n, i) => batch.update(refNumero(n), { estado: 'confirmado', categoria: data.corredores[i].categoria, inscripcion: inscRef.id }));
    try {
      await batch.commit();
    } catch (e) {
      const code = (e as ErrorCodigo)?.code;
      if (code !== 'permission-denied' && code !== 'not-found') throw e;
      // Solo cuando algo falla se leen los números, para saber cuál se perdió
      const snaps = await Promise.all(numeros.map((n) => fs.getDoc(refNumero(n))));
      const perdidos = numeros.filter((_, i) => {
        const d = snaps[i].exists() ? snaps[i].data() : null;
        return !d || d.estado !== 'apartado' || d.uid !== DB.uid || !d.creado || d.creado.toMillis() + APARTADO_MS <= ahora();
      });
      perdidos.forEach((n) => repararResumen(n).catch(() => {}));
      throw errorOcupados(perdidos.length ? perdidos : numeros);
    }
    // Actualiza el resumen del tablero (si alguna escritura fallara, la siguiente persona que lo note lo corrige)
    numeros.forEach((n) => escribirResumen(n, { e: 'c' }).catch((e) => console.warn('[resumen]', e)));
    return {};
  }

  // Modo demostración: solo revisa y guarda en este navegador
  const ocupados = numeros.filter(estaOcupado);
  if (ocupados.length) throw errorOcupados(ocupados);
  numeros.forEach((n) => DB.tablero.set(n, { e: 'c', ms: 0 }));
  const confirmados: number[] = [];
  DB.tablero.forEach((x, n) => {
    if (x.e === 'c') confirmados.push(n);
  });
  try {
    localStorage.setItem(DEMO_KEY, JSON.stringify(confirmados));
  } catch {
    /* sin almacenamiento */
  }
  return { offline: true };
}

export type ResultadoEnvio = 'ok' | 'demo' | 'fallo' | 'numeros' | 'conectando';

export async function enviar(data: Inscripcion): Promise<ResultadoEnvio> {
  if (firebaseConfigurado() && !DB.db) return 'conectando';
  // Fecha límite de pago (se guarda con la inscripción para que los organizadores la vean)
  const limite = new Date(Date.now() + CONFIG.pago.diasParaPagar * 864e5);
  data.estadoPago = 'pendiente';
  data.pagarAntesDe = limite.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  try {
    const res = await guardar(data);
    reiniciar();
    return res.offline ? 'demo' : 'ok';
  } catch (err) {
    const e = err as ErrorCodigo;
    if (e?.code === 'numeros-ocupados' && e.numeros) {
      // El número ya no está apartado a tu nombre (alguien lo confirmó o venció tu tiempo)
      const caidos = e.numeros;
      const perdidos = liberarLugares((n) => caidos.includes(n));
      caidos.forEach((n) => liberarMio(n));
      irAPaso(2);
      alertar(
        `${listaPerdidos(perdidos)} ya no ${perdidos.length > 1 ? 'están apartados' : 'está apartado'} a tu nombre (alguien lo tomó o se acabó el tiempo). Elige otro; tus datos se conservan.`,
      );
      return 'numeros';
    }
    console.error(err);
    return 'fallo';
  }
}

function reiniciar() {
  cambiar({ seleccion: [null], mios: {}, restante: null, alertaNumeros: '', cantidad: 1 });
  irAPaso(1, true);
  repintar();
}
