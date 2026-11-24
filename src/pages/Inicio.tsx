import { BarraInscripcion, Nav } from '../features/layout/Nav';
import { Footer } from '../features/layout/Footer';
import { Hero } from '../features/portada/Hero';
import { Confianza } from '../features/portada/Confianza';
import { Causa } from '../features/portada/Causa';
import { Sede } from '../features/portada/Sede';
import { Carrera } from '../features/portada/Carrera';
import { Patrocinadores } from '../features/portada/Patrocinadores';
import { Organizador } from '../features/portada/Organizador';
import { Preguntas } from '../features/portada/Preguntas';
import { Registro } from '../features/registro/Registro';

/**
 * La portada, en el orden en que alguien decide inscribirse: qué es, por qué, dónde, cómo es el día,
 * quién lo respalda, quién organiza, la inscripción y las dudas que quedan.
 */
export default function Inicio() {
  return (
    <>
      <Nav />
      <main id="contenido">
        <Hero />
        <Confianza />
        <Causa />
        <Sede />
        <Carrera />
        <Patrocinadores />
        <Organizador />
        <Registro />
        <Preguntas />
      </main>
      <Footer />
      <BarraInscripcion />
    </>
  );
}
