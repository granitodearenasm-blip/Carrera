// Comportamiento de supabase/migrations con roles reales y RLS en PGlite: lo que hace la página debe
// funcionar y el abuso debe fallar. `npm run check:db` (también parte de `npm run check`).
import fs from 'node:fs';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';

const repo = process.cwd();
const db = await PGlite.create();
await db.exec(fs.readFileSync(new URL('./supabase-standin.sql', import.meta.url), 'utf8'));
const dir = path.join(repo, 'supabase/migrations');
for (const f of fs
  .readdirSync(dir)
  .filter((x) => x.endsWith('.sql'))
  .sort())
  await db.exec(fs.readFileSync(path.join(dir, f), 'utf8'));

const ANA = '00000000-0000-0000-0000-00000000000a'; // visitante anónima
const BETO = '00000000-0000-0000-0000-00000000000b'; // otro visitante
const ORG = '00000000-0000-0000-0000-0000000000f0'; // organizadora
await db.exec(`insert into auth.users (id, is_anonymous) values ('${ANA}', true), ('${BETO}', true), ('${ORG}', false);
               insert into public.organizadores (user_id, nombre) values ('${ORG}', 'Panel');`);

let fallas = 0;
const como = async (user, sql) => {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${user ?? ''}', false); set role ${user ? 'authenticated' : 'anon'};`);
  try {
    return { ok: true, rows: (await db.query(sql)).rows };
  } catch (e) {
    return { ok: false, error: e.message, detail: e.detail };
  } finally {
    await db.exec('reset role');
  }
};
const espera = async (texto, user, sql, debeFuncionar, revisar) => {
  const r = await como(user, sql);
  const paso = r.ok === debeFuncionar && (!revisar || revisar(r));
  if (!paso) fallas++;
  console.log(`${paso ? 'OK  ' : 'FALLA'} ${texto}${r.ok ? '' : `  [${r.error.split('\n')[0]}${r.detail ? ` · ${r.detail}` : ''}]`}`);
  return r;
};
const corredor = (numero, extra = {}) => ({
  numero,
  nombre: 'Ana López Pérez',
  edad: '28',
  sexo: 'Femenino',
  categoria: '5K',
  talla: 'M',
  emergenciaNombre: 'Luis López',
  emergenciaTelefono: '2221234567',
  ...extra,
});
const inscripcion = (corredores, extra = {}) =>
  `select * from public.confirmar_inscripcion('${JSON.stringify({ correo: 'ana@example.com', telefono: '2227654321', corredores, ...extra }).replace(/'/g, "''")}'::jsonb)`;

console.log('— Lectura pública');
await espera('sin sesión se leen los ajustes', null, 'select precio from public.ajustes', true, (r) => r.rows[0].precio === 350);
await espera('sin sesión se lee el tablero', null, 'select * from public.tablero', true);
await espera('sin sesión NO se lee la tabla privada de números', null, 'select * from public.numeros', false);
await espera('sin sesión NO se puede apartar', null, 'select public.apartar_numero(10)', false);

console.log('— Apartar y soltar');
await espera('Ana aparta el 10', ANA, 'select public.apartar_numero(10)', true);
await espera(
  'el tablero muestra el 10 apartado, sin dueño',
  ANA,
  'select * from public.tablero',
  true,
  (r) => r.rows.length === 1 && r.rows[0].estado === 'apartado' && !('uid' in r.rows[0]),
);
await espera('Beto no puede apartar el 10 (en proceso)', BETO, 'select public.apartar_numero(10)', false, (r) => r.error.includes('en-proceso'));
await espera('Ana renueva su propio apartado', ANA, 'select public.apartar_numero(10)', true);
await espera('fuera de rango (701)', ANA, 'select public.apartar_numero(701)', false, (r) => r.error.includes('fuera-de-rango'));
await espera('Beto no puede soltar el apartado de Ana', BETO, 'select public.soltar_numero(10)', true);
await espera('…y el 10 sigue apartado', ANA, 'select estado from public.tablero where numero = 10', true, (r) => r.rows[0]?.estado === 'apartado');
await espera('nadie escribe el tablero directo', BETO, `insert into public.tablero values (11, 'confirmado', now())`, false);
await espera('nadie escribe números directo', BETO, `insert into public.numeros values (11, 'confirmado', '${BETO}', now())`, false);

