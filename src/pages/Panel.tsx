import { useEffect, useState } from 'react';
import { Cloud, ShieldX } from 'lucide-react';
import { Button } from '../shared/ui/Button';
import { Contenedor } from '../shared/ui/decoracion';
import { EmptyState } from '../shared/ui/EmptyState';
import { Spinner } from '../shared/ui/Spinner';
import { hayNube } from '../services/supabase/client';
import { salir, soyOrganizador, useSesion } from '../services/supabase/auth';
import { EncabezadoSimple } from '../features/layout/EncabezadoSimple';
import { Login } from '../features/panel/Login';
import { PanelOrganizadores } from '../features/panel/PanelOrganizadores';

/** /panel: entrada, comprobación de organizador y el panel. */
export default function Panel() {
  const sesion = useSesion();
  // Las sesiones anónimas (visitantes que se inscribieron) no cuentan como cuenta del panel
  const cuenta = sesion && !sesion.user.is_anonymous ? sesion : null;
  const id = cuenta?.user.id;
  // Respuesta de "¿es organizador?" para cada cuenta; mientras no llega la de la cuenta actual, es null
  const [revisado, setRevisado] = useState<{ id: string; ok: boolean } | null>(null);
  const permiso = id && revisado?.id === id ? revisado.ok : null;

  useEffect(() => {
    document.title = 'Panel de organizadores, HANGUK RUN';
  }, []);
  useEffect(() => {
    if (!id) return;
    void soyOrganizador().then((ok) => setRevisado({ id, ok }));
  }, [id]);

  let contenido;
  if (!hayNube)
    contenido = (
      <EmptyState icon={Cloud} title="Falta conectar Supabase">
        Agrega VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY (ver docs/publicar.md) y vuelve a publicar el sitio.
      </EmptyState>
    );
  else if (sesion === undefined || (cuenta && permiso === null))
    contenido = (
      <p className="flex items-center justify-center gap-2 py-20 text-fg-muted">
        <Spinner /> Revisando tu sesión…
      </p>
    );
  else if (!cuenta) contenido = <Login />;
  else if (!permiso)
    contenido = (
      <EmptyState icon={ShieldX} title="Esta cuenta no es de organizador" action={<Button label="Salir" variant="secondary" onPress={() => void salir()} />}>
        Pide a Granito de Arena que agregue tu cuenta ({cuenta.user.email}) a la tabla de organizadores.
      </EmptyState>
    );
  else contenido = <PanelOrganizadores correo={cuenta.user.email ?? ''} />;

  return (
    <div className="min-h-dvh bg-page">
      <EncabezadoSimple titulo="Hanguk Run, panel" />
      <main id="contenido" className="py-10">
        <h1 className="sr-only">Panel de organizadores de HANGUK RUN</h1>
        <Contenedor>{contenido}</Contenedor>
      </main>
    </div>
  );
}
