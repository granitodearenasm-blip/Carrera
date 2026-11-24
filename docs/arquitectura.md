# Arquitectura

Sitio estático (Vite + React 19) servido por Cloudflare Pages. Lo dinámico va directo del navegador a Supabase, protegido por las reglas de la base de datos. No hay servidor propio.

## Capas

Cada capa importa solo las anteriores, sin ciclos (lo revisa `npm run check:architecture`):

```
shared → config → services → features → pages → app
```

| Capa | Carpeta | Qué va |
|---|---|---|
| shared | `src/shared/` | Sin conocimiento de la carrera: `design/` (tokens), `ui/` (componentes base), `format.ts`, `storage.ts`, `theme.ts` |
| config | `src/config.ts` | Lo que editan los organizadores |
| services | `src/services/supabase/` | Cliente, sesión, números, inscripciones, panel. Devuelven datos con la forma del modelo y traducen errores |
| features | `src/features/` | `portada` (hero, confianza, causa, sede, carrera, patrocinadores, organizador, preguntas), `registro` (asistente, tablero, estado), `panel`, `layout` (Nav, Footer, Sección, reglamento) |
| pages | `src/pages/` | Una página delgada por ruta: `Inicio`, `Panel` |
| app | `src/app/` | Router y proveedores. `/panel` se carga aparte |

## Flujo de una inscripción

1. **Paso 1:** cuántos corredores (estado local en `features/registro/store.ts`).
2. **Paso 2:** al entrar, se abre una sesión anónima (con Turnstile si hay clave), se carga `tablero` y se escucha en tiempo real mientras la pestaña está visible. Tocar un número llama a `apartar_numero`; el temporizador cuenta 6 minutos desde la hora local del pedido (siempre igual o antes que la del servidor).
3. **Paso 3:** datos, validados con las mismas reglas que la base de datos (`datos.ts`), con el error junto al campo.
4. **Paso 4:** `confirmar_inscripcion`. Si un número se perdió, el asistente vuelve al paso 2 conservando los datos.

Sin variables de Supabase todo funciona en **modo demostración**: los números confirmados se guardan solo en ese navegador.

## Cloudflare Pages

- Sin `wrangler.toml` a propósito: si existe, Cloudflare Pages ignora las variables del panel al compilar. El proyecto y la carpeta van en `scripts/deploy.mjs` y en el panel.
- `public/_redirects`: `/panel` sirve `index.html` (lo resuelve React Router).
- `public/_headers`: seguridad (CSP con Supabase, Turnstile, Google Fonts y Google Maps) y caché.
- `functions/`: vacío; listo para Pages Functions si algún día hacen falta.

## Calidad

`npm run check` = tipos + oxlint + Vitest + arquitectura + tokens + base de datos + Prettier. Obligatorio antes de terminar un cambio (skill `verificar`).
