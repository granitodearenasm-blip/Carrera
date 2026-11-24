import { CONFIG } from '../../config';
import { miles, pesos } from '../../shared/format';
import type { Resumen as Datos } from './estadisticas';

/** Cifra principal: número grande con su etiqueta. */
function Cifra({ valor, etiqueta, tono }: { valor: string; etiqueta: string; tono?: 'danger' }) {
  return (
    <div className="rounded-md bg-surface p-4 contorno-fino">
      <dd className={`cifra text-[2.2rem] ${tono === 'danger' ? 'text-danger' : 'text-fg'}`}>{valor}</dd>
      <dt className="mt-1 text-small font-semibold text-fg-muted">{etiqueta}</dt>
    </div>
  );
}

/** Conteo por categoría: una sola serie, barras de un solo tono y el número escrito al lado. */
function Barras({ titulo, orden, conteo }: { titulo: string; orden: readonly string[]; conteo: Record<string, number> }) {
  const max = Math.max(1, ...Object.values(conteo));
  const claves = [...orden, ...Object.keys(conteo).filter((k) => !orden.includes(k))];
  return (
    <figure className="rounded-md bg-surface p-4 contorno-fino">
      <figcaption className="text-label">{titulo}</figcaption>
      <table className="mt-3 w-full border-separate border-spacing-y-1.5 text-small">
        <caption className="sr-only">{titulo}</caption>
        <tbody>
          {claves.map((k) => {
            const n = conteo[k] ?? 0;
            return (
              <tr key={k}>
                <th scope="row" className="w-20 pr-2 text-left font-semibold whitespace-nowrap">
                  {k}
                </th>
                <td aria-hidden="true" className="w-full">
                  <div className="h-3 rounded-r-[4px] bg-outline" style={{ width: `${(n / max) * 100}%`, minWidth: n ? 4 : 0 }} />
                </td>
                <td className="w-10 pl-2 text-right font-bold tabular-nums">{miles(n)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </figure>
  );
}

export function Resumen({ r }: { r: Datos }) {
  return (
    <section aria-label="Resumen">
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Cifra valor={miles(r.inscripciones)} etiqueta="Inscripciones" />
        <Cifra valor={miles(r.corredores)} etiqueta={`Corredores de ${miles(CONFIG.numeros.maximo)}`} />
        <Cifra valor={pesos(r.recaudado)} etiqueta="Pagado" />
        <Cifra valor={pesos(r.pendiente)} etiqueta="Por cobrar" />
        <Cifra valor={miles(r.porRevisar)} etiqueta="Pagos por revisar" />
        <Cifra valor={miles(r.vencidas)} etiqueta="Pagos vencidos" tono={r.vencidas ? 'danger' : undefined} />
      </dl>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <Barras titulo="Por distancia" orden={CONFIG.categorias.map((c) => c.id)} conteo={r.porDistancia} />
        <Barras titulo="Por rama" orden={CONFIG.sexos} conteo={r.porSexo} />
        <Barras titulo="Playeras por talla" orden={CONFIG.tallas} conteo={r.porTalla} />
      </div>
    </section>
  );
}
