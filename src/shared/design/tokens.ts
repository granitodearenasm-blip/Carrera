/**
 * Tokens de diseño de HANGUK RUN: la única fuente de colores, tipos, radios, sombras y movimiento.
 * La web los lee del CSS que genera `npm run tokens` (tokens.css, @theme de Tailwind 4).
 * Los nombres dicen para qué es un valor (superficie, texto secundario, peligro), nunca cómo se ve.
 *
 * Identidad «Varsity Seúl» (design system Hanguk Run): uniforme deportivo universitario cruzado
 * con el skyline de Seúl a línea. Fondo hueso con cuadrícula, marino en lugar de negro, rojo sol
 * solo para lo principal, naranja para números de sección. Esquinas rectas y sombras planas.
 *
 * Solo datos (sin imports ni enums): Node lee este archivo tal cual para generar el CSS.
 * Cada par de texto y fondo se revisa con WCAG AA en tokens.test.ts.
 */

/** Colores de marca del design system. No usar en componentes: usar `color`. */
export const palette = {
  /** Fondo de todo */
  hueso: '#F6F1E7',
  /** Líneas de la cuadrícula */
  cuadricula: '#E3DDD0',
  /** Sustituye al negro: texto, contornos, bloques fuertes */
  marino: '#1F2A6B',
  marinoNoche: '#141B47',
  marinoProfundo: '#0B1033',
  /** Rojo sol: botón principal, etiqueta 한국 런, RUN y el sol (un punto más oscuro que #E63B2E para que el blanco llegue a AA) */
  rojo: '#D3302A',
  /** Naranja destello: números de sección y chispas */
  naranja: '#FF7A2F',
  /** Azul pista: enlaces */
  pista: '#3F62C9',
  blanco: '#FFFFFF',
} as const;

/** Colores semánticos. Los dos temas tienen las mismas claves. */
export const color = {
  light: {
    /** Detrás de todo (lleva la cuadrícula) */
    page: palette.hueso,
    /** Tarjetas, paneles, campos, dorsal */
    surface: palette.blanco,
    /** Bloques suaves: secciones alternas, fondos de grupo */
    sunken: '#EFE8DA',
    /** Estados "seleccionado" suaves */
    sand: '#E6DCC6',
    /** Pasar el puntero sobre un control discreto */
    hover: '#EDE5D4',
    fg: palette.marino,
    fgMuted: '#4A5590',
    /** Contorno marino recto de tarjetas, botones y dorsal */
    outline: palette.marino,
    /** Divisores decorativos y cuadrícula */
    line: palette.cuadricula,
    /** Bordes que identifican un control (campos): 3:1 al menos */
    lineStrong: '#5D6699',
    /** Rojo sol: el botón principal de cada pantalla */
    accent: palette.rojo,
    accentHover: '#B82621',
    onAccent: palette.blanco,
    /** Naranja destello: números de sección, chispas (decorativo, nunca texto largo) */
    accentSoft: palette.naranja,
    /** Bloques marinos (menú, distancias, pie) */
    ink: palette.marino,
    inkHover: '#2A378A',
    onInk: palette.hueso,
    onInkMuted: '#C9CDE8',
    /** La sombra plana desplazada de los bloques */
    stamp: palette.marino,
    /** Errores: distinto del rojo sol */
    danger: '#A81E2A',
    dangerSoft: '#FBE6E6',
    onDanger: palette.blanco,
    /** Información */
    info: palette.pista,
    infoSoft: '#E3E9F8',
    onInfo: palette.blanco,
    link: palette.pista,
    success: '#2E6B38',
    successSoft: '#E4F2E2',
    focus: palette.pista,
    /** Velo detrás de ventanas */
    scrim: 'rgba(20, 27, 71, 0.6)',
  },
  dark: {
    page: palette.marinoNoche,
    surface: '#1F2A6B',
    sunken: '#19225A',
    sand: '#2E3A80',
    hover: '#28336F',
    fg: palette.hueso,
    fgMuted: '#C9CDE8',
    outline: palette.hueso,
    line: '#26306E',
    lineStrong: '#9AA2D0',
    accent: '#FF5A4A',
    accentHover: '#FF7466',
    onAccent: palette.marinoNoche,
    accentSoft: '#FF9A5C',
    ink: palette.marinoProfundo,
    inkHover: '#141B47',
    onInk: palette.hueso,
    onInkMuted: '#C9CDE8',
    stamp: palette.marinoProfundo,
    danger: '#FF8A92',
    dangerSoft: '#4A1C2E',
    onDanger: palette.marinoNoche,
    info: '#8EA6F0',
    infoSoft: '#1B2A5E',
    onInfo: palette.marinoNoche,
    link: '#8EA6F0',
    success: '#8FD69A',
    successSoft: '#1E3A32',
    focus: '#FF9A5C',
    scrim: 'rgba(0, 0, 0, 0.65)',
  },
} as const;

