import { useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { CONFIG } from '../../config';
import { fechaConDia, hora, img, pesos } from '../../shared/format';
import { Button } from '../../shared/ui/Button';
import { Contenedor } from '../../shared/ui/decoracion';
import { Logotipo, Skyline } from '../layout/Logotipo';
import { Pendiente } from '../layout/Seccion';
import { Dorsal } from '../registro/Dorsal';
import { PRECIO } from '../registro/datos';
import { Cuenta } from './Cuenta';

const { minimo: MIN, maximo: MAX } = CONFIG.numeros;
const SALIDA = new Date(CONFIG.salida);

/** La promesa: qué es, cuándo, dónde y por qué, con la sede a la vista desde el primer momento. */
export function Hero() {
  // Un número cualquiera del tablero, para mostrar que cada quien elige el suyo
  const [numero] = useState(() => MIN + Math.floor(Math.random() * (MAX - MIN + 1)));

  return (
    <section id="inicio" aria-labelledby="inicio-titulo" className="relative overflow-hidden border-b-[3px] border-outline">
      <Contenedor className="relative grid gap-14 pt-28 pb-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-12 lg:pt-32 lg:pb-20">
        <div className="text-center lg:text-left">
          <p className="flex items-center justify-center gap-3 etiqueta lg:justify-start">
            <img src={img('logo-granito-de-arena.png')} alt="" width={44} height={44} className="size-11" />
            Granito de Arena presenta
          </p>

          <h1 id="inicio-titulo" className="mt-6">
            <Logotipo />
            <span className="sr-only">Hanguk Run 한국</span>
          </h1>
          <p className="mt-3 etiqueta text-accent">7 · feb · 2027 — El Moral, Texmelucan</p>
          <Skyline className="mx-auto mt-4 w-full max-w-[34rem] lg:mx-0" />

          <p className="mx-auto mt-6 max-w-[34rem] text-lead lg:mx-0">
            Corre 3, 5 o 10 km por las calles de San Martín Texmelucan, con salida y meta en una hacienda de cuatro siglos, y ayuda a que jóvenes de Granito de Arena lleguen a
            Corea del Sur.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Button label={`Inscríbete por ${pesos(PRECIO)}`} size="lg" href="#inscripcion" />
            <Button label="Conoce la causa" icon={ArrowDown} iconPosition="end" size="lg" variant="secondary" href="#por-que" />
          </div>

          <dl className="mt-8 grid max-w-[34rem] gap-x-6 gap-y-4 border-t-[3px] border-outline pt-5 text-left sm:grid-cols-2">
            <div>
              <dt className="etiqueta text-fg-muted">Cuándo</dt>
              <dd className="mt-1 font-display text-[1.1rem] font-extrabold">
                {fechaConDia(SALIDA)}, {hora(SALIDA)} h
              </dd>
            </div>
            <div>
              <dt className="etiqueta text-fg-muted">Inscripciones</dt>
              <dd className="mt-1 font-display text-[1.1rem] font-extrabold">
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
              <dt className="etiqueta text-fg-muted">Salida y meta</dt>
              <dd className="mt-1 font-display text-[1.1rem] font-extrabold">
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
            <div className="relative border-[3px] border-outline bg-surface p-2.5 shadow-[8px_8px_0_0_var(--color-accent)]">
              <img
                src={img('polaxtla-fachada.jpg')}
                alt="Fachada del Museo Hacienda San Cristóbal Polaxtla, con su galería de vidrio, palmeras y jardín"
                width={636}
                height={384}
                fetchPriority="high"
                className="aspect-[636/384] w-full object-cover"
              />
              <figcaption className="absolute top-5 left-5 border-[3px] border-outline bg-ink px-3 py-1.5 etiqueta text-on-ink">
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
    </section>
  );
}
