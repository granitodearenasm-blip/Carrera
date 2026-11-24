// Íconos de Corea que cualquiera reconoce: cerezos en flor, un pabellón con techo de aleros curvos
// (palacio o templo) y la Torre Namsan (N Seoul Tower). Con el trazo café de Granito. Decorativos.

const CONTORNO = 'var(--color-outline)';
const PETALO = '#F7C3D2';
const PETALO_OSCURO = 'var(--color-saek-5)';

/** Flor de cerezo de cinco pétalos, centrada en (x, y). */
function Flor({ x, y, r, giro = 0 }: { x: number; y: number; r: number; giro?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${giro})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy={-r * 0.55} rx={r * 0.42} ry={r * 0.56} transform={`rotate(${a})`} fill={PETALO} stroke={CONTORNO} strokeWidth="1.6" />
      ))}
      <circle r={r * 0.22} fill={PETALO_OSCURO} stroke={CONTORNO} strokeWidth="1.2" />
    </g>
  );
}

/** Rama de cerezo en flor (viewBox 0 0 240 150), entra desde la esquina superior derecha. */
export function RamaCerezo({ className = '', espejo = false }: { className?: string; espejo?: boolean }) {
  return (
    <svg viewBox="0 0 240 150" aria-hidden="true" className={className} style={espejo ? { transform: 'scaleX(-1)' } : undefined}>
      <path d="M240 18 C200 22 170 34 140 52 C110 70 80 78 40 84" fill="none" stroke={CONTORNO} strokeWidth="9" strokeLinecap="round" />
      <path d="M240 18 C200 22 170 34 140 52 C110 70 80 78 40 84" fill="none" stroke="#8A5A2B" strokeWidth="4" strokeLinecap="round" />
      <path d="M150 46 C150 70 160 92 176 108 M100 70 C96 90 100 112 112 128 M190 28 C200 48 214 60 230 66" fill="none" stroke={CONTORNO} strokeWidth="5" strokeLinecap="round" />
      <Flor x={44} y={82} r={15} />
      <Flor x={78} y={64} r={12} giro={20} />
      <Flor x={112} y={128} r={13} giro={10} />
      <Flor x={128} y={50} r={16} giro={35} />
      <Flor x={176} y={108} r={14} giro={-15} />
      <Flor x={196} y={22} r={12} giro={5} />
      <Flor x={228} y={66} r={11} giro={40} />
      <circle cx="96" cy="88" r="4" fill={PETALO_OSCURO} stroke={CONTORNO} strokeWidth="1.2" />
      <circle cx="160" cy="80" r="4" fill={PETALO_OSCURO} stroke={CONTORNO} strokeWidth="1.2" />
      {/* pétalos que caen */}
      <ellipse cx="60" cy="122" rx="5" ry="3" transform="rotate(30 60 122)" fill={PETALO} stroke={CONTORNO} strokeWidth="1.2" />
      <ellipse cx="150" cy="140" rx="5" ry="3" transform="rotate(-20 150 140)" fill={PETALO} stroke={CONTORNO} strokeWidth="1.2" />
    </svg>
  );
}

/** Pabellón coreano (palacio o templo) con techo de dos aguas y aleros curvos, en un lienzo de 220 × 150. */
function Pabellon({ silueta }: { silueta: boolean }) {
  const techo = silueta ? 'var(--color-ink)' : '#3C4250';
  const madera = silueta ? 'var(--color-ink)' : 'var(--color-saek-2)';
  const dancheong = silueta ? 'var(--color-ink)' : 'var(--color-saek-3)';
  const piedra = silueta ? 'var(--color-ink)' : 'var(--color-surface)';
  const trazo = silueta ? 'none' : CONTORNO;
  return (
    <g>
      {/* base de piedra */}
      <rect x="30" y="112" width="160" height="34" rx="3" fill={piedra} stroke={trazo} strokeWidth="3" />
      {!silueta ? <path d="M96 146 V128 Q110 116 124 128 V146" fill="var(--color-ink)" stroke={trazo} strokeWidth="3" /> : null}
      {/* columnas */}
      {[50, 80, 140, 170].map((x) => (
        <rect key={x} x={x - 4} y="74" width="8" height="38" fill={madera} stroke={trazo} strokeWidth="2.5" />
      ))}
      <rect x="40" y="70" width="140" height="10" fill={dancheong} stroke={trazo} strokeWidth="2.5" />
      {/* techo inferior con aleros que se levantan */}
      <path d="M4 66 C26 70 50 58 110 54 C170 58 194 70 216 66 L198 80 C160 74 60 74 22 80 Z" fill={techo} stroke={trazo} strokeWidth="3" strokeLinejoin="round" />
      {/* segundo piso y techo superior */}
      <rect x="62" y="34" width="96" height="22" fill={madera} stroke={trazo} strokeWidth="2.5" />
      <rect x="62" y="34" width="96" height="6" fill={dancheong} stroke={trazo} strokeWidth="2" />
      <path d="M34 34 C54 36 70 24 110 20 C150 24 166 36 186 34 L172 44 C150 40 70 40 48 44 Z" fill={techo} stroke={trazo} strokeWidth="3" strokeLinejoin="round" />
      <path d="M78 22 C94 14 126 14 142 22" fill="none" stroke={silueta ? 'var(--color-ink)' : CONTORNO} strokeWidth="5" strokeLinecap="round" />
    </g>
  );
}

