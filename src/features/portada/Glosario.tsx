import { Card } from '../../shared/ui/Card';
import { SelloTaegeuk } from './ilustraciones';

// ✏️ Tres palabras para el día de la carrera: hangul, cómo se pronuncia y cuándo usarla
const PALABRAS = [
  { ko: '가자!', dice: 'ga-ya', significa: '¡Vamos!', cuando: 'En la salida, para arrancar con todo.' },
  { ko: '화이팅!', dice: 'jua-i-ting', significa: '¡Ánimo!', cuando: 'Para echarle porras a quien va a tu lado.' },
  { ko: '감사합니다', dice: 'gam-sa-jam-ni-da', significa: 'Gracias', cuando: 'Para los voluntarios de la hidratación y la meta.' },
];

/** Un guiño a la cultura coreana: tres palabras que puedes usar el día de la carrera. */
export function Glosario() {
  return (
    <Card className="mt-20 p-6 sm:p-8">
      <div className="flex items-center gap-4">
        <SelloTaegeuk className="size-12 shrink-0 -rotate-12" />
        <div>
          <h3 className="titulo">Tres palabras en coreano</h3>
          <p className="text-fg-muted">Para usarlas el día de la carrera.</p>
        </div>
      </div>
      <dl className="mt-6 grid gap-6 sm:grid-cols-3">
        {PALABRAS.map((p) => (
          <div key={p.ko} className="border-t-[2.5px] border-outline pt-4">
            <dt>
              <span lang="ko" className="block text-[2rem] leading-tight">
                {p.ko}
              </span>
              <span className="text-small text-fg-muted">Se dice «{p.dice}»</span>
            </dt>
            <dd className="mt-2">
              <strong className="font-display text-[1.15rem]">{p.significa}</strong>
              <span className="block text-small text-fg-muted">{p.cuando}</span>
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
