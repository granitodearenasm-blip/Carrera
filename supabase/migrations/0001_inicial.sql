-- =============================================================================
--  HANGUK RUN 2026 · 0001: esquema inicial
--  Se ejecuta UNA vez en Supabase → SQL Editor (ver docs/publicar.md). Las siguientes migraciones van en
--  archivos nuevos (0002_…), nunca editando esta. Modelo explicado en docs/data-model.md.
--
--  Seguridad en una frase: la página pública solo LEE `ajustes` y `tablero`, y solo ESCRIBE a través de
--  tres funciones (apartar_numero, soltar_numero, confirmar_inscripcion). Los datos personales solo los
--  leen los organizadores. El total lo calcula la base de datos.
-- =============================================================================

-- ---------- Ajustes (una sola fila) ----------
-- Deben coincidir con src/config.ts (precio, números, apartado). La base de datos manda.
create table public.ajustes (
  id boolean primary key default true check (id),
  precio integer not null default 350 check (precio >= 0),
  numero_min integer not null default 1,
  numero_max integer not null default 700,
  reservados integer[] not null default '{}',
  minutos_apartado integer not null default 6 check (minutos_apartado between 1 and 60),
  dias_para_pagar integer not null default 4,
  corredores_max integer not null default 20,
  edad_min integer not null default 12,
  edad_max integer not null default 90,
  categorias text[] not null default '{3K,5K,10K}',
  tallas text[] not null default '{S,M,L,XL}',
  sexos text[] not null default '{Femenino,Masculino}',
  inscripciones_abiertas boolean not null default true
);
insert into public.ajustes default values;

-- ---------- Organizadores (cuentas del panel) ----------
create table public.organizadores (
  user_id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null default '',
  creado timestamptz not null default now()
);

create function public.es_organizador() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.organizadores where user_id = auth.uid()) $$;

-- ---------- Inscripciones y corredores (datos personales) ----------
create table public.inscripciones (
  id uuid primary key default gen_random_uuid(),
  folio bigint generated always as identity unique,
  tipo text not null check (tipo in ('Individual', 'Grupo')),
  grupo text,
  responsable text,
  correo text not null,
  telefono text not null,
  total integer not null check (total >= 0),
  estado_pago text not null default 'pendiente' check (estado_pago in ('pendiente', 'pagado', 'cancelado')),
  pagar_antes_de date not null,
  notas text not null default '',
  uid uuid not null,
  creado timestamptz not null default now(),
  actualizado timestamptz
);
create index inscripciones_creado on public.inscripciones (creado desc);

create table public.corredores (
  id uuid primary key default gen_random_uuid(),
  inscripcion_id uuid not null references public.inscripciones (id) on delete cascade,
  numero integer not null,
  nombre text not null,
  edad integer not null,
  sexo text not null,
  categoria text not null,
  talla text not null,
  emergencia_nombre text not null,
  emergencia_telefono text not null
);
create index corredores_inscripcion on public.corredores (inscripcion_id);

-- ---------- Números ----------
-- numeros: la fuente de verdad, privada (quién tiene cada apartado). Nadie la lee desde la página.
create table public.numeros (
  numero integer primary key,
  estado text not null check (estado in ('apartado', 'confirmado')),
  uid uuid not null,
  creado timestamptz not null default now(),
  inscripcion_id uuid references public.inscripciones (id) on delete set null
);

-- tablero: espejo público sin datos de nadie, para dibujar el tablero y escucharlo en tiempo real.
-- Solo lo escriben las funciones de abajo. Un apartado vencido sigue aquí con su hora: la página lo
-- trata como libre, y el siguiente que lo aparte lo reemplaza.
create table public.tablero (
  numero integer primary key,
  estado text not null check (estado in ('apartado', 'confirmado')),
  creado timestamptz not null
);

-- ---------- Permisos ----------
-- Supabase da todos los permisos sobre tablas nuevas a anon/authenticated: se quitan y se dan solo los necesarios.
revoke all on public.ajustes, public.organizadores, public.inscripciones, public.corredores, public.numeros, public.tablero from anon, authenticated;

alter table public.ajustes enable row level security;
alter table public.organizadores enable row level security;
alter table public.inscripciones enable row level security;
alter table public.corredores enable row level security;
alter table public.numeros enable row level security;
alter table public.tablero enable row level security;

grant select on public.ajustes, public.tablero to anon, authenticated;
create policy "ajustes públicos" on public.ajustes for select using (true);
create policy "tablero público" on public.tablero for select using (true);

