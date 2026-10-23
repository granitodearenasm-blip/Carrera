import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { CONFIG } from '../config';
import { img } from '../lib/format';
import { Countdown } from '../components/Countdown';
import { Dorsal } from '../components/Dorsal';
import { btn, Saekdong, Wrap } from '../components/ui';

export function Hero() {
  // Un número cualquiera del tablero, para mostrar que cada quien elige el suyo
  const [numero] = useState(() => String(CONFIG.numeros.minimo + Math.floor(Math.random() * (CONFIG.numeros.maximo - CONFIG.numeros.minimo + 1))).padStart(3, '0'));

  return (
    <section id="inicio" className="relative overflow-hidden">
      <span aria-hidden lang="ko" className="pointer-events-none absolute top-24 -right-6 hidden font-ko text-[15rem] leading-none text-ink/[0.04] select-none lg:block [writing-mode:vertical-rl]">
        가자
      </span>

      <Wrap className="relative grid gap-14 pt-28 pb-16 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-16 lg:pt-36 lg:pb-24">
        <div>
          <p className="flex items-center gap-3 text-[13px] font-semibold tracking-[0.14em] text-muted uppercase">
            <img src={img('logo-granito-de-arena.png')} alt="" width={32} height={32} className="size-8 rounded-full ring-1 ring-ink/10" />
            Carrera con causa · Granito de Arena
          </p>

          {/* ✏️ CAMBIAR: nombre de la carrera */}
          <h1 className="display mt-6 text-[clamp(4.6rem,16vw,11rem)]">
            Hanguk
            <br />
            Run{' '}
            <span lang="ko" className="relative -top-[0.08em] ml-1 inline-block -rotate-3 rounded-[0.06em] bg-coral px-[0.14em] py-[0.08em] align-middle font-ko text-[0.36em] leading-none font-normal text-white">
              한국
            </span>
          </h1>
          <p className="mt-6 text-[clamp(1.4rem,3vw,2rem)] leading-tight font-bold condensed">De aquí para el mundo.</p>

          {/* ✏️ CAMBIAR: descripción corta (1-2 frases) */}
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink/75">
            Corre por los <strong className="text-ink">10 jóvenes voluntarios</strong> de Granito de Arena que representarán a San Martín Texmelucan en un encuentro
            internacional de intercambio cultural y liderazgo juvenil en Corea del Sur.
          </p>

          {/* ✏️ CAMBIAR: fecha y lugar visibles */}
          <dl className="mt-9 grid max-w-2xl grid-cols-2 border-y border-ink/20 sm:grid-cols-[auto_auto_1fr]">
            <div className="py-3.5 pr-6">
              <dt className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Domingo</dt>
              <dd className="mt-0.5 font-bold">6 de diciembre de 2026</dd>
            </div>
            <div className="border-l border-ink/20 py-3.5 pl-5 sm:pr-6">
              <dt className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Distancias</dt>
              <dd className="mt-0.5 font-bold">3K · 5K · 10K</dd>
            </div>
            <div className="col-span-2 border-t border-ink/20 py-3.5 sm:col-span-1 sm:border-t-0 sm:border-l sm:pl-5">
              <dt className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Sede · San Martín Texmelucan</dt>
              <dd className="mt-0.5 font-bold">
                <a href="#sede" className="underline decoration-coral decoration-2 underline-offset-4 hover:text-coral">
                  {CONFIG.sede.nombre}
                </a>
              </dd>
            </div>
          </dl>

          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#inscripcion" className={`${btn.base} ${btn.primario} ${btn.lg}`}>
              Inscríbete · $400 <ArrowRight size={18} />
            </a>
            <a href="#por-que" className={`${btn.base} ${btn.borde} ${btn.lg}`}>
              ¿Por qué corremos?
            </a>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[30rem] lg:mx-0 lg:justify-self-end">
          {/* La sede como postal, con el dorsal prendido encima */}
          <figure className="relative pr-3 pb-16">
            <img
              src={img('polaxtla-fachada.jpg')}
              alt="Fachada del Museo Hacienda San Cristóbal Polaxtla, con su galería de vidrio y jardines"
              width={636}
              height={384}
              className="aspect-[16/10] w-full -rotate-2 rounded-[3px] object-cover shadow-[0_24px_50px_-24px_rgb(61_38_0/0.55)] ring-[10px] ring-card"
            />
            <figcaption className="absolute top-4 left-3 -rotate-2 rounded-[3px] bg-ink px-2 py-1 text-[11px] font-semibold tracking-[0.12em] text-paper uppercase">
              La sede · Polaxtla
            </figcaption>
            <div className="absolute right-0 bottom-0 w-[62%] rotate-[4deg]">
              <Dorsal numero={numero} className="text-[10px] sm:text-[11px]" />
            </div>
          </figure>
          <p className="mt-5 text-center text-sm text-muted">
            Tú eliges tu número: del {CONFIG.numeros.minimo} al {CONFIG.numeros.maximo}.
          </p>
          <div className="mt-6">
            <Countdown />
          </div>
        </div>
      </Wrap>
      <Saekdong />
    </section>
  );
}
