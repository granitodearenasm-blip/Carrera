import { CONFIG } from '../../config';
import { fechaHora, pesos } from '../../shared/format';
import { Chip } from '../../shared/ui/Chip';
import { TextField } from '../../shared/ui/fields';
import type { InscripcionPanel } from '../../services/supabase/panel';
import { EstadoBadge } from './EstadoBadge';
import type { Filtros } from './estadisticas';

const ESTADOS: [Filtros['estado'], string][] = [
  ['todas', 'Todas'],
  ['pendiente', 'Pendientes'],
  ['pagado', 'Pagadas'],
  ['cancelado', 'Canceladas'],
];

export function FiltrosPanel({ f, cambiar }: { f: Filtros; cambiar: (f: Filtros) => void }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <TextField
        label="Buscar"
        kind="search"
        placeholder="Folio, número, nombre, correo…"
        value={f.texto}
        onChangeText={(texto) => cambiar({ ...f, texto })}
        className="w-full sm:w-72"
      />
      <div className="flex flex-wrap gap-2" role="group" aria-label="Estado de pago">
        {ESTADOS.map(([v, t]) => (
          <Chip key={v} pressed={f.estado === v} onPress={() => cambiar({ ...f, estado: v })}>
            {t}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Distancia">
        {['', ...CONFIG.categorias.map((c) => c.id)].map((d) => (
          <Chip key={d || 'todas'} pressed={f.distancia === d} onPress={() => cambiar({ ...f, distancia: d })}>
            {d || 'Todas las distancias'}
          </Chip>
        ))}
      </div>
    </div>
  );
}

/** Tabla de inscripciones; cada fila abre su detalle. */
export function Lista({ lista, abrir }: { lista: InscripcionPanel[]; abrir: (i: InscripcionPanel) => void }) {
  return (
    <div className="overflow-x-auto rounded-md bg-surface contorno-fino">
      <table className="w-full min-w-[44rem] text-small">
        <caption className="sr-only">Inscripciones</caption>
        <thead className="border-b-[1.5px] border-line text-left text-fg-muted">
          <tr>
            <th scope="col" className="px-3 py-2.5 font-semibold">
              Folio
            </th>
            <th scope="col" className="px-3 py-2.5 font-semibold">
              Quién
            </th>
            <th scope="col" className="px-3 py-2.5 font-semibold">
              Números
            </th>
            <th scope="col" className="px-3 py-2.5 font-semibold">
              Estado
            </th>
            <th scope="col" className="px-3 py-2.5 text-right font-semibold">
              Total
            </th>
            <th scope="col" className="px-3 py-2.5 font-semibold">
              Fecha
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {lista.map((i) => (
            <tr key={i.id} className={`hover:bg-hover ${i.estadoPago === 'cancelado' ? 'text-fg-muted' : ''}`}>
              <td className="px-3 py-2.5">
                <button type="button" onClick={() => abrir(i)} className="min-h-9 cursor-pointer font-bold text-link underline underline-offset-4">
                  {i.folio}
                </button>
              </td>
              <td className="px-3 py-2.5">
                <span className="font-semibold">{i.tipo === 'Grupo' ? i.grupo : i.corredores[0]?.nombre}</span>
                <span className="block text-fg-muted">{i.tipo === 'Grupo' ? `${i.corredores.length} corredores` : i.correo}</span>
              </td>
              <td className="px-3 py-2.5 tabular-nums">{i.corredores.map((c) => `#${c.numero}`).join(', ')}</td>
              <td className="px-3 py-2.5">
                <EstadoBadge ins={i} />
              </td>
              <td className="px-3 py-2.5 text-right font-bold tabular-nums">{pesos(i.total)}</td>
              <td className="px-3 py-2.5 whitespace-nowrap text-fg-muted">{fechaHora(i.creado)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
