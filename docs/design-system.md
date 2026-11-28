# Sistema de diseño

Fuente única: [`src/shared/design/tokens.ts`](../src/shared/design/tokens.ts). `npm run tokens` genera `tokens.css` (no se edita a mano). `tokens.test.ts` revisa el contraste AA de cada par de texto y fondo en los dos temas.

## Idea

**Varsity Seúl**, la identidad del design system «Hanguk Run» (artifact en claude.ai): retro deportivo coreano, un uniforme universitario cruzado con el skyline de Seúl a línea. La misma identidad en el sitio y en las piezas de redes.

- **Fondo hueso con cuadrícula** cada 48 px (en `body`, `src/index.css`).
- **Logotipo** (`features/layout/Logotipo.tsx`): «Hanguk» en Damion con contorno marino y doble sombra (utilidad `logo-script`), «RUN» en rojo y la etiqueta roja inclinada 한국 런. En el menú va la versión `compacto`.
- **Skyline de Seúl a línea** con el sol rojo (`Skyline`), en el hero y sobre el pie.
- **Bloques rectos** con contorno marino de 3 px y sombra plana desplazada (`estampa`, `estampa-sm`, `estampa-lg`, `contorno`); esquinas rectas salvo campos (`rounded-sm`) y chips (`rounded-pill`).
- **Un solo botón rojo** por pantalla, en MAYÚSCULAS espaciadas.
- **Franjas de uniforme** (utilidad `saekdong`): divisor, cinta de meta y progreso. Solo decoración.

## Estructura de la portada

En el orden en que alguien decide inscribirse (patrón "Event Landing" de `ui-ux-pro-max`):

1. **Hero**: la promesa, fecha, cierre de inscripciones, salida y meta, y la postal de la hacienda con el dorsal.
2. **Franja de confianza**: quién organiza, número apartado al instante, pago sin cobros en línea y números disponibles en vivo.
3. **Por qué corremos**: quiénes, a dónde y qué regresa; transparencia de los fondos.
4. **La sede**: agradecimiento al museo y a la Fundación (la sección más amplia), historia, visita, "Cuidemos la casa" y cómo llegar.
5. **La carrera**: distancias, mapa de la ruta, fechas, kit y premios.
6. **Patrocinadores**: principales en grande, niveles con logos y la invitación a patrocinar. Los logos se repiten en el pie y en la confirmación.
7. **Quién organiza**: Granito de Arena, con datos y proyectos.
8. **Inscríbete**: "Así de fácil", qué incluye y el asistente.
9. **Preguntas frecuentes** y pie con reglamento y aviso de privacidad.

**Voz**: segunda persona, voz activa, frases cortas; los botones dicen lo que hacen. Nada inventado: lo que falta va con `<Pendiente>`.

## Color

| Rol | Claro | Uso |
|---|---|---|
| `page` | `#F6F1E7` (hueso) | Fondo, con la cuadrícula `line` |
| `fg` / `outline` / `stamp` / `ink` | `#1F2A6B` (marino) | Texto, contornos, sombras y bloques fuertes (menú, pie); sustituye al negro |
| `accent` | `#D3302A` (rojo sol) | Botón principal, etiqueta 한국 런, RUN y el sol. Nunca fondos grandes |
| `accentSoft` | `#FF7A2F` (naranja) | Números de sección y chispas, nunca texto largo |
| `link` / `info` | `#3F62C9` (azul pista) | Enlaces e información |
| `danger` | `#A81E2A` | Errores, distinto del rojo sol |

En oscuro el fondo es marino noche (`#141B47`) y el texto hueso. Proporción aproximada: 60 % hueso, 30 % marino, 10 % rojo/naranja. Sin degradados, morado ni rosa.

Reglas: solo clases semánticas (`bg-surface`, `text-fg`, `bg-accent`…), nunca hex sueltos ni `dark:`.

## Tipografía

- **Damion** (`font-logo`): solo «Hanguk» del logotipo y del dorsal.
- **Archivo 900** (`titulo-hero`, `titulo-display`, `titulo`, `subtitulo`, `cifra`, `etiqueta`, botones): siempre en MAYÚSCULAS espaciadas.
- **Archivo 500**: texto corrido, 17 px, interlineado 1.55.
- **Black Han Sans**: el hangul (cualquier `lang="ko"`).

## Componentes base (`src/shared/ui/`)

`Button` (primary, ink, secondary, quiet, danger, link), `IconButton` (siempre con `label`), `Card`, `Badge`, `Chip`, `TextField`/`Select`/`Checkbox` (etiqueta visible, ayuda y error junto al campo), `Dialog` (ventana o hoja lateral), `Toast` (`useToast`), `Alerta`, `EmptyState`, `Spinner`, `ErrorBoundary`, `ThemeSwitch`, y en `decoracion.tsx`: `Manchas`, `Saekdong`, `Contenedor`.

## Accesibilidad

Áreas táctiles de 44 px; foco visible (azul en claro, amarillo en oscuro); enlace "Saltar al contenido"; el tablero de números se recorre con las flechas (un solo punto de tabulación) y distingue los estados por textura y texto, no solo por color; `prefers-reduced-motion` apaga las animaciones.
