export const pesos = (n: number) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
export const miles = (n: number) => Number(n || 0).toLocaleString('es-MX');
export const soloDigitos = (s: string) => s.replace(/\D/g, '');

/** Ruta a un archivo de public/ que funciona en cualquier carpeta del hosting. */
export const img = (archivo: string) => `${import.meta.env.BASE_URL}img/${archivo}`;

const ABRIR_REGLAMENTO = 'abrir-reglamento';
export const abrirReglamento = () => window.dispatchEvent(new Event(ABRIR_REGLAMENTO));
export const alAbrirReglamento = (fn: () => void) => {
  window.addEventListener(ABRIR_REGLAMENTO, fn);
  return () => window.removeEventListener(ABRIR_REGLAMENTO, fn);
};
