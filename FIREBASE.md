# Conectar HANGUK RUN con Firebase Firestore

La página guarda las inscripciones en **Firestore**, una base de datos no relacional de Google
con plan gratuito. Ahí también se apartan los **números de corredor**: cada número solo puede
tenerlo una persona, aunque dos se inscriban al mismo tiempo.

Mientras no la conectes, la página funciona en **modo demostración**: no guarda nada en
internet y los números ocupados solo se recuerdan en el navegador donde se probó.

---

## 1. Crear el proyecto (una sola vez)

1. Entra a <https://console.firebase.google.com> con la cuenta de Google de Granito de Arena.
2. **Agregar proyecto** → nombre, por ejemplo `hanguk-run` → puedes desactivar Google Analytics → **Crear proyecto**.

## 2. Crear la base de datos

1. En el menú izquierdo: **Compilación → Firestore Database → Crear base de datos**.
2. Ubicación: elige una cercana, por ejemplo `us-central1` o `northamerica-south1` (no se puede cambiar después).
3. Elige **Iniciar en modo de producción** → **Crear**.

## 2.5 Activar el acceso anónimo (para apartar números)

Cada número que una persona toca queda **apartado 6 minutos** a su nombre, como los asientos del
cine. Para saber de quién es cada apartado, Firebase le da a cada visitante una identidad
**anónima** (no pide correo ni contraseña).

1. En el menú izquierdo: **Compilación → Authentication → Comenzar**.
2. Pestaña **Método de acceso** (Sign-in method) → **Anónimo** → **Habilitar** → **Guardar**.

Si falta este paso, la página muestra: *"Falta activar el acceso anónimo en Firebase"*.

## 3. Pegar las reglas de seguridad

1. En Firestore Database, abre la pestaña **Reglas**.
2. Borra lo que aparece y pega **todo** el contenido del archivo `firestore.rules` de esta carpeta.
3. Clic en **Publicar**.

> ⚠️ Este proyecto también lo usa la **Expo con Causa**. `firestore.rules` trae las reglas de las dos
> páginas juntas (es idéntico a `expo/firestore.rules`). Si cambias algo, cámbialo en ambos archivos.

Con estas reglas:
- al tocar un número, se **aparta 6 minutos** (`numeros/{n}` con `estado: apartado`); solo quien lo apartó puede soltarlo, y al vencer queda libre para todos;
- un número solo se **confirma** (`estado: confirmado`) si quien lo confirma tiene su apartado vigente;
- la página dibuja el tablero con un **resumen de 7 documentos** (`tablero/1` … `tablero/7`, uno por centena), que las reglas validan contra `numeros`;
- cualquiera puede ver **qué números están ocupados o en proceso**, que no incluyen datos personales;
- cualquiera puede **crear su inscripción**;
- **nadie puede leer, cambiar ni borrar inscripciones desde la página**. Solo ustedes, desde la consola.

## 4. Registrar la página web y copiar la configuración

1. Ícono de engrane ⚙️ (arriba a la izquierda) → **Configuración del proyecto**.
2. En **Tus apps**, clic en el ícono **`</>`** (Web) → apodo `hanguk-run-web` → **Registrar app**. No hace falta activar Firebase Hosting.
3. Firebase muestra un bloque `const firebaseConfig = { ... }`. Copia esos valores en `src/config.ts`, dentro de `CONFIG` (y vuelve a generar el sitio con `npm run build`):

```js
modo: 'firebase',
firebase: {
  apiKey: 'AIza...',
  authDomain: 'hanguk-run.firebaseapp.com',
  projectId: 'hanguk-run',
  appId: '1:1234567890:web:abc123'
},
```

> Estos datos **no son secretos**: Firebase los diseña para ir en páginas web. La seguridad la dan las reglas del paso 3.

## 5. Proteger la llave (recomendado)

En <https://console.cloud.google.com/apis/credentials>, con el proyecto seleccionado:
abre la **Browser key** → **Restricciones de aplicaciones: Sitios web** → agrega el dominio
de la página (por ejemplo `https://hangukrun.mx/*`) → **Guardar**.
Así solo su página puede usar esa llave.

## 6. Probar

1. Genera el sitio (`npm run build`) y sube el contenido de `dist/` al hosting, o pruébalo en local con `npm run dev`.
2. En el paso 2 de la inscripción ("Elige tus números") debe decir **"🟢 Disponibilidad en tiempo real"**.
3. Haz una inscripción de prueba. En la consola, en **Firestore Database → Datos**, aparecen:
   - `inscripciones` → un documento con todos los datos;
   - `numeros` → un documento por cada número apartado, con su número como nombre.
