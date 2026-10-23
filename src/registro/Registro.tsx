import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check, Copy, LoaderCircle, Minus, Plus, Timer, TriangleAlert } from 'lucide-react';
import { CONFIG } from '../config';
import { abrirReglamento, pesos, soloDigitos } from '../lib/format';
import { Dialog } from '../components/Dialog';
import { Dorsal } from '../components/Dorsal';
import { btn, Km, Pendiente, Wrap } from '../components/ui';
import { Tablero } from './Tablero';
import { arrancar, enviar, intentarIr, setCantidad, useRegistro, type Inscripcion, type Paso } from './store';
import {
  armarInscripcion,
  categoria,
  comoFilas,
  comoTexto,
  CORREDOR_VACIO,
  enlaceWhatsApp,
  errorDeCampo,
  REGLAS_CONTACTO,
  REGLAS_CORREDOR,
  type Contacto,
  type DatosCorredor,
  type Regla,
} from './datos';

const PASOS: [Paso, string][] = [
  [1, 'Corredores'],
  [2, 'Números'],
  [3, 'Datos'],
  [4, 'Confirmar'],
];
const PRECIO = CONFIG.categorias[0]?.precio ?? 0;
const CONTACTO_VACIO: Contacto = { grupo: '', responsable: '', correo: '', telefono: '' };
const INPUT = 'h-12 w-full rounded-[3px] border bg-white px-3 text-[16px] outline-none transition-colors focus:border-ink focus:ring-2 focus:ring-ink/10';

type Confirmacion = { data: Inscripcion; resultado: 'ok' | 'demo' | 'fallo' };

