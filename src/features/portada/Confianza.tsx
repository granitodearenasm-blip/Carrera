import { useEffect, useState } from 'react';
import { BadgeCheck, HandCoins, Ticket } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CONFIG } from '../../config';
import { miles } from '../../shared/format';
import { Contenedor } from '../../shared/ui/decoracion';
import { consultarDisponibilidad, contarDisponibles } from '../registro/store';

const GARANTIAS: { Icono: LucideIcon; titulo: string; texto: string }[] = [
  { Icono: BadgeCheck, titulo: 'Organiza Granito de Arena', texto: 'Colectivo ciudadano sin fines de lucro que trabaja en Texmelucan desde 2021.' },
  { Icono: Ticket, titulo: 'Tu número es tuyo al instante', texto: 'Lo eliges en el tablero y queda apartado a tu nombre en cuanto confirmas.' },
  {
    Icono: HandCoins,
    titulo: 'Pagas después, sin cobros en línea',
    texto: `Te inscribes primero y tienes ${CONFIG.pago.diasParaPagar} días para pagar por transferencia o en locales aliados.`,
  },
];

/** Garantías para inscribirse con confianza, y cuántos números quedan (dato real del tablero). */
export function Confianza() {
  const [cupo, setCupo] = useState<{ libres: number; total: number } | null>(null);
  useEffect(() => {
    void consultarDisponibilidad().then(() => setCupo(contarDisponibles()));
  }, []);

  return (
    <div className="relative z-10 bg-page">
      <Contenedor>
        <div className="relative -mt-6 grid gap-px overflow-hidden rounded-xl bg-line estampa-lg sm:grid-cols-2 lg:-mt-10 lg:grid-cols-4">
          {GARANTIAS.map(({ Icono, titulo, texto }) => (
            <div key={titulo} className="flex gap-3.5 bg-surface p-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-pill border-[2.5px] border-outline bg-accent text-on-accent">
                <Icono size={21} aria-hidden="true" strokeWidth={2.3} />
              </span>
              <div>
                <h2 className="font-display text-[1.1rem] leading-tight font-semibold">{titulo}</h2>
                <p className="mt-1 text-small text-fg-muted">{texto}</p>
              </div>
            </div>
          ))}
          <div className="bg-surface p-5">
            <h2 className="font-display text-[1.1rem] leading-tight font-semibold">Números disponibles</h2>
            {cupo ? (
              <>
                <p className="mt-1 flex items-baseline gap-2">
                  <span className="cifra text-[2.4rem]">{miles(cupo.libres)}</span>
                  <span className="text-small text-fg-muted">de {miles(cupo.total)}</span>
                </p>
                <div aria-hidden="true" className="mt-2 h-3 overflow-hidden rounded-pill border-[2px] border-outline bg-sunken">
                  <div className="h-full rounded-r-[4px] bg-accent" style={{ width: `${(cupo.libres / cupo.total) * 100}%` }} />
                </div>
                <p className="mt-2 text-small text-fg-muted">
                  {CONFIG.cierreInscripciones ? `Elige el tuyo antes del ${CONFIG.cierreInscripciones}.` : 'Elige el tuyo antes de que se acaben.'}
                </p>
              </>
            ) : (
              <p className="mt-2 text-small text-fg-muted">Consultando el tablero…</p>
            )}
          </div>
        </div>
      </Contenedor>
    </div>
  );
}
