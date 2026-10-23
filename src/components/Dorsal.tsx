/** El número de corredor impreso: banda roja, cuatro orificios para los seguros y talón desprendible. */
export function Dorsal({ numero, nombre, pie, className = '' }: { numero: string | number; nombre?: string; pie?: string; className?: string }) {
  const hoyos = ['top-2.5 left-2.5', 'top-2.5 right-2.5', 'bottom-2.5 left-2.5', 'bottom-2.5 right-2.5'];
  return (
    <div className={`relative overflow-hidden rounded-[6px] bg-card text-ink shadow-[0_1px_0_rgb(22_21_15/0.08),0_24px_50px_-24px_rgb(22_21_15/0.45)] ring-1 ring-ink/10 ${className}`}>
      {hoyos.map((p) => (
        <span key={p} aria-hidden className={`absolute z-10 size-3 rounded-full bg-paper shadow-[inset_0_1px_2px_rgb(22_21_15/0.35)] ${p}`} />
      ))}
      <div className="flex items-center justify-between bg-hong px-8 py-2.5 text-white">
        <span className="display text-[1.35em] leading-none">Hanguk Run</span>
        <span lang="ko" className="font-ko text-[1.1em] leading-none">
          한국
        </span>
      </div>
      <div className="px-6 pt-3 pb-2 text-center">
        <span className="display block text-[5.2em] leading-[0.95] tabular-nums">{numero}</span>
        {nombre && <span className="mt-1 block text-[0.95em] font-bold tracking-[0.18em] uppercase">{nombre}</span>}
      </div>
      <div className="perforado mx-4 h-2" aria-hidden />
      <div className="flex items-center justify-between px-8 pt-1.5 pb-4 text-[0.72em] font-semibold tracking-[0.14em] text-muted uppercase">
        <span>{pie ?? '3K · 5K · 10K'}</span>
        <span className="tabular-nums">06·12·2026</span>
      </div>
    </div>
  );
}
