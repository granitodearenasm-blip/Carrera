import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Inbox, LogOut, RotateCw, SearchX } from 'lucide-react';
import { Alerta } from '../../shared/ui/Alerta';
import { Button } from '../../shared/ui/Button';
import { EmptyState } from '../../shared/ui/EmptyState';
import { Spinner } from '../../shared/ui/Spinner';
import { salir } from '../../services/supabase/auth';
import { listarInscripciones, type InscripcionPanel } from '../../services/supabase/panel';
import { Detalle } from './Detalle';
import { comoCsv, filtrar, resumir, type Filtros } from './estadisticas';
import { FiltrosPanel, Lista } from './Lista';
import { Resumen } from './Resumen';

/** El panel ya con sesión de organizador: resumen, filtros, lista y detalle. */
export function PanelInscripciones({ correo }: { correo: string }) {
  const [lista, setLista] = useState<InscripcionPanel[] | null>(null);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState<Filtros>({ texto: '', estado: 'todas', distancia: '' });
  const [abierta, setAbierta] = useState<string | null>(null);

  const cargar = useCallback(() => {
    listarInscripciones()
      .then((l) => {
        setLista(l);
        setError('');
      })
      .catch(() => setError('No pudimos cargar las inscripciones. Revisa tu conexión y vuelve a intentarlo.'));
  }, []);
  useEffect(cargar, [cargar]);

  const visibles = useMemo(() => (lista ? filtrar(lista, filtros) : []), [lista, filtros]);
  const resumen = useMemo(() => resumir(lista ?? []), [lista]);
  const actual = lista?.find((i) => i.id === abierta) ?? null;

  const exportar = () => {
    const url = URL.createObjectURL(new Blob([comoCsv(visibles)], { type: 'text/csv;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `hanguk-run-inscripciones-${new Date().toISOString().slice(0, 10)}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="titulo">Inscripciones</h2>
          <p className="text-small text-fg-muted">Sesión de {correo}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button label="Actualizar" icon={RotateCw} variant="quiet" size="sm" onPress={cargar} />
          <Button label="Exportar CSV" icon={Download} variant="secondary" size="sm" onPress={exportar} disabled={!visibles.length} />
          <Button label="Salir" icon={LogOut} variant="quiet" size="sm" onPress={() => void salir()} />
        </div>
      </div>

      <Alerta className="mt-5">{error}</Alerta>

      {lista === null && !error ? (
        <p className="mt-10 flex items-center gap-2 text-fg-muted">
          <Spinner /> Cargando inscripciones…
        </p>
      ) : null}

      {lista ? (
        <div className="mt-6 space-y-6">
          <Resumen r={resumen} />
          <FiltrosPanel f={filtros} cambiar={setFiltros} />
          {lista.length === 0 ? (
            <EmptyState icon={Inbox} title="Todavía no hay inscripciones">
              Aparecerán aquí en cuanto alguien termine su registro en la página.
            </EmptyState>
          ) : visibles.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="Nada coincide con la búsqueda"
              action={<Button label="Quitar filtros" variant="link" onPress={() => setFiltros({ texto: '', estado: 'todas', distancia: '' })} />}
            />
          ) : (
            <>
              <p className="text-small text-fg-muted" aria-live="polite">
                {visibles.length === lista.length ? `${lista.length} inscripciones` : `${visibles.length} de ${lista.length} inscripciones`}
              </p>
              <Lista lista={visibles} abrir={(i) => setAbierta(i.id)} />
            </>
          )}
        </div>
      ) : null}

      <Detalle key={actual?.id} ins={actual} onClose={() => setAbierta(null)} alCambiar={cargar} />
    </div>
  );
}
