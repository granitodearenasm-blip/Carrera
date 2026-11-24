// Contraste WCAG 2 entre dos colores opacos escritos como #RRGGBB.

function luminance(hex: string): number {
  const channels = hex
    .replace('#', '')
    .match(/../g)!
    .map((c) => parseInt(c, 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/** De 1 (mismo color) a 21 (negro sobre blanco). AA pide 4.5 para texto y 3 para texto grande y controles. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
