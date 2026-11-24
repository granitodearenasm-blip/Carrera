import { Clock, Droplet, Flag, HeartPulse } from 'lucide-react';
import { Button } from '../../shared/ui/Button';
import { Card } from '../../shared/ui/Card';
import { Pendiente } from '../layout/Seccion';

// ✏️ Distancias, salidas y para quién es cada una. Los puestos de hidratación son km del recorrido.
// calles: por dónde va la ruta; vacío = todavía por confirmar.
const DISTANCIAS = [
  { km: 3, ruta: 'Ruta Jeju', ko: '제주', salida: '7:30', hidratacion: [] as number[], calles: '', para: 'Ideal si vas empezando o si corres con tu familia.' },
  { km: 5, ruta: 'Ruta Seúl', ko: '서울', salida: '7:15', hidratacion: [] as number[], calles: '', para: 'Un reto cómodo si ya trotas de vez en cuando.' },
  {
    km: 10,
    ruta: 'Ruta Busan',
    ko: '부산',
    salida: '7:00',
    hidratacion: [2.5, 5, 7.5],
    calles: 'Reforma Oriente, Al Moral, el libramiento y la avenida hasta Av. México (trazo aproximado)',
    para: 'Para quienes ya entrenan y quieren medir su marca.',
  },
];

/** Las tres distancias, cada una con su perfil proporcional al recorrido más largo. Todas salen y llegan a la hacienda. */
export function Distancias() {
  return (
    <ul className="mt-12 grid gap-6 md:grid-cols-3">
      {DISTANCIAS.map((d) => (
        <li key={d.km}>
          <Card className="flex h-full flex-col p-6">
            <div className="flex items-start justify-between gap-3">
              <p className="cifra text-[4.2rem]">
                {d.km}
                <span className="text-[0.45em]"> km</span>
              </p>
              <span lang="ko" className="mt-2 rounded-pill bg-sunken px-3 py-1 text-[1.1rem]">
                {d.ko}
              </span>
            </div>
            <h3 className="mt-1 font-display text-[1.3rem] font-semibold">{d.ruta}</h3>
            <p className="mt-2 text-fg-muted">{d.para}</p>

            {/* Perfil del recorrido, proporcional a los 10 km */}
            <div className="relative mt-6 mr-7 h-12" aria-hidden="true">
              <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-pill border-t-[2px] border-dashed border-line-strong" />
              <div className="absolute top-1/2 left-0 h-4 -translate-y-1/2 rounded-pill border-[2.5px] border-outline bg-accent shadow-sm" style={{ width: `${d.km * 10}%` }}>
                {d.hidratacion.map((k) => (
                  <Droplet key={k} size={15} fill="currentColor" className="absolute -top-6 -translate-x-1/2 text-info" style={{ left: `${(k / d.km) * 100}%` }} />
                ))}
              </div>
              <Flag size={20} strokeWidth={2.4} className="absolute top-1/2 -translate-y-1/2 text-danger" style={{ left: `calc(${d.km * 10}% + 0.4rem)` }} />
            </div>

            <p className="mt-4 text-small">
              <strong>Por dónde:</strong> {d.calles || <Pendiente>ruta</Pendiente>}
            </p>
            <ul className="mt-3 space-y-2 text-small">
              {/* El texto va en un solo <span>: suelto, cada pedazo sería un hijo del flex y se separaría */}
              <li className="flex items-start gap-2.5">
                <Clock size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-fg-muted" />
                <span>
                  Sales a las <strong>{d.salida} h</strong>
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Droplet size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-fg-muted" />
                <span>{d.hidratacion.length ? `Hidratación en los km ${d.hidratacion.join(', ')} y en la meta` : 'Agua y bebida isotónica en la meta'}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <HeartPulse size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-fg-muted" />
                <span>Ambulancia en la salida y en la meta</span>
              </li>
            </ul>

            <div className="mt-auto pt-6">
              <Button label={`Inscribirme a los ${d.km} km`} variant="secondary" fullWidth href="#inscripcion" />
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
