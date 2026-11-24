import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { CONFIG } from '../../config';
import { fechaHora, fechaLarga, pesos } from '../../shared/format';
import { Alerta } from '../../shared/ui/Alerta';
import { Badge } from '../../shared/ui/Badge';
import { Button } from '../../shared/ui/Button';
import type { EstadoInscripcion as Estado } from '../../services/supabase/pagos';
import { DatosCuenta } from './DatosCuenta';
import { ReportarPago } from './ReportarPago';

const HOY = new Date(new Date().setHours(0, 0, 0, 0));

function Etiqueta({ e }: { e: Estado }) {
  if (e.estadoPago === 'pagado') return <Badge tone="success">Pago confirmado</Badge>;
  if (e.estadoPago === 'cancelado') return <Badge>Cancelada</Badge>;
  if (e.reporte) return <Badge tone="info">Pago en revisión</Badge>;
  return e.pagarAntesDe < HOY ? <Badge tone="danger">Pago vencido</Badge> : <Badge tone="sand">Pendiente de pago</Badge>;
}

/** Lo que ve el corredor de su inscripción, y desde aquí avisa (o corrige) su pago. */
export function EstadoInscripcion({ e, correo, alReportar }: { e: Estado; correo: string; alReportar: () => void }) {
  const [corrigiendo, setCorrigiendo] = useState(false);
  const pendiente = e.estadoPago === 'pendiente';
  const r = e.reporte;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-[1.6rem] font-bold">Folio {e.folio}</h2>
        <Etiqueta e={e} />
      </div>
      <dl className="grid grid-cols-2 gap-3 rounded-lg bg-sunken p-4">
        <div>
          <dt className="text-small text-fg-muted">{e.numeros.length > 1 ? 'Números' : 'Tu número'}</dt>
          <dd className="font-display text-[1.2rem] font-semibold">{e.numeros.map((n) => `#${n}`).join(', ')}</dd>
        </div>
        <div>
          <dt className="text-small text-fg-muted">Total</dt>
          <dd className="font-display text-[1.2rem] font-semibold">{pesos(e.total)}</dd>
        </div>
        {pendiente ? (
          <div className="col-span-2">
            <dt className="text-small text-fg-muted">Pagar a más tardar el</dt>
            <dd className="font-semibold">{fechaLarga(e.pagarAntesDe)}</dd>
          </div>
        ) : null}
      </dl>

      {e.estadoPago === 'pagado' ? <Alerta tone="success">¡Listo! Recibimos tu pago y tu lugar en {CONFIG.nombreCarrera} está confirmado. Nos vemos en la salida.</Alerta> : null}
      {e.estadoPago === 'cancelado' ? <Alerta tone="info">Esta inscripción se canceló y sus números quedaron libres. Si crees que es un error, escríbenos.</Alerta> : null}

      {pendiente && r && !corrigiendo ? (
        <>
          <Alerta tone="info">
            Recibimos tu aviso del {fechaHora(r.cuando)}: {r.metodo === 'transferencia' ? 'transferencia' : 'pago en efectivo'}
            {r.referencia ? `, referencia «${r.referencia}»` : ''}. Lo vamos a revisar y aquí mismo verás cuando quede confirmado.
          </Alerta>
          <Button label="Corregir mi aviso" icon={Pencil} variant="quiet" onPress={() => setCorrigiendo(true)} />
        </>
      ) : null}

      {pendiente && (!r || corrigiendo) ? (
        <>
          {!r ? (
            <>
              {e.pagarAntesDe < HOY ? <Alerta>Tu plazo ya venció. Paga lo antes posible: tus números pueden liberarse para otra persona.</Alerta> : null}
              <DatosCuenta folio={e.folio} />
            </>
          ) : null}
          <ReportarPago
            folio={e.folio}
            correo={correo}
            previo={r}
            alListo={() => {
              setCorrigiendo(false);
              alReportar();
            }}
          />
        </>
      ) : null}
    </div>
  );
}