/** Torre Namsan (N Seoul Tower), en un lienzo de 60 × 190. */
function Torre({ silueta }: { silueta: boolean }) {
  const cuerpo = silueta ? 'var(--color-ink)' : 'var(--color-surface)';
  const trazo = silueta ? 'none' : CONTORNO;
  return (
    <g>
      <path d="M30 0 V46" stroke={silueta ? 'var(--color-ink)' : CONTORNO} strokeWidth="4" strokeLinecap="round" />
      <rect x="25" y="30" width="10" height="16" rx="2" fill={silueta ? 'var(--color-ink)' : 'var(--color-saek-2)'} stroke={trazo} strokeWidth="2" />
      <path d="M4 54 Q30 40 56 54 L52 68 Q30 76 8 68 Z" fill={cuerpo} stroke={trazo} strokeWidth="3" strokeLinejoin="round" />
      {!silueta ? <path d="M8 60 H52" stroke="var(--color-saek-4)" strokeWidth="4" /> : null}
      <path d="M14 70 Q30 78 46 70 L42 82 Q30 86 18 82 Z" fill={cuerpo} stroke={trazo} strokeWidth="3" strokeLinejoin="round" />
      <path d="M25 84 L22 176 H38 L35 84 Z" fill={cuerpo} stroke={trazo} strokeWidth="3" strokeLinejoin="round" />
      <path d="M14 176 H46 L50 190 H10 Z" fill={cuerpo} stroke={trazo} strokeWidth="3" strokeLinejoin="round" />
    </g>
  );
}

/**
 * Paisaje de Seúl: montañas, un pabellón, la Torre Namsan y cerezos.
 * silueta: versión en el color de los bloques oscuros, para fundirse con el pie de página.
 */
export function PaisajeSeul({ className = '', silueta = false }: { className?: string; silueta?: boolean }) {
  const monte = silueta ? 'var(--color-ink)' : 'var(--color-accent-soft)';
  const monteLejano = silueta ? 'var(--color-ink)' : 'var(--color-sand)';
  const trazo = silueta ? 'none' : CONTORNO;
  return (
    <svg viewBox="0 0 640 220" aria-hidden="true" preserveAspectRatio="xMidYMax meet" className={className}>
      {/* montañas al fondo */}
      <path
        d="M0 220 V208 C50 186 110 100 170 120 C220 140 260 110 320 100 C380 90 430 120 480 70 C530 30 600 120 640 208 V220 Z"
        fill={monteLejano}
        opacity={silueta ? 0.55 : 1}
        stroke={trazo}
        strokeWidth="3"
      />
      {/* Namsan con su torre */}
      <path d="M380 220 C420 150 470 112 500 112 C540 112 600 170 640 210 V220 Z" fill={monte} stroke={trazo} strokeWidth="3" />
      <g transform="translate(476 -30) scale(0.78)">
        <Torre silueta={silueta} />
      </g>
      {/* el pabellón */}
      <path d="M0 220 V196 C80 186 200 186 330 200 V220 Z" fill={monte} stroke={trazo} strokeWidth="3" />
      <g transform="translate(70 62) scale(0.92)">
        <Pabellon silueta={silueta} />
      </g>
      {/* cerezos en flor al frente */}
      <g transform="translate(290 128) scale(0.5)">
        <path d="M60 180 C60 140 54 110 40 90 M60 140 C72 120 92 108 112 104" fill="none" stroke={silueta ? 'var(--color-ink)' : CONTORNO} strokeWidth="10" strokeLinecap="round" />
        <circle cx="40" cy="74" r="40" fill={PETALO} stroke={CONTORNO} strokeWidth="4" />
        <circle cx="96" cy="86" r="34" fill={PETALO} stroke={CONTORNO} strokeWidth="4" />
        <circle cx="68" cy="46" r="32" fill={PETALO} stroke={CONTORNO} strokeWidth="4" />
        <Flor x={40} y={64} r={14} />
        <Flor x={92} y={80} r={12} giro={30} />
        <Flor x={70} y={40} r={11} giro={15} />
      </g>
      <g transform="translate(590 140) scale(0.42)">
        <path d="M60 190 C60 150 56 120 46 96" fill="none" stroke={silueta ? 'var(--color-ink)' : CONTORNO} strokeWidth="10" strokeLinecap="round" />
        <circle cx="46" cy="80" r="42" fill={PETALO} stroke={CONTORNO} strokeWidth="4" />
        <circle cx="86" cy="62" r="30" fill={PETALO} stroke={CONTORNO} strokeWidth="4" />
        <Flor x={46} y={72} r={14} />
        <Flor x={84} y={56} r={11} giro={25} />
      </g>
    </svg>
  );
}
