import { useMemo, useRef, useState } from 'react';
import { Dices, LoaderCircle, TriangleAlert, X } from 'lucide-react';
import { CONFIG } from '../config';
import { miles } from '../lib/format';
import { btn } from '../components/ui';
import { alAzar, alternarNumero, asignarConsecutivos, enProceso, estaOcupado, useRegistro } from './store';

const { minimo: MIN, maximo: MAX } = CONFIG.numeros;
const RANGOS: [number, number][] = [];
for (let s = MIN; s <= MAX; s += 100) RANGOS.push([s, Math.min(s + 99, MAX)]);

const PUNTO = { cargando: 'bg-hwang', demo: 'bg-cheong', ok: 'bg-[#2f7a4f]', error: 'bg-hong' };

/** Paso 2: tablero de números con disponibilidad en tiempo real. */
export function Tablero() {
  const s = useRegistro();
  const [rango, setRango] = useState<[number, number] | null>(null);
  const [soloLibres, setSoloLibres] = useState(false);
  const [desde, setDesde] = useState('');
  const grid = useRef<HTMLDivElement>(null);
  const numeros = useMemo(() => Array.from({ length: MAX - MIN + 1 }, (_, i) => MIN + i), []);

  // s.version cambia cada vez que el tablero debe volver a dibujarse (tiempo real, apartados que vencen…)
  let libres = 0;
  const celdas = numeros.map((n) => {
    const ocupado = estaOcupado(n);
    const sel = !ocupado && s.seleccion.includes(n);
    const proceso = !ocupado && !sel && enProceso(n);
    if (!ocupado && !proceso) libres++;
    return { n, ocupado, sel, proceso };
  });

  const faltan = s.seleccion.filter((n) => n === null).length;
  const listos = s.cantidad - faltan;
  const grupo = s.cantidad > 1;

  const elegirRango = (r: [number, number] | null) => {
    setRango(r);
    if (grid.current) grid.current.scrollTop = 0;
  };

  return (
    <div>
      <p className="flex items-start gap-2.5 text-[14px] text-ink/75" aria-live="polite">
        {s.conexion.tipo === 'cargando' ? (
          <LoaderCircle size={16} className="mt-0.5 shrink-0 animate-spin text-hwang" />
        ) : s.conexion.tipo === 'error' ? (
          <TriangleAlert size={16} className="mt-0.5 shrink-0 text-hong" />
        ) : (
          <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${PUNTO[s.conexion.tipo]}`} />
        )}
        {s.conexion.texto}
      </p>

      {/* Números elegidos: un dorsal por corredor, en su lugar */}
      <div className="mt-5 rounded-[4px] bg-paper p-4">
        <p className={`text-[15px] ${faltan ? '' : 'font-semibold text-[#2f7a4f]'}`} aria-live="polite">
          {faltan > 0 ? (
            <>
              Elegidos <strong>{listos}</strong> de {s.cantidad} · {listos ? `te falta${faltan > 1 ? 'n' : ''} ${faltan}` : 'toca un número libre en el tablero'}
            </>
          ) : (
            `Listo: elegiste ${s.cantidad === 1 ? 'tu número' : `tus ${s.cantidad} números`}`
          )}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {s.seleccion.map((n, i) => (
            <span
              key={i}
              className={`inline-flex h-10 items-center gap-1.5 rounded-[3px] border-t-4 pr-1 pl-2.5 text-[15px] font-bold tabular-nums ${n === null ? 'border-ink/20 bg-card/60 text-ink/35' : 'border-hong bg-card shadow-sm'}`}
            >
              {grupo && <small className="text-[11px] font-semibold text-muted">C{i + 1}</small>}#{n ?? '—'}
              {n !== null ? (
                <button type="button" onClick={() => alternarNumero(n)} aria-label={`Quitar el número ${n}`} className="rounded p-1 text-muted hover:bg-paper hover:text-hong">
                  <X size={14} />
                </button>
              ) : (
                <span className="w-1.5" />
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button type="button" onClick={alAzar} className={`${btn.base} ${btn.borde} ${btn.sm}`}>
          <Dices size={16} /> Al azar
        </button>
        {grupo && (
          <div className="flex items-center gap-2 text-[14px]">
            <label htmlFor="desde" className="font-medium">
              Consecutivos desde #
            </label>
            <input
              id="desde"
              type="number"
              inputMode="numeric"
              min={MIN}
              max={MAX}
              placeholder="Ej. 100"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="h-9 w-24 rounded-[3px] border border-ink/25 bg-white px-2 tabular-nums outline-none focus:border-ink"
            />
            <button type="button" onClick={() => asignarConsecutivos(desde)} className={`${btn.base} ${btn.borde} ${btn.sm}`}>
              Aplicar
            </button>
          </div>
        )}
        <p className="ml-auto text-[14px] text-muted tabular-nums" aria-live="polite">
          <strong className="text-ink">{miles(libres)}</strong> libres de {miles(numeros.length)}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por rango">
          {[null, ...RANGOS].map((r) => {
            const activo = r === null ? rango === null : rango?.[0] === r[0];
            return (
              <button
                key={r ? r[0] : 'todos'}
                type="button"
                onClick={() => elegirRango(r)}
                aria-pressed={activo}
                className={`h-8 rounded-full px-3 text-[13px] font-semibold tabular-nums transition-colors ${activo ? 'bg-ink text-paper' : 'bg-paper text-ink/70 hover:text-ink'}`}
              >
                {r ? `${r[0]}–${r[1]}` : 'Todos'}
              </button>
            );
          })}
        </div>
        <label className="ml-auto flex items-center gap-2 text-[14px] font-medium">
          <input type="checkbox" checked={soloLibres} onChange={(e) => setSoloLibres(e.target.checked)} className="size-4 accent-hong" /> Solo libres
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted" aria-hidden>
        <span className="flex items-center gap-1.5">
          <i className="size-3 rounded-[2px] bg-card ring-1 ring-ink/20" />
          Libre
        </span>
        <span className="flex items-center gap-1.5">
          <i className="size-3 rounded-[2px] bg-paper-2" />
          Ocupado
        </span>
        <span className="flex items-center gap-1.5">
          <i className="rayado size-3 rounded-[2px] ring-1 ring-hwang/60" />
          En proceso
        </span>
        <span className="flex items-center gap-1.5">
          <i className="size-3 rounded-[2px] bg-hong" />
          Tu selección
        </span>
      </div>

      <div
        ref={grid}
        aria-label="Números de corredor"
        className="mt-3 grid max-h-[26rem] grid-cols-[repeat(auto-fill,minmax(3.1rem,1fr))] gap-1 overflow-y-auto rounded-[4px] bg-paper p-2 [scrollbar-width:thin]"
      >
        {celdas.map(({ n, ocupado, sel, proceso }) => {
          if (rango && (n < rango[0] || n > rango[1])) return null;
          if (soloLibres && (ocupado || proceso)) return null;
          const clase = ocupado
            ? 'bg-paper-2 text-ink/25 line-through'
            : proceso
              ? 'rayado bg-card text-ink/40 ring-1 ring-hwang/60'
              : sel
                ? 'bg-hong text-white'
                : 'bg-card ring-1 ring-ink/12 hover:ring-2 hover:ring-ink';
          return (
            <button
              key={n}
              type="button"
              disabled={ocupado || proceso}
              onClick={() => alternarNumero(n)}
              aria-pressed={sel}
              aria-label={`Número ${n}${ocupado ? ', ocupado' : proceso ? ', en proceso' : sel ? ', seleccionado' : ', libre'}`}
              title={proceso ? `Alguien lo está apartando. Se libera si no termina su registro en ${CONFIG.apartado.minutos} minutos.` : undefined}
              className={`h-10 rounded-[3px] text-[14px] font-semibold tabular-nums transition-[box-shadow,background-color] disabled:cursor-not-allowed ${clase}`}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
