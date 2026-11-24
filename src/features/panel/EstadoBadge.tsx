import { Badge } from '../../shared/ui/Badge';
import type { InscripcionPanel } from '../../services/supabase/panel';

// Inicio del día en que se abrió el panel (al recargar se actualiza)
const HOY = new Date(new Date().setHours(0, 0, 0, 0));

/** Estado de pago con texto (nunca solo color); una pendiente con plazo vencido lo dice. */
export function EstadoBadge({ ins }: { ins: InscripcionPanel }) {
  if (ins.estadoPago === 'pagado') return <Badge tone="success">Pagado</Badge>;
  if (ins.estadoPago === 'cancelado') return <Badge>Cancelado</Badge>;
  return ins.pagarAntesDe < HOY ? <Badge tone="danger">Pago vencido</Badge> : <Badge tone="sand">Pendiente</Badge>;
}
