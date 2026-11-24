import { Moon, Sun } from 'lucide-react';
import { elegirTema, useTema } from '../theme';
import { IconButton } from './IconButton';

/** Cambia entre claro y oscuro (la primera vez sigue al dispositivo). */
export function ThemeSwitch({ variant = 'quiet' }: { variant?: 'quiet' | 'onInk' }) {
  const { tema } = useTema();
  const oscuro = tema === 'dark';
  return (
    <IconButton icon={oscuro ? Sun : Moon} label={oscuro ? 'Usar tema claro' : 'Usar tema oscuro'} variant={variant} onPress={() => elegirTema(oscuro ? 'claro' : 'oscuro')} />
  );
}
