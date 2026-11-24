import { ArrowLeft } from 'lucide-react';
import { Button } from '../../shared/ui/Button';
import { Contenedor, Saekdong } from '../../shared/ui/decoracion';
import { ThemeSwitch } from '../../shared/ui/ThemeSwitch';

/** Encabezado de las páginas fuera de la portada (panel, mi inscripción): volver, título y tema. */
export function EncabezadoSimple({ titulo }: { titulo: string }) {
  return (
    <header className="border-b-[2.5px] border-outline bg-accent text-on-accent">
      <Contenedor className="flex h-16 items-center justify-between gap-3">
        <Button label="Volver al sitio" icon={ArrowLeft} variant="link" to="/" className="text-on-accent" />
        <span className="font-display text-[1.3rem] font-bold">{titulo}</span>
        <ThemeSwitch />
      </Contenedor>
      <Saekdong className="h-1.5" />
    </header>
  );
}
