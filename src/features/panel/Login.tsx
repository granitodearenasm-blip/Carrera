import { useState, type FormEvent } from 'react';
import { LogIn } from 'lucide-react';
import { Alerta } from '../../shared/ui/Alerta';
import { Button } from '../../shared/ui/Button';
import { Card } from '../../shared/ui/Card';
import { TextField } from '../../shared/ui/fields';
import { entrarConContrasena } from '../../services/supabase/auth';

/** Entrada al panel con la cuenta de organizador (correo y contraseña creados en Supabase). */
export function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [entrando, setEntrando] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!correo.trim() || !contrasena) return setError('Escribe tu correo y tu contraseña.');
    setEntrando(true);
    setError('');
    try {
      await entrarConContrasena(correo, contrasena);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEntrando(false);
    }
  }

  return (
    <Card className="mx-auto max-w-md p-6 sm:p-8">
      <h2 className="titulo">Entra con tu cuenta</h2>
      <p className="mt-2 text-small text-fg-muted">Para ver y administrar las inscripciones. Las cuentas las da de alta Granito de Arena.</p>
      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        <TextField label="Correo" kind="email" autoComplete="username" value={correo} onChangeText={setCorreo} />
        <TextField label="Contraseña" kind="password" autoComplete="current-password" value={contrasena} onChangeText={setContrasena} />
        <Alerta>{error}</Alerta>
        <Button label="Entrar" icon={LogIn} type="submit" fullWidth loading={entrando} />
      </form>
    </Card>
  );
}
