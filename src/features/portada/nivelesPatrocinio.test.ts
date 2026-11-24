import { describe, expect, it } from 'vitest';
import type { Patrocinador } from '../../config';
import { agruparPatrocinadores, patrocinadoresEnOrden } from './nivelesPatrocinio';

const p = (nombre: string, nivel: Patrocinador['nivel']): Patrocinador => ({ nombre, nivel, logo: `${nombre}.svg` });
const lugares = { principal: 2, oro: 3, plata: 4, bronce: 6 };

describe('patrocinadores', () => {
  const lista = [p('Panadería', 'bronce'), p('Trellum', 'principal'), p('Ferretería', 'oro'), p('Café', 'oro')];

  it('agrupa por nivel en orden y resta los lugares ocupados', () => {
    const g = agruparPatrocinadores(lista, lugares);
    expect(g.map((x) => x.id)).toEqual(['principal', 'oro', 'plata', 'bronce']);
    expect(g.map((x) => x.libres)).toEqual([1, 1, 4, 5]);
    expect(g[1].patrocinadores.map((x) => x.nombre)).toEqual(['Ferretería', 'Café']);
  });

  it('nunca da lugares libres negativos', () => {
    const g = agruparPatrocinadores([p('A', 'principal'), p('B', 'principal'), p('C', 'principal')], lugares);
    expect(g[0].libres).toBe(0);
  });

  it('ordena la tira del nivel más alto al más bajo', () => {
    expect(patrocinadoresEnOrden(lista).map((x) => x.nombre)).toEqual(['Trellum', 'Ferretería', 'Café', 'Panadería']);
  });
});
