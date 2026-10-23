import { Mail } from 'lucide-react';
import { EMAIL } from '../config';
import { img } from '../lib/format';
import { btn, Km, Wrap } from '../components/ui';

/* ✏️ LOGOS: agrega cada patrocinador a su nivel, por ejemplo
     { nombre: 'Panadería La Espiga', logo: 'logo-espiga.png', url: 'https://…' }
   (copia el logo a public/img/). Mientras un nivel esté vacío, muestra lugares disponibles. */
type Patrocinador = { nombre: string; logo: string; url?: string };
const NIVELES: { nombre: string; lugares: number; patrocinadores: Patrocinador[] }[] = [
  { nombre: 'Oro', lugares: 2, patrocinadores: [] },
  { nombre: 'Plata', lugares: 3, patrocinadores: [] },
  { nombre: 'Bronce', lugares: 4, patrocinadores: [] },
];

const ALTURA = ['h-32', 'h-24', 'h-20'];

export function Patrocinadores() {
  const asunto = `mailto:${EMAIL}?subject=Patrocinio%20HANGUK%20RUN`;
  return (
    <section id="patrocinadores" className="py-24 lg:py-32">
      <Wrap>
        <Km n="09" ko="후원">
          Gracias a
        </Km>
        <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-end">
          <h2 className="display text-[clamp(2.8rem,7vw,5rem)] lg:col-span-6">Patrocinadores</h2>
          {/* ✏️ CAMBIAR: invitación para empresas */}
          <div className="lg:col-span-6">
            <p className="text-[17px] text-ink/75">
              Buscamos empresas, instituciones y aliados socialmente responsables que quieran respaldar a los 10 jóvenes voluntarios que representarán a su comunidad.
            </p>
            <a className={`${btn.base} ${btn.tinta} ${btn.md} mt-5`} href={asunto}>
              <Mail size={17} /> Contacto para empresas
            </a>
          </div>
        </div>

        <div className="mt-14 space-y-8">
          {NIVELES.map((nivel, i) => (
            <div key={nivel.nombre} className="grid gap-4 border-t border-ink/20 pt-6 sm:grid-cols-[8rem_1fr]">
              <h3 className="text-[13px] font-semibold tracking-[0.14em] text-muted uppercase">{nivel.nombre}</h3>
              <div className={`grid gap-3 ${i === 0 ? 'sm:grid-cols-2' : i === 1 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
                {nivel.patrocinadores.map((p) => {
                  const logo = <img src={img(p.logo)} alt={p.nombre} loading="lazy" className="max-h-[70%] max-w-[80%] object-contain" />;
                  const clase = `flex items-center justify-center rounded-[4px] bg-card ring-1 ring-ink/10 ${ALTURA[i]}`;
                  return p.url ? (
                    <a key={p.nombre} href={p.url} target="_blank" rel="noopener" className={clase}>
                      {logo}
                    </a>
                  ) : (
                    <div key={p.nombre} className={clase}>
                      {logo}
                    </div>
                  );
                })}
                {Array.from({ length: Math.max(0, nivel.lugares - nivel.patrocinadores.length) }, (_, k) => (
                  <a
                    key={k}
                    href={asunto}
                    className={`flex items-center justify-center rounded-[4px] border-2 border-dashed border-ink/20 text-sm font-semibold text-ink/40 transition-colors hover:border-coral hover:text-coral ${ALTURA[i]}`}
                  >
                    Lugar disponible
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Wrap>
    </section>
  );
}
