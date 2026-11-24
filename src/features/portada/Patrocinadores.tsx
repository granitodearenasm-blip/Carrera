import { ExternalLink, Mail } from 'lucide-react';
import { CONFIG, EMAIL } from '../../config';
import { fechaConDia } from '../../shared/format';
import { Button } from '../../shared/ui/Button';
import { Card } from '../../shared/ui/Card';
import { Manchas } from '../../shared/ui/decoracion';
import { Pendiente, Seccion } from '../layout/Seccion';
import { LogoPatrocinador } from './LogoPatrocinador';
import { agruparPatrocinadores } from './nivelesPatrocinio';

const CORREO = `mailto:${EMAIL}?subject=Quiero%20patrocinar%20HANGUK%20RUN`;
const ALTURA = { oro: 'h-28', plata: 'h-24', bronce: 'h-20' } as const;
const COLUMNAS = { oro: 'sm:grid-cols-3', plata: 'grid-cols-2 sm:grid-cols-4', bronce: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6' } as const;

/** Los patrocinadores, en grande: sin ellos no hay carrera. Y la invitación a sumarse. */
export function Patrocinadores() {
  const [principal, ...niveles] = agruparPatrocinadores();
  return (
    <Seccion
      id="patrocinadores"
      ko="후원"
      titulo="Ellos hacen posible la carrera"
      entrada="Empresas y aliados que respaldan a la delegación. Cuando elijas dónde comprar o qué usar, acuérdate de quién nos apoyó."
    >
      {/* Patrocinio principal: tarjetas grandes con logo, descripción y enlace */}
      <ul className="mt-12 grid gap-6 lg:grid-cols-2">
        {principal.patrocinadores.map((p) => (
          <li key={p.nombre}>
            <Card className="flex h-full flex-col gap-5 p-7 sm:p-9" look="estampa">
              <p className="text-small font-semibold text-fg-muted">{principal.nombre}</p>
              <LogoPatrocinador p={p} className="h-14 w-auto self-start sm:h-16" />
              {p.descripcion ? <p className="text-lead">{p.descripcion}</p> : null}
              {p.url ? <Button label={`Conoce ${p.nombre}`} icon={ExternalLink} iconPosition="end" variant="secondary" href={p.url} className="mt-auto self-start" /> : null}
            </Card>
          </li>
        ))}
        {Array.from({ length: principal.libres }, (_, k) => (
          <li key={`libre-${k}`}>
            <a
              href={CORREO}
              className="flex h-full min-h-56 flex-col items-start justify-center gap-2 rounded-lg border-[2.5px] border-dashed border-line-strong p-7 transition-colors hover:border-outline hover:bg-sand/40"
            >
              <span className="text-small font-semibold text-fg-muted">{principal.nombre}</span>
              <span className="titulo">Este lugar puede ser de tu marca</span>
              <span className="text-fg-muted">Escríbenos y te contamos cómo sumarte.</span>
            </a>
          </li>
        ))}
      </ul>

      {/* Oro, plata y bronce */}
      <div className="mt-14 space-y-10">
        {niveles
          .filter((nivel) => nivel.patrocinadores.length > 0)
          .map((nivel) => {
            const id = nivel.id as keyof typeof ALTURA;
            return (
              <div key={nivel.id} className="grid gap-4 sm:grid-cols-[8rem_1fr]">
                <h3 className="subtitulo">{nivel.nombre}</h3>
                <ul className={`grid gap-4 ${COLUMNAS[id]}`}>
                  {nivel.patrocinadores.map((p) => (
                    <li key={p.nombre}>
                      <a
                        href={p.url ?? CORREO}
                        target={p.url ? '_blank' : undefined}
                        rel="noopener"
                        className={`flex size-full items-center justify-center rounded-lg bg-surface p-4 estampa-sm ${ALTURA[id]}`}
                      >
                        <LogoPatrocinador p={p} className="max-h-full max-w-[85%]" />
                      </a>
                    </li>
                  ))}
                  {/* Un solo lugar libre al final: invita sin llenar la página de recuadros vacíos */}
                  {Array.from({ length: Math.min(1, nivel.libres) }, (_, k) => (
                    <li key={k}>
                      <a
                        href={CORREO}
                        className={`flex size-full items-center justify-center rounded-lg border-[2px] border-dashed border-line-strong text-small font-bold text-fg-muted transition-colors hover:border-outline hover:bg-sand/40 hover:text-fg ${ALTURA[id]}`}
                      >
                        Tu marca aquí
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
      </div>

      {/* Invitación a patrocinar, solo con datos verdaderos */}
      <div className="relative mt-16 overflow-hidden rounded-xl bg-accent p-7 text-on-accent estampa-lg sm:p-10">
        <Manchas className="text-accent-soft" manchas={[{ x: 95, y: 20, size: 30, forma: 1 }]} />
        <div className="relative grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <h3 className="titulo">Patrocina HANGUK RUN</h3>
            <ul className="mt-4 space-y-2">
              <li>
                Hasta {CONFIG.numeros.maximo} corredores y sus familias, el {fechaConDia(new Date(CONFIG.salida)).toLowerCase()}, en la salida y la meta de la hacienda.
              </li>
              <li>Una causa juvenil de San Martín Texmelucan con alcance internacional.</li>
              <li>Tu marca en esta página, que acompaña cada inscripción, y en cada confirmación que reciben los corredores.</li>
            </ul>
            <p className="mt-4 font-semibold">
              Lugares disponibles:{' '}
              {[principal, ...niveles]
                .filter((n) => n.libres > 0)
                .map((n) => {
                  const corto = n.nombre.replace('Patrocinio ', '');
                  return `${corto.charAt(0).toUpperCase()}${corto.slice(1)} (${n.libres})`;
                })
                .join(', ')}
            </p>
            <div className="mt-3">
              {CONFIG.patrocinio.beneficios.length ? (
                <ul className="list-disc space-y-1 pl-5">
                  {CONFIG.patrocinio.beneficios.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : (
                <Pendiente>beneficios por nivel</Pendiente>
              )}
            </div>
          </div>
          <div className="lg:col-span-5 lg:justify-self-end">
            <Button label="Quiero patrocinar" icon={Mail} variant="ink" size="lg" href={CORREO} />
            <p className="mt-3 text-small">O escríbenos a {EMAIL}</p>
          </div>
        </div>
      </div>
    </Seccion>
  );
}
