import { Nav } from './components/Nav';
import { Hero } from './sections/Hero';
import { Causa, Compromisos } from './sections/Causa';
import { Organizador } from './sections/Organizador';
import { Agenda } from './sections/Agenda';
import { Sede } from './sections/Sede';
import { Ruta } from './sections/Ruta';
import { Kit } from './sections/Kit';
import { Premios } from './sections/Premios';
import { Patrocinadores } from './sections/Patrocinadores';
import { Footer } from './sections/Footer';
import { Registro } from './registro/Registro';

// La página es el recorrido: cada sección es un kilómetro, y la inscripción es la meta (KM 10).
export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Causa />
        <Compromisos />
        <Organizador />
        <Agenda />
        <Sede />
        <Ruta />
        <Kit />
        <Premios />
        <Patrocinadores />
        <Registro />
      </main>
      <Footer />
    </>
  );
}
