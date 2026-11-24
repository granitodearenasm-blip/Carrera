// Números, dinero y rutas de archivos públicos, siempre en español de México.

const LOCALE = 'es-MX';

export const pesos = (n: number) => n.toLocaleString(LOCALE, { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
export const miles = (n: number) => Number(n || 0).toLocaleString(LOCALE);
export const soloDigitos = (s: string) => s.replace(/\D/g, '');
export const dosDigitos = (n: number) => String(n).padStart(2, '0');

export const fechaLarga = (d: Date) => d.toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
export const fechaHora = (d: Date) => d.toLocaleString(LOCALE, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

// Fechas fijas (como la salida): en hora del centro de México, para que no cambien con la zona del navegador
const ZONA = 'America/Mexico_City';
/** "Domingo 7 de febrero de 2027". */
export const fechaConDia = (d: Date) => {
  const t = d.toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: ZONA }).replace(',', '');
  return t.charAt(0).toUpperCase() + t.slice(1);
};
/** "7 de febrero". */
export const diaYMes = (d: Date) => d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'long', timeZone: ZONA });
/** "7 feb 2027". */
export const fechaCorta = (d: Date) => d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric', timeZone: ZONA });
/** "7:00". */
export const hora = (d: Date) => d.toLocaleTimeString(LOCALE, { hour: 'numeric', minute: '2-digit', hourCycle: 'h23', timeZone: ZONA }).replace(/^0/, '');

/** Ruta a una imagen de public/img. */
export const img = (archivo: string) => `${import.meta.env.BASE_URL}img/${archivo}`;

/** Minutos:segundos de un temporizador. */
export const reloj = (segundos: number) => `${Math.floor(segundos / 60)}:${dosDigitos(segundos % 60)}`;

/** "1 corredor", "3 corredores". */
export const plural = (n: number, uno: string, varios: string) => `${miles(n)} ${n === 1 ? uno : varios}`;