export function Registro() {
  const s = useRegistro();
  const pasosRef = useRef<HTMLOListElement>(null);
  const [contacto, setContacto] = useState<Contacto>(CONTACTO_VACIO);
  // Datos por LUGAR de corredor: si alguien pierde su número, sus datos no se mezclan con los de otro
  const [corredores, setCorredores] = useState<DatosCorredor[]>([]);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [acepta, setAcepta] = useState(false);
  const [alertaDatos, setAlertaDatos] = useState('');
  const [alertaEnvio, setAlertaEnvio] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [confirmacion, setConfirmacion] = useState<Confirmacion | null>(null);
  const grupo = s.cantidad > 1;

  useEffect(arrancar, []);
  useEffect(() => {
    if (s.scroll) pasosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [s.scroll]);

  /* ---------- Validación del paso 3 ---------- */
  function camposVisibles(): [string, string, Regla][] {
    const lista: [string, string, Regla][] = [];
    (Object.keys(REGLAS_CONTACTO) as (keyof Contacto)[]).forEach((k) => {
      if (!grupo && (k === 'grupo' || k === 'responsable')) return;
      lista.push([`c-${k}`, contacto[k], REGLAS_CONTACTO[k]]);
    });
    for (let i = 0; i < s.cantidad; i++) {
      const d = corredores[i] ?? CORREDOR_VACIO;
      (Object.keys(REGLAS_CORREDOR) as (keyof DatosCorredor)[]).forEach((k) => lista.push([`r${i}-${k}`, d[k], REGLAS_CORREDOR[k]]));
    }
    return lista;
  }
  function validarDatos() {
    setAlertaDatos('');
    const nuevos: Record<string, string> = {};
    let primero: string | null = null;
    for (const [id, valor, regla] of camposVisibles()) {
      const msg = errorDeCampo(valor, regla);
      if (msg) {
        nuevos[id] = msg;
        primero ??= id;
      }
    }
    setErrores(nuevos);
    if (!primero) return true;
    const el = document.getElementById(primero);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => el?.focus({ preventScroll: true }), 400);
    setAlertaDatos('Revisa los campos marcados en rojo.');
    return false;
  }
  // Un campo con error se vuelve a revisar al escribir; uno con texto, al salir de él
  const revisar = (id: string, valor: string, regla: Regla, siempre = false) => {
    if (!siempre && !errores[id]) return;
    setErrores((e) => ({ ...e, [id]: errorDeCampo(valor, regla) }));
  };

  const cambiarContacto = (k: keyof Contacto, v: string) => {
    const valor = k === 'telefono' ? soloDigitos(v).slice(0, 10) : v;
    setContacto((c) => ({ ...c, [k]: valor }));
    revisar(`c-${k}`, valor, REGLAS_CONTACTO[k]);
  };
  const cambiarCorredor = (i: number, k: keyof DatosCorredor, v: string) => {
    const valor = k === 'emergenciaTelefono' ? soloDigitos(v).slice(0, 10) : v;
    setCorredores((lista) => {
      const copia = lista.slice();
      for (let j = 0; j <= i; j++) copia[j] ??= { ...CORREDOR_VACIO };
      copia[i] = { ...copia[i], [k]: valor };
      return copia;
    });
    revisar(`r${i}-${k}`, valor, REGLAS_CORREDOR[k]);
  };

  /* ---------- Envío ---------- */
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setAlertaEnvio('');
    if (!acepta) {
      setErrores((x) => ({ ...x, acepta: 'Debes aceptar para continuar.' }));
      setAlertaEnvio('Para continuar, acepta el reglamento y la carta responsiva.');
      return;
    }
    const data = armarInscripcion(s.seleccion, corredores, contacto);
    setEnviando(true);
    const r = await enviar(data);
    setEnviando(false);
    if (r === 'conectando') return setAlertaEnvio('Todavía estamos conectando con la base de datos. Intenta de nuevo en unos segundos.');
    if (r === 'numeros') return; // el asistente regresó al paso 2 con el aviso
    setConfirmacion({ data, resultado: r });
    if (r !== 'fallo') {
      setContacto(CONTACTO_VACIO);
      setCorredores([]);
      setErrores({});
      setAcepta(false);
    }
  }

  const campo = (id: string, label: string, control: ReactNode, className = '') => (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[14px] font-semibold">
        {label}
      </label>
      {control}
      {errores[id] && (
        <p id={`${id}-error`} className="mt-1 text-[13px] font-medium text-rojo-700">
          {errores[id]}
        </p>
      )}
    </div>
  );
  const borde = (id: string) => (errores[id] ? 'border-rojo' : 'border-ink/25');
  const aria = (id: string) => ({ 'aria-invalid': !!errores[id], 'aria-describedby': errores[id] ? `${id}-error` : undefined });

  const resumen = s.paso === 4 ? armarInscripcion(s.seleccion, corredores, contacto) : null;

  return (
    <section id="inscripcion" className="bg-paper-2 py-24 lg:py-32">
      <Wrap>
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Km n="10" ko="참가 신청">
              Meta
            </Km>
            <h2 className="display mt-6 text-[clamp(3.2rem,9vw,7rem)]">Inscríbete</h2>
          </div>
          {/* ✏️ CAMBIAR: precio visible (debe coincidir con CONFIG.categorias en src/config.ts) */}
          <p className="text-[17px] text-ink/80 lg:col-span-5">
            <strong className="text-ink">{pesos(PRECIO)} por corredor</strong> en cualquier distancia. Inscríbete solo o en grupo y <strong className="text-ink">elige tu propio número</strong>.
            Cada inscripción apoya a los 10 jóvenes voluntarios de Granito de Arena.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-4xl">
          <ol ref={pasosRef} className="grid scroll-mt-24 grid-cols-4 gap-1.5" aria-label="Pasos de la inscripción">
            {PASOS.map(([n, texto]) => {
              const hecho = n < s.paso;
              const actual = n === s.paso;
              return (
                <li key={n}>
                  <button
                    type="button"
                    disabled={!hecho}
                    onClick={() => intentarIr(n)}
                    aria-current={actual ? 'step' : undefined}
                    className="group w-full text-left disabled:cursor-default"
                  >
                    <span className={`block h-1.5 rounded-full ${actual ? 'bg-rojo' : hecho ? 'bg-ink group-hover:bg-rojo' : 'bg-ink/15'}`} />
                    <span className={`mt-2 flex items-center gap-1.5 text-[13px] font-semibold ${actual || hecho ? 'text-ink' : 'text-muted'}`}>
                      <span className="tabular-nums">{hecho ? <Check size={14} /> : `0${n}`}</span>
                      <span className="hidden sm:inline">{texto}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <form onSubmit={onSubmit} noValidate className="mt-6 rounded-[6px] bg-card p-5 shadow-[0_30px_60px_-40px_rgb(28_20_10/0.5)] ring-1 ring-ink/10 sm:p-8">
            {s.restante !== null && (
              <div
                role="timer"
                className={`sticky top-[4.5rem] z-20 -mx-1 mb-6 flex items-center gap-3 rounded-[4px] px-4 py-3 text-[14px] ${s.restante <= 60 ? 'bg-rojo-700 text-white' : 'bg-sol/20 text-ink'}`}
              >
                <Timer size={18} className="shrink-0" />
                <span>
                  Tus números están apartados por{' '}
                  <b className="tabular-nums">
                    {Math.floor(s.restante / 60)}:{String(s.restante % 60).padStart(2, '0')}
                  </b>
                  . Termina tu registro antes de que se acabe el tiempo.
                </span>
              </div>
            )}

            {/* ========== PASO 1: ¿Cuántos corredores? ========== */}
            {s.paso === 1 && (
              <div>
                <h3 className="text-2xl font-bold condensed">¿Cuántos corredores vas a inscribir?</h3>
                <p className="mt-2 text-ink/75">
                  Elige <strong>1</strong> si te inscribes solo. Si inscribes a tu familia, amigos o equipo, indica cuántos son (máximo {CONFIG.corredoresMaximo}).
                </p>
                <div className="mt-8 flex items-center justify-center gap-4">
                  <button type="button" onClick={() => setCantidad(s.cantidad - 1)} aria-label="Quitar un corredor" className="flex size-14 items-center justify-center rounded-full border-2 border-ink hover:bg-ink hover:text-paper">
                    <Minus size={22} />
                  </button>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={CONFIG.corredoresMaximo}
                    value={s.cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    aria-label="Número de corredores"
                    className="display w-28 [appearance:textfield] bg-transparent text-center text-[5rem] tabular-nums outline-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button type="button" onClick={() => setCantidad(s.cantidad + 1)} aria-label="Agregar un corredor" className="flex size-14 items-center justify-center rounded-full border-2 border-ink hover:bg-ink hover:text-paper">
                    <Plus size={22} />
                  </button>
                </div>
                <p className="mt-3 text-center text-ink/75" aria-live="polite">
                  Inscripción <strong>{grupo ? `en grupo de ${s.cantidad} corredores` : 'individual'}</strong> · {pesos(s.cantidad * PRECIO)}
                </p>
                <div className="mt-8">
                  <button type="button" onClick={() => intentarIr(2)} className={`${btn.base} ${btn.primario} ${btn.lg} w-full`}>
                    Siguiente: elegir {grupo ? `${s.cantidad} números` : 'número'} <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* ========== PASO 2: Elegir números ========== */}
            {s.paso === 2 && (
              <div>
                <h3 className="mb-4 text-2xl font-bold condensed">Elige {grupo ? 'tus números' : 'tu número'}</h3>
                <Tablero />
                <Alerta texto={s.alertaNumeros} />
                <Acciones>
                  <button type="button" onClick={() => intentarIr(1)} className={`${btn.base} ${btn.borde} ${btn.md}`}>
                    <ArrowLeft size={17} /> Atrás
                  </button>
                  <button type="button" onClick={() => intentarIr(3)} disabled={s.seleccion.includes(null)} className={`${btn.base} ${btn.primario} ${btn.md}`}>
                    Siguiente: datos <ArrowRight size={17} />
                  </button>
                </Acciones>
              </div>
            )}

            {/* ========== PASO 3: Datos ========== */}
            {s.paso === 3 && (
              <div>
                <h3 className="text-2xl font-bold condensed">Datos de {grupo ? 'los corredores' : 'tu inscripción'}</h3>
                <fieldset className="mt-6 grid gap-4 sm:grid-cols-2">
                  <legend className="mb-4 text-[12px] font-semibold tracking-[0.14em] text-muted uppercase">{grupo ? 'Responsable del grupo' : 'Tus datos de contacto'}</legend>
                  {grupo && (
                    <>
                      {campo(
                        'c-grupo',
                        'Nombre del grupo (equipo, empresa, familia…) *',
                        <input id="c-grupo" type="text" value={contacto.grupo} onChange={(e) => cambiarContacto('grupo', e.target.value)} onBlur={(e) => e.target.value && revisar('c-grupo', e.target.value, REGLAS_CONTACTO.grupo, true)} className={`${INPUT} ${borde('c-grupo')}`} {...aria('c-grupo')} />,
                        'sm:col-span-2',
                      )}
                      {campo(
                        'c-responsable',
                        'Nombre del responsable *',
                        <input id="c-responsable" type="text" autoComplete="name" value={contacto.responsable} onChange={(e) => cambiarContacto('responsable', e.target.value)} onBlur={(e) => e.target.value && revisar('c-responsable', e.target.value, REGLAS_CONTACTO.responsable, true)} className={`${INPUT} ${borde('c-responsable')}`} {...aria('c-responsable')} />,
                        'sm:col-span-2',
                      )}
                    </>
                  )}
                  {campo(
                    'c-correo',
                    'Correo electrónico *',
                    <input id="c-correo" type="email" autoComplete="email" value={contacto.correo} onChange={(e) => cambiarContacto('correo', e.target.value)} onBlur={(e) => e.target.value && revisar('c-correo', e.target.value, REGLAS_CONTACTO.correo, true)} className={`${INPUT} ${borde('c-correo')}`} {...aria('c-correo')} />,
                  )}
                  {campo(
                    'c-telefono',
                    'WhatsApp / teléfono (10 dígitos) *',
                    <input id="c-telefono" type="tel" inputMode="numeric" autoComplete="tel" value={contacto.telefono} onChange={(e) => cambiarContacto('telefono', e.target.value)} onBlur={(e) => e.target.value && revisar('c-telefono', e.target.value, REGLAS_CONTACTO.telefono, true)} className={`${INPUT} ${borde('c-telefono')}`} {...aria('c-telefono')} />,
                  )}
                </fieldset>

                <div className="mt-8 space-y-5">
                  {s.seleccion.map((numero, i) => {
                    const d = corredores[i] ?? CORREDOR_VACIO;
                    const id = (k: keyof DatosCorredor) => `r${i}-${k}`;
                    const texto = (k: keyof DatosCorredor, label: string, extra: Record<string, string> = {}, className = '') =>
                      campo(
                        id(k),
                        label,
                        <input
                          id={id(k)}
                          value={d[k]}
                          onChange={(e) => cambiarCorredor(i, k, e.target.value)}
                          onBlur={(e) => e.target.value && revisar(id(k), e.target.value, REGLAS_CORREDOR[k], true)}
                          className={`${INPUT} ${borde(id(k))}`}
                          {...extra}
                          {...aria(id(k))}
                        />,
                        className,
                      );
                    const lista = (k: keyof DatosCorredor, label: string, opciones: [string, string][]) =>
                      campo(
                        id(k),
                        label,
                        <select
                          id={id(k)}
                          value={d[k]}
                          onChange={(e) => {
                            cambiarCorredor(i, k, e.target.value);
                            revisar(id(k), e.target.value, REGLAS_CORREDOR[k]);
                          }}
                          className={`${INPUT} ${borde(id(k))}`}
                          {...aria(id(k))}
                        >
                          <option value="">Selecciona…</option>
                          {opciones.map(([v, t]) => (
                            <option key={v} value={v}>
                              {t}
                            </option>
                          ))}
                        </select>,
                      );
                    return (
                      <div key={i} className="rounded-[4px] border border-ink/15 p-4 sm:p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <h4 className="text-lg font-bold">{grupo ? `Corredor ${i + 1}` : 'Tus datos'}</h4>
                          <span className="rounded-[3px] border-t-4 border-rojo bg-paper px-2.5 py-1 font-bold tabular-nums">#{numero}</span>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {texto('nombre', 'Nombre completo *', grupo ? { type: 'text' } : { type: 'text', autoComplete: 'name' }, 'sm:col-span-2')}
                          {texto('edad', 'Edad *', { type: 'number', inputMode: 'numeric' })}
                          {lista('sexo', 'Sexo *', CONFIG.sexos.map((x) => [x, x]))}
                          {lista('categoria', 'Distancia *', CONFIG.categorias.map((c) => [c.id, `${c.nombre} — ${pesos(c.precio)}`]))}
                          {lista('talla', 'Talla de playera (unisex) *', CONFIG.tallas.map((x) => [x, x]))}
                          {texto('emergenciaNombre', 'Contacto de emergencia *', { type: 'text' })}
                          {texto('emergenciaTelefono', 'Tel. de emergencia *', { type: 'tel', inputMode: 'numeric' })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Alerta texto={alertaDatos} />
                <Acciones>
                  <button type="button" onClick={() => intentarIr(2)} className={`${btn.base} ${btn.borde} ${btn.md}`}>
                    <ArrowLeft size={17} /> Atrás
                  </button>
                  <button type="button" onClick={() => intentarIr(4, validarDatos)} className={`${btn.base} ${btn.primario} ${btn.md}`}>
                    Siguiente: revisar <ArrowRight size={17} />
                  </button>
                </Acciones>
              </div>
            )}

            {/* ========== PASO 4: Revisar y confirmar ========== */}
            {s.paso === 4 && resumen && (
              <div>
                <h3 className="text-2xl font-bold condensed">Revisa y confirma</h3>
                <div className="mt-5 rounded-[4px] bg-paper p-5" aria-live="polite">
                  <p className="font-bold">{resumen.tipo === 'Grupo' ? `Grupo «${resumen.grupo}»` : 'Tu inscripción'}</p>
                  <ul className="mt-3 divide-y divide-ink/10">
                    {resumen.corredores.map((r) => (
                      <li key={r.numero} className="flex items-center justify-between gap-3 py-2.5 text-[15px]">
                        <span className="min-w-0">
                          <span className="mr-2 font-bold tabular-nums">#{r.numero}</span>
                          {r.nombre} · {r.categoria} · Talla {r.talla}
                        </span>
                        <span className="shrink-0 tabular-nums">{pesos(categoria(r.categoria)?.precio ?? 0)}</span>
                      </li>
                    ))}
                    {!!resumen.descuento && (
                      <li className="flex justify-between py-2.5 text-[15px] text-jardin">
                        <span>Descuento por grupo</span>
                        <span>−{pesos(resumen.descuento)}</span>
                      </li>
                    )}
                  </ul>
                  <p className="mt-2 flex items-baseline justify-between border-t-2 border-ink pt-3">
                    <span className="font-bold">Total a pagar</span>
                    <span className="display text-[2.4rem] tabular-nums">{pesos(resumen.total)}</span>
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    Contacto: {resumen.tipo === 'Grupo' ? `${resumen.responsable} · ${resumen.correo} · ${resumen.telefono}` : `${resumen.corredores[0].correo} · ${resumen.corredores[0].telefono}`}
                  </p>
                </div>

                {/* ✏️ CAMBIAR: instrucciones de pago (el WhatsApp se configura en CONFIG.pago) */}
                <ol className="mt-6 grid gap-4 sm:grid-cols-3">
                  {[
                    ['Aparta tus números', <>Quedan apartados al confirmar esta inscripción.</>],
                    [
                      'Envía un WhatsApp',
                      <>
                        Al terminar aparece un botón para pedir el número de cuenta. {!CONFIG.pago.whatsapp && <Pendiente>WhatsApp</Pendiente>}
                      </>,
                    ],
                    [
                      `Paga en máximo ${CONFIG.pago.diasParaPagar} días`,
                      <>
                        Por transferencia o en los locales que nos apoyan: <Pendiente>lista de locales</Pendiente>. Si no se paga a tiempo, el número puede liberarse.
                      </>,
                    ],
                  ].map(([titulo, texto], i) => (
                    <li key={i} className="border-t-2 border-ink pt-3 text-[14px] text-ink/75">
                      <span className="display text-2xl text-rojo">0{i + 1}</span>
                      <strong className="mt-1 block text-[15px] text-ink">{titulo}</strong>
                      {texto}
                    </li>
                  ))}
                </ol>

                <label className={`mt-7 flex items-start gap-3 rounded-[4px] p-3 text-[15px] ${errores.acepta && !acepta ? 'bg-rojo/10 ring-1 ring-rojo' : 'bg-paper'}`}>
                  <input
                    type="checkbox"
                    checked={acepta}
                    onChange={(e) => setAcepta(e.target.checked)}
                    className="mt-0.5 size-5 shrink-0 accent-rojo"
                  />
                  <span>
                    {grupo ? 'Como responsable, confirmo que todos los integrantes leyeron y aceptan el ' : 'He leído y acepto el '}
                    <button type="button" onClick={abrirReglamento} className="font-semibold underline decoration-rojo decoration-2 underline-offset-2">
                      reglamento y carta responsiva
                    </button>
                    . *
                  </span>
                </label>

                <Alerta texto={alertaEnvio} />
                <Acciones>
                  <button type="button" onClick={() => intentarIr(3)} className={`${btn.base} ${btn.borde} ${btn.md}`}>
                    <ArrowLeft size={17} /> Atrás
                  </button>
                  <button type="submit" disabled={enviando} className={`${btn.base} ${btn.primario} ${btn.lg}`}>
                    {enviando ? (
                      <>
                        <LoaderCircle size={18} className="animate-spin" /> Apartando tus números…
                      </>
                    ) : grupo ? (
                      'Inscribir al grupo'
                    ) : (
                      'Confirmar inscripción'
                    )}
                  </button>
                </Acciones>
              </div>
            )}
          </form>
        </div>
      </Wrap>
      <Confirmado confirmacion={confirmacion} onClose={() => setConfirmacion(null)} />
    </section>
  );
}

function Alerta({ texto }: { texto: string }) {
  if (!texto) return null;
  return (
    <p role="alert" className="mt-5 flex gap-2.5 rounded-[4px] bg-rojo/10 px-4 py-3 text-[15px] text-rojo-700">
      <TriangleAlert size={18} className="mt-0.5 shrink-0" />
      {texto}
    </p>
  );
}

const Acciones = ({ children }: { children: ReactNode }) => <div className="mt-8 flex flex-wrap justify-between gap-3">{children}</div>;

/** Ventana de confirmación con instrucciones de pago; si falló la conexión, muestra los datos para copiarlos. */
function Confirmado({ confirmacion, onClose }: { confirmacion: Confirmacion | null; onClose: () => void }) {
  const [copiado, setCopiado] = useState(false);
  const ultimo = useRef<Confirmacion | null>(null);
  if (confirmacion) ultimo.current = confirmacion;
  const c = confirmacion ?? ultimo.current;
  if (!c) return null;

  const { data, resultado } = c;
  const fallo = resultado === 'fallo';
  const nums = data.corredores.map((r) => r.numero);
  const wa = enlaceWhatsApp(data);
  const texto = `${comoTexto(data)}\n\n--- Filas para hoja de cálculo ---\n${comoFilas(data)}`;

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      const ta = document.getElementById('datos-inscripcion') as HTMLTextAreaElement | null;
      ta?.select();
      document.execCommand('copy');
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <Dialog open={!!confirmacion} onClose={onClose} titulo={fallo ? 'No pudimos enviar tu inscripción' : '¡Gracias por sumar tu paso!'}>
      {/* ✏️ CAMBIAR: textos del mensaje de confirmación */}
      {fallo ? (
        <p className="text-ink/80">Hubo un problema de conexión. Copia tus datos y envíalos por WhatsApp o correo al organizador.</p>
      ) : (
        <div className="space-y-4 text-[15px] text-ink/85">
          {data.tipo === 'Individual' && <Dorsal numero={nums[0]} nombre={data.corredores[0].nombre.split(' ')[0]} pie={data.corredores[0].categoria} className="mx-auto max-w-[17rem] -rotate-1 text-[12px]" />}
          <p>
            <span lang="ko" className="font-ko text-xl">
              감사합니다!
            </span>{' '}
            Tu inscripción a <strong>HANGUK RUN</strong> quedó registrada.
          </p>
          <p>
            {data.tipo === 'Grupo' ? (
              <>
                Grupo <strong>{data.grupo}</strong> ({nums.length} corredores)
              </>
            ) : (
              <strong>{data.corredores[0].nombre}</strong>
            )}
            <br />
            {nums.length > 1 ? 'Números: ' : 'Tu número: '}
            <strong>{nums.map((n) => `#${n}`).join(', ')}</strong>
            <br />
            Total a pagar: <strong>{pesos(data.total)}</strong>
          </p>
          <div className="rounded-[4px] bg-sol/15 p-4">
            <p className="font-bold text-ink">Siguiente paso: realiza tu pago</p>
            <p className="mt-1">
              Tienes <strong>{CONFIG.pago.diasParaPagar} días</strong> para pagar, a más tardar el <strong>{data.pagarAntesDe}</strong>. Envíanos un WhatsApp para recibir el
              número de cuenta, o paga en los locales que nos apoyan.
            </p>
            {wa ? (
              <a href={wa} target="_blank" rel="noopener" className={`${btn.base} ${btn.primario} ${btn.md} mt-4 w-full`}>
                Pedir número de cuenta por WhatsApp
              </a>
            ) : (
              <p className="mt-3">
                <Pendiente>número de WhatsApp para pagos</Pendiente>
              </p>
            )}
          </div>
          <p>
            Cada inscripción apoya a los <strong>10 jóvenes voluntarios de Granito de Arena</strong> que representarán a su comunidad en Corea del Sur.{' '}
            <span lang="ko">가자!</span>
          </p>
        </div>
      )}

      {resultado !== 'ok' && (
        <div className="mt-6">
          <p className="text-sm text-muted">{fallo ? 'Tus datos:' : 'Vista de datos (modo demostración). Cópialos y pégalos en tu hoja de cálculo o WhatsApp:'}</p>
          <textarea id="datos-inscripcion" readOnly rows={8} value={texto} className="mt-2 w-full rounded-[3px] border border-ink/20 bg-paper p-3 font-mono text-[12px]" />
          <button type="button" onClick={copiar} className={`${btn.base} ${btn.borde} ${btn.md} mt-2 w-full`}>
            {copiado ? <Check size={17} /> : <Copy size={17} />} {copiado ? '¡Copiado!' : 'Copiar datos'}
          </button>
        </div>
      )}
      <button type="button" onClick={onClose} className={`${btn.base} ${btn.tinta} ${btn.md} mt-6 w-full`}>
        Listo
      </button>
    </Dialog>
  );
}
