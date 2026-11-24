// Abrir el reglamento o el aviso de privacidad desde cualquier parte (asistente, preguntas, pie de página)
// sin pasar props por toda la página.

const ABRIR_REGLAMENTO = 'hanguk:abrir-reglamento';
const ABRIR_PRIVACIDAD = 'hanguk:abrir-privacidad';

export const abrirReglamento = () => window.dispatchEvent(new Event(ABRIR_REGLAMENTO));
export const abrirPrivacidad = () => window.dispatchEvent(new Event(ABRIR_PRIVACIDAD));

function escuchar(evento: string, fn: () => void) {
  window.addEventListener(evento, fn);
  return () => window.removeEventListener(evento, fn);
}
export const alAbrirReglamento = (fn: () => void) => escuchar(ABRIR_REGLAMENTO, fn);
export const alAbrirPrivacidad = (fn: () => void) => escuchar(ABRIR_PRIVACIDAD, fn);
