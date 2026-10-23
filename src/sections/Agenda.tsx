import type { ReactNode } from 'react';
import { Km, Pendiente, Wrap } from '../components/ui';

type Hito = { fecha: string; titulo: string; texto: ReactNode; tono?: 'salida' | 'corea'; ko?: string };

// ✏️ CAMBIAR: fechas. Para agregar otra, copia un objeto de la lista.
const HITOS: Hito[] = [
  { fecha: '25 oct', titulo: 'Abren inscripciones', texto: 'Inscripción en línea en esta página.' },
  { fecha: '30 nov', titulo: 'Cierran inscripciones', texto: 'O antes, si se agotan los lugares.' },
  {
    fecha: '4 y 5 dic',
    titulo: 'Entrega de kits',
    texto: (
      <>
        10:00 a 18:00 h · <Pendiente>lugar de entrega</Pendiente>. Presenta tu confirmación e identificación.
      </>
    ),
  },
  // ✏️ CAMBIAR: horarios de salida
  { fecha: '6 dic', titulo: 'Día de la carrera', texto: 'Salida 10K a las 7:00, 5K a las 7:15 y 3K a las 7:30. Llega con al menos 45 minutos de anticipación.', tono: 'salida', ko: '가자!' },
  { fecha: '4 abr 2027', titulo: 'Encuentro en Corea del Sur', texto: 'La delegación de 10 jóvenes voluntarios representa a San Martín Texmelucan.', tono: 'corea', ko: '감사합니다' },
];

export function Agenda() {
  return (
    <section id="fechas" className="bg-paper-2 py-24 lg:py-28">
      <Wrap>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Km n="04" ko="일정">
              Agenda
            </Km>
            <h2 className="display mt-6 text-[clamp(2.8rem,7vw,5rem)]">Fechas importantes</h2>
          </div>
          <p className="text-sm font-semibold tracking-[0.14em] text-muted uppercase">2026 → 2027</p>
        </div>

        {/* Recorrido: vertical en celular, horizontal en pantallas grandes */}
        <ol className="relative mt-14 grid gap-0 lg:grid-cols-5">
          <span aria-hidden className="absolute top-2 bottom-2 left-[7px] w-0.5 bg-ink/25 lg:top-[7px] lg:right-0 lg:bottom-auto lg:left-0 lg:h-0.5 lg:w-auto" />
          {HITOS.map((h) => {
            const color = h.tono === 'salida' ? 'bg-coral' : h.tono === 'corea' ? 'bg-jardin' : 'bg-ink';
            return (
              <li key={h.titulo} className="relative pb-10 pl-10 lg:pr-6 lg:pb-0 lg:pl-0">
                <span aria-hidden className={`absolute top-0 left-0 size-4 rounded-full ring-4 ring-paper-2 ${color} ${h.tono ? 'scale-125' : ''}`} />
                <div className="lg:pt-9">
                  <p className={`display text-[2.6rem] ${h.tono === 'salida' ? 'text-coral' : h.tono === 'corea' ? 'text-jardin' : ''}`}>{h.fecha}</p>
                  <h3 className="mt-2 text-lg font-bold">
                    {h.titulo}{' '}
                    {h.ko && (
                      <span lang="ko" className="font-ko font-normal text-muted">
                        {h.ko}
                      </span>
                    )}
                  </h3>
                  <p className="mt-1 text-[15px] text-ink/75">{h.texto}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </Wrap>
    </section>
  );
}
