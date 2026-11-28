import { useMemo, useState, type FormEvent } from 'react';
import { Copy, KeyRound, UserPlus, Users } from 'lucide-react';
import { miles, pesos } from '../../shared/format';
import { Alerta } from '../../shared/ui/Alerta';
import { Badge } from '../../shared/ui/Badge';
import { Button } from '../../shared/ui/Button';
import { EmptyState } from '../../shared/ui/EmptyState';
import { TextField } from '../../shared/ui/fields';
import { useCopiar } from '../../shared/ui/useCopiar';
import { useToast } from '../../shared/ui/Toast';
import { agregarMiembro, cambiarActivo, linkInvitacion, linkPrivado, type Miembro } from '../../services/supabase/equipo';
import type { InscripcionPanel } from '../../services/supabase/panel';
import { codigoDesdeNombre, desempenoEquipo, parteDelEquipo } from './cuentas';
import { Cifra } from './Resumen';

/** Alta de un miembro: el código del link sale del nombre, y se puede cambiar. */
function Alta({ alAgregar }: { alAgregar: () => void }) {
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const toast = useToast();
  const cod = codigo ?? codigoDesdeNombre(nombre);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (nombre.trim().length < 2) return setError('Escribe el nombre del miembro.');
    if (!/^[a-z0-9-]{3,30}$/.test(cod)) return setError('El código lleva de 3 a 30 letras sin acentos, números o guiones.');
    setEnviando(true);
    try {
      await agregarMiembro(nombre, cod);
      toast.show({ message: `${nombre.trim()} ya es parte del Equipo Hanguk`, tone: 'success' });
      setNombre('');
      setCodigo(null);
      setError('');
      alAgregar();
    } catch (err) {
      setError(
        (err as Error).message === 'codigo-repetido' ? 'Ese código ya lo usa alguien más. Cámbialo (por ejemplo, agrega el apellido).' : 'No pudimos guardarlo. Intenta de nuevo.',
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="rounded-md bg-surface p-4 contorno-fino" aria-label="Agregar miembro">
      <h3 className="text-label">Agregar miembro</h3>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <TextField label="Nombre" value={nombre} onChangeText={setNombre} maxLength={60} className="w-full sm:w-64" />
        <TextField
          label="Código del link"
          value={cod}
          onChangeText={(t) => setCodigo(t.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          maxLength={30}
          hint={cod ? `…/?ref=${cod}` : 'Sale del nombre'}
          className="w-full sm:w-56"
        />
        <Button label="Agregar" icon={UserPlus} variant="ink" type="submit" loading={enviando} />
      </div>
      <Alerta className="mt-3">{error}</Alerta>
    </form>
  );
}

export function PanelEquipo({ equipo, lista, recargar }: { equipo: Miembro[]; lista: InscripcionPanel[]; recargar: () => void }) {
  const copiar = useCopiar();
  const toast = useToast();
  const filas = useMemo(() => desempenoEquipo(equipo, lista), [equipo, lista]);
  const activos = equipo.filter((m) => m.activo).length;
  const delEquipo = filas.reduce((s, f) => s + f.corredores, 0);

  const alternar = (m: Miembro) =>
    cambiarActivo(m.id, !m.activo)
      .then(() => {
        toast.show({ message: m.activo ? `Se pausó a ${m.nombre}: sus links dejan de contar` : `${m.nombre} vuelve a estar activo`, tone: 'success' });
        recargar();
      })
      .catch(() => toast.show({ message: 'No se pudo cambiar. Intenta de nuevo.', tone: 'danger' }));

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Cifra valor={miles(activos)} etiqueta="Miembros activos" />
        <Cifra valor={miles(delEquipo)} etiqueta="Corredores traídos por el equipo" />
        <Cifra valor={`${Math.round(parteDelEquipo(lista) * 100)} %`} etiqueta="De la carrera llegó por un link" />
        <Cifra valor={pesos(filas.reduce((s, f) => s + f.porCobrar, 0))} etiqueta="Por cobrar del equipo" nota="Pídeles que den seguimiento" />
      </dl>

      <Alta alAgregar={recargar} />

      {filas.length === 0 ? (
        <EmptyState icon={Users} title="Todavía no hay nadie en el equipo">
          Agrega a cada persona que va a invitar a correr. Recibe un link para compartir y otro privado para ver cuántos lleva.
        </EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-md bg-surface contorno-fino">
          <table className="w-full text-small">
            <caption className="sr-only">Desempeño de cada miembro del equipo</caption>
            <thead className="text-left text-fg-muted">
              <tr className="border-b border-line">
                <th scope="col" className="p-3">
                  #
                </th>
                <th scope="col" className="p-3">
                  Miembro
                </th>
                <th scope="col" className="p-3 text-right">
                  Corredores
                </th>
                <th scope="col" className="p-3 text-right">
                  Pagados
                </th>
                <th scope="col" className="p-3 text-right">
                  Recaudado
                </th>
                <th scope="col" className="p-3 text-right">
                  Por cobrar
                </th>
                <th scope="col" className="p-3">
                  Links
                </th>
                <th scope="col" className="p-3">
                  <span className="sr-only">Estado</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f, i) => (
                <tr key={f.miembro.id} className={`border-b border-line last:border-0 ${f.miembro.activo ? '' : 'opacity-60'}`}>
                  <td className="p-3 font-bold tabular-nums">{i + 1}</td>
                  <th scope="row" className="p-3 text-left">
                    <span className="font-semibold">{f.miembro.nombre}</span>
                    <span className="block font-normal text-fg-muted">?ref={f.miembro.codigo}</span>
                  </th>
                  <td className="p-3 text-right font-bold tabular-nums">{miles(f.corredores)}</td>
                  <td className="p-3 text-right tabular-nums">{miles(f.corredoresPagados)}</td>
                  <td className="p-3 text-right tabular-nums">{pesos(f.recaudado)}</td>
                  <td className="p-3 text-right tabular-nums">{pesos(f.porCobrar)}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Button label="Invitar" icon={Copy} variant="quiet" size="sm" onPress={() => void copiar(linkInvitacion(f.miembro.codigo), 'Link para invitar copiado')} />
                      <Button
                        label="Privado"
                        icon={KeyRound}
                        variant="quiet"
                        size="sm"
                        onPress={() => void copiar(linkPrivado(f.miembro.clave), 'Link privado copiado: mándaselo solo a esta persona')}
                      />
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    {f.miembro.activo ? null : <Badge className="mr-2">Pausado</Badge>}
                    <Button label={f.miembro.activo ? 'Pausar' : 'Activar'} variant="link" size="sm" onPress={() => void alternar(f.miembro)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-small text-fg-muted">
        «Invitar» es el link que cada quien comparte; las inscripciones que lleguen por él se le cuentan. «Privado» es su página con sus números: mándaselo solo a esa persona.
      </p>
    </div>
  );
}
