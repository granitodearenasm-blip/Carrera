import { CONFIG } from '../../config';
import { pesos } from '../../shared/format';

// ✏️ Preguntas frecuentes. Las respuestas toman precio, plazos y edades de CONFIG para no contradecirse.
// `pendiente`: dato que Granito de Arena aún debe confirmar (se muestra como "Por confirmar").

export type Pregunta = { pregunta: string; respuesta: string; pendiente?: string };

const precio = pesos(CONFIG.categorias[0]?.precio ?? 0);
const dias = CONFIG.pago.diasParaPagar;

export const PREGUNTAS: Pregunta[] = [
  {
    pregunta: '¿Cuánto cuesta y qué incluye?',
    respuesta: `${precio} por corredor en cualquier distancia. Incluye tu número con tu nombre, playera oficial dry-fit, medalla al cruzar la meta, hidratación en la ruta y un snack coreano.`,
  },
  {
    pregunta: '¿Cómo y cuándo pago?',
    respuesta: `Primero te inscribes y apartas tu número; no pagas nada en la página. Después tienes ${dias} días para pagar por transferencia o en los locales que nos apoyan. Al terminar tu inscripción verás un botón para pedir el número de cuenta por WhatsApp.`,
    pendiente: CONFIG.pago.whatsapp ? undefined : 'WhatsApp para pagos y lista de locales',
  },
  {
    pregunta: '¿Mi número de verdad queda apartado?',
    respuesta: `Sí. Al tocarlo queda reservado para ti ${CONFIG.apartado.minutos} minutos mientras llenas tus datos, y al confirmar ya es tuyo: nadie más puede elegirlo. El tablero se actualiza en tiempo real.`,
  },
  {
    pregunta: '¿Qué pasa si no pago a tiempo?',
    respuesta: `Si no recibimos tu pago en ${dias} días, el número puede liberarse para otra persona. Si necesitas más tiempo, escríbenos antes de que venza el plazo.`,
  },
  {
    pregunta: '¿Pueden correr menores de edad?',
    respuesta: `Sí, desde los ${CONFIG.edadMinima} años. Quienes tengan menos de 18 necesitan la autorización de su madre, padre o tutor.`,
  },
  {
    pregunta: '¿Puedo inscribir a mi familia o a mi equipo?',
    respuesta: `Sí, hasta ${CONFIG.corredoresMaximo} personas en una sola inscripción. Cada quien elige su distancia, su talla y su número, y una sola persona queda como responsable del grupo.`,
  },
  {
    pregunta: '¿Hay reembolsos? ¿Puedo cambiar de distancia o de talla?',
    respuesta:
      'Tu inscripción es un donativo para la delegación, por eso no hay reembolsos. Los cambios de distancia o de talla dependen de la disponibilidad: escríbenos y lo revisamos.',
  },
  {
    pregunta: '¿Dónde y cuándo recojo mi kit?',
    respuesta: 'Unos días antes de la carrera. Lleva tu confirmación y una identificación.',
    pendiente: 'días, horario y lugar de entrega',
  },
  {
    pregunta: '¿Por dónde es la ruta?',
    respuesta: `Todas las distancias salen y llegan al ${CONFIG.sede.nombre}. La de 10 km recorre las calles de El Moral: Reforma Oriente, Al Moral, el libramiento y la avenida hasta Av. México. La ruta estará marcada y habrá personal de apoyo.`,
    pendiente: 'trazo definitivo de 10 km y rutas de 3 y 5 km',
  },
  {
    pregunta: '¿Cómo llego y dónde me estaciono?',
    respuesta: `La salida y la meta están en el ${CONFIG.sede.nombre}, Prol. Ignacio Zaragoza s/n, en San Martín Texmelucan. Llega al menos 45 minutos antes de tu salida.`,
    pendiente: 'estacionamiento y transporte el día de la carrera',
  },
  {
    pregunta: '¿Cómo son los premios?',
    respuesta:
      'Hay $20,000 en efectivo para los tres primeros lugares de cada distancia, en rama femenil y varonil. Se entregan en efectivo presentando identificación oficial. También premiamos el mejor outfit K-culture.',
  },
  {
    pregunta: '¿Qué hacen con mis datos?',
    respuesta:
      'Los usamos solo para organizar la carrera: confirmar tu inscripción, preparar tu kit y avisar a tu contacto de emergencia si hace falta. Solo los ve el equipo organizador; no se publican ni se comparten.',
  },
];
