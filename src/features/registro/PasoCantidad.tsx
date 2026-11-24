import { Minus, Plus, Users, User } from 'lucide-react';
import { CONFIG } from '../../config';
import { pesos } from '../../shared/format';
import { Button } from '../../shared/ui/Button';
import { IconButton } from '../../shared/ui/IconButton';
import { PRECIO } from './datos';
import { intentarIr, setCantidad, useRegistro } from './store';

/** Paso 1: ¿cuántos corredores? */
export function PasoCantidad() {
  const s = useRegistro();
  const grupo = s.cantidad > 1;
  return (
    <div>
      <h3 tabIndex={-1} className="titulo">
        ¿A cuántas personas vas a inscribir?
      </h3>
      <p className="mt-2 max-w-prose text-fg-muted">
        Elige 1 si corres tú. Si inscribes a tu familia, amigos o equipo, indica cuántos son (hasta {CONFIG.corredoresMaximo}). Cada quien tendrá su número.
      </p>

      <div className="mt-8 flex flex-col items-center gap-5 rounded-lg bg-sunken px-4 py-8 sm:flex-row sm:justify-center sm:gap-8">
        <div className="flex items-center gap-5">
          <IconButton icon={Minus} label="Quitar un corredor" variant="secondary" onPress={() => setCantidad(s.cantidad - 1)} disabled={s.cantidad <= 1} />
          <label className="flex flex-col items-center">
            <span className="sr-only">Número de corredores</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={s.cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-28 rounded-md bg-transparent text-center cifra text-[5.5rem] text-fg outline-none focus:bg-surface"
            />
          </label>
          <IconButton icon={Plus} label="Agregar un corredor" variant="secondary" onPress={() => setCantidad(s.cantidad + 1)} disabled={s.cantidad >= CONFIG.corredoresMaximo} />
        </div>
        <p className="flex items-center gap-2 font-display text-[1.15rem] font-semibold" aria-live="polite">
          {grupo ? <Users size={20} aria-hidden="true" /> : <User size={20} aria-hidden="true" />}
          {grupo ? `Grupo de ${s.cantidad}` : 'Individual'}, {pesos(s.cantidad * PRECIO)}
        </p>
      </div>

      <Button label={grupo ? `Elegir ${s.cantidad} números` : 'Elegir mi número'} size="lg" fullWidth className="mt-8" onPress={() => intentarIr(2)} />
    </div>
  );
}