export type ThemeName = keyof typeof color;
export type ColorRole = keyof (typeof color)['light'];

/** Franjas de uniforme varsity: divisores, cinta de meta y progreso. Decorativas. */
export const saekdong = [palette.marino, palette.blanco, palette.rojo, palette.blanco, palette.marino, palette.naranja, palette.marino] as const;

/** Familias (Google Fonts). Damion solo para «Hanguk» del logotipo; Archivo para todo lo demás. */
export const font = {
  logo: { family: 'Damion', fallback: "'Brush Script MT', cursive" },
  display: { family: 'Archivo', fallback: "'Arial Black', system-ui, sans-serif" },
  ui: { family: 'Archivo', fallback: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" },
  ko: { family: 'Black Han Sans', fallback: "'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif" },
} as const;

/**
 * Escala tipográfica (px). `max`: tamaño desde 1440 px; entre 360 y 1440 crece de forma fluida.
 * `width`: ancho de Archivo (62 estrecho … 125 ancho).
 */
export const text = {
  hero: { size: 56, max: 128, lineHeight: 0.92, tracking: 0.01, weight: 900, width: 100 },
  display: { size: 40, max: 88, lineHeight: 0.95, tracking: 0.02, weight: 900, width: 100 },
  title: { size: 28, max: 44, lineHeight: 1, tracking: 0.04, weight: 900, width: 100 },
  subtitle: { size: 20, max: 24, lineHeight: 1.2, tracking: 0.02, weight: 800, width: 100 },
  lead: { size: 18, max: 22, lineHeight: 1.45, tracking: 0, weight: 500, width: 100 },
  body: { size: 17, lineHeight: 1.55, tracking: 0, weight: 500, width: 100 },
  small: { size: 15, lineHeight: 1.45, tracking: 0, weight: 500, width: 100 },
  label: { size: 13, lineHeight: 1.2, tracking: 0.18, weight: 900, width: 100 },
  button: { size: 16, lineHeight: 1, tracking: 0.12, weight: 900, width: 100 },
} as const;

/** Radios (px): esquinas rectas como un uniforme; solo campos y casillas llevan `sm`, chips de distancia `pill`. */
export const radius = { sm: 4, md: 0, lg: 0, xl: 0, pill: 999 } as const;

/** Grosor del contorno de estampa (px) */
export const stroke = { thin: 1.5, base: 3, bold: 3 } as const;

/** Sombras de estampa: planas, desplazadas, del color `stamp`. Sin desenfoque. */
export const shadow = { sm: { x: 4, y: 4 }, md: { x: 6, y: 6 }, lg: { x: 8, y: 8 } } as const;

export const motion = {
  duration: { fast: 140, base: 220, slow: 380, roll: 620 },
  easing: { standard: 'cubic-bezier(0.2, 0, 0, 1)', stamp: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
} as const;

export const layer = { nav: 40, sticky: 30, toast: 60, dialog: 50 } as const;
