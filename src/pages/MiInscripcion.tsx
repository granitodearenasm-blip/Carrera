import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Cloud } from 'lucide-react';
import { soloDigitos } from '../shared/format';
import { Contenedor } from '../shared/ui/decoracion';
import { EmptyState } from '../shared/ui/EmptyState';
import { hayNube } from '../services/supabase/client';
import { EncabezadoSimple } from '../features/layout/EncabezadoSimple';
import { ConsultaInscripcion } from '../features/pago/ConsultaInscripcion';

/** /mi-inscripcion: el corredor consulta su estado de pago y avisa que ya pagó. */
export default function MiInscripcion() {
  const [params] = useSearchParams();
  const folio = soloDigitos(params.get('folio') ?? '') || undefined;

  useEffect(() => {
    document.title = 'Mi inscripción, HANGUK RUN';
  }, []);

  return (
    <div className="min-h-dvh bg-page">
      <EncabezadoSimple titulo="Mi inscripción" />
      <main id="contenido" className="py-10">
        <h1 className="sr-only">Mi inscripción a HANGUK RUN</h1>
        <Contenedor>
          {hayNube ? (
            <ConsultaInscripcion folioInicial={folio} />
          ) : (
            <EmptyState icon={Cloud} title="Consulta no disponible">
              Esta página funciona cuando el sitio está conectado a la base de datos.
            </EmptyState>
          )}
        </Contenedor>
      </main>
    </div>
  );
}
