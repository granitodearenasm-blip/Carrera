import { CONFIG } from '../../config';
import { Card } from '../../shared/ui/Card';
import { Manchas } from '../../shared/ui/decoracion';
import { Pendiente, Seccion } from '../layout/Seccion';
import { PaisajeSeul } from './corea';

// Colores oficiales de los Objetivos de Desarrollo Sostenible (texto blanco a 4.5:1 o más en cada uno)
const ODS = [
  { n: 4, texto: 'Educación de calidad', color: '#C5192D' },
  { n: 8, texto: 'Trabajo decente', color: '#A21942' },
  { n: 9, texto: 'Innovación', color: '#B5501A' },
  { n: 11, texto: 'Ciudades sostenibles', color: '#A8640F' },
];

/* ✏️ Lo que regresa a la comunidad. Sin fechas: se organizan después del viaje.
   Uno nuevo sin confirmar va con confirmado: false (se marca "por confirmar"); con
   CONFIG.mostrarPorConfirmar = false solo se ven los confirmados. */
const COMPROMISOS = [
  { titulo: 'Talleres abiertos', texto: 'Para jóvenes de la región, sobre liderazgo y proyectos comunitarios.', confirmado: true },
  { titulo: 'Presentación pública', texto: 'Para contar lo que vivieron y lo que traen de vuelta.', confirmado: true },
  { titulo: 'Red con otros colectivos', texto: 'Metodologías y contactos compartidos con escuelas y grupos de la región.', confirmado: true },
];

/** El corazón del logo de Granito de Arena. */
function Corazon() {
  return (
    <svg viewBox="0 0 40 36" aria-hidden="true" className="w-full">
      <path
        d="M20 33 C8 25 3 18 3 11.5 C3 6.5 7 3 11.5 3 C15 3 18 5 20 8 C22 5 25 3 28.5 3 C33 3 37 6.5 37 11.5 C37 18 32 25 20 33Z"
        fill="var(--color-surface)"
        stroke="var(--color-on-accent)"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** La razón de la carrera, contada en tres tiempos: quiénes, a dónde van y qué regresa. */
export function Causa() {
  const compromisos = COMPROMISOS.filter((c) => c.confirmado || CONFIG.mostrarPorConfirmar);
  return (
    <Seccion
      id="por-que"
      ko="왜 달리나요?"
      titulo="Por qué corremos"
      entrada="Para que jóvenes voluntarios de Granito de Arena lleven a Texmelucan a un encuentro internacional en Corea del Sur. Cada inscripción ayuda a cubrir su viaje."
    >
      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        <Card tone="accent" className="relative overflow-hidden p-6">
          <Manchas className="text-accent-soft" manchas={[{ x: 92, y: 10, size: 45, forma: 2 }]} />
          <div className="relative">
            <h3 className="titulo">Quiénes</h3>
            <div className="mt-5 w-16">
              <Corazon />
            </div>
            <p className="mt-5">Jóvenes voluntarios de Granito de Arena que ya dedican su tiempo a proyectos de educación, salud y medio ambiente en San Martín Texmelucan.</p>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b-[2.5px] border-outline bg-info-soft px-4 pt-4">
            <PaisajeSeul className="block h-auto w-full" />
          </div>
          <div className="p-6">
            <h3 className="titulo">A dónde: Seúl, Corea del Sur</h3>
            <p className="mt-3 cifra text-[2.2rem] text-info">Abril 2027</p>
            <p className="mt-3">
              A un encuentro internacional de intercambio cultural y liderazgo juvenil en Corea del Sur, donde jóvenes de distintos países comparten proyectos y estrategias para el
              cambio sostenible.
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="titulo">Qué traen de vuelta</h3>
          <p className="mt-5 text-fg-muted">Lo aprendido vuelve a casa:</p>
          <ul className="mt-3 space-y-3.5">
            {compromisos.map((c) => (
              <li key={c.titulo}>
                <strong className="block font-display text-[1.1rem]">{c.titulo}</strong>
                <span className="text-small text-fg-muted">{c.texto}</span>
                {!c.confirmado ? (
                  <span className="mt-1 block text-small">
                    <Pendiente />
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-14 grid gap-8 rounded-xl border-[2.5px] border-dashed border-line-strong p-6 sm:p-8 lg:grid-cols-12 lg:items-center">
        <p className="titulo lg:col-span-7">Lo que reunimos se destina por completo a los gastos de representación de la delegación.</p>
        <div className="lg:col-span-5">
          <p className="text-small font-semibold text-fg-muted">Objetivos de Desarrollo Sostenible a los que aporta</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {ODS.map((o) => (
              <li key={o.n} className="inline-flex items-center overflow-hidden rounded-pill bg-surface text-small font-semibold contorno">
                <span className="flex h-full items-center px-2.5 py-1 cifra text-[1.05rem] text-white" style={{ background: o.color }}>
                  {o.n}
                </span>
                <span className="px-2.5">{o.texto}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Seccion>
  );
}
