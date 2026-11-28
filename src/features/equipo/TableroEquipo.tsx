import { Award, Copy, Flame, MessageCircle, Trophy, Users } from 'lucide-react';
import { CONFIG } from '../../config';
import { fechaCorta, miles, pesos, plural } from '../../shared/format';
import { Badge } from '../../shared/ui/Badge';
import { Button } from '../../shared/ui/Button';
import { useCopiar } from '../../shared/ui/useCopiar';
import { linkInvitacion, type MiEquipo } from '../../services/supabase/equipo';
import { calcularLogros } from './logros';

const CAJA = 'rounded-md bg-surface p-5 contorno-fino';

function Barra({ pct, etiqueta }: { pct: number; etiqueta: string }) {
  const v = Math.min(100, Math.max(0, Math.round(pct)));
  return (
    <div className="mt-2 h-3 overflow-hidden rounded-full bg-sunken" role="progressbar" aria-label={etiqueta} aria-valuemin={0} aria-valuemax={100} aria-valuenow={v}>
      <div className="h-full rounded-full bg-accent" style={{ width: `${v}%` }} />
    </div>
  );
}

/** La página privada de un miembro: lo que lleva, su lugar, sus insignias y a quién darle seguimiento. */
export function TableroEquipo({ d }: { d: MiEquipo }) {
  const copiar = useCopiar();
  const l = calcularLogros(d, CONFIG.equipo.insignias);
  const link = linkInvitacion(d.codigo);
  const precio = CONFIG.categorias[0]?.precio ?? 0;
  const aportado = l.corredoresPagados * precio;
  const costo = CONFIG.viaje.costoPorViajero;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${CONFIG.equipo.mensaje} ${link}`)}`;
  const top = d.ranking.slice(0, 5);
  const yoFuera = !top.some((r) => r.yo) ? d.ranking.find((r) => r.yo) : undefined;
  const meta = CONFIG.numeros.maximo;

  return (
    <div className="space-y-5">
      <section className={CAJA} aria-labelledby="t-hola">
        <h2 id="t-hola" className="titulo">
          ¡Hola, {d.nombre.split(' ')[0]}!
        </h2>
        <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-3">
          <p>
            <span className="block cifra text-[3.5rem] leading-none">{miles(l.corredores)}</span>
            <span className="text-small font-semibold text-fg-muted">corredores inscritos con tu link</span>
          </p>
          {l.lugar ? (
            <p className="flex items-center gap-2 font-bold">
              <Trophy size={20} aria-hidden="true" /> Lugar {l.lugar} del equipo
            </p>
          ) : null}
          {l.estaSemana ? (
            <p className="flex items-center gap-2 font-bold">
              <Flame size={20} aria-hidden="true" /> {plural(l.estaSemana, 'corredor', 'corredores')} esta semana
            </p>
          ) : null}
        </div>
        {l.paraSubir ? <p className="mt-3 text-small text-fg-muted">Te faltan {plural(l.paraSubir, 'corredor', 'corredores')} para subir un lugar.</p> : null}
      </section>

      <section className={CAJA} aria-labelledby="t-compartir">
        <h2 id="t-compartir" className="text-label">
          Tu link para invitar
        </h2>
        <p className="mt-2 font-mono text-small break-all">{link}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button label="Compartir por WhatsApp" icon={MessageCircle} href={whatsapp} />
          <Button label="Copiar link" icon={Copy} variant="secondary" onPress={() => void copiar(link, 'Link copiado')} />
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <section className={CAJA} aria-labelledby="t-impacto">
          <h2 id="t-impacto" className="text-label">
            Tu impacto
          </h2>
          <p className="mt-3 cifra text-[2.4rem]">{pesos(aportado)}</p>
          <p className="text-small text-fg-muted">ya pagados por tus {plural(l.corredoresPagados, 'corredor', 'corredores')} para el viaje a Corea</p>
          {costo ? (
            <>
              <Barra pct={(aportado / costo) * 100} etiqueta="Parte de un viaje cubierta" />
              <p className="mt-1 text-small text-fg-muted">Equivale al {Math.round((aportado / costo) * 100)} % del viaje de un joven</p>
            </>
          ) : null}
        </section>

        <section className={CAJA} aria-labelledby="t-insignias">
          <h2 id="t-insignias" className="text-label">
            Insignias
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {CONFIG.equipo.insignias.map((n) => {
              const ok = l.insigniasGanadas.includes(n);
              return (
                <li key={n} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-small font-bold ${ok ? 'bg-accent text-on-accent' : 'bg-sunken text-fg-muted'}`}>
                  <Award size={16} aria-hidden="true" /> {n} <span className="sr-only">{ok ? 'ganada' : 'por ganar'}</span>
                </li>
              );
            })}
          </ul>
          {l.siguienteInsignia ? (
            <p className="mt-3 text-small text-fg-muted">
              Te faltan {plural(l.siguienteInsignia - l.corredores, 'corredor', 'corredores')} para la de {l.siguienteInsignia}.
            </p>
          ) : (
            <p className="mt-3 text-small font-semibold">¡Ganaste todas! Eres leyenda del Hanguk Run.</p>
          )}
        </section>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <section className={CAJA} aria-labelledby="t-ranking">
          <h2 id="t-ranking" className="text-label">
            Ranking del equipo
          </h2>
          <ol className="mt-3 space-y-1.5">
            {[...top, ...(yoFuera ? [yoFuera] : [])].map((r) => (
              <li key={`${r.nombre}-${r.yo}`} className={`flex justify-between rounded-sm px-2 py-1 ${r.yo ? 'bg-accent-soft font-bold' : ''}`}>
                <span>
                  {d.ranking.indexOf(r) + 1}. {r.nombre}
                  {r.yo ? ' (tú)' : ''}
                </span>
                <span className="tabular-nums">{miles(r.corredores)}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className={CAJA} aria-labelledby="t-meta">
          <h2 id="t-meta" className="flex items-center gap-2 text-label">
            <Users size={16} aria-hidden="true" /> Meta de todos
          </h2>
          <p className="mt-3 cifra text-[2.4rem]">
            {miles(d.totalCarrera)} <span className="text-body text-fg-muted">de {miles(meta)}</span>
          </p>
          <Barra pct={(d.totalCarrera / meta) * 100} etiqueta="Corredores inscritos en la carrera" />
          <p className="mt-1 text-small text-fg-muted">Corredores inscritos en toda la carrera. ¡Llenemos la salida!</p>
        </section>
      </div>

      <section className={CAJA} aria-labelledby="t-inscritos">
        <h2 id="t-inscritos" className="text-label">
          Tus inscritos
        </h2>
        {l.porPagar ? (
          <p className="mt-2 text-small">{plural(l.porPagar, 'inscripción falta', 'inscripciones faltan')} por pagar: recuérdales que su lugar se libera si no pagan a tiempo.</p>
        ) : null}
        <ul className="mt-3 divide-y divide-line">
          {d.inscripciones.map((i, k) => (
            <li key={k} className="flex flex-wrap items-center gap-3 py-2.5">
              <span className="min-w-0 flex-1 font-semibold">{i.nombres}</span>
              <span className="text-small text-fg-muted">{fechaCorta(i.creado)}</span>
              <Badge tone={i.estado === 'pagado' ? 'success' : 'sand'}>{i.estado === 'pagado' ? 'Pagado' : 'Por pagar'}</Badge>
            </li>
          ))}
          {d.inscripciones.length === 0 ? <li className="py-3 text-small text-fg-muted">Todavía nadie se inscribe con tu link. ¡Compártelo con tu familia y amigos!</li> : null}
        </ul>
      </section>
    </div>
  );
}
