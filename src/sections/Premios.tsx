import { ArrowUpRight, Sparkles } from 'lucide-react';
import { EMAIL } from '../config';
import { pesos } from '../lib/format';
import { Km, Wrap } from '../components/ui';

// ✏️ CAMBIAR: reparto de premios en efectivo, por rama (varonil y femenil). Suma actual: $20,000
const PREMIOS = [
  { distancia: '10K', ruta: 'Ruta Busan', lugares: [2400, 1400, 900] },
  { distancia: '5K', ruta: 'Ruta Seúl', lugares: [1700, 1100, 600] },
  { distancia: '3K', ruta: 'Ruta Jeju', lugares: [1000, 600, 300] },
];
const BOLSA = PREMIOS.reduce((s, p) => s + p.lugares.reduce((a, b) => a + b, 0) * 2, 0);

export function Premios() {
  return (
    <section id="premios" className="bg-ink py-24 text-paper lg:py-32">
      <Wrap>
        <Km n="08" ko="시상" tono="oscuro">
          Reconocimientos
        </Km>
        <div className="mt-8 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="display text-[clamp(2.8rem,7vw,5rem)]">Premios</h2>
            <p className="mt-8 text-[12px] font-semibold tracking-[0.14em] text-paper/60 uppercase">Bolsa total en efectivo</p>
            <p className="display mt-2 text-[clamp(4.5rem,12vw,8rem)] text-sol tabular-nums">{pesos(BOLSA)}</p>
            <p className="mt-4 max-w-sm text-paper/70">Para los tres primeros lugares de cada distancia, en rama varonil y femenil.</p>
          </div>

          <div className="lg:col-span-7">
            {/* Tabla de resultados, como el tablero de una meta */}
            <table className="w-full text-left tabular-nums">
              <caption className="sr-only">Premios por distancia y lugar, en cada rama</caption>
              <thead>
                <tr className="border-b-2 border-paper/80 text-[12px] tracking-[0.14em] text-paper/60 uppercase">
                  <th scope="col" className="py-3 font-semibold">
                    Distancia
                  </th>
                  {['1º', '2º', '3º'].map((l) => (
                    <th key={l} scope="col" className="py-3 text-right font-semibold">
                      {l}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PREMIOS.map((p) => (
                  <tr key={p.distancia} className="border-b border-paper/15">
                    <th scope="row" className="py-5 font-normal">
                      <span className="display block text-[2.6rem] leading-none">{p.distancia}</span>
                      <span className="text-sm text-paper/60">{p.ruta}</span>
                    </th>
                    {p.lugares.map((m, i) => (
                      <td key={i} className={`py-5 text-right text-xl font-bold condensed sm:text-2xl ${i === 0 ? 'text-sol' : ''}`}>
                        {pesos(m)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-sm text-paper/60">Por rama. Se entregan únicamente en efectivo, presentando identificación oficial.</p>

            {/* ✏️ Premio especial: cuando haya patrocinador, cambia el texto por los premios */}
            <div className="mt-10 rounded-[4px] border border-dashed border-paper/35 p-6">
              <p className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.14em] text-sol uppercase">
                <Sparkles size={15} /> Premio especial · premios por anunciar
              </p>
              <h3 className="mt-2 text-2xl font-bold condensed">Mejor outfit K-culture</h3>
              <p className="mt-1 text-paper/70">Cualquier distancia. Hanbok, K-pop, K-drama… sorpréndenos.</p>
              <a href={`mailto:${EMAIL}?subject=Patrocinio%20HANGUK%20RUN`} className="mt-4 inline-flex items-center gap-1 font-semibold text-paper underline decoration-coral decoration-2 underline-offset-4">
                ¿Tu marca quiere patrocinar este premio? <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </Wrap>
    </section>
  );
}
