# HANGUK RUN 한국

Sitio de la carrera con causa de Granito de Arena: 3K, 5K y 10K el domingo 6 de diciembre de 2026 por las calles de San Martín Texmelucan, con salida y meta en el Museo Hacienda San Cristóbal Polaxtla. Cada inscripción apoya a jóvenes voluntarios de Granito de Arena que representarán a su comunidad en Corea del Sur.

- **Portada:** pensada para inscribirse con confianza: la causa, la sede (salida y meta), la carrera con su ruta, los patrocinadores, quién organiza y preguntas frecuentes.
- **Inscripción:** en 4 pasos; cada corredor elige su número en un tablero en tiempo real.
- **Panel de organizadores** en `/panel`: inscripciones, pagos y exportación a CSV.

Hecho con Vite, React, TypeScript y Tailwind. Datos en **Supabase** y publicación en **Cloudflare Pages**.

## Trabajar en el sitio

Requiere [Node.js](https://nodejs.org) 24.

```bash
npm install      # una vez
npm run dev      # http://localhost:5173 (sin .env.local funciona en modo demostración)
npm run check    # tipos, lint, pruebas, arquitectura, tokens, base de datos y formato
npm run build    # sitio listo en dist/
```

Para conectarlo a Supabase, copia `.env.example` como `.env.local` y llénalo.

## Documentación

- [Publicar](docs/publicar.md): crear Supabase, Cloudflare Pages y Turnstile paso a paso, y publicar.
- [Modelo de datos](docs/data-model.md): tablas, funciones y reglas de seguridad.
- [Arquitectura](docs/arquitectura.md): capas y flujo de una inscripción.
- [Sistema de diseño](docs/design-system.md): la identidad de Granito aplicada a la carrera.
- [CLAUDE.md](CLAUDE.md): convenciones para trabajar con Claude Code (igual que en Trellum).

## Dónde cambiar cada cosa

Lo editable está marcado con `✏️` en el código.

| Qué | Dónde |
|---|---|
| Precio, categorías, tallas, números, fecha, sede, fotos, WhatsApp de pagos | `src/config.ts` (y la tabla `ajustes` de Supabase si es precio, números o tiempos) |
| Textos de cada sección | `src/features/portada/` |
| Patrocinadores (logo, nivel, enlace, descripción) y lugares por nivel | `CONFIG.patrocinadores` y `CONFIG.patrocinio` en `src/config.ts`; logos en `public/img/patrocinadores/` |
| Preguntas frecuentes | `src/features/portada/listaPreguntas.ts` |
| Trazo de la ruta de 10 km | `src/features/portada/MapaRuta.tsx` |
| Aviso de privacidad | `src/features/layout/Privacidad.tsx` (revisarlo antes de publicar) |
| Reglamento | `src/features/layout/Footer.tsx` |
| Colores y tipografía | `src/shared/design/tokens.ts` y luego `npm run tokens` |
| Fotos | `public/img/` |

La versión anterior en HTML puro se conserva en `_anterior/` solo como respaldo.
