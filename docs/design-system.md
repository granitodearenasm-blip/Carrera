# Sistema de diseño

Fuente única: [`src/shared/design/tokens.ts`](../src/shared/design/tokens.ts). `npm run tokens` genera `tokens.css` (no se edita a mano). `tokens.test.ts` revisa el contraste AA de cada par de texto y fondo en los dos temas.

## Idea

**Estampas de Granito para una carrera coreana.** Todo se dibuja con el lenguaje del logo de Granito de Arena, y lo coreano entra con el saekdong y el taegeuk.

- **Contorno café grueso**, como el del logo, en dorsales, botones, tarjetas y fotos (utilidades `estampa`, `estampa-sm`, `estampa-lg`, `contorno`).
- **Sombra plana desplazada** del mismo café, como un sticker pegado; nunca sombras grises difusas. Al tocarlos, los botones bajan hacia su sombra.
- **Manchas de arena**: formas orgánicas del logo como fondo (`Manchas` en `shared/ui/decoracion.tsx`).
- **Saekdong**, las franjas del hanbok: divisor de bloques, cinta de meta y barra de progreso (utilidad `saekdong`). Solo decoración.
- **Rojo y azul del taegeuk** solo con significado y en par: rojo = tu selección, la salida, errores; azul = Corea, información, enlaces.
- **El elemento memorable** es la postal de la hacienda con el dorsal pegado encima, en el hero; el dorsal sostenido por las manos del logo acompaña la inscripción.

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
| `accent` | `#FDCD00` (amarillo del logo) | Bloque del hero, botón principal (uno por pantalla) |
| `sand` / `accentSoft` | `#FBE180` | Manchas, fondos suaves |
| `outline` / `stamp` | `#6A4207` (contorno del logo) | Contornos y sombras de estampa |
| `fg` | `#3A2406` | Texto; el café sustituye al negro |
| `page` | `#FFFCF2` | Fondo |
| `danger` | `#B8222E` | Selección, salida, errores |
| `info` / `link` | `#0047A0` | Corea, información, enlaces |

En el modo oscuro el fondo es café profundo y el amarillo sigue siendo amarillo. El hero es amarillo en los dos temas, así que lo que vive sobre él usa `on-accent` y `accent-soft`.

Reglas: solo clases semánticas (`bg-surface`, `text-fg`, `bg-accent`…), nunca hex sueltos ni `dark:`. El amarillo nunca es color de texto sobre fondos claros.

## Tipografía

- **Fredoka** (variable, ancho 75–125): títulos (`titulo-hero`, `titulo-display`, `titulo`, `subtitulo`) y números (`cifra`, estrecha y tabular). Redondeada como las letras del logo.
- **Nunito Sans**: texto, 17 px, interlineado 1.55, líneas de menos de 75 caracteres.
- **Jua**: el hangul (cualquier `lang="ko"`).
- Etiquetas en minúsculas normales; nada de mayúsculas espaciadas ni datos unidos con puntos medios.

## Componentes base (`src/shared/ui/`)

`Button` (primary, ink, secondary, quiet, danger, link), `IconButton` (siempre con `label`), `Card`, `Badge`, `Chip`, `TextField`/`Select`/`Checkbox` (etiqueta visible, ayuda y error junto al campo), `Dialog` (ventana o hoja lateral), `Toast` (`useToast`), `Alerta`, `EmptyState`, `Spinner`, `ErrorBoundary`, `ThemeSwitch`, y en `decoracion.tsx`: `Manchas`, `Saekdong`, `Contenedor`.

## Accesibilidad

Áreas táctiles de 44 px; foco visible (azul en claro, amarillo en oscuro); enlace "Saltar al contenido"; el tablero de números se recorre con las flechas (un solo punto de tabulación) y distingue los estados por textura y texto, no solo por color; `prefers-reduced-motion` apaga las animaciones.
