import { useEffect, useState } from 'react';
import { CONFIG } from '../../config';
import { dosDigitos } from '../../shared/format';

const OBJETIVO = new Date(CONFIG.salida).getTime();

/** Cuenta regresiva a la salida, como el reloj de meta. `compacta`: días, horas y minutos. */
export function Cuenta({ className = '', compacta = false }: { className?: string; compacta?: boolean }) {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), compacta ? 30000 : 1000);
    return () => clearInterval(t);
  }, [compacta]);

  if (isNaN(OBJETIVO)) return null;
  const diff = OBJETIVO - ahora;
  if (diff <= 0) return <p className={`rounded-lg bg-ink px-5 py-4 text-center titulo text-on-ink ${className}`}>¡Hoy corremos! 가자!</p>;

  const partes: [string, string][] = [
    [String(Math.floor(diff / 864e5)), 'días'],
    [dosDigitos(Math.floor(diff / 36e5) % 24), compacta ? 'hrs' : 'horas'],
    [dosDigitos(Math.floor(diff / 6e4) % 60), 'min'],
    ...(compacta ? [] : ([[dosDigitos(Math.floor(diff / 1e3) % 60), 'seg']] as [string, string][])),
  ];
  const texto = `Faltan ${partes[0][0]} días, ${partes[1][0]} horas y ${partes[2][0]} minutos para la salida`;
  return (
    <div className={`rounded-lg border-[2.5px] border-on-accent bg-ink text-on-ink shadow-md ${compacta ? 'px-3.5 py-2.5' : 'px-5 py-3.5'} ${className}`}>
      <p className="sr-only">{texto}</p>
      <p aria-hidden="true" className="text-small font-semibold text-on-ink-muted">
        Para la salida{' '}
        <span lang="ko" className={`text-accent ${compacta ? 'hidden sm:inline' : ''}`}>
          출발까지
        </span>
      </p>
      <div aria-hidden="true" className={`mt-1 grid ${compacta ? 'grid-cols-3' : 'grid-cols-4'}`}>
        {partes.map(([valor, etiqueta], i) => (
          <div key={etiqueta} className={i ? 'border-l-[1.5px] border-on-ink/20 pl-2.5' : ''}>
            <span className={`block cifra text-accent ${compacta ? 'text-[clamp(1.5rem,4vw,2rem)]' : 'text-[clamp(2rem,5vw,2.8rem)]'}`}>{valor}</span>
            <span className="text-small text-on-ink-muted">{etiqueta}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
