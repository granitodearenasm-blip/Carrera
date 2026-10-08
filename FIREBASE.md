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

## 3. Pegar las reglas de seguridad

1. En Firestore Database, abre la pestaña **Reglas**.
2. Borra lo que aparece y pega **todo** el contenido del archivo `firestore.rules` de esta carpeta.
3. Clic en **Publicar**.

Con estas reglas:
- cualquiera puede ver **qué números están ocupados**, que no incluyen datos personales;
- cualquiera puede **crear su inscripción**;
- **nadie puede leer, cambiar ni borrar inscripciones desde la página**. Solo ustedes, desde la consola.

## 4. Registrar la página web y copiar la configuración

1. Ícono de engrane ⚙️ (arriba a la izquierda) → **Configuración del proyecto**.
2. En **Tus apps**, clic en el ícono **`</>`** (Web) → apodo `hanguk-run-web` → **Registrar app**. No hace falta activar Firebase Hosting.
3. Firebase muestra un bloque `const firebaseConfig = { ... }`. Copia esos valores en `script.js`, dentro de `CONFIG`:

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

1. Sube los archivos al hosting, o abre la página local, y recarga.
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
| **Liberar un número** (por ejemplo, alguien no pagó) | Borra su documento en `numeros`, cuyo nombre es el número. Revisa también su inscripción. |
| **Cambiar el rango de números** | `script.js` → `CONFIG.numeros.minimo / maximo`, y lo mismo en `firestore.rules` (`MINIMO` / `MAXIMO`). Vuelve a publicar las reglas. |
| **Reservar números** (organizadores, invitados) | `script.js` → `CONFIG.numeros.reservados`, y la lista `RESERVADOS` en `firestore.rules`. |
| **Agregar otra distancia** | `script.js` → `CONFIG.categorias`, y agrégala a la lista `['3K', '5K', '10K']` en `firestore.rules`. |
| **Descargar las inscripciones en Excel** | Firestore no exporta a Excel directo desde la consola. Se puede agregar una página privada para organizadores que las descargue en CSV. |

## Límites del plan gratuito (Spark)

Gratis cada día: 50,000 lecturas, 20,000 escrituras y 20,000 borrados, más 1 GiB de almacenamiento
en total.

**Lo que más gasta son las lecturas.** Cada persona que llega al paso 2 de la inscripción lee
**todos los números ocupados** una vez: con 300 apartados son 300 lecturas. La página solo los
consulta al llegar al paso 2, así que quien solo ve la información no gasta nada.

Como referencia, con 700 números ocupados el plan gratuito alcanza para unas 70 personas al día
en el paso 2. Si se acercan al límite, la página deja de mostrar la disponibilidad hasta el día
siguiente. Para evitarlo, cambien al plan **Blaze** (pago por uso) en la consola
(⚙️ → Uso y facturación) y pongan una **alerta de presupuesto**, por ejemplo de $5 USD. Las
lecturas adicionales cuestan centavos de dólar por cada 100,000.

## Datos personales

La página recopila nombres, edades, teléfonos y contactos de emergencia. En México, la ley de
protección de datos personales pide un **aviso de privacidad** que explique para qué se usan esos
datos. Agreguen uno y enlácenlo junto a la casilla del reglamento: **[POR CONFIRMAR]**.
