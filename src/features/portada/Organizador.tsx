import { Baby, BookOpen, HandHeart, Mail, Recycle } from 'lucide-react';
import { EMAIL, FACEBOOK_URL, INSTAGRAM_URL } from '../../config';
import { img } from '../../shared/format';
import { Button } from '../../shared/ui/Button';
import { Card } from '../../shared/ui/Card';
import { Seccion } from '../layout/Seccion';
import { Instagram } from './Instagram';

// ✏️ Proyectos de Granito de Arena que ya están en marcha
const PROYECTOS = [
  { Icono: HandHeart, titulo: 'Servicios profesionales gratuitos', texto: 'Asesoría profesional sin costo para quien la necesita.' },
  { Icono: Baby, titulo: 'Espacios dignos de lactancia', texto: 'Lugares cómodos y seguros para que las mamás amamanten con tranquilidad.' },
  { Icono: Recycle, titulo: 'Talleres ambientales', texto: 'Jabón con aceite usado y masa moldeable con sobras de café.' },
  { Icono: BookOpen, titulo: 'Ruta de la Lectura', texto: 'Grupos de lectura para jóvenes en las cafeterías locales.' },
];

const DATOS = [
  { valor: '2021', texto: 'el año en que empezamos, sin fines de lucro' },
  { valor: '4', texto: 'proyectos que sostenemos todo el año' },
];

/** Quién está detrás: un colectivo con trayectoria, proyectos reales y contacto directo. */
export function Organizador() {
  return (
    <Seccion id="organizador">
      <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-4">
          <img
            src={img('logo-granito-de-arena.png')}
            alt="Logo de Granito de Arena: dos manos sostienen un corazón"
            width={600}
            height={600}
            loading="lazy"
            className="mx-auto w-full max-w-[13rem] -rotate-6 drop-shadow-[6px_8px_0_var(--color-stamp)] sm:max-w-[18rem] lg:mx-0"
          />
        </div>
        <div className="lg:col-span-8">
          <p lang="ko" aria-hidden="true" className="mb-3 text-[1.15rem] text-danger">
            주최
          </p>
          <p className="text-label text-fg-muted">Quién organiza</p>
          <h2 id="organizador-titulo" className="mt-2 titulo-display">
            Granito de Arena
          </h2>
          <p className="mt-4 max-w-prose text-lead">
            Somos un colectivo ciudadano de San Martín Texmelucan que defiende y difunde los derechos humanos y apoya buenas causas. HANGUK RUN lo organizamos con voluntarios,
            aliados y mucho cariño por nuestra ciudad.
          </p>
          <dl className="mt-7 grid max-w-md grid-cols-2 gap-4">
            {DATOS.map((d) => (
              <div key={d.texto} className="border-t-[2.5px] border-outline pt-3">
                <dt className="cifra text-[2.2rem]">{d.valor}</dt>
                <dd className="text-small text-fg-muted">{d.texto}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button label="Escríbenos" icon={Mail} variant="ink" href={`mailto:${EMAIL}`} />
            <Button label="Instagram" variant="secondary" href={INSTAGRAM_URL} />
            <Button label="Facebook" variant="secondary" href={FACEBOOK_URL} />
          </div>
        </div>
      </div>

      <h3 className="mt-20 subtitulo">Lo que ya hacemos todo el año</h3>
      <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PROYECTOS.map(({ Icono, titulo, texto }) => (
          <li key={titulo}>
            <Card className="h-full p-6">
              <span className="flex size-12 items-center justify-center rounded-pill border-[2.5px] border-outline bg-accent text-on-accent">
                <Icono size={22} aria-hidden="true" strokeWidth={2.2} />
              </span>
              <h4 className="mt-4 font-display text-[1.2rem] leading-tight font-semibold">{titulo}</h4>
              <p className="mt-1.5 text-small text-fg-muted">{texto}</p>
            </Card>
          </li>
        ))}
      </ul>
      <Instagram />
    </Seccion>
  );
}
