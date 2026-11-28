import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { pesos } from '../../shared/format';
import { Button } from '../../shared/ui/Button';
import { Contenedor } from '../../shared/ui/decoracion';
import { Dialog } from '../../shared/ui/Dialog';
import { IconButton } from '../../shared/ui/IconButton';
import { ThemeSwitch } from '../../shared/ui/ThemeSwitch';
import { PRECIO } from '../registro/datos';
import { Logotipo } from './Logotipo';

// ✏️ Menú: [id de la sección, texto]
export const SECCIONES = [
  ['por-que', 'Por qué corremos'],
  ['sede', 'La sede'],
  ['carrera', 'La carrera'],
  ['patrocinadores', 'Patrocinadores'],
  ['preguntas', 'Preguntas'],
] as const;

export function Nav() {
  const [abierto, setAbierto] = useState(false);
  const [arriba, setArriba] = useState(true);
  const [avance, setAvance] = useState(0);
  const [activa, setActiva] = useState('');

  useEffect(() => {
    const alDesplazar = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setArriba(window.scrollY < 24);
      setAvance(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    alDesplazar();
    window.addEventListener('scroll', alDesplazar, { passive: true });
    // Resalta en el menú la sección visible
    const io = new IntersectionObserver((entradas) => entradas.forEach((e) => e.isIntersecting && setActiva(e.target.id)), { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach((s) => io.observe(s));
    return () => {
      window.removeEventListener('scroll', alDesplazar);
      io.disconnect();
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-(--layer-nav) border-b-[3px] border-outline bg-ink text-on-ink transition-[background-color,border-color] duration-(--duration-base)`}
    >
      <a href="#contenido" className="sr-only rounded-md bg-ink px-4 py-2 font-bold text-on-ink focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10">
        Saltar al contenido
      </a>
      <Contenedor className="flex h-[4.25rem] items-center gap-4">
        <a href="#inicio" className="flex items-center gap-2 whitespace-nowrap" aria-label="HANGUK RUN, ir al inicio">
          <Logotipo compacto />
          <span lang="ko" className="hidden text-[1.15rem] sm:inline">
            한국
          </span>
        </a>

        <nav className="ml-auto hidden items-center gap-1 xl:flex" aria-label="Secciones">
          {SECCIONES.map(([id, texto]) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={activa === id ? 'location' : undefined}
              className={`px-3 py-2 etiqueta transition-colors ${activa === id ? 'bg-on-ink text-ink' : 'hover:bg-current/10'}`}
            >
              {texto}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1 xl:ml-2">
          <ThemeSwitch />
          <Button label="Inscríbete" size="sm" href="#inscripcion" className="hidden sm:inline-flex" />
          <IconButton icon={Menu} label="Abrir menú" onPress={() => setAbierto(true)} expanded={abierto} className="xl:hidden" />
        </div>
      </Contenedor>

      {/* Cuánto llevas de la página: la franja saekdong se llena al bajar */}
      <div aria-hidden="true" className={`absolute inset-x-0 -bottom-[2.5px] h-[5px] ${arriba ? 'opacity-0' : ''}`}>
        <div className="h-full saekdong" style={{ clipPath: `inset(0 ${100 - avance * 100}% 0 0)` }} />
      </div>

      <Dialog open={abierto} onClose={() => setAbierto(false)} title="Menú" look="hoja">
        <nav aria-label="Secciones">
          <ul>
            {SECCIONES.map(([id, texto]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={() => setAbierto(false)}
                  className="flex min-h-12 items-center gap-3 rounded-md px-2 hover:bg-hover"
                  aria-current={activa === id ? 'location' : undefined}
                >
                  <span className={`font-display text-[1.35rem] font-semibold ${activa === id ? 'underline decoration-[3px] underline-offset-4' : ''}`}>{texto}</span>
                </a>
              </li>
            ))}
          </ul>
          <Button label="Inscríbete" size="lg" fullWidth href="#inscripcion" onPress={() => setAbierto(false)} className="mt-6" />
        </nav>
      </Dialog>
    </header>
  );
}

/** En el celular: botón fijo abajo para inscribirse, que se esconde al llegar a la inscripción. */
export function BarraInscripcion() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const meta = document.getElementById('inscripcion');
    const hero = document.getElementById('inicio');
    if (!meta || !hero) return;
    const estado = { meta: false, hero: true };
    const actualizar = () => setVisible(!estado.meta && !estado.hero);
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => (e.target === meta ? (estado.meta = e.isIntersecting) : (estado.hero = e.isIntersecting)));
      actualizar();
    });
    io.observe(meta);
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--barra-inferior', visible ? '4.5rem' : '0px');
  }, [visible]);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-(--layer-sticky) border-t-[2.5px] border-outline bg-page px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] transition-transform duration-(--duration-base) sm:hidden ${visible ? '' : 'translate-y-full'}`}
      aria-hidden={!visible}
    >
      <Button label={`Inscríbete por ${pesos(PRECIO)}`} fullWidth href="#inscripcion" disabled={!visible} />
    </div>
  );
}
