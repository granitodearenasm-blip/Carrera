import { Check } from 'lucide-react';
import { CONFIG } from '../../config';
import { pesos } from '../../shared/format';
import { RamaCerezo } from '../portada/corea';
import { PRECIO } from './datos';

// ✏️ Lo que incluye la inscripción
const INCLUYE = [
  'Tu número de corredor, con tu nombre',
  'Playera oficial dry-fit',
  'Medalla al cruzar la meta',
  'Hidratación en la ruta y snack coreano',
  'Ambulancia en la salida y en la meta',
];

const PASOS = [
  {
    titulo: 'Elige tu número',
    texto: `Del ${CONFIG.numeros.minimo} al ${CONFIG.numeros.maximo}, en un tablero que se actualiza en tiempo real. Queda apartado para ti mientras llenas tus datos.`,
  },
  { titulo: 'Llena tus datos', texto: 'Nombre, distancia, talla y un contacto de emergencia. Si es en grupo, los de cada corredor.' },
  { titulo: `Paga en ${CONFIG.pago.diasParaPagar} días`, texto: 'Por transferencia o en los locales que nos apoyan. No hay cobros en la página.' },
];

/** Antes del asistente: cómo funciona y qué incluye, para inscribirse sin dudas. */
export function Intro() {
  return (
    <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:items-start">
      <div className="lg:col-span-7">
        <h3 className="titulo">Así de fácil</h3>
        <ol className="mt-6 space-y-5">
          {PASOS.map((p, i) => (
            <li key={p.titulo} className="flex gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-pill border-[2.5px] border-outline bg-accent cifra text-[1.4rem] text-on-accent">
                {i + 1}
              </span>
              <div>
                <h4 className="font-display text-[1.2rem] font-semibold">{p.titulo}</h4>
                <p className="mt-1 text-fg-muted">{p.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-surface p-6 estampa lg:col-span-5">
        {/* Cerezo en flor, en una esquina */}
        <RamaCerezo className="pointer-events-none absolute -top-2 -right-3 w-44" />
        <p lang="ko" className="text-[1.1rem] text-danger">
          참가비
        </p>
        <p className="mt-1 flex flex-wrap items-baseline gap-x-2 pr-28">
          <span className="cifra text-[3rem]">{pesos(PRECIO)}</span>
          <span className="text-fg-muted">por corredor, en cualquier distancia</span>
        </p>
        <ul className="mt-4 space-y-2">
          {INCLUYE.map((x) => (
            <li key={x} className="flex gap-2.5">
              <Check size={19} strokeWidth={3} aria-hidden="true" className="mt-0.5 shrink-0 text-success" />
              {x}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
