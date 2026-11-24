/* ==========================================================================
   ✏️ CONFIGURACIÓN — CAMBIA AQUÍ PRECIOS, CATEGORÍAS, TALLAS, NÚMEROS, SEDE Y CONEXIÓN
   Después de cambiar algo, vuelve a generar el sitio con `npm run build`.
   ⚠️ Precio, rango de números, reservados y minutos de apartado también viven en la base de datos
   (tabla `ajustes` de Supabase): si los cambias aquí, cámbialos allá (ver docs/data-model.md).
   La conexión a Supabase NO va aquí: va en las variables VITE_SUPABASE_* (ver .env.example).
   ========================================================================== */
export const CONFIG = {
  nombreCarrera: 'HANGUK RUN 한국 2027',

  // ✏️ Fecha y hora EXACTA de la salida (cuenta regresiva y fechas de la página). -06:00 = hora del centro de México.
  salida: '2027-02-07T07:00:00-06:00',
  // ✏️ Fecha de cierre de inscripciones, como se muestra en la página ("31 de enero").
  //    Vacío = todavía por confirmar (la página lo muestra como pendiente).
  cierreInscripciones: '',

  /* Sección "Lo que regresa a la comunidad":
     true  → muestra también los compromisos marcados "por confirmar" (para revisarlos).
     false → muestra SOLO los confirmados. ✏️ Ponlo en false antes de publicar. */
  mostrarPorConfirmar: true,

  // Categorías / distancias y su precio por corredor (MXN)
  categorias: [
    { id: '3K', nombre: '3K · Ruta Jeju', precio: 350 },
    { id: '5K', nombre: '5K · Ruta Seúl', precio: 350 },
    { id: '10K', nombre: '10K · Ruta Busan', precio: 350 },
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

  /* 💳 PAGO: por transferencia o en efectivo (sin tarjeta)
     Al inscribirse, la persona ve esta cuenta con su folio como concepto. Después reporta su pago en
     /mi-inscripcion y un organizador lo marca como pagado en el panel al revisarlo.
     👉 WhatsApp (opcional, para dudas): 52 + 10 dígitos, sin espacios ni "+". Vacío = no se muestra. */
  pago: {
    banco: 'BBVA',
    clabe: '012650015441587670',
    titular: 'Angélica García Morales',
    efectivo: 'en los locales que nos apoyan',
    whatsapp: '',
    diasParaPagar: 4,
  },

  /* 🔢 NÚMEROS DE CORREDOR (cada participante elige el suyo)
     Si cambias el rango o los reservados, cámbialos también en la tabla `ajustes` de Supabase. */
  numeros: {
    minimo: 1,
    maximo: 700,
    reservados: [] as number[], // ejemplo: [1, 2, 3, 100]
  },

  /* ⏱ APARTADO TEMPORAL (como asientos de cine)
     Si lo cambias, cámbialo también en la tabla `ajustes` de Supabase. */
  apartado: {
    minutos: 6,
  },

  /* 📸 CARRUSEL DE INSTAGRAM (vía Behold, https://behold.so, plan gratuito)
     1. Conecta @granitodearena.sm en behold.so  2. Crea un feed JSON  3. Pega su URL en feedUrl.
     Mientras esté vacío se muestra una tarjeta "Síguenos en Instagram". */
  instagram: {
    feedUrl: '',
    maxPublicaciones: 8,
  },

  /* 🏛 SEDE
     autorizada: true → la sección agradece al museo; false → muestra el aviso "sujeta a autorización".
     ✏️ fotos: copia las imágenes a public/img/ y agrégalas aquí. Mientras la lista esté vacía, la galería no aparece.
        La primera foto se muestra en grande. */
  sede: {
    nombre: 'Museo Hacienda San Cristóbal Polaxtla',
    fundacion: 'Fundación Cultural Antonio Haghenbeck y de la Lama',
    autorizada: true,
    lat: 19.272663,
    lng: -98.437736,
    fotos: [
      { src: 'polaxtla-fachada.jpg', alt: 'Fachada de la hacienda con su galería de vidrio, palmeras y jardín', pie: 'La fachada y el jardín' },
      { src: 'polaxtla-patio.jpg', alt: 'Patio empedrado con corredores de columnas y un árbol grande', pie: 'El patio y sus corredores' },
      { src: 'polaxtla-escultura.jpg', alt: 'Escultura clásica de mármol frente a las columnas de la entrada', pie: 'Esculturas en la entrada' },
    ] as { src: string; alt: string; pie?: string }[],
  },

  /* 🤝 PATROCINADORES
     nivel: 'principal' (tarjeta grande), 'oro', 'plata' o 'bronce'.
     logo: archivo en public/img/patrocinadores/ para fondo claro; logoOscuro (opcional) para el tema oscuro.
     Los lugares libres de cada nivel se muestran como "Tu marca aquí". */
  patrocinadores: [
    {
      nombre: 'Trellum',
      nivel: 'principal',
      logo: 'trellum.svg',
      logoOscuro: 'trellum-blanco.svg',
      url: 'https://trellum.io',
      descripcion: 'Planea tu viaje día a día con tu gente: rutas en el mapa, horarios y presupuesto.',
    },
  ] as Patrocinador[],

  patrocinio: {
    // ✏️ Cuántos lugares hay en cada nivel (los ocupados se restan solos)
    lugares: { principal: 2, oro: 3, plata: 4, bronce: 6 } as Record<NivelPatrocinio, number>,
    // ✏️ Lo que recibe cada patrocinador. Mientras esté vacío se muestra "Por confirmar": no prometas nada que no exista.
    beneficios: [] as string[],
  },
};
/* ======================== FIN DE CONFIGURACIÓN ======================== */

export type NivelPatrocinio = 'principal' | 'oro' | 'plata' | 'bronce';
export type Patrocinador = { nombre: string; nivel: NivelPatrocinio; logo: string; logoOscuro?: string; url?: string; descripcion?: string };

export const EMAIL = 'granitodearena.sm@gmail.com';
export const INSTAGRAM_URL = 'https://www.instagram.com/granitodearena.sm/';
export const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=100075559972420';
