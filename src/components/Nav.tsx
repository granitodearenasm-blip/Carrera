import { useEffect, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { btn, Wrap } from './ui';

// ✏️ Menú: [id de la sección, texto, kilómetro]
export const SECCIONES = [
  ['por-que', 'La causa', '01'],
  ['organizador', 'Organizador', '03'],
  ['fechas', 'Agenda', '04'],
  ['sede', 'Sede', '05'],
  ['ruta', 'Ruta', '06'],
  ['kit', 'Kit', '07'],
  ['premios', 'Premios', '08'],
  ['patrocinadores', 'Patrocinios', '09'],
] as const;

export function Nav() {
  const [abierto, setAbierto] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activa, setActiva] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    // Resalta en el menú la sección visible
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && setActiva(en.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    document.querySelectorAll('main section[id]').forEach((s) => io.observe(s));
    return () => {
      window.removeEventListener('scroll', onScroll);
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = abierto ? 'hidden' : '';
  }, [abierto]);

  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow] ${scrolled || abierto ? 'bg-paper/95 shadow-[0_1px_0_var(--color-line)] backdrop-blur' : ''}`}>
      <Wrap className="flex h-16 items-center gap-6">
        <a href="#inicio" className="flex items-baseline gap-2 whitespace-nowrap" aria-label="HANGUK RUN, ir al inicio">
          <span className="display text-[1.65rem]">
            Hanguk <span className="text-hong">Run</span>
          </span>
          <span lang="ko" className="hidden font-ko text-[1.05rem] text-muted sm:inline">
            한국
          </span>
        </a>

        <nav className="ml-auto hidden items-center gap-5 xl:flex" aria-label="Secciones">
          {SECCIONES.map(([id, texto]) => (
            <a
              key={id}
              href={`#${id}`}
              className={`text-[14px] font-semibold transition-colors ${activa === id ? 'text-hong' : 'text-ink/70 hover:text-ink'}`}
            >
              {texto}
            </a>
          ))}
        </nav>
        <a href="#inscripcion" className={`${btn.base} ${btn.rojo} ${btn.sm} ml-auto xl:ml-0`}>
          Inscríbete <ArrowRight size={15} />
        </a>
        <button
          type="button"
          className="-mr-2 rounded p-2 xl:hidden"
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={abierto}
          aria-controls="menu-movil"
          onClick={() => setAbierto((v) => !v)}
        >
          {abierto ? <X size={24} /> : <Menu size={24} />}
        </button>
      </Wrap>

      {abierto && (
        <nav id="menu-movil" className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-paper xl:hidden" aria-label="Secciones">
          <Wrap className="py-4">
            <ol>
              {SECCIONES.map(([id, texto, km]) => (
                <li key={id} className="border-b border-line">
                  <a href={`#${id}`} onClick={() => setAbierto(false)} className="flex items-baseline gap-4 py-3.5">
                    <span className="w-14 text-[12px] font-bold tracking-[0.1em] text-muted tabular-nums">KM {km}</span>
                    <span className="display text-[2rem]">{texto}</span>
                  </a>
                </li>
              ))}
              <li>
                <a href="#inscripcion" onClick={() => setAbierto(false)} className="flex items-baseline gap-4 py-3.5 text-hong">
                  <span className="w-14 text-[12px] font-bold tracking-[0.1em] tabular-nums">KM 10</span>
                  <span className="display text-[2rem]">Meta: inscríbete</span>
                </a>
              </li>
            </ol>
          </Wrap>
        </nav>
      )}
    </header>
  );
}
