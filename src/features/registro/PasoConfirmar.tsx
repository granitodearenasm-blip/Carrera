import { useState, type FormEvent } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CONFIG } from '../../config';
import { pesos } from '../../shared/format';
import { Alerta } from '../../shared/ui/Alerta';
import { Button } from '../../shared/ui/Button';
import { Checkbox } from '../../shared/ui/fields';
import { abrirReglamento } from '../layout/eventos';
import { armarInscripcion } from './datos';
import { enviar, intentarIr, useRegistro, type ResultadoEnvio } from './store';
import type { Formulario } from './useFormulario';

/** Paso 4: resumen, aceptación del reglamento y envío. */
export function PasoConfirmar({ f, alTerminar }: { f: Formulario; alTerminar: (r: ResultadoEnvio) => void }) {
  const s = useRegistro();
  const [acepta, setAcepta] = useState(false);
  const [error, setError] = useState('');
  const [alerta, setAlerta] = useState('');
  const [enviando, setEnviando] = useState(false);
  const resumen = armarInscripcion(s.seleccion, f.corredores, f.contacto);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setAlerta('');
    if (!acepta) {
      setError('Para inscribirte, marca que aceptas el reglamento y la carta responsiva.');
      return;
    }
    setEnviando(true);
    const r = await enviar(resumen);
    setEnviando(false);
    if (r.tipo === 'conectando') return setAlerta('Todavía estamos conectando con la base de datos. Intenta de nuevo en unos segundos.');
    if (r.tipo === 'cerrado') return setAlerta('Las inscripciones están cerradas. Escríbenos si necesitas ayuda.');
    if (r.tipo === 'numeros') return; // el asistente regresó al paso 2 con el aviso
    if (r.tipo !== 'fallo') {
      f.limpiar();
      setAcepta(false);
    }
    alTerminar(r);
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <h3 tabIndex={-1} className="titulo">
        Revisa y confirma
      </h3>

      <div className="mt-6 rounded-lg bg-sunken p-5 sm:p-6">
        <p className="subtitulo">{resumen.tipo === 'Grupo' ? `Grupo ${resumen.grupo}` : 'Tu inscripción'}</p>
        <ul className="mt-3 divide-y-[1.5px] divide-line">
          {resumen.corredores.map((r) => (
            <li key={r.numero} className="flex items-center gap-4 py-3">
              <span className="w-16 shrink-0 cifra text-[1.6rem]">#{r.numero}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{r.nombre}</span>
                <span className="text-small text-fg-muted">
                  {CONFIG.categorias.find((c) => c.id === r.categoria)?.nombre}, playera {r.talla}
                </span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex items-baseline justify-between border-t-[2.5px] border-outline pt-3">
          <span className="font-semibold">Total a pagar</span>
          <span className="cifra text-[2.6rem]">{pesos(resumen.total)}</span>
        </p>
        <p className="mt-1 text-small text-fg-muted">
          Te contactamos en {resumen.correo} o al {resumen.telefono}.
        </p>
      </div>

      <h4 className="mt-8 subtitulo">Después de confirmar</h4>
      <ol className="mt-4 grid gap-4 sm:grid-cols-3">
        <li className="rounded-md bg-surface p-4 contorno-fino">
          <span className="cifra text-[1.6rem] text-danger">1</span>
          <strong className="mt-1 block">Tus números quedan tuyos</strong>
          <span className="text-small text-fg-muted">Se marcan como ocupados en el tablero.</span>
        </li>
        <li className="rounded-md bg-surface p-4 contorno-fino">
          <span className="cifra text-[1.6rem] text-danger">2</span>
          <strong className="mt-1 block">Pagas en {CONFIG.pago.diasParaPagar} días</strong>
          <span className="text-small text-fg-muted">Por transferencia, con tu folio como concepto, o en efectivo {CONFIG.pago.efectivo}. Si no, el número puede liberarse.</span>
        </li>
        <li className="rounded-md bg-surface p-4 contorno-fino">
          <span className="cifra text-[1.6rem] text-danger">3</span>
          <strong className="mt-1 block">Nos avisas que pagaste</strong>
          <span className="text-small text-fg-muted">En «Mi inscripción» dejas tu referencia y ves cuándo queda confirmado.</span>
        </li>
      </ol>

      <div className="mt-8">
        <Checkbox
          checked={acepta}
          onChange={(v) => {
            setAcepta(v);
            if (v) setError('');
          }}
          error={error}
        >
          {f.grupo ? 'Como responsable, confirmo que todo el grupo leyó y acepta el ' : 'Leí y acepto el '}
          <button type="button" onClick={abrirReglamento} className="cursor-pointer font-bold text-link underline decoration-2 underline-offset-2">
            reglamento y la carta responsiva
          </button>
          .
        </Checkbox>
      </div>

      <Alerta className="mt-5">{alerta}</Alerta>

      <div className="mt-8 flex flex-wrap justify-between gap-3">
        <Button label="Corregir datos" icon={ArrowLeft} variant="quiet" onPress={() => intentarIr(3)} />
        <Button label={enviando ? 'Confirmando…' : f.grupo ? 'Inscribir al grupo' : 'Confirmar inscripción'} type="submit" size="lg" loading={enviando} />
      </div>
    </form>
  );
}
