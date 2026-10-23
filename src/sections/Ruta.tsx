import { Droplet, Flag, HeartPulse, MapPin } from 'lucide-react';
import { CONFIG } from '../config';
import { Km, Pendiente, Wrap } from '../components/ui';

// ✏️ CAMBIAR: distancias, nombres de ruta y horarios de salida
const RUTAS = [
  { km: 10, nombre: 'Ruta Busan', salida: '7:00' },
  { km: 5, nombre: 'Ruta Seúl', salida: '7:15' },
  { km: 3, nombre: 'Ruta Jeju', salida: '7:30' },
];
// ✏️ Puestos de hidratación (kilómetro del recorrido de 10K)
const HIDRATACION = [2.5, 5, 7.5];

export function Ruta() {
  return (
    <section id="ruta" className="py-24 lg:py-32">
      <Wrap>
        <Km n="06" ko="코스">
          Recorrido
        </Km>
        <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 className="display text-[clamp(2.8rem,7vw,5rem)] lg:col-span-6">Tres distancias, una meta</h2>
          <p className="text-[17px] text-ink/75 lg:col-span-6">
            Las tres rutas salen y llegan al mismo punto, dentro del {CONFIG.sede.nombre}. Salidas escalonadas para que cada distancia corra con espacio.
          </p>
        </div>

        {/* Cada barra es proporcional a su distancia */}
        <div className="mt-14 space-y-8" role="list">
          {RUTAS.map((r) => (
            <div key={r.km} role="listitem" className="grid items-center gap-x-6 gap-y-3 sm:grid-cols-[11rem_1fr]">
              <div className="flex items-baseline gap-3 sm:block">
                <p className="display text-[3.4rem] leading-none">
                  {r.km}
                  <span className="text-rojo">K</span>
                </p>
                <p className="text-[14px] font-semibold text-muted sm:mt-1">
                  {r.nombre} · salida {r.salida}
                </p>
              </div>
              <div className="relative mr-8 h-12">
                <div className="absolute inset-y-0 left-0 flex items-center" style={{ width: `${r.km * 10}%` }}>
                  <div className="relative h-3 w-full rounded-full bg-ink">
                    {Array.from({ length: r.km - 1 }, (_, i) => (
                      <span key={i} aria-hidden className="absolute top-1/2 h-1.5 w-px -translate-y-1/2 bg-paper/50" style={{ left: `${((i + 1) / r.km) * 100}%` }} />
                    ))}
                    {r.km === 10 &&
                      HIDRATACION.map((k) => (
                        <span key={k} className="absolute -top-7 -translate-x-1/2 text-azul" style={{ left: `${(k / r.km) * 100}%` }} title={`Hidratación km ${k}`}>
                          <Droplet size={16} fill="currentColor" />
                        </span>
                      ))}
                    <span className="absolute top-1/2 -right-1 -translate-y-1/2 translate-x-full pl-2 text-rojo">
                      <Flag size={20} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="grid gap-6 sm:grid-cols-[11rem_1fr]">
            <span className="hidden sm:block" />
            <div className="mr-8 flex justify-between border-t border-ink/20 pt-2 text-[12px] font-semibold text-muted tabular-nums">
              {[0, 2, 4, 6, 8, 10].map((k) => (
                <span key={k}>{k} km</span>
              ))}
            </div>
          </div>
        </div>

        {/* ✏️ CAMBIAR: datos de la ruta. Cuando tengan el trazo, se puede agregar aquí una imagen del mapa del recorrido. */}
        <dl className="mt-16 grid gap-px overflow-hidden rounded-[4px] bg-ink/15 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-paper p-5">
            <dt className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.14em] text-muted uppercase">
              <MapPin size={15} /> Salida
            </dt>
            <dd className="mt-2">
              Museo Hacienda San Cristóbal Polaxtla · <Pendiente>punto exacto</Pendiente>
            </dd>
          </div>
          <div className="bg-paper p-5">
            <dt className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.14em] text-muted uppercase">
              <Flag size={15} /> Meta
            </dt>
            <dd className="mt-2">Mismo punto de salida</dd>
          </div>
          <div className="bg-paper p-5">
            <dt className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.14em] text-muted uppercase">
              <Droplet size={15} /> Hidratación
            </dt>
            <dd className="mt-2">Km 2.5, 5 y 7.5 · agua y bebida isotónica en meta</dd>
          </div>
          <div className="bg-paper p-5">
            <dt className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.14em] text-muted uppercase">
              <HeartPulse size={15} /> Servicio médico
            </dt>
            <dd className="mt-2">Ambulancia en salida y meta</dd>
          </div>
        </dl>
      </Wrap>
    </section>
  );
}
