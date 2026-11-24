import type { ReactNode } from 'react';
import { CONFIG } from '../../config';
import { fechaCorta } from '../../shared/format';
import { Pendiente } from '../layout/Seccion';

const SALIDA = new Date(CONFIG.salida);
const POR_CONFIRMAR = 'Por confirmar';

type Hito = { fecha: string; titulo: string; texto: ReactNode; tono?: 'salida' | 'corea'; ko?: string };

// ✏️ Fechas clave. Para agregar otra, copia un objeto de la lista.
const HITOS: Hito[] = [
  { fecha: '25 oct', titulo: 'Abren inscripciones', texto: 'En línea, en esta página.' },
  { fecha: CONFIG.cierreInscripciones || POR_CONFIRMAR, titulo: 'Cierran inscripciones', texto: 'O antes, si se acaban los números.' },
  {
    // ✏️ Pon aquí los días de entrega de kits (p. ej. '5 y 6 feb') cuando estén confirmados
    fecha: POR_CONFIRMAR,
    titulo: 'Recoge tu kit',
    texto: (
      <>
        Unos días antes de la carrera, con tu confirmación e identificación. <Pendiente>días, horario y lugar</Pendiente>
      </>
    ),
  },
  {
    fecha: fechaCorta(SALIDA).replace(/ \d{4}$/, ''),
    titulo: '¡A correr!',
    ko: '화이팅!',
    texto: 'Salen los 10 km a las 7:00, los 5 km a las 7:15 y los 3 km a las 7:30.',
    tono: 'salida',
  },
  { fecha: 'abr 2027', titulo: 'Rumbo a Corea', ko: '한국으로', texto: 'La delegación viaja al encuentro internacional.', tono: 'corea' },
];

/** Línea de tiempo: es una secuencia real, de la inscripción hasta Corea. */
export function Fechas() {
  return (
    <div className="mt-20">
      <h3 className="titulo">Fechas para tu calendario</h3>
      <p className="mt-2 text-fg-muted">
        {CONFIG.cierreInscripciones ? (
          `Las inscripciones cierran el ${CONFIG.cierreInscripciones} o cuando se acaben los números.`
        ) : (
          <>
            Las inscripciones cierran cuando se acaben los números. <Pendiente>fecha de cierre</Pendiente>
          </>
        )}
      </p>
      <div className="relative mt-10">
        <span
          aria-hidden="true"
          className="absolute top-3 bottom-3 left-[13px] border-l-[3px] border-dashed border-outline lg:top-[13px] lg:right-4 lg:bottom-auto lg:left-4 lg:border-t-[3px] lg:border-l-0"
        />
        <ol className="relative grid lg:grid-cols-5">
          {HITOS.map((h) => {
            const color = h.tono === 'salida' ? 'bg-danger' : h.tono === 'corea' ? 'bg-info' : 'bg-accent';
            return (
              <li key={h.titulo} className="relative pb-9 pl-12 lg:pr-5 lg:pb-0 lg:pl-0">
                <span aria-hidden="true" className={`absolute top-0 left-0 size-7 rounded-pill border-[3px] border-outline shadow-sm ${color}`} />
                <div className="lg:pt-12">
                  {h.fecha === POR_CONFIRMAR ? (
                    <p className="flex h-[2.3rem] items-center font-display text-[1.25rem] font-semibold text-fg-muted">{h.fecha}</p>
                  ) : (
                    <p className={`cifra text-[2.3rem] ${h.tono === 'salida' ? 'text-danger' : h.tono === 'corea' ? 'text-info' : ''}`}>{h.fecha}</p>
                  )}
                  <h4 className="mt-2 font-display text-[1.15rem] font-semibold">
                    {h.titulo}{' '}
                    {h.ko ? (
                      <span lang="ko" className="text-fg-muted">
                        {h.ko}
                      </span>
                    ) : null}
                  </h4>
                  <p className="mt-1 text-small text-fg-muted">{h.texto}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
