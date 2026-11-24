import type { ComponentType } from 'react';
import { Sparkles } from 'lucide-react';
import { EMAIL } from '../../config';
import { pesos } from '../../shared/format';
import { Button } from '../../shared/ui/Button';
import { Card } from '../../shared/ui/Card';
import { Medalla, Playera, Snack } from './ilustraciones';

/* ✏️ Cuando tengan fotos del kit, cópienlas a public/img/ y cambien la ilustración por una <img>. */
const KIT: { Ilustracion: ComponentType<{ className?: string }>; titulo: string; texto: string }[] = [
  { Ilustracion: Playera, titulo: 'Playera oficial', texto: 'Diseño HANGUK RUN en tela dry-fit.' },
  { Ilustracion: Medalla, titulo: 'Medalla al cruzar la meta', texto: 'Con diseño coreano, para todas las distancias.' },
  { Ilustracion: Snack, titulo: 'Snack coreano', texto: 'Y bebida isotónica para reponerte en la meta.' },
];

// ✏️ Premios en efectivo por rama (femenil y varonil). Suma actual: $20,000
const PREMIOS = [
  { distancia: '10 km', lugares: [2400, 1400, 900] },
  { distancia: '5 km', lugares: [1700, 1100, 600] },
  { distancia: '3 km', lugares: [1000, 600, 300] },
];
const BOLSA = PREMIOS.reduce((s, p) => s + p.lugares.reduce((a, b) => a + b, 0) * 2, 0);

/** Lo que recibes al inscribirte y lo que puedes ganar. */
export function KitPremios() {
  return (
    <div className="mt-20 grid gap-6 lg:grid-cols-2">
      <Card className="p-6 sm:p-8">
        <h3 className="titulo">Tu kit</h3>
        <p className="mt-2 text-fg-muted">Además de tu número con tu nombre:</p>
        <ul className="mt-6 space-y-5">
          {KIT.map(({ Ilustracion, titulo, texto }) => (
            <li key={titulo} className="flex items-center gap-5">
              <Ilustracion className="w-16 shrink-0" />
              <div>
                <h4 className="font-display text-[1.15rem] font-semibold">{titulo}</h4>
                <p className="text-small text-fg-muted">{texto}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card tone="ink" className="p-6 sm:p-8">
        <h3 className="titulo">{pesos(BOLSA)} en premios</h3>
        <p className="mt-2 text-on-ink-muted">En efectivo, para los tres primeros lugares de cada distancia, en rama femenil y varonil.</p>
        <table className="mt-5 w-full text-left tabular-nums">
          <caption className="sr-only">Premio por distancia y lugar, en cada rama</caption>
          <thead>
            <tr className="border-b-[2px] border-accent text-small text-on-ink-muted">
              <th scope="col" className="py-2 font-semibold">
                Distancia
              </th>
              {['1.º', '2.º', '3.º'].map((l) => (
                <th key={l} scope="col" className="py-2 text-right font-semibold">
                  {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PREMIOS.map((p) => (
              <tr key={p.distancia} className="border-b-[1.5px] border-on-ink/15">
                <th scope="row" className="py-3 cifra text-[1.6rem] font-normal">
                  {p.distancia}
                </th>
                {p.lugares.map((m, i) => (
                  <td key={i} className={`py-3 text-right font-display text-[1.15rem] font-semibold ${i === 0 ? 'text-accent' : ''}`}>
                    {pesos(m)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-small text-on-ink-muted">Por rama. Se entregan en efectivo con identificación oficial.</p>
        <div className="mt-6 rounded-lg border-[2px] border-dashed border-accent p-4">
          <p className="flex items-center gap-2 font-display text-[1.1rem] font-semibold text-accent">
            <Sparkles size={18} aria-hidden="true" /> Mejor outfit K-culture
          </p>
          <p className="mt-1 text-small text-on-ink-muted">Hanbok, K-pop, K-drama… en cualquier distancia. Premio por anunciar.</p>
          <Button label="Patrocinar este premio" variant="secondary" size="sm" className="mt-3" href={`mailto:${EMAIL}?subject=Patrocinio%20del%20premio%20K-culture`} />
        </div>
      </Card>
    </div>
  );
}
