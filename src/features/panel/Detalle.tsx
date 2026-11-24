import { useState } from 'react';
import { Ban, CircleCheck, Mail, MessageCircle, RotateCcw } from 'lucide-react';
import { fechaHora, fechaLarga, pesos } from '../../shared/format';
import { Alerta } from '../../shared/ui/Alerta';
import { Button } from '../../shared/ui/Button';
import { Dialog } from '../../shared/ui/Dialog';
import { TextField } from '../../shared/ui/fields';
import { useToast } from '../../shared/ui/Toast';
import type { ErrorBase } from '../../services/supabase/client';
import { cambiarEstadoPago, guardarNotas, type EstadoPago, type InscripcionPanel } from '../../services/supabase/panel';
import { EstadoBadge } from './EstadoBadge';

const MENSAJES: Record<string, string> = {
  'sin-permiso': 'Tu cuenta no es de organizador.',
  'ya-cancelada': 'Una inscripción cancelada no se reactiva: sus números ya se liberaron. Pide a la persona que se inscriba de nuevo.',
};

/** Detalle de una inscripción, con el cambio de estado de pago y las notas internas. */
export function Detalle({ ins, onClose, alCambiar }: { ins: InscripcionPanel | null; onClose: () => void; alCambiar: () => void }) {
  const toast = useToast();
  const [notas, setNotas] = useState(ins?.notas ?? '');
  const [ocupado, setOcupado] = useState<EstadoPago | 'notas' | null>(null);
  const [confirmarCancelar, setConfirmarCancelar] = useState(false);
  const [error, setError] = useState('');

  if (!ins) return null;

  const cambiar = async (estado: EstadoPago) => {
    setOcupado(estado);
    setError('');
    try {
      await cambiarEstadoPago(ins.id, estado);
      toast.show({
        message:
          estado === 'pagado'
            ? `Folio ${ins.folio} marcado como pagado`
            : estado === 'cancelado'
              ? `Folio ${ins.folio} cancelado; sus números quedaron libres`
              : `Folio ${ins.folio} otra vez pendiente`,
        tone: 'success',
      });
      setConfirmarCancelar(false);
      alCambiar();
    } catch (e) {
      setError(MENSAJES[(e as ErrorBase).codigo] ?? 'No se guardó el cambio. Revisa tu conexión e intenta de nuevo.');
    } finally {
      setOcupado(null);
    }
  };

  const guardar = async () => {
    setOcupado('notas');
    try {
      await guardarNotas(ins.id, notas);
      toast.show({ message: 'Notas guardadas', tone: 'success' });
      alCambiar();
    } catch {
      setError('No se guardaron las notas. Intenta de nuevo.');
    } finally {
      setOcupado(null);
    }
  };

  const wa = `https://wa.me/52${ins.telefono}`;
  return (
    <Dialog open onClose={onClose} title={`Folio ${ins.folio}`} width="44rem">
      <div className="flex flex-wrap items-center gap-2">
        <EstadoBadge ins={ins} />
        <span className="text-small text-fg-muted">
          Inscrita el {fechaHora(ins.creado)}. Pagar a más tardar el {fechaLarga(ins.pagarAntesDe)}.
        </span>
      </div>

      <dl className="mt-5 grid gap-3 rounded-md bg-sunken p-4 sm:grid-cols-2">
        {ins.tipo === 'Grupo' ? (
          <div className="sm:col-span-2">
            <dt className="text-small text-fg-muted">Grupo</dt>
            <dd className="font-semibold">
              {ins.grupo}, responsable {ins.responsable}
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="text-small text-fg-muted">Correo</dt>
          <dd className="font-semibold [overflow-wrap:anywhere]">{ins.correo}</dd>
        </div>
        <div>
          <dt className="text-small text-fg-muted">WhatsApp</dt>
          <dd className="font-semibold tabular-nums">{ins.telefono}</dd>
        </div>
        <div>
          <dt className="text-small text-fg-muted">Total</dt>
          <dd className="cifra text-[1.8rem]">{pesos(ins.total)}</dd>
        </div>
      </dl>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button label="Escribir por WhatsApp" icon={MessageCircle} variant="quiet" size="sm" href={wa} />
        <Button label="Enviar correo" icon={Mail} variant="quiet" size="sm" href={`mailto:${ins.correo}?subject=HANGUK%20RUN%2C%20folio%20${ins.folio}`} />
      </div>

      <h3 className="mt-6 subtitulo">{ins.corredores.length > 1 ? `${ins.corredores.length} corredores` : 'Corredor'}</h3>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-small">
          <thead className="text-left text-fg-muted">
            <tr>
              <th className="py-2 pr-3 font-semibold">Núm.</th>
              <th className="py-2 pr-3 font-semibold">Nombre</th>
              <th className="py-2 pr-3 font-semibold">Edad</th>
              <th className="py-2 pr-3 font-semibold">Distancia</th>
              <th className="py-2 pr-3 font-semibold">Talla</th>
              <th className="py-2 font-semibold">Emergencia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {ins.corredores.map((c) => (
              <tr key={c.numero}>
                <td className="py-2 pr-3 font-bold tabular-nums">#{c.numero}</td>
                <td className="py-2 pr-3">
                  {c.nombre}
                  <span className="block text-fg-muted">{c.sexo}</span>
                </td>
                <td className="py-2 pr-3 tabular-nums">{c.edad}</td>
                <td className="py-2 pr-3">{c.categoria}</td>
                <td className="py-2 pr-3">{c.talla}</td>
                <td className="py-2">
                  {c.emergenciaNombre}
                  <span className="block text-fg-muted tabular-nums">{c.emergenciaTelefono}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-end gap-2">
        <TextField label="Notas internas" hint="Solo las ven los organizadores" value={notas} onChangeText={setNotas} className="flex-1" maxLength={500} />
        <Button label="Guardar" variant="secondary" onPress={guardar} loading={ocupado === 'notas'} disabled={notas === ins.notas} className={notas === ins.notas ? '' : 'mb-6'} />
      </div>

      <Alerta className="mt-4">{error}</Alerta>

      {ins.estadoPago !== 'cancelado' ? (
        <div className="mt-6 flex flex-wrap justify-between gap-3 border-t-[1.5px] border-line pt-5">
          {confirmarCancelar ? (
            <div className="flex w-full flex-wrap items-center gap-3 rounded-md bg-danger-soft p-3">
              <p className="flex-1 text-small font-semibold text-danger">¿Cancelar el folio {ins.folio}? Sus números quedan libres para otras personas y no se puede deshacer.</p>
              <Button label="No" variant="quiet" size="sm" onPress={() => setConfirmarCancelar(false)} />
              <Button label="Sí, cancelar" variant="danger" size="sm" onPress={() => cambiar('cancelado')} loading={ocupado === 'cancelado'} />
            </div>
          ) : (
            <>
              <Button label="Cancelar inscripción" icon={Ban} variant="quiet" onPress={() => setConfirmarCancelar(true)} />
              {ins.estadoPago === 'pendiente' ? (
                <Button label="Marcar como pagado" icon={CircleCheck} onPress={() => cambiar('pagado')} loading={ocupado === 'pagado'} />
              ) : (
                <Button label="Regresar a pendiente" icon={RotateCcw} variant="secondary" onPress={() => cambiar('pendiente')} loading={ocupado === 'pendiente'} />
              )}
            </>
          )}
        </div>
      ) : null}
    </Dialog>
  );
}
