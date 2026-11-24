import { Copy } from 'lucide-react';
import { CONFIG } from '../../config';
import { IconButton } from '../../shared/ui/IconButton';
import { useCopiar } from '../../shared/ui/useCopiar';

// La CLABE se muestra en grupos de 3-3-11-1 (banco, plaza, cuenta, control) para leerla sin perderse.
const clabeLegible = (c: string) => c.replace(/^(\d{3})(\d{3})(\d{11})(\d)$/, '$1 $2 $3 $4');

/** Cuenta para transferir, con la CLABE y el concepto listos para copiar, y la opción de efectivo. */
export function DatosCuenta({ folio, className = '' }: { folio?: number; className?: string }) {
  const copiar = useCopiar();
  const { banco, clabe, titular, efectivo } = CONFIG.pago;
  return (
    <div className={`rounded-md bg-surface p-4 text-fg contorno-fino ${className}`}>
      <p className="text-small font-bold text-fg-muted">Transferencia o depósito</p>
      <dl className="mt-2 grid gap-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <dt className="text-small text-fg-muted">CLABE ({banco})</dt>
            <dd className="font-display text-[1.15rem] font-semibold tracking-wide tabular-nums">{clabeLegible(clabe)}</dd>
          </div>
          <IconButton icon={Copy} label="Copiar CLABE" variant="secondary" size="sm" onPress={() => void copiar(clabe, 'CLABE copiada')} />
        </div>
        <div>
          <dt className="text-small text-fg-muted">A nombre de</dt>
          <dd className="font-semibold">{titular}</dd>
        </div>
        {folio ? (
          <div className="flex items-center justify-between gap-2">
            <div>
              <dt className="text-small text-fg-muted">Concepto</dt>
              <dd className="font-semibold">Folio {folio}</dd>
            </div>
            <IconButton icon={Copy} label="Copiar concepto" variant="secondary" size="sm" onPress={() => void copiar(`Folio ${folio}`, 'Concepto copiado')} />
          </div>
        ) : null}
      </dl>
      <p className="mt-3 border-t-[1.5px] border-line pt-3 text-small">
        <strong>En efectivo:</strong> {efectivo}
        {folio ? ', diciendo tu folio' : ''}.
      </p>
    </div>
  );
}
