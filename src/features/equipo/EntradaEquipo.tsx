import { useCallback, useEffect, useState } from 'react';
import { KeyRound, LogIn } from 'lucide-react';
import { Alerta } from '../../shared/ui/Alerta';
import { Button } from '../../shared/ui/Button';
import { EmptyState } from '../../shared/ui/EmptyState';
import { Spinner } from '../../shared/ui/Spinner';
import { asegurarSesionAnonima, useSesion } from '../../services/supabase/auth';
import type { ErrorBase } from '../../services/supabase/client';
import { consultarMiEquipo, type MiEquipo } from '../../services/supabase/equipo';
import { useCaptcha } from '../registro/useCaptcha';
import { TableroEquipo } from './TableroEquipo';

/**
 * Abre la página privada de un miembro del equipo. Si este navegador ya tiene sesión, carga directo;
 * la primera vez pide un toque (y el captcha, si está activo) para abrir una sesión anónima.
 */
export function EntradaEquipo({ clave }: { clave: string }) {
  const sesion = useSesion();
  const captcha = useCaptcha();
  const [datos, setDatos] = useState<MiEquipo | null>(null);
  const [error, setError] = useState('');
  const [noExiste, setNoExiste] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Sin setState síncrono: corre desde un efecto cuando llega la sesión
  const cargar = useCallback(() => {
    consultarMiEquipo(clave)
      .then((d) => {
        setDatos(d);
        setError('');
      })
      .catch((e: ErrorBase) => (e.codigo === 'no-encontrado' ? setNoExiste(true) : setError('No pudimos cargar tus números. Revisa tu conexión y vuelve a intentarlo.')))
      .finally(() => setCargando(false));
  }, [clave]);

  useEffect(() => {
    if (sesion) cargar();
  }, [sesion, cargar]);

  const entrar = async () => {
    setCargando(true);
    setError('');
    try {
      await asegurarSesionAnonima(await captcha.getToken());
      // La sesión nueva dispara la carga
    } catch {
      setError('No pudimos abrir tu página. Recarga e intenta de nuevo.');
      setCargando(false);
    }
  };

  if (noExiste)
    return (
      <EmptyState icon={KeyRound} title="Este link no está activo">
        Revisa que lo hayas copiado completo o pide uno nuevo a los organizadores.
      </EmptyState>
    );
  if (datos) return <TableroEquipo d={datos} />;
  if (sesion === undefined || (sesion && !error))
    return (
      <p className="flex items-center justify-center gap-2 py-20 text-fg-muted">
        <Spinner /> Cargando tus números…
      </p>
    );
  return (
    <div className="mx-auto max-w-md py-10 text-center">
      <h2 className="titulo">Tu página del Equipo Hanguk</h2>
      <p className="mt-2 text-fg-muted">Aquí ves cuántos corredores llevas con tu link, tu lugar en el equipo y tus insignias.</p>
      <Alerta className="mt-4">{error}</Alerta>
      {sesion ? (
        <Button label="Volver a intentar" className="mt-5" onPress={() => (setCargando(true), cargar())} loading={cargando} />
      ) : (
        <Button label="Ver mis números" icon={LogIn} className="mt-5" onPress={() => void entrar()} loading={cargando} />
      )}
      {captcha.element ? <div className="mt-4">{captcha.element}</div> : null}
    </div>
  );
}
