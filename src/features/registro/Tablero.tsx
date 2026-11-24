import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Check, Dices, RotateCw, Search, X } from 'lucide-react';
import { CONFIG } from '../../config';
import { miles } from '../../shared/format';
import { Button } from '../../shared/ui/Button';
import { Chip } from '../../shared/ui/Chip';
import { Spinner } from '../../shared/ui/Spinner';
import { alAzar, alternarNumero, asignarConsecutivos, enProceso, estaOcupado, reintentarConexion, useRegistro } from './store';

const { minimo: MIN, maximo: MAX } = CONFIG.numeros;
const RANGOS: [number, number][] = [];
for (let s = MIN; s <= MAX; s += 100) RANGOS.push([s, Math.min(s + 99, MAX)]);

type Celda = { n: number; ocupado: boolean; mio: boolean; proceso: boolean };

/** Paso 2: tablero de números con disponibilidad en tiempo real. */
export function Tablero() {
  const s = useRegistro();
  const [rango, setRango] = useState(0);
  const [soloLibres, setSoloLibres] = useState(false);
  const [buscar, setBuscar] = useState('');
  const [desde, setDesde] = useState('');
  const [foco, setFoco] = useState<number | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const grupo = s.cantidad > 1;

  // s.version cambia cada vez que el tablero debe volver a dibujarse (tiempo real, apartados que vencen…)
  const { celdas, libres } = useMemo(() => {
    let libres = 0;
    const celdas: Celda[] = [];
    for (let n = MIN; n <= MAX; n++) {
      const ocupado = estaOcupado(n);
      const mio = !ocupado && s.seleccion.includes(n);
      const proceso = !ocupado && !mio && enProceso(n);
      if (!ocupado && !proceso) libres++;
      celdas.push({ n, ocupado, mio, proceso });
    }
    return { celdas, libres };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version es la señal de repintado
  }, [s.version, s.seleccion]);

  const [a, b] = RANGOS[rango];
  const visibles = celdas.filter((c) => c.n >= a && c.n <= b && (!soloLibres || (!c.ocupado && !c.proceso)));
  const activo = foco !== null && visibles.some((c) => c.n === foco) ? foco : (visibles.find((c) => !c.ocupado && !c.proceso)?.n ?? visibles[0]?.n);
  const faltan = s.seleccion.filter((n) => n === null).length;

  const irANumero = () => {
    const n = parseInt(buscar, 10);
    if (isNaN(n) || n < MIN || n > MAX) return;
    setRango(Math.floor((n - MIN) / 100));
    setSoloLibres(false);
    setFoco(n);
    requestAnimationFrame(() => grid.current?.querySelector<HTMLButtonElement>(`[data-n="${n}"]`)?.focus());
  };

  // Flechas, Inicio y Fin mueven el foco dentro del tablero (un solo punto de tabulación)
  const teclas = (e: KeyboardEvent<HTMLDivElement>) => {
    const botones = [...(grid.current?.querySelectorAll<HTMLButtonElement>('button[data-n]') ?? [])];
    const i = botones.findIndex((x) => x === document.activeElement);
    if (i === -1) return;
    const columnas = botones.filter((x) => x.offsetTop === botones[0].offsetTop).length || 1;
    const mover = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: columnas, ArrowUp: -columnas, Home: -i, End: botones.length - 1 - i }[e.key];
    if (mover === undefined) return;
    e.preventDefault();
    const destino = botones[Math.max(0, Math.min(botones.length - 1, i + mover))];
    setFoco(Number(destino.dataset.n));
    destino.focus();
  };

  return (
    <div>
      <Estado />

      {/* Números elegidos: un lugar por corredor */}
      <div className="mt-5 rounded-lg bg-sunken p-4">
        <p className={`font-semibold ${faltan ? 'text-fg' : 'text-success'}`} aria-live="polite">
          {faltan
            ? grupo
              ? `Llevas ${s.cantidad - faltan} de ${s.cantidad}. Toca un número libre.`
              : 'Toca un número libre en el tablero.'
            : grupo
              ? `Listo: tus ${s.cantidad} números están apartados.`
              : 'Listo: tu número está apartado.'}
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {s.seleccion.map((n, i) => (
            <li
              key={i}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-md pr-1 pl-3 font-display font-semibold tabular-nums ${n === null ? 'border-[2px] border-dashed border-line-strong text-fg-muted' : 'bg-accent text-on-accent estampa-sm'}`}
            >
              {grupo ? <span className="text-[0.8rem] font-bold opacity-75">C{i + 1}</span> : null}#{n ?? '—'}
              {n !== null ? (
                <button
                  type="button"
                  onClick={() => alternarNumero(n)}
                  aria-label={`Quitar el número ${n}`}
                  className="flex size-9 cursor-pointer items-center justify-center rounded-pill hover:bg-on-accent/10"
                >
                  <X size={16} aria-hidden="true" strokeWidth={2.6} />
                </button>
              ) : (
                <span className="w-2" />
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Herramientas */}
      <div className="mt-6 flex flex-wrap items-end gap-3">
        <Button label="Sortear" icon={Dices} variant="secondary" size="sm" onPress={alAzar} />
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            irANumero();
          }}
        >
          <label className="flex flex-col gap-1 text-label">
            Ir al número
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value.replace(/\D/g, '').slice(0, 3))}
              placeholder="128…"
              className="h-10 w-24 rounded-md border-[2px] border-line-strong bg-surface px-3 tabular-nums outline-none focus:border-link"
            />
          </label>
          <Button label="Ver" icon={Search} variant="quiet" size="sm" type="submit" />
        </form>
        {grupo ? (
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              asignarConsecutivos(desde);
            }}
          >
            <label className="flex flex-col gap-1 text-label">
              Seguidos desde el
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={desde}
                onChange={(e) => setDesde(e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="100…"
                className="h-10 w-24 rounded-md border-[2px] border-line-strong bg-surface px-3 tabular-nums outline-none focus:border-link"
              />
            </label>
            <Button label="Apartar seguidos" variant="quiet" size="sm" type="submit" />
          </form>
        ) : null}
        <p className="ml-auto text-small text-fg-muted tabular-nums" aria-live="polite">
          <strong className="text-fg">{miles(libres)}</strong> libres de {miles(MAX - MIN + 1)}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2" role="group" aria-label="Rango de números">
        {RANGOS.map(([x, y], i) => (
          <Chip key={x} pressed={rango === i} onPress={() => setRango(i)}>
            {x}–{y}
          </Chip>
        ))}
        <label className="ml-auto flex min-h-11 cursor-pointer items-center gap-2 text-small font-semibold">
          <input type="checkbox" checked={soloLibres} onChange={(e) => setSoloLibres(e.target.checked)} className="size-5 cursor-pointer accent-[var(--color-outline)]" />
          Solo libres
        </label>
      </div>

      <Leyenda />

      <div
        ref={grid}
        role="group"
        aria-label={`Números del ${a} al ${b}. Usa las flechas para moverte.`}
        onKeyDown={teclas}
        className="mt-3 grid max-h-[28rem] [scrollbar-width:thin] grid-cols-5 gap-1.5 overflow-y-auto rounded-lg bg-sunken p-2 sm:grid-cols-10"
      >
        {visibles.map(({ n, ocupado, mio, proceso }) => (
          <button
            key={n}
            data-n={n}
            type="button"
            tabIndex={n === activo ? 0 : -1}
            aria-disabled={ocupado || proceso || undefined}
            onClick={() => !ocupado && !proceso && alternarNumero(n)}
            onFocus={() => setFoco(n)}
            aria-pressed={mio}
            aria-label={`${n}${ocupado ? ', ocupado' : proceso ? ', alguien lo está apartando' : mio ? ', apartado para ti' : ', libre'}`}
            title={proceso ? `Alguien lo está apartando. Se libera si no termina su registro en ${CONFIG.apartado.minutos} minutos.` : undefined}
            className={`relative h-11 rounded-sm font-display text-[0.95rem] font-semibold tabular-nums transition-[background-color,transform] duration-(--duration-fast) ${
              ocupado
                ? 'cursor-not-allowed bg-transparent text-fg-muted/60 line-through'
                : proceso
                  ? 'cursor-not-allowed border-[1.5px] border-line-strong bg-surface rayado text-fg-muted'
                  : mio
                    ? 'cursor-pointer border-[2.5px] border-on-accent bg-accent text-on-accent shadow-sm'
                    : 'cursor-pointer border-[1.5px] border-line bg-surface text-fg hover:border-outline hover:bg-sand active:scale-95'
            }`}
          >
            {n}
            {mio ? <Check size={11} strokeWidth={4} aria-hidden="true" className="absolute top-0.5 right-0.5" /> : null}
          </button>
        ))}
        {!visibles.length ? <p className="col-span-full py-8 text-center text-fg-muted">No quedan números libres en este rango. Prueba otro.</p> : null}
      </div>
    </div>
  );
}

function Estado() {
  const { conexion } = useRegistro();
  const color = { cargando: 'bg-accent', demo: 'bg-info', ok: 'bg-success', error: 'bg-danger' }[conexion.tipo];
  return (
    <div className="flex flex-wrap items-start gap-2.5 text-small text-fg-muted" aria-live="polite">
      {conexion.tipo === 'cargando' ? <Spinner size={16} className="mt-0.5" /> : <span aria-hidden="true" className={`mt-1.5 size-2.5 shrink-0 rounded-full ${color}`} />}
      <span className="flex-1">{conexion.texto}</span>
      {conexion.tipo === 'error' ? <Button label="Reintentar" icon={RotateCw} variant="link" size="sm" onPress={reintentarConexion} /> : null}
    </div>
  );
}

function Leyenda() {
  const muestra = 'inline-block h-5 w-7 rounded-[5px]';
  return (
    <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-small text-fg-muted" aria-label="Qué significa cada número">
      <li className="flex items-center gap-2">
        <i aria-hidden="true" className={`${muestra} border-[1.5px] border-line bg-surface`} />
        Libre
      </li>
      <li className="flex items-center gap-2">
        <i aria-hidden="true" className={`${muestra} border-[2.5px] border-on-accent bg-accent`} />
        Tuyo
      </li>
      <li className="flex items-center gap-2">
        <i aria-hidden="true" className={`${muestra} border-[1.5px] border-line-strong rayado`} />
        Alguien lo está apartando
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className="font-semibold line-through">
          12
        </span>
        Ocupado
      </li>
    </ul>
  );
}
