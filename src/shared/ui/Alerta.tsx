import type { ReactNode } from 'react';
import { CircleCheck, Info, TriangleAlert } from 'lucide-react';

const TONO = {
  danger: { clase: 'bg-danger-soft text-danger', Icono: TriangleAlert },
  info: { clase: 'bg-info-soft text-info', Icono: Info },
  success: { clase: 'bg-success-soft text-success', Icono: CircleCheck },
};

/** Aviso dentro del contenido: qué pasó y cómo seguir. Los de peligro se anuncian de inmediato. */
export function Alerta({ children, tone = 'danger', className = '' }: { children: ReactNode; tone?: keyof typeof TONO; className?: string }) {
  if (!children) return null;
  const { clase, Icono } = TONO[tone];
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={`flex gap-3 rounded-md px-4 py-3 text-small font-semibold ${clase} ${className}`}>
      <Icono size={19} aria-hidden="true" className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
