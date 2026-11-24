# HANGUK RUN 한국 2026

Sitio de la carrera con causa de Granito de Arena (3K, 5K y 10K, 7 feb 2027): portada, inscripción con elección de número y panel de organizadores. Leer docs solo si la tarea lo requiere: [arquitectura](docs/arquitectura.md) (capas, convenciones), [design-system](docs/design-system.md), [data-model](docs/data-model.md), [publicar](docs/publicar.md) (cuando el dueño dice "publícalo" o "publica lo pendiente": pedirlo ya es la aprobación, seguir la guía sin preguntar).

## Stack
- TypeScript 7, React 19, Vite 8, Tailwind 4, React Router 7.
- Datos: Supabase (Postgres, Realtime, auth anónima + correo para el panel). Captcha: Cloudflare Turnstile.
- Hosting: Cloudflare Pages (`wrangler.toml`, `public/_redirects`, `public/_headers`; `functions/` listo para Pages Functions).
- Íconos: lucide-react. Calidad: Vitest, oxlint, Prettier. Gestor de paquetes: npm.

## Comandos
- `npm run dev` / `npm run build` (tsc + vite build) / `npm run preview`
- `npm run check`: tipos, lint, pruebas, tokens, base de datos y formato. Obligatorio antes de terminar.
- `npm test` (Vitest) · `npm run lint` (oxlint) · `npm run typecheck` · `npm run format`
- `npm run tokens` regenera `tokens.css` · `npm run check:db` prueba la migración en PGlite
- `npm run pages:dev`: sirve `dist/` como Cloudflare Pages (prueba `_redirects` y `_headers`)
- `npm run deploy`: compila lo ya commiteado, despliega en Cloudflare y lo comprueba (ver [publicar](docs/publicar.md))

## Mapa de arquitectura
- `src/app/` rutas (`/` y `/panel`) · `src/pages/` una página delgada por ruta
- `src/features/` interfaz por área: `portada` (hero, confianza, causa, sede, carrera, patrocinadores, organizador, preguntas), `registro` (asistente, tablero de números, estado), `panel` (organizadores), `layout` (Nav, Footer, reglamento)
- `src/services/supabase/` cliente, auth, números, inscripciones y panel
- `src/shared/` sin conocimiento de la carrera: `design/` (tokens), `ui/` (componentes base), `format.ts`, `storage.ts`
- `src/config.ts` lo editan los organizadores: precios, categorías, tallas, números, sede, fotos, pago
- `supabase/` migraciones · `scripts/` tokens, deploy y pruebas de BD · `docs/` · `public/` (imágenes, `_redirects`, `_headers`)
- `_anterior/` versión vieja en HTML: solo respaldo, no tocar
- Ignorar siempre: `node_modules/`, `dist/`, `.wrangler/`

**Capas** (cada una importa solo las anteriores, sin ciclos): `shared → config → services → features → pages → app`.

## Dónde va cada cosa
- Pantalla nueva: `pages/` (delgada) + piezas en `features/<área>/`. Genérico: `shared/ui/`.
- Sección nueva de la portada: `features/portada/` + su lugar en `pages/Inicio.tsx` y, si va en el menú, en `SECCIONES` de `features/layout/Nav.tsx`.
- Patrocinadores: `CONFIG.patrocinadores` (logos en `public/img/patrocinadores/`). Preguntas frecuentes: `features/portada/listaPreguntas.ts`.
- La hacienda es **salida y meta**; la carrera corre por las calles de El Moral. Nunca escribir que se corre "dentro" de la hacienda.
- Dato editable por los organizadores (precio, fecha, texto corto, foto): `src/config.ts`, no en el componente.
- Acceso a Supabase: `services/supabase/`; los componentes nunca llaman a `supabase` directo.
- Lógica del asistente (apartados, temporizador, selección): `features/registro/store.ts`. Validación: `features/registro/datos.ts`.
- Navegador: `shared/storage.ts`. Fechas/números: `shared/format.ts` (`Intl`, `es-MX`).
- Avisos: `useToast()`. Ventanas: `Dialog` de `shared/ui/`.
- Color, tamaño, radio, sombra: token en `shared/design/tokens.ts` + `npm run tokens`.

## Reglas críticas
- Nombres: componentes `PascalCase.tsx`; lógica `camelCase.ts` por lo que hace; hooks `useX`. El sitio es solo en español: identificadores, comentarios (el porqué) y textos de UI en español, como el resto del código.
- Componentes de menos de ~250 líneas; si crecen, separar en archivos hermanos.
- Nada de utilidades duplicadas: buscar primero en `src/shared/`.
- Colores solo con clases semánticas de tokens (`bg-surface`, `text-fg`, `bg-accent`…); un solo botón principal por pantalla; el modo oscuro lo resuelven los tokens.
- Toda escritura pública pasa por funciones RPC de Supabase (`apartar_numero`, `soltar_numero`, `confirmar_inscripcion`); el total lo calcula la base de datos, nunca se confía en el precio que manda la página.
- Si cambia precio, rango de números, reservados o minutos de apartado en `config.ts`, cambiar también la tabla `ajustes` (nueva migración).
- Migraciones de `supabase/migrations/`: las ejecuta el dueño a mano, en orden. Cada una nueva va también en `docs/data-model.md` y se comprueba con `npm run check:db`.
- Datos personales (inscripciones, corredores) solo los leen los organizadores (`es_organizador()`); nunca exponerlos en tablas o vistas públicas.
- Textos marcados `[POR CONFIRMAR]` o `<Pendiente>`: no inventar el dato, dejarlo pendiente.
- Si el cambio toca la compilación, correr también `npm run build`.

## NUNCA
- Usar `localStorage` directo, `confirm()`/`alert()` del navegador, valores de color sueltos ni `dark:`.
- Nombrar archivos `utils.ts` o `helpers.ts`.
- Mostrar o copiar `.env.local` ni `.dev.vars`; la clave secreta de Supabase (`service_role`) nunca va al navegador.
- Abrir la tabla `numeros` a escritura directa ni dar lectura pública a `inscripciones`/`corredores`.
- Meter ciclos de imports ni saltarse el orden de capas.

## Manejo de errores
- Fallos visibles al usuario: `Alerta` en el paso del asistente o `useToast`; nunca un error crudo de Supabase en pantalla.
- `services/` devuelve datos con la forma del modelo (`Inscripcion`, `Corredor`), sin componentes; traduce los códigos de error de las RPC.
- Errores de lint detienen `npm run check`; un warning de hooks omitido a propósito lleva su comentario.

## Skills automáticos
- `verificar`: al terminar cualquier cambio de código, antes de darlo por hecho (corre `npm run check`).
- `frontend-design` / `ui-ux-pro-max`: al crear o rediseñar pantallas, componentes o estilos (siempre dentro de los tokens).
- `web-design-guidelines`: al pedir revisar UI, UX o buenas prácticas de un archivo.
- `accessibility-scan` / `-inspect` / `-audit`: revisar accesibilidad de una página (automático / teclado y lector / sitio completo).
- `accessibility-diff` / `-fix`: comprobar si un cambio rompió accesibilidad / reparar violaciones.

## Flujo de trabajo y ahorro de tokens
- Delegar siempre búsquedas de código, lectura de logs y exploración inicial al subagente `explorador` (Haiku).
- Delegar siempre la ejecución de pruebas, linters y validaciones de build al subagente `tester` (Haiku).
- No leer archivos enteros si basta con buscar funciones específicas (`Grep`), y evitar leer carpetas de dependencias o compilados.
- Mantener las respuestas breves y enfocadas solo en el código modificado.
