import { useSyncExternalStore } from 'react';
import { color } from './design/tokens';
import { guardar, leer } from './storage';

// Aspecto claro u oscuro. La elección se guarda en este navegador; "sistema" sigue al dispositivo.
// index.html lo aplica antes de pintar (misma clave y atributo), así la página no parpadea.

export type PreferenciaTema = 'sistema' | 'claro' | 'oscuro';
export type Tema = 'light' | 'dark';

const CLAVE = 'tema';
const CAMBIO = 'hanguk:tema';
const consultaOscuro = () => window.matchMedia('(prefers-color-scheme: dark)');
const COLOR_BARRA: Record<Tema, string> = { light: color.light.page, dark: color.dark.page };

export const preferenciaTema = (): PreferenciaTema => leer<PreferenciaTema>(CLAVE, 'sistema');
const resolver = (p: PreferenciaTema): Tema => (p === 'sistema' ? (consultaOscuro().matches ? 'dark' : 'light') : p === 'oscuro' ? 'dark' : 'light');

function aplicar() {
  const tema = resolver(preferenciaTema());
  document.documentElement.dataset.theme = tema;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COLOR_BARRA[tema]);
}

export function elegirTema(p: PreferenciaTema) {
  guardar(CLAVE, p);
  aplicar();
  window.dispatchEvent(new Event(CAMBIO));
}

function suscribir(avisar: () => void) {
  const q = consultaOscuro();
  const alCambiar = () => {
    aplicar();
    avisar();
  };
  q.addEventListener('change', alCambiar);
  window.addEventListener(CAMBIO, avisar);
  return () => {
    q.removeEventListener('change', alCambiar);
    window.removeEventListener(CAMBIO, avisar);
  };
}

/** Tema aplicado ahora mismo y la preferencia guardada. */
export function useTema() {
  const tema = useSyncExternalStore(suscribir, () => resolver(preferenciaTema()));
  const preferencia = useSyncExternalStore(suscribir, preferenciaTema);
  return { tema, preferencia };
}
