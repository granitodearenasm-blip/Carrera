// Lo que se guarda en este navegador (tema, números del modo demostración). Nada en el código toca
// localStorage directo: si el navegador lo bloquea (modo privado, cuota llena), aquí se ignora.

const PREFIJO = 'hanguk:';

export function leer<T>(clave: string, porDefecto: T): T {
  try {
    const crudo = window.localStorage.getItem(PREFIJO + clave);
    return crudo === null ? porDefecto : (JSON.parse(crudo) as T);
  } catch {
    return porDefecto;
  }
}

export function guardar(clave: string, valor: unknown) {
  try {
    window.localStorage.setItem(PREFIJO + clave, JSON.stringify(valor));
  } catch {
    /* sin almacenamiento: se pierde al recargar, sin romper nada */
  }
}

export function borrar(clave: string) {
  try {
    window.localStorage.removeItem(PREFIJO + clave);
  } catch {
    /* sin almacenamiento */
  }
}
