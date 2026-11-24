import { CONFIG, type NivelPatrocinio, type Patrocinador } from '../../config';

export const NIVELES: { id: NivelPatrocinio; nombre: string }[] = [
  { id: 'principal', nombre: 'Patrocinio principal' },
  { id: 'oro', nombre: 'Oro' },
  { id: 'plata', nombre: 'Plata' },
  { id: 'bronce', nombre: 'Bronce' },
];

export type GrupoPatrocinio = { id: NivelPatrocinio; nombre: string; patrocinadores: Patrocinador[]; libres: number };

/** Patrocinadores por nivel, en orden, con los lugares que quedan libres en cada uno. */
export function agruparPatrocinadores(lista: Patrocinador[] = CONFIG.patrocinadores, lugares = CONFIG.patrocinio.lugares): GrupoPatrocinio[] {
  return NIVELES.map(({ id, nombre }) => {
    const patrocinadores = lista.filter((p) => p.nivel === id);
    return { id, nombre, patrocinadores, libres: Math.max(0, (lugares[id] ?? 0) - patrocinadores.length) };
  });
}

/** Todos, del nivel más alto al más bajo (para la tira "Con el apoyo de"). */
export const patrocinadoresEnOrden = (lista: Patrocinador[] = CONFIG.patrocinadores) => agruparPatrocinadores(lista).flatMap((g) => g.patrocinadores);
