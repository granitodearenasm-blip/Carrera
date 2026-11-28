import { useState, type FormEvent, type ReactNode } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { CONFIG } from '../../config';
import { fechaCorta, pesos, soloDigitos } from '../../shared/format';
import { Alerta } from '../../shared/ui/Alerta';
import { Badge } from '../../shared/ui/Badge';
import { Button } from '../../shared/ui/Button';
import { Checkbox, Select, TextField } from '../../shared/ui/fields';
import { Dialog } from '../../shared/ui/Dialog';
import { IconButton } from '../../shared/ui/IconButton';
import { useToast } from '../../shared/ui/Toast';
import { agregarGasto, agregarPatrocinio, borrarGasto, borrarPatrocinio, cambiarEstadoPatrocinio, type Gasto, type Patrocinio } from '../../services/supabase/finanzas';

// Altas y bajas de patrocinios y gastos. Borrar pide confirmación en una ventana.

/** Pide confirmar antes de borrar un renglón. */
function useBorrar(recargar: () => void) {
  const [pendiente, setPendiente] = useState<{ texto: string; accion: () => Promise<void> } | null>(null);
  const toast = useToast();
  const confirmar = () => {
    if (!pendiente) return;
    pendiente
      .accion()
      .then(() => {
        toast.show({ message: 'Borrado', tone: 'success' });
        recargar();
      })
      .catch(() => toast.show({ message: 'No se pudo borrar. Intenta de nuevo.', tone: 'danger' }))
      .finally(() => setPendiente(null));
  };
  const ventana = (
    <Dialog open={pendiente !== null} onClose={() => setPendiente(null)} title="¿Borrar este registro?" width="28rem">
      <p>{pendiente?.texto}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button label="No, dejarlo" variant="quiet" onPress={() => setPendiente(null)} />
        <Button label="Sí, borrar" variant="danger" icon={Trash2} onPress={confirmar} />
      </div>
    </Dialog>
  );
  return { pedir: (texto: string, accion: () => Promise<void>) => setPendiente({ texto, accion }), ventana };
}

function Seccion({ titulo, total, children }: { titulo: string; total: string; children: ReactNode }) {
  return (
    <section aria-label={titulo} className="rounded-md bg-surface p-4 contorno-fino">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-label">{titulo}</h3>
        <span className="font-bold tabular-nums">{total}</span>
      </div>
      {children}
    </section>
  );
}

const monto = (t: string) => Number(soloDigitos(t)) || 0;

export function Patrocinios({ patrocinios, recargar }: { patrocinios: Patrocinio[]; recargar: () => void }) {
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [cobrado, setCobrado] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const { pedir, ventana } = useBorrar(recargar);

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (nombre.trim().length < 2 || monto(cantidad) <= 0) return setError('Escribe el patrocinador y el monto.');
    agregarPatrocinio({ patrocinador: nombre, monto: monto(cantidad), estado: cobrado ? 'cobrado' : 'comprometido', notas: '' })
      .then(() => {
        setNombre('');
        setCantidad('');
        setCobrado(false);
        setError('');
        recargar();
      })
      .catch(() => setError('No pudimos guardarlo. Intenta de nuevo.'));
  };
  const alternar = (p: Patrocinio) =>
    cambiarEstadoPatrocinio(p.id, p.estado === 'cobrado' ? 'comprometido' : 'cobrado')
      .then(recargar)
      .catch(() => toast.show({ message: 'No se pudo cambiar. Intenta de nuevo.', tone: 'danger' }));

  return (
    <Seccion titulo="Patrocinios" total={pesos(patrocinios.reduce((s, p) => s + p.monto, 0))}>
      <form onSubmit={enviar} className="mt-3 flex flex-wrap items-end gap-3">
        <TextField label="Patrocinador" value={nombre} onChangeText={setNombre} maxLength={80} className="min-w-40 flex-1" />
        <TextField label="Monto" kind="number" value={cantidad} onChangeText={(t) => setCantidad(soloDigitos(t))} className="w-32" />
        <Checkbox checked={cobrado} onChange={setCobrado}>
          Ya se cobró
        </Checkbox>
        <Button label="Agregar" icon={Plus} variant="secondary" size="sm" type="submit" />
      </form>
      <Alerta className="mt-3">{error}</Alerta>
      <ul className="mt-3 divide-y divide-line">
        {patrocinios.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-3 py-2.5">
            <span className="min-w-0 flex-1 font-semibold">{p.patrocinador}</span>
            <span className="font-bold tabular-nums">{pesos(p.monto)}</span>
            <Badge tone={p.estado === 'cobrado' ? 'success' : 'sand'}>{p.estado === 'cobrado' ? 'Cobrado' : 'Comprometido'}</Badge>
            <Button label={p.estado === 'cobrado' ? 'Marcar pendiente' : 'Marcar cobrado'} variant="link" size="sm" onPress={() => void alternar(p)} />
            <IconButton icon={Trash2} label={`Borrar ${p.patrocinador}`} size="sm" onPress={() => pedir(`${p.patrocinador}, ${pesos(p.monto)}`, () => borrarPatrocinio(p.id))} />
          </li>
        ))}
        {patrocinios.length === 0 ? <li className="py-3 text-small text-fg-muted">Aún no hay patrocinios registrados.</li> : null}
      </ul>
      {ventana}
    </Seccion>
  );
}

