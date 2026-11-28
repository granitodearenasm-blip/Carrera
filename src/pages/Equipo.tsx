import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Contenedor } from '../shared/ui/decoracion';
import { EncabezadoSimple } from '../features/layout/EncabezadoSimple';
import { EntradaEquipo } from '../features/equipo/EntradaEquipo';

/** /equipo/:clave: la página privada de cada miembro del Equipo Hanguk. */
export default function Equipo() {
  const { clave = '' } = useParams();
  useEffect(() => {
    document.title = 'Equipo Hanguk, HANGUK RUN';
  }, []);
  return (
    <div className="min-h-dvh bg-page">
      <EncabezadoSimple titulo="Hanguk Run, equipo" />
      <main id="contenido" className="py-10">
        <h1 className="sr-only">Equipo Hanguk</h1>
        <Contenedor className="max-w-4xl">
          <EntradaEquipo key={clave} clave={clave} />
        </Contenedor>
      </main>
    </div>
  );
}
