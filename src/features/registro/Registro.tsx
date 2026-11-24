import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Timer } from 'lucide-react';
import { pesos, reloj } from '../../shared/format';
import { Alerta } from '../../shared/ui/Alerta';
import { Button } from '../../shared/ui/Button';
import { Manchas } from '../../shared/ui/decoracion';
import { Seccion } from '../layout/Seccion';
import { Confirmado } from './Confirmado';
import { Intro } from './Intro';
import { PRECIO } from './datos';
import { PasoCantidad } from './PasoCantidad';
import { PasoConfirmar } from './PasoConfirmar';
import { PasoDatos } from './PasoDatos';
import { arrancar, configurarCaptcha, intentarIr, useRegistro, type Paso, type ResultadoEnvio } from './store';
import { Tablero } from './Tablero';
import { useCaptcha } from './useCaptcha';
import { useFormulario } from './useFormulario';

const PASOS: [Paso, string][] = [
  [1, 'Corredores'],
  [2, 'Números'],
  [3, 'Datos'],
  [4, 'Confirmar'],
];

type Final = Extract<ResultadoEnvio, { data: unknown }>;

/** La inscripción: cómo funciona, qué incluye y el asistente de 4 pasos. */
export function Registro() {
  const s = useRegistro();
  const f = useFormulario(s.cantidad);
  const captcha = useCaptcha();
  const inicio = useRef<HTMLDivElement>(null);
  // El último resultado se conserva para que la ventana no se vacíe mientras se cierra
  const [final, setFinal] = useState<Final | null>(null);
  const [verFinal, setVerFinal] = useState(false);

  useEffect(arrancar, []);
  useEffect(() => {
    configurarCaptcha(captcha.getToken);
  }, [captcha.getToken]);
  useEffect(() => {
    if (!s.scroll) return;
    inicio.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Lleva el foco al título del paso nuevo, para lectores de pantalla y teclado
    inicio.current?.querySelector<HTMLElement>('[data-paso] h3')?.focus({ preventScroll: true });
  }, [s.scroll, s.paso]);

  return (
    <Seccion
      id="inscripcion"
      ko="참가 신청"
      titulo="Inscríbete y elige tu número"
      entrada={
        <>
          <strong className="text-fg">{pesos(PRECIO)} por corredor</strong>, solo o en grupo. Te toma unos minutos y tu número queda apartado al instante.
        </>
      }
      tone="sunken"
      fondo={
        <Manchas
          manchas={[
            { x: 99, y: 2, size: 16, forma: 1, rotar: 20 },
            { x: 2, y: 92, size: 30, forma: 0, rotar: -10 },
          ]}
        />
      }
    >
      <Intro />
      <div ref={inicio} className="mx-auto mt-16 max-w-4xl scroll-mt-24">
        <Progreso paso={s.paso} />

        <div className="relative mt-5 rounded-xl bg-page p-5 estampa-lg sm:p-8">
          {s.restante !== null ? (
            <div
              role="timer"
              aria-live="off"
              className={`sticky top-[4.75rem] z-(--layer-sticky) -mx-1 mb-6 flex items-center gap-3 rounded-md px-4 py-3 text-small font-semibold ${s.restante <= 60 ? 'bg-danger text-on-danger' : 'bg-sand text-fg'}`}
            >
              <Timer size={19} aria-hidden="true" className="shrink-0" />
              <span>
                {s.cantidad > 1 ? 'Tus números están apartados' : 'Tu número está apartado'} por <b className="tabular-nums">{reloj(s.restante)}</b>. Termina antes de que se acabe
                el tiempo.
              </span>
            </div>
          ) : null}

          <div data-paso={s.paso} className="[&_h3]:outline-none" key={s.paso}>
            {s.paso === 1 ? <PasoCantidad /> : null}
            {s.paso === 2 ? (
              <div>
                <h3 tabIndex={-1} className="mb-4 titulo">
                  {s.cantidad > 1 ? 'Elige sus números' : 'Elige tu número'}
                </h3>
                <Tablero />
                <Alerta className="mt-5">{s.alertaNumeros}</Alerta>
                <div className="mt-8 flex flex-wrap justify-between gap-3">
                  <Button label="Cambiar cantidad" icon={ArrowLeft} variant="quiet" onPress={() => intentarIr(1)} />
                  <Button label="Llenar datos" onPress={() => intentarIr(3)} />
                </div>
              </div>
            ) : null}
            {s.paso === 3 ? <PasoDatos f={f} /> : null}
            {s.paso === 4 ? (
              <PasoConfirmar
                f={f}
                alTerminar={(r) => {
                  if (!('data' in r)) return;
                  setFinal(r);
                  setVerFinal(true);
                }}
              />
            ) : null}
          </div>
          {captcha.element ? <div className="mt-4">{captcha.element}</div> : null}
        </div>
      </div>
      <Confirmado resultado={final} open={verFinal} onClose={() => setVerFinal(false)} />
    </Seccion>
  );
}

/** Indicador de pasos: la franja saekdong se va llenando, como la cinta de meta que se acerca. */
function Progreso({ paso }: { paso: Paso }) {
  return (
    <nav aria-label="Pasos de la inscripción">
      <p className="mb-3 text-small font-semibold text-fg-muted">
        Paso {paso} de {PASOS.length}
        <span className="sm:hidden">: {PASOS[paso - 1][1]}</span>
      </p>
      <div className="relative h-3 overflow-hidden rounded-pill border-[2px] border-outline bg-surface">
        <div
          className="absolute inset-0 transition-[clip-path] duration-(--duration-slow) ease-standard saekdong"
          style={{ clipPath: `inset(0 ${100 - (paso / PASOS.length) * 100}% 0 0)` }}
        />
      </div>
      <ol className="mt-3 grid grid-cols-4 gap-2">
        {PASOS.map(([n, texto]) => {
          const hecho = n < paso;
          const actual = n === paso;
          return (
            <li key={n}>
              <button
                type="button"
                disabled={!hecho}
                onClick={() => intentarIr(n)}
                aria-current={actual ? 'step' : undefined}
                className={`min-h-11 w-full text-left text-small font-bold disabled:cursor-default ${actual ? 'text-fg' : hecho ? 'cursor-pointer text-link underline underline-offset-4' : 'text-fg-muted'}`}
              >
                <span className="hidden sm:inline">{texto}</span>
                <span className="sm:hidden">{n}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