console.log('— Vencimiento (6 minutos)');
await db.exec(`update public.numeros set creado = now() - interval '7 minutes' where numero = 10`);
await espera('Beto toma el 10 vencido', BETO, 'select public.apartar_numero(10)', true);
await espera('Ana ya no puede confirmar el 10', ANA, inscripcion([corredor(10)]), false, (r) => r.error.includes('numeros-ocupados') && r.detail === '10');

console.log('— Confirmar');
await espera('Ana aparta el 20 y el 21', ANA, 'select public.apartar_numero(20), public.apartar_numero(21)', true);
await espera(
  'datos inválidos (edad 8) no guardan nada',
  ANA,
  inscripcion([corredor(20, { edad: '8' }), corredor(21)], { grupo: 'Las Ardillas', responsable: 'Ana López' }),
  false,
  (r) => r.error.includes('datos-invalidos'),
);
await espera('un grupo sin nombre de grupo falla', ANA, inscripcion([corredor(20), corredor(21)]), false);
await espera(
  'un número que no es tuyo hace fallar todo',
  ANA,
  inscripcion([corredor(20), corredor(10)], { grupo: 'Las Ardillas', responsable: 'Ana López' }),
  false,
  (r) => r.detail === '10',
);
await espera('nada quedó a medias', ORG, 'select count(*)::int n from public.inscripciones', true, (r) => r.rows[0].n === 0);
await espera(
  'Ana inscribe a su grupo; el total lo pone la base (2 × 350), aunque mande otro',
  ANA,
  inscripcion([corredor(20), corredor(21, { nombre: 'Carla Ruiz Díaz', sexo: 'Femenino' })], { grupo: 'Las Ardillas', responsable: 'Ana López', total: 1 }),
  true,
  (r) => r.rows[0].total === 700,
);
await espera('el tablero ya marca el 20 confirmado', null, 'select estado from public.tablero where numero = 20', true, (r) => r.rows[0]?.estado === 'confirmado');
await espera('un confirmado no se puede apartar', BETO, 'select public.apartar_numero(20)', false, (r) => r.error.includes('ocupado'));
await espera('un confirmado no se puede soltar', ANA, 'select public.soltar_numero(20)', true);
await espera('…y sigue confirmado', null, 'select estado from public.tablero where numero = 20', true, (r) => r.rows[0]?.estado === 'confirmado');

console.log('— Datos personales');
await espera('Ana no puede leer inscripciones (ni la suya)', ANA, 'select count(*)::int n from public.inscripciones', true, (r) => r.rows[0].n === 0);
await espera('Beto no puede leer corredores', BETO, 'select count(*)::int n from public.corredores', true, (r) => r.rows[0].n === 0);
await espera('sin sesión no se leen inscripciones', null, 'select * from public.inscripciones', false);
await espera('la organizadora ve la inscripción y sus 2 corredores', ORG, 'select (select count(*) from public.corredores)::int n', true, (r) => r.rows[0].n === 2);
await espera('un visitante no cambia el estado de pago', ANA, `select public.cambiar_estado_pago((select id from public.inscripciones limit 1), 'pagado')`, false);
await espera('un visitante no edita el total', ANA, `update public.inscripciones set total = 0`, false);
await espera('…y el total sigue en 700', ORG, 'select total from public.inscripciones', true, (r) => r.rows[0].total === 700);

