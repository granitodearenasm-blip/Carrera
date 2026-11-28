import { useMemo } from 'react';
import { CONFIG } from '../../config';
import { pesos } from '../../shared/format';
import type { Gasto, Patrocinio } from '../../services/supabase/finanzas';
import type { InscripcionPanel } from '../../services/supabase/panel';
import { balance, gastosPorCategoria } from './cuentas';
import { Gastos, Patrocinios } from './Movimientos';
import { Barras, Cifra } from './Resumen';

/** Barra de avance de una meta, con el porcentaje escrito. */
function Avance({ valor, meta, etiqueta }: { valor: number; meta: number; etiqueta: string }) {
  const pct = meta > 0 ? Math.min(100, Math.round((valor / meta) * 100)) : 0;
  return (
    <div>
      <div className="flex justify-between text-small font-semibold">
        <span>{etiqueta}</span>
        <span className="tabular-nums">{pct} %</span>
      </div>
      <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-sunken" role="progressbar" aria-label={etiqueta} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Finanzas({ lista, patrocinios, gastos, recargar }: { lista: InscripcionPanel[]; patrocinios: Patrocinio[]; gastos: Gasto[]; recargar: () => void }) {
  const b = useMemo(() => balance(lista, patrocinios, gastos, CONFIG.viaje), [lista, patrocinios, gastos]);
  const { viajeros, costoPorViajero } = CONFIG.viaje;
  const ingresos = b.inscripcionesCobradas + b.patrociniosCobrados;

  return (
    <div className="space-y-6">
      <section aria-labelledby="t-balance">
        <h3 id="t-balance" className="text-label">
          Lo cobrado
        </h3>
        <dl className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Cifra valor={pesos(b.inscripcionesCobradas)} etiqueta="Inscripciones pagadas" nota={`+ ${pesos(b.inscripcionesPorCobrar)} por cobrar`} />
          <Cifra valor={pesos(b.patrociniosCobrados)} etiqueta="Patrocinios cobrados" nota={`+ ${pesos(b.patrociniosComprometidos)} comprometidos`} />
          <Cifra valor={pesos(b.gastos)} etiqueta="Gastos" nota={ingresos ? `${Math.round((b.gastos / ingresos) * 100)} % de lo cobrado` : undefined} />
          <Cifra
            valor={pesos(b.neto)}
            etiqueta="Queda para el viaje"
            tono={b.neto < 0 ? 'danger' : 'success'}
            nota={b.neto < 0 ? 'Los gastos aún superan lo cobrado' : undefined}
          />
        </dl>
      </section>

      <section aria-labelledby="t-reparto" className="rounded-md bg-surface p-5 contorno-fino">
        <h3 id="t-reparto" className="text-label">
          Reparto entre los {viajeros} viajeros
        </h3>
        <dl className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <dd className="cifra text-[2.6rem]">{pesos(b.porViajero)}</dd>
            <dt className="text-small font-semibold text-fg-muted">Le toca hoy a cada uno</dt>
          </div>
          <div>
            <dd className="cifra text-[2.6rem] text-fg-muted">{pesos(b.porViajeroProyectado)}</dd>
            <dt className="text-small font-semibold text-fg-muted">Si se cobra todo lo pendiente y comprometido</dt>
          </div>
          <div>
            <dd className="cifra text-[2.6rem]">{b.faltaPorViajero === null ? '—' : pesos(b.faltaPorViajero)}</dd>
            <dt className="text-small font-semibold text-fg-muted">
              {costoPorViajero === null ? 'Falta por viajero: confirma el costo del viaje en config.ts' : `Le falta a cada uno para su viaje de ${pesos(costoPorViajero)}`}
            </dt>
          </div>
        </dl>
        {costoPorViajero !== null ? (
          <div className="mt-5 space-y-3">
            <Avance valor={b.porViajero} meta={costoPorViajero} etiqueta="Viaje cubierto con lo cobrado" />
            <Avance valor={b.porViajeroProyectado} meta={costoPorViajero} etiqueta="Viaje cubierto si se cobra todo" />
          </div>
        ) : null}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Patrocinios patrocinios={patrocinios} recargar={recargar} />
        <div className="space-y-4">
          <Gastos gastos={gastos} recargar={recargar} />
          {gastos.length ? <Barras titulo="Gastos por categoría (pesos)" orden={CONFIG.equipo.categoriasGasto} conteo={gastosPorCategoria(gastos)} /> : null}
        </div>
      </div>
    </div>
  );
}
