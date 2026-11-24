-- Sustitutos de lo que Supabase ya trae (roles, auth, realtime), para correr supabase/migrations/*.sql
-- en PGlite (Postgres real en WASM) desde scripts/db/. Copiado del modelo de Trellum.
create role anon nologin; create role authenticated nologin; create role service_role nologin;
create schema auth;
create table auth.users (id uuid primary key, email text, is_anonymous boolean default false, created_at timestamptz default now());
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;
create publication supabase_realtime;
grant usage on schema public to anon, authenticated;
-- Como Supabase: las tablas nuevas de public nacen con todos los permisos para anon y authenticated.
alter default privileges in schema public grant all on tables to anon, authenticated;
