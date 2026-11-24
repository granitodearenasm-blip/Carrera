import { Pendiente } from '../layout/Seccion';

/*
 * ✏️ Trazo APROXIMADO de la ruta de 10 km, simplificado del mapa que compartió el organizador.
 * Coordenadas en un lienzo de 1340 × 830 (no son geográficas). Cuando el trazo sea definitivo,
 * cambia los puntos y quita el aviso.
 */
const RUTA_10K: [number, number][] = [
  [826, 222],
  [760, 238],
  [765, 182],
  [690, 174],
  [565, 166],
  [545, 190],
  [500, 192],
  [380, 206],
  [236, 222],
  [214, 236],
  [140, 226],
  [76, 142],
  [128, 238],
  [198, 348],
  [262, 412],
  [330, 470],
  [420, 494],
  [700, 550],
  [860, 566],
  [1000, 596],
  [1186, 650],
];

// Calles de referencia (decorativas, para ubicarse)
const CALLES = ['M0 120 L330 0', 'M640 0 L1340 360', 'M1120 0 L1180 830', 'M330 830 L560 220 L1000 120', 'M0 520 L1340 600', 'M600 830 L640 300', 'M760 830 L760 230'];

const puntos = RUTA_10K.map(([x, y]) => `${x},${y}`).join(' ');
const [salida] = RUTA_10K;
const extremo = RUTA_10K[RUTA_10K.length - 1];

/** Mapa simplificado del recorrido de 10 km, con la salida y la meta en la hacienda. */
export function MapaRuta() {
  return (
    <figure className="overflow-hidden rounded-xl bg-surface estampa">
      <svg viewBox="0 0 1340 830" role="img" aria-labelledby="mapa-ruta-titulo" className="block h-auto w-full bg-sunken">
        <title id="mapa-ruta-titulo">
          Trazo aproximado de la ruta de 10 km: sale del Museo Hacienda, va por Reforma Oriente y Al Moral hacia el poniente, baja por el libramiento y sigue hacia el oriente hasta
          la Avenida México.
        </title>
        {CALLES.map((d) => (
          <path key={d} d={d} fill="none" stroke="var(--color-line)" strokeWidth="14" strokeLinecap="round" />
        ))}
        {/* Contorno café y trazo amarillo, como el resto de las estampas */}
        <polyline points={puntos} fill="none" stroke="var(--color-outline)" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={puntos} fill="none" stroke="var(--color-accent)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={puntos} fill="none" stroke="var(--color-outline)" strokeWidth="3" strokeDasharray="2 22" strokeLinecap="round" />

        {/* Extremo de la ruta (Av. México) */}
        <circle cx={extremo[0]} cy={extremo[1]} r="20" fill="var(--color-info)" stroke="var(--color-outline)" strokeWidth="6" />
        <text
          x={extremo[0] - 10}
          y={extremo[1] + 70}
          textAnchor="end"
          fontFamily="Nunito Sans, sans-serif"
          fontWeight="800"
          fontSize="40"
          fill="var(--color-fg)"
          paintOrder="stroke"
          stroke="var(--color-sunken)"
          strokeWidth="12"
          strokeLinejoin="round"
        >
          Av. México
        </text>

        {/* Salida y meta: la hacienda */}
        <circle cx={salida[0]} cy={salida[1]} r="30" fill="var(--color-danger)" stroke="var(--color-outline)" strokeWidth="7" />
        <path
          d={`M${salida[0] - 8} ${salida[1] + 12} V${salida[1] - 16} L${salida[0] + 12} ${salida[1] - 9} L${salida[0] - 8} ${salida[1] - 2}`}
          fill="#fff"
          stroke="#fff"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <g transform={`translate(${salida[0] + 46} ${salida[1] - 30})`}>
          <rect width="430" height="104" rx="20" fill="var(--color-surface)" stroke="var(--color-outline)" strokeWidth="6" />
          <text x="24" y="46" fontFamily="Nunito Sans, sans-serif" fontWeight="800" fontSize="40" fill="var(--color-fg)">
            Salida y meta
          </text>
          <text x="24" y="84" fontFamily="Nunito Sans, sans-serif" fontWeight="600" fontSize="29" fill="var(--color-fg-muted)">
            Museo Hacienda Polaxtla
          </text>
        </g>
        <text
          x="110"
          y="78"
          fontFamily="Nunito Sans, sans-serif"
          fontWeight="700"
          fontSize="36"
          fill="var(--color-fg-muted)"
          paintOrder="stroke"
          stroke="var(--color-sunken)"
          strokeWidth="12"
          strokeLinejoin="round"
        >
          Reforma Oriente y Al Moral
        </text>
        <text
          x="280"
          y="650"
          fontFamily="Nunito Sans, sans-serif"
          fontWeight="700"
          fontSize="36"
          fill="var(--color-fg-muted)"
          paintOrder="stroke"
          stroke="var(--color-sunken)"
          strokeWidth="12"
          strokeLinejoin="round"
        >
          Libramiento
        </text>
      </svg>
      <figcaption className="flex flex-wrap items-center gap-x-3 gap-y-2 p-4 text-small text-fg-muted sm:px-6">
        <span>
          <strong className="text-fg">Ruta de 10 km, trazo aproximado.</strong> Calles de El Moral, en San Martín Texmelucan.
        </span>
        <Pendiente>trazo definitivo y rutas de 3 y 5 km</Pendiente>
      </figcaption>
    </figure>
  );
}
