import { Cookie, Medal, Shirt } from 'lucide-react';
import { Dorsal } from '../components/Dorsal';
import { Km, Wrap } from '../components/ui';

/* ✏️ FOTOS DEL KIT: cuando las tengan, copien la imagen a public/img/ y cambien el ícono de la
   tarjeta por <img src={img('kit-playera.jpg')} alt="Playera oficial" className="..."> */
const KIT = [
  { Icono: Shirt, titulo: 'Playera oficial', texto: 'Diseño HANGUK RUN, tela dry-fit.' },
  { Icono: Medal, titulo: 'Medalla temática', texto: 'Diseño coreano para todos los que crucen la meta.' },
  { Icono: Cookie, titulo: 'Snack coreano', texto: 'Hidratación y un antojo coreano en la meta.' },
];

export function Kit() {
  return (
    <section id="kit" className="bg-paper-2 py-24 lg:py-28">
      <Wrap>
        <Km n="07" ko="기념품">
          Lo que recibes
        </Km>
        <h2 className="display mt-6 text-[clamp(2.8rem,7vw,5rem)]">Kit de la carrera</h2>

        <div className="mt-12 grid gap-4 lg:grid-cols-12">
          <article className="flex flex-col justify-between gap-8 rounded-[4px] bg-ink p-6 text-paper sm:flex-row sm:items-center lg:col-span-6">
            <div className="max-w-xs">
              <p className="display text-[2.4rem] text-coral">01</p>
              <h3 className="mt-2 text-xl font-bold">Número de corredor</h3>
              <p className="mt-1 text-paper/70">El número que tú elijas, con tu nombre en español y en hangul.</p>
            </div>
            <Dorsal numero="128" nombre="Ana · 아나" pie="Corredora" className="w-full max-w-[15rem] shrink-0 -rotate-2 text-[11px]" />
          </article>
          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-6 lg:grid-cols-1">
            {KIT.map(({ Icono, titulo, texto }, i) => (
              <article key={titulo} className="flex gap-5 rounded-[4px] bg-card p-5 ring-1 ring-ink/10 sm:flex-col lg:flex-row lg:items-center">
                <span className="display w-10 shrink-0 text-[2rem] text-ink/30">{String(i + 2).padStart(2, '0')}</span>
                <Icono size={30} strokeWidth={1.6} className="shrink-0 text-coral" />
                <div>
                  <h3 className="text-lg font-bold">{titulo}</h3>
                  <p className="text-ink/70">{texto}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Wrap>
    </section>
  );
}
