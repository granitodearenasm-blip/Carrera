/* ==========================================================================
   ✏️ CONFIGURACIÓN — CAMBIA AQUÍ PRECIOS, CATEGORÍAS, TALLAS, NÚMEROS, SEDE Y CONEXIÓN
   Después de cambiar algo, vuelve a generar el sitio con `npm run build`.
   ========================================================================== */
export const CONFIG = {
  nombreCarrera: 'HANGUK RUN 한국 2026',

  // ✏️ Fecha y hora EXACTA de la salida (cuenta regresiva). -06:00 = hora del centro de México.
  salida: '2026-12-06T07:00:00-06:00',

  /* Sección "Lo que regresa a la comunidad":
     true  → muestra también los compromisos marcados "por confirmar" (para revisarlos).
     false → muestra SOLO los confirmados. ✏️ Ponlo en false antes de publicar. */
  mostrarPorConfirmar: true,

  // Categorías / distancias y su precio por corredor (MXN)
  categorias: [
    { id: '3K', nombre: '3K · Ruta Jeju', precio: 400 },
    { id: '5K', nombre: '5K · Ruta Seúl', precio: 400 },
    { id: '10K', nombre: '10K · Ruta Busan', precio: 400 },
  ],

  // Tallas de playera (unisex)
  tallas: ['S', 'M', 'L', 'XL'],
  sexos: ['Femenino', 'Masculino'],

  edadMinima: 12,
  edadMaxima: 90,

  // Corredores por inscripción (1 = individual; 2 o más = grupo)
  corredoresMaximo: 20,
  // Descuento por tamaño del grupo: actualmente SIN descuento.
  // Para activarlo, por ejemplo: [{ desde: 5, porcentaje: 10 }, { desde: 10, porcentaje: 15 }]
  descuentosGrupo: [] as { desde: number; porcentaje: number }[],

  /* 💳 PAGO
     Después de inscribirse, la persona envía un WhatsApp para pedir el número de cuenta.
     👉 WhatsApp: 52 + 10 dígitos, sin espacios ni "+". Mientras esté vacío se muestra "por confirmar". */
  pago: {
    whatsapp: '', // [POR CONFIRMAR] ej. '5212223334444'
    diasParaPagar: 4,
  },

  /* 🔢 NÚMEROS DE CORREDOR (cada participante elige el suyo)
     Si cambias el rango o los reservados, cámbialos también en firestore.rules. */
  numeros: {
    minimo: 1,
    maximo: 700,
    reservados: [] as number[], // ejemplo: [1, 2, 3, 100]
  },

  /* ⏱ APARTADO TEMPORAL (como asientos de cine)
     Si lo cambias, cámbialo también en firestore.rules (MINUTOS_APARTADO). */
  apartado: {
    minutos: 6,
  },

  /* 🔌 BASE DE DATOS (Firebase Firestore) — instrucciones en FIREBASE.md
       'firebase' → guarda las inscripciones en Firestore y garantiza que cada número sea único.
       'pantalla' → modo demostración: no guarda nada en internet.
     Estos datos son públicos por diseño; la seguridad la dan las reglas de firestore.rules. */
  modo: 'firebase' as 'firebase' | 'pantalla',
  firebase: {
    apiKey: 'AIzaSyCENeangPCyAKQX9ylKP1cLCO-pfg1hAWI',
    authDomain: 'hanguk-run.firebaseapp.com',
    projectId: 'hanguk-run',
    appId: '1:336183514717:web:ec68ceb51e93ae74121fb4',
  },

  /* 📸 CARRUSEL DE INSTAGRAM (vía Behold, https://behold.so, plan gratuito)
     1. Conecta @granitodearena.sm en behold.so  2. Crea un feed JSON  3. Pega su URL en feedUrl.
     Mientras esté vacío se muestra una tarjeta "Síguenos en Instagram". */
  instagram: {
    feedUrl: '',
    maxPublicaciones: 8,
  },

  /* 🏛 SEDE
     ✏️ autorizada: ponlo en true cuando el museo confirme el uso del espacio (quita el aviso "sujeta a autorización").
     ✏️ fotos: copia las imágenes a public/img/ y agrégalas aquí. Mientras la lista esté vacía, la galería no aparece.
        Ejemplo: { src: 'polaxtla-casco.webp', alt: 'Casco de la hacienda visto desde el jardín', pie: 'El casco' } */
  sede: {
    nombre: 'Museo Hacienda San Cristóbal Polaxtla',
    autorizada: false,
    lat: 19.272663,
    lng: -98.437736,
    fotos: [] as { src: string; alt: string; pie?: string }[],
  },
};
/* ======================== FIN DE CONFIGURACIÓN ======================== */

export const EMAIL = 'granitodearena.sm@gmail.com';
export const INSTAGRAM_URL = 'https://www.instagram.com/granitodearena.sm/';
export const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=100075559972420';
