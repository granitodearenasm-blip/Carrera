import { useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import { Alerta } from '../../shared/ui/Alerta';
import { Button } from '../../shared/ui/Button';
import { Chip } from '../../shared/ui/Chip';
import { TextField } from '../../shared/ui/fields';
import { mensajeDePago, reportarPago, type MetodoPago, type PagoReportado } from '../../services/supabase/pagos';

/** Formulario para avisar que ya pagó: transferencia (con referencia) o efectivo. También corrige un aviso. */
export function ReportarPago({ folio, correo, previo, alListo }: { folio: number; correo: string; previo: PagoReportado | null; alListo: () => void }) {
  const [metodo, setMetodo] = useState<MetodoPago>(previo?.metodo ?? 'transferencia');
  const [referencia, setReferencia] = useState(previo?.referencia ?? '');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const transferencia = metodo === 'transferencia';
  const faltaReferencia = transferencia && referencia.trim().length < 4;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (faltaReferencia) {
      setError('Escribe la clave de rastreo o el número de referencia que te dio tu banco.');
      return;
    }
    setEnviando(true);
    setError('');
    try {
      await reportarPago(folio, correo, metodo, referencia);
      alListo();
    } catch (err) {
      setError(mensajeDePago(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <div>
        <p id="metodo-pago" className="text-small font-bold">
          ¿Cómo pagaste?
        </p>
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="metodo-pago">
          <Chip pressed={transferencia} onPress={() => setMetodo('transferencia')}>
            Transferencia o depósito
          </Chip>
          <Chip pressed={!transferencia} onPress={() => setMetodo('efectivo')}>
            Efectivo
          </Chip>
        </div>
      </div>
      <TextField
        label={transferencia ? 'Clave de rastreo o referencia' : '¿Dónde pagaste o quién te atendió? (opcional)'}
        hint={transferencia ? 'Viene en el comprobante de tu app del banco. Con ella encontramos tu pago más rápido.' : 'Nos ayuda a ubicar tu pago.'}
        value={referencia}
        onChangeText={setReferencia}
        maxLength={80}
        required={transferencia}
      />
      <Alerta>{error}</Alerta>
      <Button label={previo ? 'Guardar cambios' : 'Avisar mi pago'} icon={Send} type="submit" fullWidth loading={enviando} />
    </form>
  );
}
