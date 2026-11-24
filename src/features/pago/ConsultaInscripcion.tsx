import { useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';
import { soloDigitos } from '../../shared/format';
import { Alerta } from '../../shared/ui/Alerta';
import { Button } from '../../shared/ui/Button';
import { Card } from '../../shared/ui/Card';
import { TextField } from '../../shared/ui/fields';
import { useToast } from '../../shared/ui/Toast';
import { asegurarSesionAnonima } from '../../services/supabase/auth';
import { consultarInscripcion, mensajeDePago, type EstadoInscripcion as Estado } from '../../services/supabase/pagos';
import { useCaptcha } from '../registro/useCaptcha';
import { EstadoInscripcion } from './EstadoInscripcion';
import { leerRecordada, olvidar, recordar } from './recordar';

/** "Mi inscripción": folio + correo → estado de pago y aviso de pago. */
export function ConsultaInscripcion({ folioInicial }: { folioInicial?: string }) {
  const toast = useToast();
  const captcha = useCaptcha();
  const recordada = leerRecordada();
  // Si llega un folio en el enlace y no es el recordado, el correo recordado no le corresponde
  const usarRecordada = recordada && (!folioInicial || folioInicial === String(recordada.folio));
  const [folio, setFolio] = useState(folioInicial ?? (recordada ? String(recordada.folio) : ''));
  const [correo, setCorreo] = useState(usarRecordada ? recordada.correo : '');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [estado, setEstado] = useState<Estado | null>(null);

  async function consultar(aviso?: string) {
    setCargando(true);
    setError('');
    try {
      let token: string | undefined;
      try {
        token = await captcha.getToken();
      } catch (e) {
        setError((e as Error).message);
        return;
      }
      await asegurarSesionAnonima(token);
      const r = await consultarInscripcion(Number(folio), correo.trim());
      recordar({ folio: r.folio, correo: correo.trim() });
      setEstado(r);
      if (aviso) toast.show({ message: aviso, tone: 'success' });
    } catch (e) {
      setError(mensajeDePago(e));
    } finally {
      setCargando(false);
    }
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (!folio || !correo.trim()) {
      setError('Escribe tu folio y el correo con el que te inscribiste.');
      return;
    }
    void consultar();
  }

  // El captcha queda montado en el mismo lugar en las dos vistas: al volver a consultar tras avisar del pago, sigue listo.
  return (
    <>
      {estado ? (
        <Card className="mx-auto max-w-xl p-6 sm:p-8">
          <EstadoInscripcion e={estado} correo={correo.trim()} alReportar={() => void consultar('¡Gracias! Recibimos tu aviso de pago')} />
          <Alerta className="mt-4">{error}</Alerta>
          <Button
            label="Consultar otro folio"
            variant="link"
            className="mt-4"
            onPress={() => {
              olvidar();
              setEstado(null);
              setFolio('');
              setCorreo('');
            }}
          />
        </Card>
      ) : (
        <Card className="mx-auto max-w-xl p-6 sm:p-8">
          <h2 className="font-display text-[1.6rem] font-bold">Consulta tu inscripción</h2>
          <p className="mt-1 text-fg-muted">Revisa si ya confirmamos tu pago, o avísanos que ya pagaste. Tu folio aparece al terminar tu inscripción.</p>
          <form onSubmit={enviar} noValidate className="mt-6 space-y-4">
            <TextField label="Folio" kind="number" value={folio} onChangeText={(v) => setFolio(soloDigitos(v).slice(0, 9))} required autoComplete="off" />
            <TextField label="Correo con el que te inscribiste" kind="email" value={correo} onChangeText={setCorreo} required autoComplete="email" maxLength={120} />
            <Alerta>{error}</Alerta>
            <Button label="Consultar" icon={Search} type="submit" fullWidth loading={cargando} />
          </form>
        </Card>
      )}
      {captcha.element ? <div className="mx-auto mt-4 max-w-xl">{captcha.element}</div> : null}
    </>
  );
}
