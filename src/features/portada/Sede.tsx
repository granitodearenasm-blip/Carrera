import { useState } from 'react';
import { Car, Footprints, Landmark, MapPin, Navigation, Trash2, Trees } from 'lucide-react';
import { CONFIG } from '../../config';
import { img } from '../../shared/format';
import { Badge } from '../../shared/ui/Badge';
import { Button } from '../../shared/ui/Button';
import { Dialog } from '../../shared/ui/Dialog';
import { Pendiente, Seccion } from '../layout/Seccion';

const { sede } = CONFIG;
const BUSQUEDA = encodeURIComponent('Museo Hacienda de San Cristóbal Polaxtla, San Martín Texmelucan, Puebla');
const MAPS = `https://www.google.com/maps/search/?api=1&query=${BUSQUEDA}`;
const WAZE = `https://waze.com/ul?ll=${sede.lat},${sede.lng}&navigate=yes`;
const EMBED = `https://www.google.com/maps?q=${BUSQUEDA}&z=15&output=embed`;

// ✏️ Historia de la sede (fuentes: Secretaría de Cultura, México es Cultura, México Desconocido)
const HISTORIA = [
  { valor: '1614', texto: 'Primeros registros de la hacienda, en un juicio por el uso del agua.' },
  { valor: '1963', texto: 'Comienza su restauración; hoy es casa museo.' },
  { valor: 'INAH', texto: 'Catalogada como monumento histórico.' },
  { valor: '33 ha', texto: 'De bosque de fresnos, jardines, un jagüey y tierras de cultivo.' },
];

// ✏️ Cómo cuidar la casa el día de la carrera
const CUIDADOS = [
  { Icono: Footprints, texto: 'En la salida y la meta, quédate en las zonas señaladas: los jardines no son pista.' },
  { Icono: Trash2, texto: 'Deja tu vaso y tu basura en los botes de la ruta y la meta.' },
  { Icono: Landmark, texto: 'Las salas y colecciones del museo no forman parte del evento.' },
];

/** La sede como agradecimiento: el museo nos presta su casa. Es la sección más amplia de la página. */
export function Sede() {
  const [foto, setFoto] = useState<number | null>(null);
  const actual = foto !== null ? sede.fotos[foto] : null;
  const [principal, ...otras] = sede.fotos;

  return (
    <Seccion
      id="sede"
      ko="감사합니다"
      titulo={sede.autorizada ? `Gracias al ${sede.nombre}` : sede.nombre}
      entrada={
        sede.autorizada ? (
          <>
            Y a la <strong className="text-on-ink">{sede.fundacion}</strong>, que nos abren las puertas de su casa para que esta carrera sea posible. Aquí será la salida y la meta:
            arrancaremos y celebraremos entre fresnos, jardines y cuatro siglos de historia.
          </>
        ) : (
          'Una hacienda novohispana dentro de San Martín Texmelucan, rodeada de fresnos y jardines.'
        )
      }
      tone="ink"
    >
      {!sede.autorizada ? (
        <Badge tone="accent" className="mt-6">
          Sujeta a autorización del museo
        </Badge>
      ) : null}

      {principal ? (
        <ul className="mt-12 grid gap-4 lg:grid-cols-12">
          {[principal, ...otras].map((f, i) => (
            <li key={f.src} className={i === 0 ? 'lg:col-span-7 lg:row-span-2' : 'lg:col-span-5'}>
              <button
                type="button"
                onClick={() => setFoto(i)}
                aria-label={`Ver en grande: ${f.pie ?? f.alt}`}
                className="group relative block size-full cursor-zoom-in overflow-hidden rounded-lg border-[3px] border-accent shadow-[5px_6px_0_0_var(--color-stamp)]"
              >
                <img
                  src={img(f.src)}
                  alt={f.alt}
                  width={636}
                  height={420}
                  loading="lazy"
                  className={`w-full object-cover transition-transform duration-(--duration-slow) group-hover:scale-[1.03] ${i === 0 ? 'aspect-[4/3] lg:h-full' : 'aspect-[16/9]'}`}
                />
                {f.pie ? <span className="absolute bottom-3 left-3 rounded-pill bg-accent px-3 py-1 text-small font-bold text-on-accent">{f.pie}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <h3 className="mt-16 titulo">Cuatro siglos de historia</h3>
      <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {HISTORIA.map((c) => (
          <div key={c.valor} className="border-t-[3px] border-accent pt-4">
            <dt className="cifra text-[3.2rem] text-accent">{c.valor}</dt>
            <dd className="mt-2 text-on-ink-muted">{c.texto}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-16 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border-[3px] border-accent bg-accent p-6 text-on-accent sm:p-8">
          <h3 className="titulo">Visítala también otro día</h3>
          <p className="mt-3">
            La hacienda es casa museo de la {sede.fundacion}: guarda pintura novohispana, tapicería europea y una colección de relojes, rodeada de jardines y un bosque de fresnos.
            Después de la carrera, vuelve con calma.
          </p>
          <Button label="Cómo llegar" icon={Navigation} variant="ink" href={MAPS} className="mt-5" />
        </div>
        <div className="rounded-xl border-[2.5px] border-dashed border-accent p-6 sm:p-8">
          <h3 className="titulo">Cuidemos la casa</h3>
          <p className="mt-3 text-on-ink-muted">Arrancar y llegar aquí es un privilegio. Ayúdanos a dejarla como la encontramos:</p>
          <ul className="mt-4 space-y-3">
            {CUIDADOS.map(({ Icono, texto }) => (
              <li key={texto} className="flex gap-3">
                <Icono size={21} aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
                <span>{texto}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-12">
        <div className="self-start overflow-hidden rounded-lg border-[3px] border-accent lg:col-span-7">
          <iframe src={EMBED} title={`Mapa: ${sede.nombre}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="block aspect-[4/3] w-full sm:aspect-[16/10]" />
        </div>
        <div className="lg:col-span-5">
          <h3 className="titulo">Cómo llegar</h3>
          <ul className="mt-5 space-y-5">
            <li className="flex gap-4">
              <MapPin size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
              <div>
                <strong className="block font-display text-[1.1rem]">Prol. Ignacio Zaragoza s/n</strong>
                <span className="text-on-ink-muted">San Martín Texmelucan, Puebla, a unos minutos del centro.</span>
              </div>
            </li>
            <li className="flex gap-4">
              <Car size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
              <div>
                <strong className="block font-display text-[1.1rem]">Estacionamiento y transporte</strong>
                <span className="text-on-ink-muted">Llega al menos 45 minutos antes de tu salida.</span> <Pendiente>estacionamiento el día de la carrera</Pendiente>
              </div>
            </li>
            <li className="flex gap-4">
              <Trees size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
              <div>
                <strong className="block font-display text-[1.1rem]">Para toda la familia</strong>
                <span className="text-on-ink-muted">Áreas verdes para esperar a tus corredores y celebrar en la meta.</span>
              </div>
            </li>
          </ul>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button label="Abrir en Google Maps" icon={Navigation} href={MAPS} />
            <Button label="Abrir en Waze" icon={Car} variant="secondary" href={WAZE} />
          </div>
        </div>
      </div>

      <Dialog open={actual !== null} onClose={() => setFoto(null)} title={actual?.pie ?? 'La sede'} width="44rem">
        {actual ? <img src={img(actual.src)} alt={actual.alt} className="w-full rounded-md" /> : null}
      </Dialog>
    </Seccion>
  );
}
