import { Globe, Handshake, House } from 'lucide-react';
import { CONFIG } from '../config';
import { Km, Pendiente, Wrap } from '../components/ui';

// Colores oficiales de los Objetivos de Desarrollo Sostenible
const ODS = [
  { n: 4, texto: 'Educación de calidad', color: '#C5192D' },
  { n: 8, texto: 'Trabajo decente y crecimiento económico', color: '#A21942' },
  { n: 9, texto: 'Industria, innovación e infraestructura', color: '#FD6925' },
  { n: 11, texto: 'Ciudades y comunidades sostenibles', color: '#FD9D24' },
];

export function Causa() {
  return (
    <section id="por-que" className="py-24 lg:py-32">
      <Wrap>
        <Km n="01" ko="우리의 목표">
          La causa
        </Km>
        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
          <h2 className="display text-[clamp(3rem,8vw,6.5rem)] lg:col-span-7">
            ¿Por qué
            <br />
            corremos?
          </h2>
          {/* ✏️ CAMBIAR: texto de la causa */}
          <p className="text-xl leading-snug lg:col-span-5">
            Corremos por <strong>10 jóvenes voluntarios de Granito de Arena</strong> que dedican su tiempo a proyectos comunitarios en San Martín Texmelucan: educación,
            trabajo digno, innovación y ciudades más sostenibles.
          </p>
        </div>

        <div className="mt-14 grid gap-12 border-t-2 border-ink pt-10 lg:grid-cols-12">
          <aside className="lg:col-span-4" aria-label="La delegación">
            <p className="display text-[9rem] text-hong">10</p>
            <p className="-mt-1 text-lg font-bold">jóvenes voluntarios</p>
            <ul className="mt-6 space-y-3 text-[15px]">
              <li className="flex gap-3">
                <House size={18} className="mt-0.5 shrink-0 text-muted" /> Una comunidad: San Martín Texmelucan, Puebla
              </li>
              <li className="flex gap-3">
                <Globe size={18} className="mt-0.5 shrink-0 text-muted" /> Un encuentro internacional en Corea del Sur
              </li>
              <li className="flex gap-3">
                <Handshake size={18} className="mt-0.5 shrink-0 text-muted" /> Proyectos comunitarios que ya están en marcha
              </li>
            </ul>
          </aside>

          <div className="space-y-5 text-[17px] leading-relaxed text-ink/80 lg:col-span-5">
            <p>
              Estos jóvenes representarán a su comunidad en <strong className="text-ink">un encuentro internacional de intercambio cultural y liderazgo juvenil en Corea del Sur</strong>,
              donde participantes de distintos países comparten sus proyectos y desarrollan estrategias para el cambio sostenible. Que Puebla tenga voz en ese espacio es
              mostrar el talento y el trabajo comunitario que nace aquí.
            </p>
            <p>
              Es la oportunidad de demostrar que las ideas que surgen en nuestras comunidades pueden trascender fronteras y volver con nuevas herramientas para seguir
              trabajando en casa. Lo recaudado se destina exclusivamente a cubrir los gastos de representación de la delegación.
            </p>
          </div>

          <div className="lg:col-span-3">
            <p className="text-[12px] font-semibold tracking-[0.14em] text-muted uppercase">Objetivos de Desarrollo Sostenible</p>
            <ul className="mt-4 space-y-2">
              {ODS.map((o) => (
                <li key={o.n} className="flex items-stretch overflow-hidden rounded-[3px] bg-card ring-1 ring-ink/10">
                  <span className="display flex w-12 shrink-0 items-center justify-center text-2xl text-white" style={{ background: o.color }}>
                    {o.n}
                  </span>
                  <span className="px-3 py-2.5 text-[14px] leading-tight font-medium">{o.texto}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <blockquote className="mt-20 max-w-4xl border-l-4 border-hong pl-6 text-[clamp(1.6rem,3.6vw,2.6rem)] leading-[1.1] font-bold condensed">
          “Cada paso puede ayudar a que una idea nacida en nuestra comunidad llegue más lejos.”
        </blockquote>
      </Wrap>
    </section>
  );
}

/* ---------- Lo que regresa a la comunidad ----------
   ✏️ COMPROMISOS: todos son EJEMPLOS con confirmado: false.
   - Cuando Granito de Arena confirme uno, ponle confirmado: true y borra su "pendiente".
   - Antes de publicar, pon CONFIG.mostrarPorConfirmar = false en src/config.ts: así solo se ven
     los confirmados (y si no hay ninguno, la sección se oculta sola). */
const COMPROMISOS = [
  { titulo: 'Talleres abiertos', texto: 'Talleres gratuitos para jóvenes de la región sobre liderazgo y proyectos comunitarios.', pendiente: 'número de talleres, fechas y sede', confirmado: false },
  { titulo: 'Presentación pública', texto: 'Una presentación abierta a la comunidad para compartir la experiencia y los aprendizajes del encuentro.', pendiente: 'fecha y lugar', confirmado: false },
  { titulo: 'Red con otros jóvenes', texto: 'Compartir metodologías y contactos con otros colectivos y escuelas de la región.', pendiente: '', confirmado: false },
  { titulo: 'Informe de transparencia', texto: 'Un informe público sobre cómo se utilizaron los recursos recaudados.', pendiente: '', confirmado: false },
];

export function Compromisos() {
  const visibles = COMPROMISOS.filter((c) => c.confirmado || CONFIG.mostrarPorConfirmar);
  if (!visibles.length) return null;
  return (
    <section id="compromisos" className="bg-paper-2 py-24 lg:py-28">
      <Wrap className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Km n="02" ko="약속">
            Compromisos
          </Km>
          <h2 className="display mt-6 text-[clamp(2.6rem,5vw,3.9rem)]">
            Lo que regresa
            <br />a la comunidad
          </h2>
          <p className="mt-5 text-[17px] text-ink/75">Al volver, la delegación compartirá lo aprendido con San Martín Texmelucan y la región.</p>
        </div>
        <ol className="lg:col-span-8">
          {visibles.map((c, i) => (
            <li key={c.titulo} className="grid grid-cols-[3.5rem_1fr] gap-x-4 border-t border-ink/25 py-6 last:border-b sm:grid-cols-[5rem_1fr]">
              <span className="display text-[2.6rem] text-ink/30 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3 className="text-xl font-bold">{c.titulo}</h3>
                <p className="mt-1 text-ink/75">{c.texto}</p>
                {!c.confirmado && (
                  <p className="mt-2 text-sm">
                    <Pendiente>{c.pendiente || undefined}</Pendiente>
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </Wrap>
    </section>
  );
}
