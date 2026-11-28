# Modelo de datos (Supabase)

Esquema completo: [`supabase/migrations/`](../supabase/migrations/). Pruebas de comportamiento: `npm run check:db` (Postgres real en PGlite, con los roles de Supabase).

## Tablas

| Tabla | Qué guarda | Quién la lee | Quién la escribe |
|---|---|---|---|
| `ajustes` | Una fila: precio, rango de números, reservados, minutos de apartado, días para pagar, edades, categorías, tallas, si las inscripciones están abiertas | Todos | Solo desde el SQL Editor |
| `tablero` | Espejo público de los números: `numero`, `estado` (`apartado`/`confirmado`), `creado`. Sin datos de nadie. En Realtime | Todos | Solo las funciones |
| `numeros` | La fuente de verdad privada: además, `uid` (sesión que lo apartó) e `inscripcion_id` | Nadie desde la página | Solo las funciones |
| `inscripciones` | Folio, tipo, grupo, responsable, correo, teléfono, total, estado de pago, fecha límite, notas y el pago que reportó el corredor (`pago_metodo`, `pago_referencia`, `pago_reportado`, desde 0002) | Organizadores | Funciones; los organizadores editan solo `notas` |
| `corredores` | Un registro por corredor: número, nombre, edad, rama, distancia, talla, contacto de emergencia | Organizadores | Solo las funciones |
| `organizadores` | Cuentas que pueden entrar al panel | Cada organizador ve su fila | Solo desde el SQL Editor |
| `equipo` | Equipo Hanguk (0003): `nombre`, `codigo` (link para invitar, `/?ref=codigo`), `clave` privada (link de sus números, `/equipo/<clave>`, la genera la base), `activo`. `inscripciones.equipo_id` dice quién trajo cada inscripción | Organizadores | Organizadores (menos `clave`) |
| `patrocinios` | Dinero de patrocinadores (0003): `patrocinador`, `monto`, `estado` (`comprometido`/`cobrado`), `notas` | Organizadores | Organizadores |
| `gastos` | Gastos de la carrera (0003): `concepto`, `categoria`, `monto`, `fecha` | Organizadores | Organizadores |

Un apartado vencido sigue en `tablero` con su hora: la página lo trata como libre (pasaron más de `minutos_apartado`) y el siguiente que lo aparte lo reemplaza.

## Funciones (RPC)

Todas son `security definer` con `search_path = ''`, y solo las ejecuta quien tiene sesión (anónima o del panel).

| Función | Qué hace | Errores (código en el mensaje) |
|---|---|---|
| `apartar_numero(n)` | Aparta `n` para quien llama, renueva su propio apartado o toma uno vencido. Devuelve la hora del servidor | `sin-sesion`, `cerrado`, `fuera-de-rango`, `ocupado`, `en-proceso` |
| `soltar_numero(n)` | Suelta un apartado propio o vencido. Los confirmados no se tocan | `sin-sesion` |
| `confirmar_inscripcion(datos)` | En una transacción: valida contacto y corredores, comprueba que cada número siga apartado a tu nombre, **calcula el total** (`precio × corredores`), crea inscripción y corredores y confirma los números | `datos-invalidos` (detalle: campo), `numeros-ocupados` (detalle: lista), `cerrado`, `sin-sesion` |
| `cambiar_estado_pago(id, estado)` | Organizadores: `pendiente`/`pagado`/`cancelado`. Cancelar libera los números; una cancelada no se reactiva | `sin-permiso`, `ya-cancelada`, `no-existe` |
| `consultar_inscripcion(folio, correo)` | Página "Mi inscripción" (0002): con folio y correo devuelve folio, total, estado de pago, fecha límite, números y el pago reportado. Sin nombres ni teléfonos | `sin-sesion`, `no-encontrada` |
| `reportar_pago(folio, correo, metodo, referencia)` | El corredor avisa que pagó (0002): `transferencia` (referencia obligatoria, 4 a 80 caracteres) o `efectivo` (referencia opcional). Se puede corregir mientras siga pendiente. **No** marca pagado: eso lo hace un organizador | `sin-sesion`, `no-encontrada`, `ya-pagada`, `ya-cancelada`, `datos-invalidos` (detalle: `metodo` o `referencia`) |
| `atribuir_inscripcion(inscripcion, codigo)` | Justo después de confirmar (0003): liga la inscripción al miembro del equipo cuyo link trajo a la persona. Solo quien la hizo, el primer día y una vez; un código que no existe no hace nada | `sin-sesion` |
| `mi_equipo(clave)` | Página del miembro del equipo (0003): su nombre, código, sus inscripciones (nombres de pila, corredores, estado, fecha), el ranking del equipo y los corredores de toda la carrera. Sin correos ni teléfonos | `sin-sesion`, `no-encontrado` |
| `es_organizador()` | ¿La sesión está en `organizadores`? | — |

`services/supabase/` traduce estos códigos a textos para la persona.

## Formato de `datos` en `confirmar_inscripcion`

```json
{
  "grupo": "Las Ardillas",
  "responsable": "Ana López",
  "correo": "ana@gmail.com",
  "telefono": "2221234567",
  "corredores": [
    { "numero": 128, "nombre": "Ana López Pérez", "edad": "28", "sexo": "Femenino", "categoria": "5K", "talla": "M", "emergenciaNombre": "Luis López", "emergenciaTelefono": "2227654321" }
  ]
}
```

`grupo` y `responsable` solo cuentan con 2 corredores o más. Cualquier `total` que mande la página se ignora.

## Migraciones aplicadas

| Archivo | Qué hace |
|---|---|
| `0001_inicial.sql` | Esquema inicial: tablas, permisos y funciones de apartar, confirmar y panel |
| `0002_reporte_pago.sql` | Columnas del pago reportado en `inscripciones`; funciones `consultar_inscripcion` y `reportar_pago` |
| `0003_equipo_finanzas.sql` | Tablas `equipo`, `patrocinios` y `gastos`; `inscripciones.equipo_id`; funciones `atribuir_inscripcion` y `mi_equipo` |

## Migraciones nuevas

1. Archivo nuevo `supabase/migrations/000N_descripcion.sql` (nunca editar los anteriores).
2. Actualizar esta página.
3. `npm run check:db` (agrega casos a `scripts/db/behaviour.mjs` si cambia una regla).
4. El dueño la ejecuta a mano en el SQL Editor.
