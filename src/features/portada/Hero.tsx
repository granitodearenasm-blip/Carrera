import { useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { CONFIG } from '../../config';
import { fechaConDia, hora, img, pesos } from '../../shared/format';
import { Button } from '../../shared/ui/Button';
import { Contenedor, Manchas, Saekdong } from '../../shared/ui/decoracion';
import { Pendiente } from '../layout/Seccion';
import { Dorsal } from '../registro/Dorsal';
import { PRECIO } from '../registro/datos';
import { Cuenta } from './Cuenta';
import { RamaCerezo } from './corea';
import { SelloTaegeuk } from './ilustraciones';

const { minimo: MIN, maximo: MAX } = CONFIG.numeros;
const SALIDA = new Date(CONFIG.salida);

/** La promesa: qué es, cuándo, dónde y por qué, con la sede a la vista desde el primer momento. */
export function Hero() {
  // Un número cualquiera del tablero, para mostrar que cada quien elige el suyo
  const [numero] = useState(() => MIN + Math.floor(Math.random() * (MAX - MIN + 1)));

  return (
    <section id="inicio" aria-labelledby="inicio-titulo" className="relative overflow-hidden bg-accent text-on-accent">
      <Manchas
        className="text-accent-soft"
        manchas={[
          { x: 6, y: 20, size: 20, forma: 0, rotar: 10 },
          { x: 48, y: 96, size: 22, forma: 1, rotar: -20 },
          { x: 97, y: 12, size: 16, forma: 2, rotar: 40 },
        ]}
      />
      {/* Cerezo en flor que entra por la esquina */}
      <RamaCerezo className="pointer-events-none absolute top-16 right-0 hidden w-64 sm:block lg:w-80" />
      <Contenedor className="relative grid gap-14 pt-28 pb-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-12 lg:pt-32 lg:pb-20">
        <div>
          <p className="flex items-center gap-3 font-display text-[1.05rem] font-semibold">
            <img src={img('logo-granito-de-arena.png')} alt="" width={44} height={44} className="size-11" />
            Granito de Arena presenta
          </p>

          <h1 id="inicio-titulo" className="mt-5 titulo-hero">
            <span className="block" translate="no">
              Hanguk
            </span>
            <span className="flex items-center gap-[0.12em]" translate="no">
              Run
              <SelloTaegeuk className="size-[0.78em] shrink-0 -rotate-12" />
            </span>
            <span className="sr-only"> 한국</span>
          </h1>

          <p className="mt-6 max-w-[34rem] text-[clamp(1.2rem,1rem+0.8vw,1.5rem)] leading-snug font-semibold">
            Corre 3, 5 o 10 km por las calles de San Martín Texmelucan, con salida y meta en una hacienda de cuatro siglos, y ayuda a que jóvenes de Granito de Arena lleguen a
            Corea del Sur.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button label={`Inscríbete por ${pesos(PRECIO)}`} size="lg" variant="ink" href="#inscripcion" />
            <Button label="Conoce la causa" icon={ArrowDown} iconPosition="end" size="lg" variant="secondary" href="#por-que" />
          </div>

          <dl className="mt-8 grid max-w-[34rem] gap-x-6 gap-y-4 border-t-[2.5px] border-on-accent pt-5 sm:grid-cols-2">
            <div>
              <dt className="text-small font-semibold opacity-80">Cuándo</dt>
              <dd className="font-display text-[1.15rem] font-semibold">
                {fechaConDia(SALIDA)}, {hora(SALIDA)} h
              </dd>
            </div>
            <div>
              <dt className="text-small font-semibold opacity-80">Inscripciones</dt>
              <dd className="font-display text-[1.15rem] font-semibold">
                {CONFIG.cierreInscripciones ? (
                  `Abiertas hasta el ${CONFIG.cierreInscripciones}`
                ) : (
                  <>
                    Abiertas <Pendiente>fecha de cierre</Pendiente>
                  </>
                )}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-small font-semibold opacity-80">Salida y meta</dt>
              <dd className="font-display text-[1.15rem] font-semibold">
                <a href="#sede" className="underline decoration-2 underline-offset-4 hover:decoration-[3px]">
                  {CONFIG.sede.nombre}
                </a>
                , San Martín Texmelucan, Puebla
              </dd>
            </div>
          </dl>
        </div>

        {/* La sede como postal, con el dorsal pegado encima */}
        <div className="mx-auto w-full max-w-[34rem] lg:mr-0">
          <figure className="relative pb-24 sm:pb-28">
            <div className="relative rotate-[-2deg] rounded-lg border-[3px] border-on-accent bg-surface p-2.5 shadow-[7px_9px_0_0_var(--color-on-accent)]">
              <img
                src={img('polaxtla-fachada.jpg')}
                alt="Fachada del Museo Hacienda San Cristóbal Polaxtla, con su galería de vidrio, palmeras y jardín"
                width={636}
                height={384}
                fetchPriority="high"
                className="aspect-[636/384] w-full rounded-md object-cover"
              />
              <figcaption className="absolute top-5 left-5 rounded-pill border-[2px] border-on-accent bg-accent px-3 py-1 text-small font-bold text-on-accent">
                Salida y meta<span className="hidden sm:inline">: {CONFIG.sede.nombre}</span>
              </figcaption>
            </div>
            <div className="absolute bottom-0 left-[-4%] w-[52%] rotate-[-6deg] sm:left-[-6%]">
              <Dorsal numero={numero} pie="Tú eliges tu número" className="text-[clamp(8px,2.4vw,11px)]" />
            </div>
            <div className="absolute right-0 bottom-3 w-[44%]">
              <Cuenta compacta />
            </div>
          </figure>
        </div>
      </Contenedor>
      <Saekdong className="h-3" />
    </section>
  );
}
