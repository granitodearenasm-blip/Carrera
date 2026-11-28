import { describe, expect, it } from 'vitest';
import { contrastRatio } from './contrast';
import { color, palette, type ColorRole, type ThemeName } from './tokens';

const TEXTO = 4.5;
const CONTROL = 3;

/** Color de texto, los fondos donde se usa y el mínimo. */
const PARES: [ColorRole, ColorRole[], number][] = [
  ['fg', ['page', 'surface', 'sunken', 'hover', 'sand'], TEXTO],
  ['fgMuted', ['page', 'surface', 'sunken', 'hover'], TEXTO],
  ['link', ['page', 'surface', 'sunken'], TEXTO],
  ['onAccent', ['accent', 'accentHover'], TEXTO],
  ['onInk', ['ink', 'inkHover'], TEXTO],
  ['onInkMuted', ['ink', 'inkHover'], TEXTO],
  ['onDanger', ['danger'], TEXTO],
  ['danger', ['surface', 'page', 'dangerSoft'], TEXTO],
  ['onInfo', ['info'], TEXTO],
  ['info', ['surface', 'page', 'infoSoft'], TEXTO],
  ['success', ['surface', 'successSoft', 'sunken'], TEXTO],
  ['lineStrong', ['surface', 'page'], CONTROL],
  ['outline', ['surface', 'page'], CONTROL],
  ['focus', ['page', 'surface'], CONTROL],
];

describe('tokens de diseño', () => {
  for (const tema of Object.keys(color) as ThemeName[]) {
    for (const [fg, fondos, min] of PARES) {
      for (const bg of fondos) {
        it(`${tema}: ${fg} sobre ${bg} llega a ${min}:1`, () => {
          expect(contrastRatio(color[tema][fg], color[tema][bg])).toBeGreaterThanOrEqual(min);
        });
      }
    }
  }

  it('los dos temas tienen los mismos roles', () => {
    expect(Object.keys(color.dark).sort()).toEqual(Object.keys(color.light).sort());
  });

  it('el rojo sol nunca es texto corrido sobre fondos claros (regla de marca)', () => {
    const textos = ['fg', 'fgMuted', 'link', 'info', 'success'] as const;
    for (const rol of textos) expect(color.light[rol]).not.toBe(palette.rojo);
  });

  it('el marino del contorno se lee sobre el hueso del fondo', () => {
    expect(contrastRatio(palette.marino, palette.hueso)).toBeGreaterThanOrEqual(TEXTO);
  });
});