console.log('— Panel');
await espera('la organizadora marca pagado', ORG, `select public.cambiar_estado_pago((select id from public.inscripciones limit 1), 'pagado')`, true);
await espera('la organizadora edita notas', ORG, `update public.inscripciones set notas = 'Pagó en efectivo'`, true);
await espera('la organizadora no puede editar el total', ORG, `update public.inscripciones set total = 0`, false);
await espera('cancelar libera los números', ORG, `select public.cambiar_estado_pago((select id from public.inscripciones limit 1), 'cancelado')`, true);
await espera('…el 20 vuelve a estar libre en el tablero', null, 'select count(*)::int n from public.tablero where numero in (20, 21)', true, (r) => r.rows[0].n === 0);
await espera('…y Beto lo puede apartar', BETO, 'select public.apartar_numero(20)', true);
await espera('una cancelada no se reactiva', ORG, `select public.cambiar_estado_pago((select id from public.inscripciones limit 1), 'pagado')`, false);

console.log('— Mi inscripción: consultar y reportar el pago (0002)');
await espera('Ana aparta el 30', ANA, 'select public.apartar_numero(30)', true);
await espera('Ana se inscribe sola con el 30', ANA, inscripcion([corredor(30)]), true);
const folio = (await como(ORG, 'select folio from public.inscripciones where estado_pago = $$pendiente$$')).rows[0].folio;
const consulta = (correo) => `select * from public.consultar_inscripcion(${folio}, '${correo}')`;
const reporte = (metodo, ref, f = folio) => `select public.reportar_pago(${f}, 'ana@example.com', '${metodo}', ${ref === null ? 'null' : `'${ref}'`})`;
await espera('sin sesión no se consulta', null, consulta('ana@example.com'), false);
await espera(
  'con folio y correo (sin importar mayúsculas) ve su estado y sus números, sin datos personales',
  BETO,
  consulta('  ANA@example.com '),
  true,
  (r) => r.rows[0].estado_pago === 'pendiente' && r.rows[0].numeros.join() === '30' && r.rows[0].total === 350 && !('correo' in r.rows[0]) && !('telefono' in r.rows[0]),
);
await espera('con otro correo no encuentra nada', BETO, consulta('beto@example.com'), false, (r) => r.error.includes('no-encontrada'));
await espera('la búsqueda interna no se llama directo', BETO, `select public.inscripcion_por_folio(${folio}, 'ana@example.com')`, false);
await espera('transferencia sin referencia no se guarda', ANA, reporte('transferencia', null), false, (r) => r.detail === 'referencia');
await espera('un método inventado no se guarda', ANA, reporte('cripto', 'abc123'), false, (r) => r.detail === 'metodo');
await espera('folio que no existe', ANA, reporte('efectivo', null, 999999), false, (r) => r.error.includes('no-encontrada'));
await espera('Ana reporta su transferencia', ANA, reporte('transferencia', 'BBVA 0123456789'), true);
await espera(
  '…la consulta ya muestra el reporte, y sigue pendiente',
  ANA,
  consulta('ana@example.com'),
  true,
  (r) => r.rows[0].pago_metodo === 'transferencia' && r.rows[0].pago_referencia === 'BBVA 0123456789' && r.rows[0].pago_reportado && r.rows[0].estado_pago === 'pendiente',
);
await espera('efectivo sin referencia sí se guarda (corrige el reporte)', ANA, reporte('efectivo', null), true);
await espera(
  'la organizadora ve el reporte en el panel',
  ORG,
  'select pago_metodo from public.inscripciones where estado_pago = $$pendiente$$',
  true,
  (r) => r.rows[0].pago_metodo === 'efectivo',
);
await espera('un visitante no escribe el reporte directo', ANA, `update public.inscripciones set pago_metodo = 'efectivo'`, false);
await espera('la organizadora confirma el pago', ORG, `select public.cambiar_estado_pago((select id from public.inscripciones where folio = ${folio}), 'pagado')`, true);
await espera('una pagada ya no acepta reportes', ANA, reporte('transferencia', 'otra-ref'), false, (r) => r.error.includes('ya-pagada'));
await espera('…y la consulta dice pagado', BETO, consulta('ana@example.com'), true, (r) => r.rows[0].estado_pago === 'pagado');

console.log(fallas ? `\n${fallas} prueba(s) de base de datos fallaron` : '\nBase de datos: todo bien');
process.exit(fallas ? 1 : 0);