-- Organizadores: leen inscripciones y corredores, y editan solo las notas (el estado de pago va por función).
grant select on public.inscripciones, public.corredores, public.organizadores to authenticated;
grant update (notas) on public.inscripciones to authenticated;
create policy "organizadores leen inscripciones" on public.inscripciones for select to authenticated using (public.es_organizador());
create policy "organizadores editan notas" on public.inscripciones for update to authenticated using (public.es_organizador()) with check (public.es_organizador());
create policy "organizadores leen corredores" on public.corredores for select to authenticated using (public.es_organizador());
create policy "cada organizador se ve" on public.organizadores for select to authenticated using (user_id = auth.uid());

alter publication supabase_realtime add table public.tablero;

-- =============================================================================
--  Funciones públicas (security definer: escriben aunque las tablas estén cerradas, con sus reglas)
--  Los errores usan códigos cortos en el mensaje; services/supabase/ los traduce a texto.
-- =============================================================================

-- Aparta un número para quien llama, o renueva su propio apartado. Devuelve la hora del servidor.
create function public.apartar_numero(n integer) returns timestamptz
language plpgsql security definer set search_path = ''
as $$
declare
  a public.ajustes;
  yo uuid := auth.uid();
  ahora timestamptz := now();
  actual public.numeros;
begin
  if yo is null then raise exception 'sin-sesion'; end if;
  select * into a from public.ajustes;
  if not a.inscripciones_abiertas then raise exception 'cerrado'; end if;
  if n is null or n < a.numero_min or n > a.numero_max or n = any (a.reservados) then raise exception 'fuera-de-rango'; end if;

  insert into public.numeros as x (numero, estado, uid, creado) values (n, 'apartado', yo, ahora)
  on conflict (numero) do update set uid = yo, creado = ahora, estado = 'apartado', inscripcion_id = null
    where x.estado = 'apartado' and (x.uid = yo or x.creado < ahora - make_interval(mins => a.minutos_apartado));

  if not found then
    select * into actual from public.numeros where numero = n;
    raise exception '%', case when actual.estado = 'confirmado' then 'ocupado' else 'en-proceso' end;
  end if;

  insert into public.tablero (numero, estado, creado) values (n, 'apartado', ahora)
  on conflict (numero) do update set estado = 'apartado', creado = ahora;
  return ahora;
end $$;

-- Suelta un apartado: el propio, o cualquiera ya vencido. Los confirmados no se tocan.
create function public.soltar_numero(n integer) returns void
language plpgsql security definer set search_path = ''
as $$
declare minutos integer := (select minutos_apartado from public.ajustes);
begin
  if auth.uid() is null then raise exception 'sin-sesion'; end if;
  delete from public.numeros
    where numero = n and estado = 'apartado' and (uid = auth.uid() or creado < now() - make_interval(mins => minutos));
  if found then delete from public.tablero where numero = n; end if;
end $$;

-- Guarda una inscripción completa en una sola transacción. Si algún número ya no está apartado a tu
-- nombre (o venció), no guarda NADA y responde 'numeros-ocupados' con la lista en el detalle.
create function public.confirmar_inscripcion(datos jsonb)
returns table (id uuid, folio bigint, total integer, pagar_antes_de date)
language plpgsql security definer set search_path = ''
as $$
declare
  a public.ajustes;
  yo uuid := auth.uid();
  lista jsonb := datos -> 'corredores';
  cuantos integer;
  nums integer[];
  mios integer[];
  perdidos integer[];
  c jsonb;
  tel_ok text := '^[0-9]{10}$';
  nueva public.inscripciones;
  es_grupo boolean;
