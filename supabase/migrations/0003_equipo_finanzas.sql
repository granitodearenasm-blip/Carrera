-- =============================================================================
--  0003: Equipo Hanguk (quién trae cada inscripción) y finanzas (patrocinios y gastos).
--  • equipo: cada miembro tiene un código público (link para invitar, /?ref=codigo) y una clave
--    privada (link para ver sus números, /equipo/<clave>). Solo los organizadores leen la tabla.
--  • inscripciones.equipo_id: quién la trajo. Lo pone atribuir_inscripcion() justo después de
--    confirmar, y solo quien hizo la inscripción, una vez.
--  • mi_equipo(clave): lo único que ve un miembro: sus inscripciones con nombre de pila y estado,
--    y el ranking del equipo. Sin correos ni teléfonos.
--  • patrocinios y gastos: los registran y leen solo los organizadores.
-- =============================================================================

create table public.equipo (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (length(trim(nombre)) between 2 and 60),
  codigo text not null unique check (codigo ~ '^[a-z0-9-]{3,30}$'),
  clave uuid not null unique default gen_random_uuid(),
  activo boolean not null default true,
  creado timestamptz not null default now()
);

alter table public.inscripciones add column equipo_id uuid references public.equipo (id) on delete set null;
create index inscripciones_equipo on public.inscripciones (equipo_id);

create table public.patrocinios (
  id uuid primary key default gen_random_uuid(),
  patrocinador text not null check (length(trim(patrocinador)) between 2 and 80),
  monto integer not null check (monto > 0),
  estado text not null default 'comprometido' check (estado in ('comprometido', 'cobrado')),
  notas text not null default '',
  creado timestamptz not null default now()
);

create table public.gastos (
  id uuid primary key default gen_random_uuid(),
  concepto text not null check (length(trim(concepto)) between 2 and 80),
  categoria text not null default 'Otro',
  monto integer not null check (monto > 0),
  fecha date not null default (now() at time zone 'America/Mexico_City')::date,
  creado timestamptz not null default now()
);

alter table public.equipo enable row level security;
alter table public.patrocinios enable row level security;
alter table public.gastos enable row level security;
revoke all on public.equipo, public.patrocinios, public.gastos from anon, authenticated;
grant select, insert, update, delete on public.patrocinios, public.gastos to authenticated;
-- La clave privada la genera la base; ni los organizadores la escriben a mano
grant select, delete on public.equipo to authenticated;
grant insert (nombre, codigo), update (nombre, codigo, activo) on public.equipo to authenticated;
create policy "organizadores manejan equipo" on public.equipo for all to authenticated using (public.es_organizador()) with check (public.es_organizador());
create policy "organizadores manejan patrocinios" on public.patrocinios for all to authenticated using (public.es_organizador()) with check (public.es_organizador());
create policy "organizadores manejan gastos" on public.gastos for all to authenticated using (public.es_organizador()) with check (public.es_organizador());

-- ---------- Atribuir una inscripción a un miembro del equipo ----------
-- Solo quien la hizo, dentro del primer día y una sola vez. Un código que no existe no hace nada
-- (no se avisa, para no dejar adivinar códigos).
create function public.atribuir_inscripcion(inscripcion uuid, codigo text)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  yo uuid := auth.uid();
  miembro uuid;
begin
  if yo is null then raise exception 'sin-sesion'; end if;
  select e.id into miembro from public.equipo e where e.codigo = lower(trim(atribuir_inscripcion.codigo)) and e.activo;
  if miembro is null then return; end if;
  update public.inscripciones i set equipo_id = miembro
   where i.id = atribuir_inscripcion.inscripcion and i.uid = yo and i.equipo_id is null
     and i.creado > now() - interval '1 day';
end;
$$;

-- ---------- Lo que ve un miembro con su link privado ----------
create function public.mi_equipo(clave uuid)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  yo public.equipo;
begin
  if auth.uid() is null then raise exception 'sin-sesion'; end if;
  select * into yo from public.equipo e where e.clave = mi_equipo.clave and e.activo;
  if yo.id is null then raise exception 'no-encontrado'; end if;

  return jsonb_build_object(
    'nombre', yo.nombre,
    'codigo', yo.codigo,
    -- Sus inscripciones: nombres de pila de los corredores, estado y fecha
    'inscripciones', coalesce((
      select jsonb_agg(jsonb_build_object(
               'nombres', (select string_agg(split_part(trim(c.nombre), ' ', 1), ', ' order by c.numero) from public.corredores c where c.inscripcion_id = i.id),
               'corredores', (select count(*) from public.corredores c where c.inscripcion_id = i.id),
               'estado', i.estado_pago,
               'creado', i.creado) order by i.creado desc)
        from public.inscripciones i
       where i.equipo_id = yo.id and i.estado_pago <> 'cancelado'), '[]'::jsonb),
    -- Ranking por corredores (pagados y pendientes), con nombre de pila de cada miembro
    'ranking', coalesce((
      select jsonb_agg(jsonb_build_object('nombre', r.nombre, 'corredores', r.corredores, 'yo', r.id = yo.id) order by r.corredores desc, r.nombre)
        from (select e.id, split_part(trim(e.nombre), ' ', 1) nombre,
                     (select count(*) from public.corredores c join public.inscripciones i on i.id = c.inscripcion_id
                       where i.equipo_id = e.id and i.estado_pago <> 'cancelado') corredores
                from public.equipo e where e.activo) r), '[]'::jsonb),
    -- Corredores inscritos en toda la carrera (para la meta colectiva)
    'total_carrera', (select count(*) from public.corredores c join public.inscripciones i on i.id = c.inscripcion_id where i.estado_pago <> 'cancelado')
  );
end;
$$;

revoke execute on function public.atribuir_inscripcion(uuid, text), public.mi_equipo(uuid) from public, anon;
grant execute on function public.atribuir_inscripcion(uuid, text), public.mi_equipo(uuid) to authenticated;
