import { Copy, MessageCircle } from 'lucide-react';
import { CONFIG } from '../../config';
import { pesos } from '../../shared/format';
import { Button } from '../../shared/ui/Button';
import { Dialog } from '../../shared/ui/Dialog';
import { useToast } from '../../shared/ui/Toast';
import { Pendiente } from '../layout/Seccion';
import { TiraPatrocinadores } from '../portada/TiraPatrocinadores';
import { comoTexto, enlaceWhatsApp } from './datos';
import { Dorsal } from './Dorsal';
import type { ResultadoEnvio } from './store';

type Final = Extract<ResultadoEnvio, { data: unknown }>;

/** Ventana final: el dorsal "se pega" y vienen las instrucciones de pago. Si falló, los datos para copiarlos. */
export function Confirmado({ resultado: r, open, onClose }: { resultado: Final | null; open: boolean; onClose: () => void }) {
  const toast = useToast();
  if (!r) return null;

  const { data } = r;
  const fallo = r.tipo === 'fallo';
  const nums = data.corredores.map((c) => c.numero);
  const wa = enlaceWhatsApp(data);
  const texto = comoTexto(data);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      toast.show({ message: 'Datos copiados', tone: 'success' });
    } catch {
      toast.show({ message: 'No se pudieron copiar. Selecciona el texto y cópialo a mano.', tone: 'danger' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={fallo ? 'No se envió tu inscripción' : '¡Ya estás en la carrera!'} width="36rem">
      {fallo ? (
        <p className="text-fg-muted">
          Hubo un problema de conexión y tus números siguen apartados unos minutos. Intenta confirmar de nuevo; si sigue fallando, copia tus datos y mándalos por correo a Granito
          de Arena.
        </p>
      ) : (
        <div className="space-y-5">
          <div className="flex justify-center py-2">
            <Dorsal
              numero={nums[0]}
              nombre={data.tipo === 'Individual' ? data.corredores[0].nombre.split(' ')[0] : data.grupo}
              pie={data.tipo === 'Individual' ? data.corredores[0].categoria : `${nums.length} corredores`}
              className="w-[min(100%,17rem)] -rotate-2 animate-[estampar_var(--duration-slow)_var(--ease-stamp)] text-[11px]"
            />
          </div>
          <p>
            <span lang="ko" className="text-[1.3rem]">
              감사합니다!
            </span>{' '}
            Gracias por sumar tu paso.{' '}
            {data.folio ? (
              <>
                Tu folio es el <strong>{data.folio}</strong>.
              </>
            ) : null}
          </p>
          <dl className="grid grid-cols-2 gap-3 rounded-lg bg-sunken p-4">
            <div>
              <dt className="text-small text-fg-muted">{nums.length > 1 ? 'Números' : 'Tu número'}</dt>
              <dd className="font-display text-[1.2rem] font-semibold">{nums.map((n) => `#${n}`).join(', ')}</dd>
            </div>
            <div>
              <dt className="text-small text-fg-muted">Total a pagar</dt>
              <dd className="font-display text-[1.2rem] font-semibold">{pesos(data.total)}</dd>
            </div>
          </dl>
          <div className="rounded-lg bg-accent p-5 text-on-accent estampa-sm">
            <p className="subtitulo">Ahora, tu pago</p>
            <p className="mt-1">
              Paga a más tardar el <strong>{data.pagarAntesDe}</strong> ({CONFIG.pago.diasParaPagar} días). Pide el número de cuenta por WhatsApp o paga en los locales que nos
              apoyan.
            </p>
            {wa ? (
              <Button label="Pedir número de cuenta" icon={MessageCircle} variant="ink" href={wa} fullWidth className="mt-4" />
            ) : (
              <p className="mt-3">
                <Pendiente>WhatsApp para pagos</Pendiente>
              </p>
            )}
          </div>
          <p className="text-small text-fg-muted">Tu inscripción apoya a los 10 jóvenes voluntarios de Granito de Arena que representarán a su comunidad en Corea del Sur.</p>
          <TiraPatrocinadores className="border-t-[1.5px] border-line pt-4" />
        </div>
      )}

      {r.tipo !== 'ok' ? (
        <div className="mt-6">
          <label htmlFor="datos-inscripcion" className="text-small text-fg-muted">
            {fallo ? 'Tus datos' : 'Modo demostración: nada se envió. Así quedarían tus datos:'}
          </label>
          <textarea id="datos-inscripcion" readOnly rows={7} value={texto} className="mt-2 w-full rounded-md border-[2px] border-line-strong bg-surface p-3 font-sans text-small" />
          <Button label="Copiar datos" icon={Copy} variant="secondary" fullWidth className="mt-2" onPress={copiar} />
        </div>
      ) : null}
      <Button label="Listo" variant="quiet" fullWidth className="mt-6" onPress={onClose} />
    </Dialog>
  );
}