begin
  if yo is null then raise exception 'sin-sesion'; end if;
  select * into a from public.ajustes;
  if not a.inscripciones_abiertas then raise exception 'cerrado'; end if;
  if jsonb_typeof(lista) is distinct from 'array' then raise exception 'datos-invalidos' using detail = 'corredores'; end if;

  cuantos := jsonb_array_length(lista);
  if cuantos < 1 or cuantos > a.corredores_max then raise exception 'datos-invalidos' using detail = 'cantidad'; end if;
  es_grupo := cuantos > 1;

  -- Contacto
  if coalesce(datos ->> 'correo', '') !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' or length(datos ->> 'correo') > 120 then
    raise exception 'datos-invalidos' using detail = 'correo';
  end if;
  if coalesce(datos ->> 'telefono', '') !~ tel_ok then raise exception 'datos-invalidos' using detail = 'telefono'; end if;
  if es_grupo and (length(trim(coalesce(datos ->> 'grupo', ''))) not between 2 and 80
                   or length(trim(coalesce(datos ->> 'responsable', ''))) not between 5 and 80) then
    raise exception 'datos-invalidos' using detail = 'grupo';
  end if;

  -- Corredores
  for c in select * from jsonb_array_elements(lista) loop
    if jsonb_typeof(c -> 'numero') <> 'number'
       or length(trim(coalesce(c ->> 'nombre', ''))) not between 5 and 80
       or coalesce(c ->> 'edad', '') !~ '^[0-9]{1,3}$' or (c ->> 'edad')::int not between a.edad_min and a.edad_max
       or not ((c ->> 'sexo') = any (a.sexos))
       or not ((c ->> 'categoria') = any (a.categorias))
       or not ((c ->> 'talla') = any (a.tallas))
       or length(trim(coalesce(c ->> 'emergenciaNombre', ''))) not between 3 and 80
       or coalesce(c ->> 'emergenciaTelefono', '') !~ tel_ok then
      raise exception 'datos-invalidos' using detail = 'corredor ' || coalesce(c ->> 'numero', '?');
    end if;
  end loop;

  select array_agg((x ->> 'numero')::int) into nums from jsonb_array_elements(lista) x;
  if (select count(distinct v) from unnest(nums) v) <> cuantos then raise exception 'datos-invalidos' using detail = 'numeros repetidos'; end if;

  -- Cada número debe seguir apartado a mi nombre y sin vencer (se bloquean hasta terminar)
  select array_agg(numero) into mios from (
    select numero from public.numeros
    where numero = any (nums) and estado = 'apartado' and uid = yo and creado >= now() - make_interval(mins => a.minutos_apartado)
    for update
  ) t;
  select array_agg(v order by v) into perdidos from unnest(nums) v where not (v = any (coalesce(mios, '{}')));
  if perdidos is not null then
    raise exception 'numeros-ocupados' using detail = array_to_string(perdidos, ',');
  end if;

  insert into public.inscripciones (tipo, grupo, responsable, correo, telefono, total, pagar_antes_de, uid)
  values (
    case when es_grupo then 'Grupo' else 'Individual' end,
    case when es_grupo then trim(datos ->> 'grupo') end,
    case when es_grupo then trim(datos ->> 'responsable') end,
    lower(trim(datos ->> 'correo')),
    datos ->> 'telefono',
    a.precio * cuantos,
    (now() at time zone 'America/Mexico_City')::date + a.dias_para_pagar,
    yo
  ) returning * into nueva;

  insert into public.corredores (inscripcion_id, numero, nombre, edad, sexo, categoria, talla, emergencia_nombre, emergencia_telefono)
  select nueva.id, (x ->> 'numero')::int, trim(x ->> 'nombre'), (x ->> 'edad')::int, x ->> 'sexo', x ->> 'categoria', x ->> 'talla',
         trim(x ->> 'emergenciaNombre'), x ->> 'emergenciaTelefono'
  from jsonb_array_elements(lista) x;

  update public.numeros set estado = 'confirmado', inscripcion_id = nueva.id where numero = any (nums);
  update public.tablero set estado = 'confirmado' where numero = any (nums);

  return query select nueva.id, nueva.folio, nueva.total, nueva.pagar_antes_de;
end $$;

-- Organizadores: cambia el estado de pago. Cancelar libera los números de la inscripción.
create function public.cambiar_estado_pago(inscripcion uuid, nuevo text) returns void
language plpgsql security definer set search_path = ''
as $$
declare anterior text;
begin
  if not public.es_organizador() then raise exception 'sin-permiso'; end if;
  if nuevo not in ('pendiente', 'pagado', 'cancelado') then raise exception 'datos-invalidos'; end if;
  select estado_pago into anterior from public.inscripciones where id = inscripcion for update;
  if anterior is null then raise exception 'no-existe'; end if;
  if anterior = 'cancelado' and nuevo <> 'cancelado' then raise exception 'ya-cancelada'; end if;

  update public.inscripciones set estado_pago = nuevo, actualizado = now() where id = inscripcion;
  if nuevo = 'cancelado' and anterior <> 'cancelado' then
    delete from public.tablero where numero in (select numero from public.numeros where inscripcion_id = inscripcion);
    delete from public.numeros where inscripcion_id = inscripcion;
  end if;
end $$;

-- Las funciones son de quien tiene sesión (anónima o del panel); nadie sin sesión las ejecuta.
revoke execute on function public.apartar_numero(integer), public.soltar_numero(integer), public.confirmar_inscripcion(jsonb),
  public.cambiar_estado_pago(uuid, text), public.es_organizador() from public, anon;
grant execute on function public.apartar_numero(integer), public.soltar_numero(integer), public.confirmar_inscripcion(jsonb),
  public.cambiar_estado_pago(uuid, text), public.es_organizador() to authenticated;
