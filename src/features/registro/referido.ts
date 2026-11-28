import { borrar, guardar, leer } from '../../shared/storage';

// Link de invitación del Equipo Hanguk (/?ref=codigo): se recuerda en este navegador 30 días, para
// que cuente aunque la persona se inscriba otro día. Gana el último link que abrió.

const CLAVE = 'referido';
const VIGENCIA_MS = 30 * 864e5;

/** Lee ?ref= de la dirección, lo guarda y lo quita de la barra (para que no se comparta por error). */
export function capturarReferido() {
  const url = new URL(window.location.href);
  const codigo = url.searchParams.get('ref')?.trim().toLowerCase();
  if (!codigo) return;
  if (/^[a-z0-9-]{3,30}$/.test(codigo)) guardar(CLAVE, { codigo, ms: Date.now() });
  url.searchParams.delete('ref');
  window.history.replaceState(window.history.state, '', url);
}

export function referidoVigente(): string | null {
  const r = leer<{ codigo: string; ms: number } | null>(CLAVE, null);
  if (!r || Date.now() - r.ms > VIGENCIA_MS) return null;
  return r.codigo;
}

export const olvidarReferido = () => borrar(CLAVE);
