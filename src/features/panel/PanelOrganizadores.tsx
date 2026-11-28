import { useCallback, useEffect, useState } from 'react';
import { ClipboardList, LogOut, PiggyBank, RotateCw, Users } from 'lucide-react';
import { Alerta } from '../../shared/ui/Alerta';
import { Button } from '../../shared/ui/Button';
import { Pestanas, type Pestana } from '../../shared/ui/Pestanas';
import { Spinner } from '../../shared/ui/Spinner';
import { salir } from '../../services/supabase/auth';
import { listarEquipo, type Miembro } from '../../services/supabase/equipo';
import { listarGastos, listarPatrocinios, type Gasto, type Patrocinio } from '../../services/supabase/finanzas';
import { listarInscripciones, type InscripcionPanel } from '../../services/supabase/panel';
import { Finanzas } from './Finanzas';
import { PanelEquipo } from './PanelEquipo';
import { PanelInscripciones } from './PanelInscripciones';

type Id = 'inscripciones' | 'equipo' | 'finanzas';
const PESTANAS: Pestana<Id>[] = [
  { id: 'inscripciones', label: 'Inscripciones', icon: ClipboardList },
  { id: 'equipo', label: 'Equipo Hanguk', icon: Users },
  { id: 'finanzas', label: 'Finanzas', icon: PiggyBank },
];

type Datos = { lista: InscripcionPanel[]; equipo: Miembro[]; patrocinios: Patrocinio[]; gastos: Gasto[] };

/** El panel ya con sesión de organizador: carga todo una vez y lo reparte en pestañas. */
export function PanelOrganizadores({ correo }: { correo: string }) {
  const [datos, setDatos] = useState<Datos | null>(null);
  const [error, setError] = useState('');
  const [pestana, setPestana] = useState<Id>('inscripciones');

  const cargar = useCallback(() => {
    Promise.all([listarInscripciones(), listarEquipo(), listarPatrocinios(), listarGastos()])
      .then(([lista, equipo, patrocinios, gastos]) => {
        setDatos({ lista, equipo, patrocinios, gastos });
        setError('');
      })
      .catch(() => setError('No pudimos cargar el panel. Revisa tu conexión y vuelve a intentarlo.'));
  }, []);
  useEffect(cargar, [cargar]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="titulo">Panel de organizadores</h2>
          <p className="text-small text-fg-muted">Sesión de {correo}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button label="Actualizar" icon={RotateCw} variant="quiet" size="sm" onPress={cargar} />
          <Button label="Salir" icon={LogOut} variant="quiet" size="sm" onPress={() => void salir()} />
        </div>
      </div>

      <Alerta className="mt-5">{error}</Alerta>

      {datos === null && !error ? (
        <p className="mt-10 flex items-center gap-2 text-fg-muted">
          <Spinner /> Cargando…
        </p>
      ) : null}

      {datos ? (
        <div className="mt-6">
          <Pestanas etiqueta="Secciones del panel" pestanas={PESTANAS} activa={pestana} cambiar={setPestana}>
            {pestana === 'inscripciones' ? <PanelInscripciones lista={datos.lista} recargar={cargar} /> : null}
            {pestana === 'equipo' ? <PanelEquipo equipo={datos.equipo} lista={datos.lista} recargar={cargar} /> : null}
            {pestana === 'finanzas' ? <Finanzas lista={datos.lista} patrocinios={datos.patrocinios} gastos={datos.gastos} recargar={cargar} /> : null}
          </Pestanas>
        </div>
      ) : null}
    </div>
  );
}