export function Gastos({ gastos, recargar }: { gastos: Gasto[]; recargar: () => void }) {
  const [concepto, setConcepto] = useState('');
  const [categoria, setCategoria] = useState(CONFIG.equipo.categoriasGasto[0]);
  const [cantidad, setCantidad] = useState('');
  const [error, setError] = useState('');
  const { pedir, ventana } = useBorrar(recargar);

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (concepto.trim().length < 2 || monto(cantidad) <= 0) return setError('Escribe el concepto y el monto.');
    agregarGasto({ concepto, categoria, monto: monto(cantidad) })
      .then(() => {
        setConcepto('');
        setCantidad('');
        setError('');
        recargar();
      })
      .catch(() => setError('No pudimos guardarlo. Intenta de nuevo.'));
  };

  return (
    <Seccion titulo="Gastos" total={pesos(gastos.reduce((s, g) => s + g.monto, 0))}>
      <form onSubmit={enviar} className="mt-3 flex flex-wrap items-end gap-3">
        <TextField label="Concepto" value={concepto} onChangeText={setConcepto} maxLength={80} className="min-w-40 flex-1" />
        <Select label="Categoría" value={categoria} onChange={setCategoria} options={CONFIG.equipo.categoriasGasto.map((c) => ({ value: c, label: c }))} className="w-40" />
        <TextField label="Monto" kind="number" value={cantidad} onChangeText={(t) => setCantidad(soloDigitos(t))} className="w-32" />
        <Button label="Agregar" icon={Plus} variant="secondary" size="sm" type="submit" />
      </form>
      <Alerta className="mt-3">{error}</Alerta>
      <ul className="mt-3 divide-y divide-line">
        {gastos.map((g) => (
          <li key={g.id} className="flex flex-wrap items-center gap-3 py-2.5">
            <span className="min-w-0 flex-1">
              <span className="font-semibold">{g.concepto}</span>
              <span className="block text-small text-fg-muted">
                {g.categoria} · {fechaCorta(g.fecha)}
              </span>
            </span>
            <span className="font-bold tabular-nums">{pesos(g.monto)}</span>
            <IconButton icon={Trash2} label={`Borrar ${g.concepto}`} size="sm" onPress={() => pedir(`${g.concepto}, ${pesos(g.monto)}`, () => borrarGasto(g.id))} />
          </li>
        ))}
        {gastos.length === 0 ? <li className="py-3 text-small text-fg-muted">Aún no hay gastos registrados.</li> : null}
      </ul>
      {ventana}
    </Seccion>
  );
}
