/**
 * Logotipo de la identidad «Varsity Seúl»: «Hanguk» en script con contorno, «RUN» en rojo sol
 * y la etiqueta roja inclinada 한국 런. Se arma con texto, no es una imagen; las proporciones
 * son las mismas en el menú, el hero y las piezas de redes.
 */
export function Logotipo({ className = '', compacto = false }: { className?: string; compacto?: boolean }) {
  if (compacto) {
    return (
      <span className={`inline-flex items-baseline gap-2 ${className}`} translate="no">
        <span className="font-logo text-[1.9rem] leading-none">Hanguk</span>
        <span className="font-display text-[0.95rem] font-black tracking-[0.3em] text-accent-soft">RUN</span>
      </span>
    );
  }
  return (
    <span className={`inline-flex flex-col items-center ${className}`} translate="no">
      <span className="block -rotate-6 logo-script text-[clamp(4.5rem,3rem+7vw,9.5rem)] leading-[1.05]">Hanguk</span>
      <span className="mt-1 flex items-center gap-4">
        <span className="font-display text-[clamp(1.8rem,1.2rem+2.4vw,3.4rem)] font-black tracking-[0.35em] text-accent">RUN</span>
        <span lang="ko" className="rotate-[4deg] border-[3px] border-outline bg-accent px-3 py-1 text-[clamp(1.1rem,0.9rem+1vw,1.8rem)] text-on-accent shadow-sm">
          한국 런
        </span>
      </span>
    </span>
  );
}

/** Skyline de Seúl a línea con el sol rojo: torres, Namsan, puerta tradicional, Lotte Tower y puente. */
export function Skyline({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 900 120" className={className} aria-hidden="true" fill="none" strokeWidth="2" strokeLinejoin="round">
      <circle cx="640" cy="52" r="30" className="fill-accent" />
      <g className="stroke-outline">
        {/* Puente */}
        <path d="M0 108h170M10 108q75-40 150 0M40 108v-18M85 108v-26M130 108v-18" />
        {/* Torres */}
        <path d="M170 118V70h34v48M180 80h14M180 92h14M180 104h14M210 118V50h28v68M220 62h8M220 76h8M220 90h8" />
        {/* Namsan y su torre */}
        <path d="M240 118q70-60 140 0M310 88V40M302 40h16M306 30h8M310 30V18" />
        {/* Puerta tradicional */}
        <path d="M400 118V86h80v32M392 86h96l-10-14h-76zM404 72q36-14 72 0M430 118v-18h20v18" />
        {/* Edificios */}
        <path d="M500 118V64h30v54M540 118V78h26v40M508 76h14M508 90h14M548 90h10" />
        {/* Lotte Tower */}
        <path d="M700 118V40l12-34 12 34v78M706 60h12M706 80h12M706 100h12" />
        {/* Más edificios */}
        <path d="M740 118V72h30v46M780 118V86h40v32M830 118V60h26v58M748 84h14M838 74h10M838 90h10" />
        <path d="M0 118h900" />
      </g>
    </svg>
  );
}
