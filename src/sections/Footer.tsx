import { useEffect, useState } from 'react';
import { CONFIG, EMAIL, FACEBOOK_URL, INSTAGRAM_URL } from '../config';
import { abrirReglamento, alAbrirReglamento } from '../lib/format';
import { Dialog } from '../components/Dialog';
import { btn, Saekdong, Wrap } from '../components/ui';

export function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <Saekdong />
      <Wrap className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.7fr_1.3fr_0.9fr_1fr]">
        <div>
          <p className="display text-[2.6rem]">
            Hanguk <span className="text-sol">Run</span>{' '}
            <span lang="ko" className="font-ko text-[0.7em] font-normal text-paper/60">
              한국
            </span>
          </p>
          <p className="mt-3 text-paper/70">
            De aquí para el mundo · Carrera con causa de Granito de Arena
            <br />6 de diciembre de 2026 · {CONFIG.sede.nombre}, San Martín Texmelucan, Puebla
          </p>
        </div>
        {/* ✏️ CAMBIAR: contacto del pie */}
        <div>
          <h4 className="text-[12px] font-semibold tracking-[0.14em] text-paper/50 uppercase">Contacto</h4>
          <a href={`mailto:${EMAIL}`} className="mt-3 block [overflow-wrap:anywhere] hover:text-sol">
            {EMAIL}
          </a>
        </div>
        <div>
          <h4 className="text-[12px] font-semibold tracking-[0.14em] text-paper/50 uppercase">Síguenos</h4>
          <a href={FACEBOOK_URL} target="_blank" rel="noopener" className="mt-3 block hover:text-sol">
            Facebook
          </a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener" className="mt-1 block hover:text-sol">
            Instagram
          </a>
        </div>
        <div>
          <h4 className="text-[12px] font-semibold tracking-[0.14em] text-paper/50 uppercase">Documentos</h4>
          <button type="button" onClick={abrirReglamento} className="mt-3 block text-left hover:text-sol">
            Reglamento y responsiva
          </button>
        </div>
      </Wrap>
      <Wrap className="border-t border-paper/15 py-6 text-sm text-paper/50">© 2026 HANGUK RUN · Granito de Arena. Todos los derechos reservados.</Wrap>
      <Reglamento />
    </footer>
  );
}

/** Reglamento y carta responsiva. Se abre desde cualquier enlace con abrirReglamento(). */
function Reglamento() {
  const [open, setOpen] = useState(false);
  useEffect(() => alAbrirReglamento(() => setOpen(true)), []);
  return (
    <Dialog open={open} onClose={() => setOpen(false)} titulo="Reglamento y carta responsiva">
      {/* ✏️ CAMBIAR: texto del reglamento */}
      <ol className="list-decimal space-y-2.5 pl-5 text-[15px] leading-relaxed text-ink/85 marker:font-bold marker:text-rojo">
        <li>La edad mínima para participar es de 12 años. Menores de 18 requieren autorización de padre o tutor.</li>
        <li>
          Cada participante elige su número de corredor al inscribirse; los números se apartan en el orden en que se completan las inscripciones. Una vez apartado, tienes{' '}
          <strong>4 días</strong> para realizar el pago; si no se realiza en ese plazo, el número podrá liberarse.
        </li>
        <li>El número de corredor es personal e intransferible y debe portarse al frente, visible.</li>
        <li>El tiempo límite para completar la ruta es de 1 hora 30 minutos.</li>
        <li>Es obligatorio seguir la ruta marcada y las indicaciones de jueces y personal de apoyo.</li>
        <li>Se permite correr con vestuario temático, siempre que no ponga en riesgo tu seguridad ni la de otros corredores.</li>
        <li>
          No hay reembolsos: tu inscripción es un donativo que apoya la representación de los 10 jóvenes voluntarios de Granito de Arena. Los cambios de distancia o talla
          están sujetos a disponibilidad.
        </li>
        <li>Los premios son únicamente en efectivo (bolsa total de $20,000) y se entregan presentando identificación oficial.</li>
      </ol>
      <h3 className="mt-7 text-lg font-bold">Carta responsiva</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-ink/85">
        Declaro que me encuentro en condiciones físicas y de salud adecuadas para participar en HANGUK RUN. Participo de forma voluntaria y bajo mi propio riesgo, y libero
        al comité organizador, patrocinadores y autoridades de cualquier responsabilidad por lesiones o daños que pudiera sufrir antes, durante o después del evento.
        Autorizo el uso de mi imagen en fotografías y videos del evento.
      </p>
      <button type="button" onClick={() => setOpen(false)} className={`${btn.base} ${btn.primario} ${btn.md} mt-7 w-full`}>
        Entendido
      </button>
    </Dialog>
  );
}
