import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CONFIG, EMAIL, FACEBOOK_URL, INSTAGRAM_URL } from '../../config';
import { fechaConDia, img } from '../../shared/format';
import { Button } from '../../shared/ui/Button';
import { Contenedor, Saekdong } from '../../shared/ui/decoracion';
import { Dialog } from '../../shared/ui/Dialog';
import { Skyline } from './Logotipo';
import { TiraPatrocinadores } from '../portada/TiraPatrocinadores';
import { abrirPrivacidad, abrirReglamento, alAbrirReglamento } from './eventos';
import { Privacidad } from './Privacidad';

const SALIDA = new Date(CONFIG.salida);
const ENLACE = 'inline-flex min-h-11 items-center underline-offset-4 hover:text-accent hover:underline';

export function Footer() {
  return (
    <footer className="text-on-ink">
      {/* Skyline de Seúl a línea con el sol rojo, apoyado sobre el pie marino */}
      <div className="pt-16">
        <Skyline className="mx-auto block w-full max-w-5xl px-4" />
      </div>
      <div className="border-t-[3px] border-outline bg-ink">
        <Contenedor className="grid gap-8 border-b-[1.5px] border-on-ink/15 py-10 lg:grid-cols-2 lg:items-end">
          <TiraPatrocinadores fondo="oscuro" />
          <p className="text-on-ink-muted lg:text-right">
            Salimos y llegamos al <strong className="text-on-ink">{CONFIG.sede.nombre}</strong> gracias a la {CONFIG.sede.fundacion}.
          </p>
        </Contenedor>
        <Contenedor className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.6fr_1.2fr_0.9fr_1fr]">
          <div className="flex gap-4">
            <img src={img('logo-granito-de-arena.png')} alt="" width={64} height={64} loading="lazy" className="size-16 shrink-0" />
            <div>
              <p className="font-logo text-[2.2rem] leading-none" translate="no">
                Hanguk Run{' '}
                <span lang="ko" className="text-[0.75em] text-accent">
                  한국
                </span>
              </p>
              <p className="mt-3 text-on-ink-muted">La carrera con causa de Granito de Arena. {fechaConDia(SALIDA)}, San Martín Texmelucan, Puebla.</p>
            </div>
          </div>
          <div>
            <h2 className="font-display text-[1.1rem] font-semibold text-accent">Contacto</h2>
            <a href={`mailto:${EMAIL}`} className={`${ENLACE} [overflow-wrap:anywhere]`}>
              {EMAIL}
            </a>
          </div>
          <div>
            <h2 className="font-display text-[1.1rem] font-semibold text-accent">Síguenos</h2>
            <ul>
              <li>
                <a href={FACEBOOK_URL} target="_blank" rel="noopener" className={ENLACE}>
                  Facebook
                </a>
              </li>
              <li>
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener" className={ENLACE}>
                  Instagram
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-display text-[1.1rem] font-semibold text-accent">Documentos</h2>
            <ul>
              <li>
                <Link to="/mi-inscripcion" className={ENLACE}>
                  Mi inscripción y pago
                </Link>
              </li>
              <li>
                <button type="button" onClick={abrirReglamento} className={`${ENLACE} cursor-pointer text-left`}>
                  Reglamento y carta responsiva
                </button>
              </li>
              <li>
                <button type="button" onClick={abrirPrivacidad} className={`${ENLACE} cursor-pointer text-left`}>
                  Aviso de privacidad
                </button>
              </li>
            </ul>
          </div>
        </Contenedor>
        <Contenedor className="border-t-[1.5px] border-on-ink/15 py-6 text-small text-on-ink-muted">© {SALIDA.getFullYear()} HANGUK RUN, Granito de Arena.</Contenedor>
      </div>
      <Saekdong className="h-3" />
      <Reglamento />
      <Privacidad />
    </footer>
  );
}

/** Reglamento y carta responsiva. Se abre desde cualquier enlace con abrirReglamento(). */
function Reglamento() {
  const [open, setOpen] = useState(false);
  useEffect(() => alAbrirReglamento(() => setOpen(true)), []);
  return (
    <Dialog open={open} onClose={() => setOpen(false)} title="Reglamento y carta responsiva">
      {/* ✏️ Texto del reglamento */}
      <ol className="list-decimal space-y-2.5 pl-5 text-fg marker:font-bold marker:text-danger">
        <li>La edad mínima para participar es de {CONFIG.edadMinima} años. Menores de 18 necesitan autorización de su madre, padre o tutor.</li>
        <li>
          Cada participante elige su número al inscribirse; los números se apartan en el orden en que se completan las inscripciones. Una vez apartado, tienes{' '}
          <strong>{CONFIG.pago.diasParaPagar} días</strong> para pagar; si no, el número puede liberarse.
        </li>
        <li>El número es personal e intransferible y se porta al frente, visible.</li>
        <li>El tiempo límite para completar la ruta es de 1 hora 30 minutos.</li>
        <li>Es obligatorio seguir la ruta marcada y las indicaciones de jueces y personal de apoyo.</li>
        <li>Se permite correr con vestuario temático, siempre que no ponga en riesgo tu seguridad ni la de otras personas.</li>
        <li>
          No hay reembolsos: tu inscripción es un donativo para la representación de los jóvenes voluntarios de Granito de Arena. Los cambios de distancia o talla dependen de la
          disponibilidad.
        </li>
        <li>Los premios son solo en efectivo (bolsa total de $20,000) y se entregan con identificación oficial.</li>
      </ol>
      <h3 className="mt-7 subtitulo">Carta responsiva</h3>
      <p className="mt-2 text-fg">
        Declaro que estoy en condiciones físicas y de salud adecuadas para participar en HANGUK RUN. Participo de forma voluntaria y bajo mi propio riesgo, y libero al comité
        organizador, patrocinadores y autoridades de cualquier responsabilidad por lesiones o daños antes, durante o después del evento. Autorizo el uso de mi imagen en fotos y
        videos del evento.
      </p>
      <Button label="Entendido" fullWidth className="mt-7" onPress={() => setOpen(false)} />
    </Dialog>
  );
}