4. Intenta inscribirte otra vez con el mismo número: la página debe avisar que ya está ocupado.
5. **Borra los datos de prueba** antes de abrir las inscripciones. Borra el documento en `inscripciones` y los de `numeros`; esto último **libera el número**.

---

## Tareas frecuentes

| Quiero… | Cómo |
|---|---|
| **Ver las inscripciones** | Consola → Firestore Database → Datos → `inscripciones`. Cada una incluye `estadoPago` (pendiente) y `pagarAntesDe` (fecha límite). |
| **Marcar que alguien ya pagó** | Abre su documento en `inscripciones` → campo `estadoPago` → cámbialo de `pendiente` a `pagado`. |
| **Cambiar los 6 minutos de apartado** | `src/config.ts` → `CONFIG.apartado.minutos`, y `MINUTOS_APARTADO` en `firestore.rules`. |
| **Apartados vencidos** | Documentos en `numeros` con `estado: apartado` de hace más de 6 minutos. Pueden quedarse ahí: la página los trata como libres y se reutilizan. |
| **Liberar un número** (por ejemplo, alguien no pagó) | 1) En `numeros`, borra el documento del número (por ejemplo `123`). 2) En `tablero`, abre el bloque de su centena (`tablero/2` para 101–200) → en el campo `n`, borra la clave `123`. Haz **los dos**: el primero libera el número y el segundo lo muestra libre en el tablero. |
| **Cambiar el rango de números** | `src/config.ts` → `CONFIG.numeros.minimo / maximo`, y lo mismo en `firestore.rules` (`MINIMO` / `MAXIMO`). Vuelve a publicar las reglas. |
| **Reservar números** (organizadores, invitados) | `src/config.ts` → `CONFIG.numeros.reservados`, y la lista `RESERVADOS` en `firestore.rules`. |
| **Agregar otra distancia** | `src/config.ts` → `CONFIG.categorias`, y agrégala a la lista `['3K', '5K', '10K']` en `firestore.rules`. |
| **Descargar las inscripciones en Excel** | Firestore no exporta a Excel directo desde la consola. Se puede agregar una página privada para organizadores que las descargue en CSV. |

## Límites del plan gratuito (Spark)

Gratis cada día: 50,000 lecturas, 20,000 escrituras y 20,000 borrados, más 1 GiB de almacenamiento
en total.

**Cómo está optimizada la página para el plan gratuito:**

| Acción | Lecturas | Escrituras |
|---|---|---|
| Ver la página (sin llegar al paso 2) | 0 | 0 |
| Abrir el paso 2 (tablero completo, sin importar cuántos números estén ocupados) | **7** | 0 |
| Cada cambio de otra persona mientras estás en el paso 2 | 1 | 0 |
| Apartar un número | 0 | 2 |
| Soltar un número | 0 | 1 + 1 borrado |
| Confirmar una inscripción (individual) | 0 | 3 |
| Confirmar un grupo de N | 0 | 1 + 2·N |

- La conexión en tiempo real **solo está abierta en el paso 2** y con la pestaña visible.
- Apartar y confirmar **no leen nada antes**: escriben directo y las reglas rechazan lo que no se puede.
- Solo si algo falla (por ejemplo, alguien ganó el número), se lee ese número para avisar y corregir el tablero.

**Estimación:** con 700 inscripciones y ~3,000 visitas al paso 2 durante todo el periodo de
inscripción, el consumo total sería del orden de 30,000–60,000 lecturas (repartidas en ~5 semanas)
y unas 3,000 escrituras. Un día muy movido, con 1,000 personas en el paso 2, usaría alrededor de
15,000 lecturas: menos de un tercio del límite diario.

Pueden ver el consumo real en la consola: **Firestore Database → Uso**. Si algún día se acercaran
al límite, cambien al plan **Blaze** (pago por uso; ⚙️ → Uso y facturación) con una
**alerta de presupuesto**, por ejemplo de $5 USD.

## Datos personales

La página recopila nombres, edades, teléfonos y contactos de emergencia. En México, la ley de
protección de datos personales pide un **aviso de privacidad** que explique para qué se usan esos
datos. Agreguen uno y enlácenlo junto a la casilla del reglamento: **[POR CONFIRMAR]**.
