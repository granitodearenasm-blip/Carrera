import { CONFIG } from '../../config';
import { Seccion } from '../layout/Seccion';
import { Distancias } from './Distancias';
import { Fechas } from './Fechas';
import { Glosario } from './Glosario';
import { KitPremios } from './KitPremios';
import { MapaRuta } from './MapaRuta';

/** Cómo es el día: distancias, fechas, kit y premios. */
export function Carrera() {
  return (
    <Seccion
      id="carrera"
      ko="코스"
      titulo="Elige tu distancia"
      entrada={`Las tres distancias salen y llegan al ${CONFIG.sede.nombre} y recorren las calles de El Moral, en San Martín Texmelucan. Las salidas son escalonadas para que cada quien corra con espacio.`}
      tone="sunken"
    >
      <Distancias />
      <div className="mt-20 grid gap-8 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-4">
          <h3 className="titulo">Por dónde corremos</h3>
          <p className="mt-3 text-fg-muted">
            Sales de la hacienda, recorres las calles de El Moral y regresas a la meta, donde te esperan tu familia, la medalla y el snack coreano.
          </p>
          <p className="mt-3 text-fg-muted">La ruta estará marcada y habrá personal de apoyo para guiarte en todo el recorrido.</p>
        </div>
        <div className="lg:col-span-8">
          <MapaRuta />
        </div>
      </div>
      <Fechas />
      <Glosario />
      <KitPremios />
    </Seccion>
  );
}
