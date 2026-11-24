import { ChevronDown, Mail } from 'lucide-react';
import { EMAIL } from '../../config';
import { Button } from '../../shared/ui/Button';
import { abrirPrivacidad, abrirReglamento } from '../layout/eventos';
import { Pendiente, Seccion } from '../layout/Seccion';
import { PREGUNTAS } from './listaPreguntas';

/** Preguntas frecuentes: acordeón nativo (<details>), accesible con teclado y lector de pantalla. */
export function Preguntas() {
  return (
    <Seccion
      id="preguntas"
      ko="자주 묻는 질문"
      titulo="Preguntas frecuentes"
      entrada={
        <>
          ¿No encuentras tu respuesta? Escríbenos y te contestamos.
          <Button
            label="Escribir a Granito de Arena"
            icon={Mail}
            variant="secondary"
            size="sm"
            href={`mailto:${EMAIL}?subject=Duda%20sobre%20HANGUK%20RUN`}
            className="mt-4 flex w-fit"
          />
        </>
      }
    >
      <div className="mt-12 divide-y-[1.5px] divide-line overflow-hidden rounded-xl bg-surface estampa">
        {PREGUNTAS.map((p) => (
          <details key={p.pregunta} className="group">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-display text-[1.15rem] font-semibold hover:bg-hover sm:px-7 [&::-webkit-details-marker]:hidden">
              {p.pregunta}
              <ChevronDown size={22} aria-hidden="true" className="shrink-0 transition-transform duration-(--duration-base) group-open:rotate-180" />
            </summary>
            <div className="max-w-prose px-5 pb-5 text-fg-muted sm:px-7">
              <p>{p.respuesta}</p>
              {p.pendiente ? (
                <p className="mt-2 text-small">
                  <Pendiente>{p.pendiente}</Pendiente>
                </p>
              ) : null}
            </div>
          </details>
        ))}
      </div>
      <p className="mt-6 text-small text-fg-muted">
        Lee también el{' '}
        <button type="button" onClick={abrirReglamento} className="cursor-pointer font-bold text-link underline underline-offset-4">
          reglamento y la carta responsiva
        </button>{' '}
        y el{' '}
        <button type="button" onClick={abrirPrivacidad} className="cursor-pointer font-bold text-link underline underline-offset-4">
          aviso de privacidad
        </button>
        .
      </p>
    </Seccion>
  );
}
