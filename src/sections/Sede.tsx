import { BadgeCheck, Car, Info, Landmark, MapPin, Navigation, Trees } from 'lucide-react';
import { CONFIG } from '../config';
import { img } from '../lib/format';
import { btn, Km, Pendiente, Wrap } from '../components/ui';

const { sede } = CONFIG;
const BUSQUEDA = encodeURIComponent('Museo Hacienda de San Cristóbal Polaxtla, San Martín Texmelucan, Puebla');
const MAPS = `https://www.google.com/maps/search/?api=1&query=${BUSQUEDA}`;
const WAZE = `https://waze.com/ul?ll=${sede.lat},${sede.lng}&navigate=yes`;
const EMBED = `https://www.google.com/maps?q=${BUSQUEDA}&z=15&output=embed`;

// ✏️ CAMBIAR: datos de la sede (fuentes: Secretaría de Cultura · México es Cultura, México Desconocido)
const CIFRAS = [
  { valor: '1614', texto: 'Primeros registros de la hacienda, en un juicio por el uso del agua.' },
  { valor: '33 ha', texto: 'De bosque de fresnos, jardines, un jagüey y tierras de cultivo.' },
  { valor: 'INAH', texto: 'Catalogada como monumento histórico.' },
];

export function Sede() {
  return (
    <section id="sede" className="bg-ink py-24 text-paper lg:py-32">
      <Wrap>
        <div className="flex flex-wrap items-center gap-4">
          <Km n="05" ko="장소" tono="oscuro">
            La sede
          </Km>
          {!sede.autorizada && <span className="rounded-[3px] border border-hwang px-2 py-0.5 text-[12px] font-semibold tracking-[0.1em] text-hwang uppercase">Sujeta a autorización</span>}
        </div>

        <h2 className="display mt-6 max-w-5xl text-[clamp(2.9rem,8vw,6.5rem)]">
          Museo Hacienda
          <br />
          <span className="text-hong">San Cristóbal Polaxtla</span>
        </h2>
        {/* ✏️ CAMBIAR: descripción de la sede */}
        <p className="mt-6 max-w-3xl text-xl leading-snug text-paper/80">
          Esta vez corremos en casa: una hacienda novohispana dentro de San Martín Texmelucan, rodeada de un bosque de fresnos y jardines. Hoy es una casa museo de la
          Fundación Cultural Antonio Haghenbeck y de la Lama, con pintura novohispana, tapicería europea y una colección de relojes.
        </p>

        <dl className="mt-14 grid gap-px overflow-hidden rounded-[4px] bg-paper/15 sm:grid-cols-3">
          {CIFRAS.map((c) => (
            <div key={c.valor} className="bg-ink p-6">
              <dt className="display text-[3.6rem] text-paper">{c.valor}</dt>
              <dd className="mt-2 text-paper/70">{c.texto}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-14 grid gap-10 lg:grid-cols-12">
          <div className="overflow-hidden rounded-[4px] bg-ink-2 lg:col-span-7">
            <iframe
              src={EMBED}
              title={`Mapa: ${sede.nombre}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block aspect-[4/3] w-full grayscale-[0.35] sm:aspect-[16/10]"
            />
          </div>
          <div className="lg:col-span-5">
            <ul className="divide-y divide-paper/15 border-y border-paper/15">
              <li className="flex gap-4 py-4">
                <MapPin size={20} className="mt-0.5 shrink-0 text-hong" />
                <div>
                  <strong className="block">San Martín Texmelucan, Puebla</strong>
                  <span className="text-paper/70">Prol. Ignacio Zaragoza s/n, a unos minutos del centro.</span>
                </div>
              </li>
              <li className="flex gap-4 py-4">
                <Landmark size={20} className="mt-0.5 shrink-0 text-hong" />
                <div>
                  <strong className="block">Una hacienda con historia</strong>
                  <span className="text-paper/70">Productora de trigo y cebada en el Virreinato; restaurada desde 1963.</span>
                </div>
              </li>
              <li className="flex gap-4 py-4">
                <Trees size={20} className="mt-0.5 shrink-0 text-hong" />
                <div>
                  <strong className="block">Naturaleza</strong>
                  <span className="text-paper/70">Bosque de fresnos, jardines y áreas verdes para correr y convivir en familia.</span>
                </div>
              </li>
              <li className="flex gap-4 py-4">
                <BadgeCheck size={20} className="mt-0.5 shrink-0 text-hong" />
                <div>
                  <strong className="block">Servicios</strong>
                  <span className="text-paper/70">
                    Sanitarios y estacionamiento en el museo. Para la carrera: <Pendiente />
                  </span>
                </div>
              </li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <a className={`${btn.base} ${btn.rojo} ${btn.md}`} href={MAPS} target="_blank" rel="noopener">
                <Navigation size={17} /> Google Maps
              </a>
              <a className={`${btn.base} ${btn.bordeClaro} ${btn.md}`} href={WAZE} target="_blank" rel="noopener">
                <Car size={17} /> Waze
              </a>
            </div>
            {/* ✏️ CAMBIAR: indicaciones de llegada y estacionamiento */}
            <p className="mt-6 flex gap-3 text-[15px] text-paper/70">
              <Info size={18} className="mt-0.5 shrink-0" />
              <span>
                Llega con al menos 45 minutos de anticipación. Estacionamiento y transporte el día de la carrera: <Pendiente />
              </span>
            </p>
          </div>
        </div>

        {/* Galería: se llena desde CONFIG.sede.fotos en src/config.ts */}
        {sede.fotos.length > 0 && (
          <div className="mt-14 grid gap-3 sm:grid-cols-3">
            {sede.fotos.map((f) => (
              <figure key={f.src} className="overflow-hidden rounded-[4px]">
                <img src={img(f.src)} alt={f.alt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                {f.pie && <figcaption className="pt-2 text-sm text-paper/60">{f.pie}</figcaption>}
              </figure>
            ))}
          </div>
        )}
      </Wrap>
    </section>
  );
}
