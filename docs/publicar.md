# Publicar HANGUK RUN (Supabase + Cloudflare Pages)

Cuando el dueño dice "publícalo" o "publica lo pendiente", pedirlo ya es la aprobación: seguir la sección 4 sin preguntar.

Las secciones 1 a 3 se hacen **una sola vez**. Después, publicar es solo la sección 4.

---

## 1. Crear la base de datos en Supabase

1. Entra a [supabase.com](https://supabase.com) y crea un proyecto (plan gratuito). Región sugerida: la más cercana a México, por ejemplo `East US (North Virginia)`. Guarda la contraseña de la base de datos en un lugar seguro.
2. Abre **SQL Editor → New query**, pega todo el contenido de [`supabase/migrations/0001_inicial.sql`](../supabase/migrations/0001_inicial.sql) y pulsa **Run**. Debe terminar sin errores.
3. **Authentication → Sign In / Providers**:
   - Activa **Allow anonymous sign-ins**. Los visitantes reciben una sesión anónima para apartar números; sin esto, el tablero muestra un aviso.
   - Deja activado **Email** para las cuentas del panel.
   - Deja **activado** **Allow new users to sign up**: si se apaga, Supabase también bloquea las sesiones anónimas (`signup_disabled`) y nadie puede apartar números. Una cuenta con correo creada por alguien de fuera no ve nada: el panel solo abre para quien está en la tabla `organizadores`. Deja **Confirm email** activado en el proveedor Email.
4. **Project Settings → API Keys**: copia la **Project URL** y la clave **publishable** (empieza con `sb_publishable_`). La clave **secret** no se usa en este sitio: no la copies a ningún archivo.

### Crear una cuenta de organizador

1. **Authentication → Users → Add user → Create new user**: correo y contraseña, con **Auto Confirm User** marcado.
2. En **SQL Editor**, ejecuta, cambiando el correo:

   ```sql
   insert into public.organizadores (user_id, nombre)
   select id, 'Panel Granito' from auth.users where email = 'correo-del-organizador@ejemplo.com';
   ```

3. Esa cuenta ya puede entrar en `/panel`. Para quitarle el acceso: `delete from public.organizadores where user_id = '…';`

## 2. (Recomendado) Captcha con Cloudflare Turnstile

Evita que un programa abra miles de sesiones y aparte todos los números.

1. En el panel de Cloudflare: **Turnstile → Add widget**. Dominio: el de Pages (`hanguk-run.pages.dev`) y tu dominio propio si lo tienes. Modo: **Managed**.
2. Copia la **Site key**: va en la variable `VITE_TURNSTILE_SITE_KEY`.
3. Copia la **Secret key** en Supabase: **Authentication → Attack Protection → Enable Captcha protection**, proveedor **Turnstile**.

## 3. Crear el sitio en Cloudflare Pages

Hay dos formas. Elige una.

### Opción A: conectar el repositorio de GitHub (se publica solo con cada push a `main`)

1. Cloudflare → **Workers & Pages → Create → Pages → Connect to Git** y elige este repositorio.
2. Configuración de compilación:
   - Framework preset: **None** (o Vite)
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Variables (pestaña **Variables and Secrets**, entorno de compilación): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` y, si hiciste el paso 2, `VITE_TURNSTILE_SITE_KEY`. Agrega también `NODE_VERSION` = `24`.
3. Guarda y despliega. El nombre del proyecto debe ser `hanguk-run` (o cambia `PROYECTO` en `scripts/deploy.mjs`). No agregues un `wrangler.toml`: con él, Pages ignora las variables del panel.

### Opción B: desplegar desde esta computadora con `npm run deploy`

1. `npx wrangler login` (una vez).
2. `npx wrangler pages project create hanguk-run --production-branch main` (una vez).
3. Crea `.env.local` a partir de `.env.example` con los valores de los pasos 1 y 2. Vite los usa al compilar.

### Dominio propio (opcional)

Pages → el proyecto → **Custom domains → Set up a domain**. Después cambia `SITIO` en `scripts/deploy.mjs` y agrega el dominio al widget de Turnstile.

## 4. Publicar

- **Opción A:** haz commit y push a `main`. Cloudflare compila y publica.
- **Opción B:** haz commit y luego `npm run deploy`. El script se niega a publicar con cambios sin commit, compila, despliega y comprueba que el sitio ya sirve la versión nueva.

Antes de publicar, corre `npm run check`.

## 5. Probar que todo funciona (después del primer despliegue)

1. Abre el sitio: la franja de confianza debe mostrar los números disponibles. Ve a **Inscríbete**, pulsa **Elegir mi número** y el tablero debe decir "Disponibilidad en tiempo real".
2. Completa una inscripción de prueba. Debe aparecer la ventana "¡Ya estás en la carrera!" con un folio.
3. Abre `/panel` con la cuenta de organizador: la inscripción aparece. Cancélala para liberar el número de prueba.
4. En otra ventana (modo incógnito), aparta un número y comprueba que en la primera ventana aparece rayado ("Alguien lo está apartando") en segundos.

## Cosas que cambiaron respecto al sitio anterior

- **Firebase ya no se usa en este sitio.** El archivo `firestore.rules` salió de este repositorio; la página de la **Expo Emprendedores con Causa** sigue usando Firebase con su propia copia idéntica de las reglas, así que no se ve afectada. No publiques en Firebase unas reglas sin la parte de la Expo.
- **Wasmer y la rama `sitio` ya no se usan.** El flujo de GitHub Actions que la generaba se eliminó. La rama `sitio` puede borrarse en GitHub cuando Cloudflare ya esté publicando.
- **Hostinger:** el `.htaccess` se sustituyó por `public/_headers` y `public/_redirects` (formato de Cloudflare Pages).

## Si cambias precio, números o tiempos

Los valores viven en dos lugares: `src/config.ts` (lo que se muestra) y la tabla `ajustes` de Supabase (lo que se cobra y se valida). Cambia los dos. Ejemplo para el precio:

```sql
update public.ajustes set precio = 400;
```

Para cerrar las inscripciones sin tocar el sitio: `update public.ajustes set inscripciones_abiertas = false;`
