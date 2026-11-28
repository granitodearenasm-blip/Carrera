import { useMemo, useState } from 'react';
import { Download, Inbox, SearchX } from 'lucide-react';
import { Button } from '../../shared/ui/Button';
import { EmptyState } from '../../shared/ui/EmptyState';
import type { InscripcionPanel } from '../../services/supabase/panel';
import { Detalle } from './Detalle';
import { comoCsv, filtrar, resumir, type Filtros } from './estadisticas';
import { FiltrosPanel, Lista } from './Lista';
import { Resumen } from './Resumen';

/** Pestaña de inscripciones: resumen, filtros, lista y detalle. Las carga el panel (PanelOrganizadores). */
export function PanelInscripciones({ lista, recargar }: { lista: InscripcionPanel[]; recargar: () => void }) {
  const [filtros, setFiltros] = useState<Filtros>({ texto: '', estado: 'todas', distancia: '' });
  const [abierta, setAbierta] = useState<string | null>(null);

  const visibles = useMemo(() => filtrar(lista, filtros), [lista, filtros]);
  const resumen = useMemo(() => resumir(lista), [lista]);
  const actual = lista.find((i) => i.id === abierta) ?? null;

  const exportar = () => {
    const url = URL.createObjectURL(new Blob([comoCsv(visibles)], { type: 'text/csv;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `hanguk-run-inscripciones-${new Date().toISOString().slice(0, 10)}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Resumen r={resumen} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <FiltrosPanel f={filtros} cambiar={setFiltros} />
        <Button label="Exportar CSV" icon={Download} variant="secondary" size="sm" onPress={exportar} disabled={!visibles.length} />
      </div>
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
      <Detalle key={actual?.id} ins={actual} onClose={() => setAbierta(null)} alCambiar={recargar} />
    </div>
  );
}
