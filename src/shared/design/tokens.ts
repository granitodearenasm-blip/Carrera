/**
 * Tokens de diseño de HANGUK RUN: la única fuente de colores, tipos, radios, sombras y movimiento.
 * La web los lee del CSS que genera `npm run tokens` (tokens.css, @theme de Tailwind 4).
 * Los nombres dicen para qué es un valor (superficie, texto secundario, peligro), nunca cómo se ve.
 *
 * Identidad: la del logo de Granito de Arena (amarillo sol, arena pálida, contorno café grueso, blanco),
 * mezclada con lo coreano de la carrera (rojo y azul del taegeuk, franjas saekdong del hanbok).
 *
 * Solo datos (sin imports ni enums): Node lee este archivo tal cual para generar el CSS.
 * Cada par de texto y fondo se revisa con WCAG AA en tokens.test.ts.
 */

/** Colores de marca, muestreados del logo y de la bandera coreana. No usar en componentes: usar `color`. */
export const palette = {
  /** Amarillo del logo */
  sol: '#FDCD00',
  solHover: '#F0C000',
  /** Manchas pálidas del logo: los granitos de arena */
  arena: '#FBE180',
  /** Contorno del logo */
  cafe: '#6A4207',
  /** Café para texto largo: más oscuro que el contorno para leer cómodo */
  cafeTexto: '#3A2406',
  cafeProfundo: '#2A1A0A',
  cafeNoche: '#1C1106',
  leche: '#FFFCF2',
  blanco: '#FFFFFF',
  /** Taegeukgi */
  rojo: '#CD2E3A',
  azul: '#0047A0',
} as const;

/** Colores semánticos. Los dos temas tienen las mismas claves. */
export const color = {
  light: {
    /** Detrás de todo */
    page: palette.leche,
    /** Tarjetas, paneles, campos */
    surface: palette.blanco,
    /** Bloques suaves: secciones alternas, fondos de grupo */
    sunken: '#FFF4CC',
    /** Manchas de arena y estados "seleccionado" suaves */
    sand: palette.arena,
    /** Pasar el puntero sobre un control discreto */
    hover: '#FFF0B8',
    fg: palette.cafeTexto,
    fgMuted: '#6B5432',
    /** Contorno de estampa: tarjetas, botones, dorsal (lo grueso del logo) */
    outline: palette.cafe,
    /** Divisores decorativos */
    line: '#E8D7A6',
    /** Bordes que identifican un control (campos): 3:1 al menos */
    lineStrong: '#8A6B3C',
    /** Sol: el botón principal de cada pantalla, el bloque del hero */
    accent: palette.sol,
    accentHover: palette.solHover,
    onAccent: palette.cafeTexto,
    /** Manchas de arena sobre un bloque amarillo (el hero es amarillo en los dos temas) */
    accentSoft: palette.arena,
    /** Bloques oscuros (sede, premios, pie) */
    ink: palette.cafeProfundo,
    inkHover: '#3A2610',
    onInk: palette.leche,
    onInkMuted: '#E5D3AC',
    /** La sombra plana desplazada de las estampas */
    stamp: palette.cafe,
    /** Tu selección, la salida, errores (rojo taegeuk un punto más oscuro para leerse sobre fondos suaves) */
    danger: '#B8222E',
    dangerSoft: '#FCE9EA',
    onDanger: palette.blanco,
    /** Corea, información, enlaces */
    info: palette.azul,
    infoSoft: '#E4ECF8',
    onInfo: palette.blanco,
    link: palette.azul,
    success: '#2E6B38',
    successSoft: '#E4F2E2',
    focus: palette.azul,
    /** Velo detrás de ventanas */
    scrim: 'rgba(42, 26, 10, 0.55)',
  },
  dark: {
    page: palette.cafeProfundo,
    surface: '#38240F',
    sunken: '#33210D',
    sand: '#5A4318',
    hover: '#4A3218',
    fg: '#FFF4D6',
    fgMuted: '#E3CFA3',
    outline: '#C9A55C',
    line: '#5A4220',
    lineStrong: '#B8935A',
    accent: palette.sol,
    accentHover: '#FFD83A',
    onAccent: palette.cafeTexto,
    accentSoft: palette.arena,
    ink: palette.cafeNoche,
    inkHover: '#2A1A0A',
    onInk: '#FFF4D6',
    onInkMuted: '#E3CFA3',
    stamp: '#0E0802',
    danger: '#FF8A92',
    dangerSoft: '#4A1C20',
    onDanger: palette.cafeNoche,
    info: '#9DBEFF',
    infoSoft: '#1B2A48',
    onInfo: palette.cafeNoche,
    link: '#9DBEFF',
    success: '#8FD69A',
    successSoft: '#1E3A22',
    focus: palette.sol,
    scrim: 'rgba(0, 0, 0, 0.65)',
  },
} as const;

export type ThemeName = keyof typeof color;
export type ColorRole = keyof (typeof color)['light'];

/** Franjas saekdong (mangas del hanbok): solo en divisores, cinta de meta y progreso. Decorativas. */
export const saekdong = [palette.sol, palette.rojo, '#3F8A4E', palette.azul, '#E07A9E', palette.blanco, '#6A3E9A'] as const;

/** Familias. Fredoka y Jua son redondeadas como las letras del logo. */
export const font = {
  display: { family: 'Fredoka', fallback: "'Nunito Sans', ui-rounded, system-ui, sans-serif" },
  ui: { family: 'Nunito Sans', fallback: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" },
  ko: { family: 'Jua', fallback: "'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif" },
} as const;

/**
 * Escala tipográfica (px). `max`: tamaño desde 1440 px; entre 360 y 1440 crece de forma fluida.
 * `width`: ancho de Fredoka (75 estrecho … 125 ancho).
 */
export const text = {
  hero: { size: 64, max: 152, lineHeight: 0.86, tracking: -0.01, weight: 700, width: 82 },
  display: { size: 44, max: 96, lineHeight: 0.92, tracking: -0.005, weight: 700, width: 88 },
  title: { size: 30, max: 48, lineHeight: 1, tracking: 0, weight: 650, width: 95 },
  subtitle: { size: 21, max: 26, lineHeight: 1.2, tracking: 0, weight: 600, width: 100 },
  lead: { size: 18, max: 21, lineHeight: 1.5, tracking: 0, weight: 500, width: 100 },
  body: { size: 17, lineHeight: 1.55, tracking: 0, weight: 400, width: 100 },
  small: { size: 15, lineHeight: 1.45, tracking: 0, weight: 400, width: 100 },
  label: { size: 14, lineHeight: 1.3, tracking: 0.005, weight: 700, width: 100 },
  button: { size: 17, lineHeight: 1, tracking: 0.005, weight: 600, width: 100 },
} as const;

/** Radios (px): distintos según la jerarquía, nunca uno solo para todo. */
export const radius = { sm: 8, md: 14, lg: 22, xl: 32, pill: 999 } as const;

/** Grosor del contorno de estampa (px) */
export const stroke = { thin: 1.5, base: 2.5, bold: 3.5 } as const;

/** Sombras de estampa: planas, desplazadas, del color `stamp`. Sin desenfoque. */
export const shadow = { sm: { x: 2, y: 3 }, md: { x: 4, y: 5 }, lg: { x: 7, y: 9 } } as const;

export const motion = {
  duration: { fast: 140, base: 220, slow: 380, roll: 620 },
  easing: { standard: 'cubic-bezier(0.2, 0, 0, 1)', stamp: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
} as const;

export const layer = { nav: 40, sticky: 30, toast: 60, dialog: 50 } as const;
