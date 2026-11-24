// Ilustraciones con el trazo del logo de Granito: contorno café grueso, relleno amarillo, puntas redondas.
// Decorativas (aria-hidden): el texto de alrededor dice lo importante.

const TRAZO = { stroke: 'var(--color-outline)', strokeWidth: 7, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** Sello taegeuk: el círculo rojo y azul de la bandera coreana con "한국". */
export function SelloTaegeuk({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <circle cx="50" cy="50" r="46" fill="#0047A0" />
      <path d="M4 50a46 46 0 0 1 92 0a23 23 0 0 1-46 0a23 23 0 0 0-46 0Z" fill="#CD2E3A" />
      <circle cx="50" cy="50" r="46" fill="none" stroke="var(--color-on-accent)" strokeWidth="5" />
      <text x="50" y="62" textAnchor="middle" fontFamily="Jua, sans-serif" fontSize="32" fill="#fff" stroke="var(--color-on-accent)" strokeWidth="1.2" paintOrder="stroke">
        한국
      </text>
    </svg>
  );
}

/** Playera dry-fit con el contorno del logo. */
export function Playera({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 110" aria-hidden="true" className={className}>
      <path
        d="M40 8 L22 16 L6 38 L22 50 L28 42 L28 102 L92 102 L92 42 L98 50 L114 38 L98 16 L80 8 C76 18 68 22 60 22 C52 22 44 18 40 8Z"
        fill="var(--color-surface)"
        {...TRAZO}
        strokeWidth={5}
      />
      <path d="M28 62 H92" stroke="#CD2E3A" strokeWidth="6" />
      <path d="M28 70 H92" stroke="#0047A0" strokeWidth="6" />
    </svg>
  );
}

/** Medalla temática con listón saekdong. */
export function Medalla({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className={className}>
      <path d="M38 6 L60 50 L82 6" fill="none" stroke="var(--color-outline)" strokeWidth="5" />
      <path d="M40 6 L52 30" stroke="#CD2E3A" strokeWidth="9" />
      <path d="M80 6 L68 30" stroke="#0047A0" strokeWidth="9" />
      <circle cx="60" cy="78" r="34" fill="var(--color-accent)" {...TRAZO} strokeWidth={5} />
      <circle cx="60" cy="78" r="22" fill="none" stroke="var(--color-outline)" strokeWidth="3" strokeDasharray="4 5" />
      <text x="60" y="88" textAnchor="middle" fontFamily="Jua, sans-serif" fontSize="22" fill="var(--color-outline)">
        완주
      </text>
    </svg>
  );
}

/** Snack coreano (un samgak gimbap, la bola de arroz triangular). */
export function Snack({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 110" aria-hidden="true" className={className}>
      <path
        d="M60 10 C66 10 70 14 74 20 L108 82 C112 90 108 100 98 100 L22 100 C12 100 8 90 12 82 L46 20 C50 14 54 10 60 10Z"
        fill="var(--color-surface)"
        {...TRAZO}
        strokeWidth={5}
      />
      <path d="M36 70 L84 70 L92 100 L28 100Z" fill="var(--color-ink)" stroke="var(--color-outline)" strokeWidth="5" strokeLinejoin="round" />
      <circle cx="48" cy="48" r="3.5" fill="var(--color-outline)" />
      <circle cx="72" cy="48" r="3.5" fill="var(--color-outline)" />
      <path d="M52 58 Q60 64 68 58" fill="none" stroke="var(--color-outline)" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}
