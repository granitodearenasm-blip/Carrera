import { useEffect, useState } from 'react';
import { CONFIG } from '../config';

const OBJETIVO = new Date(CONFIG.salida).getTime();
const dos = (n: number) => String(n).padStart(2, '0');

/** Reloj de carrera hasta la salida. */
export function Countdown() {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (isNaN(OBJETIVO)) return null;
  const diff = OBJETIVO - ahora;
  if (diff <= 0) {
    return <p className="rounded-[4px] bg-ink px-5 py-6 text-center display text-4xl text-paper">¡Hoy es el gran día!</p>;
  }
  const partes = [
    [String(Math.floor(diff / 864e5)), 'días'],
    [dos(Math.floor(diff / 36e5) % 24), 'horas'],
    [dos(Math.floor(diff / 6e4) % 60), 'min'],
    [dos(Math.floor(diff / 1e3) % 60), 'seg'],
  ];
  return (
    <div className="rounded-[4px] bg-ink px-5 pt-3.5 pb-4 text-paper" aria-label="Tiempo para la salida">
      <p className="flex justify-between text-[11px] font-semibold tracking-[0.16em] text-paper/55 uppercase">
        <span>Para la salida</span>
        <span className="tabular-nums">07:00 h</span>
      </p>
      <div className="mt-2 grid grid-cols-4" aria-live="off">
        {partes.map(([valor, etiqueta], i) => (
          <div key={etiqueta} className={i ? 'border-l border-paper/15 pl-3' : ''}>
            <span className="display block text-[clamp(2.2rem,5vw,3.2rem)] leading-none tabular-nums">{valor}</span>
            <span className="text-[11px] font-medium tracking-[0.12em] text-paper/55 uppercase">{etiqueta}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
